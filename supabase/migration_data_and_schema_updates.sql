-- ==============================================================================
-- Migration : Étape 2 - Migration des données et mise à jour des clés/colonnes
-- À exécuter dans l'onglet "SQL Editor" de votre console Supabase
-- ==============================================================================

BEGIN;

-- ─── 1. AJOUT DE LA COLONNE TEMPORAIRE ─────────────────────────────────────────
-- Permet de faire la liaison temporaire entre users et leur nouvelle organisation
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS temp_org_id UUID;


-- ─── 2. CRÉATION DES ORGANISATIONS & MEMBERSHIPS PAR DÉFAUT ─────────────────────
-- Pour chaque utilisateur existant, on crée son organisation avec le nom de sa marque
-- (extrait de brand_profiles) ou son nom complet/email à défaut.
DO $$
DECLARE
    u RECORD;
    new_org_id UUID;
    brand_name_val TEXT;
BEGIN
    FOR u IN 
        SELECT id, email, full_name, plan, stripe_customer_id, zernio_profile_id, created_at 
        FROM public.users 
    LOOP
        -- Récupérer le nom de la marque s'il existe
        SELECT brand_name INTO brand_name_val 
        FROM public.brand_profiles 
        WHERE user_id = u.id 
        LIMIT 1;

        -- Générer un ID unique pour la nouvelle organisation
        new_org_id := gen_random_uuid();
        
        -- Insérer l'organisation
        INSERT INTO public.organizations (id, name, plan, stripe_customer_id, zernio_profile_id, created_at, updated_at)
        VALUES (
            new_org_id,
            COALESCE(brand_name_val, u.full_name, split_part(u.email, '@', 1), 'Ma Marque'),
            u.plan,
            u.stripe_customer_id,
            u.zernio_profile_id,
            u.created_at,
            NOW()
        );

        -- Lier temporairement l'organisation à l'utilisateur
        UPDATE public.users SET temp_org_id = new_org_id WHERE id = u.id;
        
        -- Créer la relation de membre 'owner'
        INSERT INTO public.memberships (organization_id, user_id, role, created_at)
        VALUES (new_org_id, u.id, 'owner', u.created_at);
    END LOOP;
END $$;


-- ─── 3. MIGRATION DES TABLES FILLES ───────────────────────────────────────────

-- 3.1 SOCIAL ACCOUNTS
-- Remplacement de user_id par organization_id
ALTER TABLE public.social_accounts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

UPDATE public.social_accounts sa
SET organization_id = u.temp_org_id
FROM public.users u
WHERE sa.user_id = u.id;

ALTER TABLE public.social_accounts ALTER COLUMN organization_id SET NOT NULL;

-- Suppression des RLS policies existantes dépendantes de user_id
DROP POLICY IF EXISTS "social_accounts: own rows" ON public.social_accounts;

-- Suppression des anciennes contraintes uniques
ALTER TABLE public.social_accounts DROP CONSTRAINT IF EXISTS social_accounts_user_id_platform_key;
ALTER TABLE public.social_accounts DROP CONSTRAINT IF EXISTS social_accounts_user_id_platform_idx;

-- Ajouter la nouvelle contrainte autorisant le multi-comptes par plateforme
ALTER TABLE public.social_accounts ADD CONSTRAINT social_accounts_org_platform_user_unique UNIQUE (organization_id, platform, platform_user_id);

-- Supprimer l'ancienne colonne
ALTER TABLE public.social_accounts DROP COLUMN IF EXISTS user_id;


-- 3.2 POSTS
-- Liaison des posts à l'organisation (on garde user_id comme auteur)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

UPDATE public.posts p
SET organization_id = u.temp_org_id
FROM public.users u
WHERE p.user_id = u.id;

ALTER TABLE public.posts ALTER COLUMN organization_id SET NOT NULL;

-- Suppression des RLS policies existantes dépendantes de user_id
DROP POLICY IF EXISTS "posts: own rows" ON public.posts;

-- Index pour accélérer le requêtage
CREATE INDEX IF NOT EXISTS idx_posts_organization_status ON public.posts(organization_id, status);


-- 3.3 BRAND PROFILES
-- Remplacement de user_id par organization_id
ALTER TABLE public.brand_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE;

UPDATE public.brand_profiles bp
SET organization_id = u.temp_org_id
FROM public.users u
WHERE bp.user_id = u.id;

ALTER TABLE public.brand_profiles ALTER COLUMN organization_id SET NOT NULL;

-- Suppression des RLS policies existantes dépendantes de user_id
DROP POLICY IF EXISTS "brand_profiles: own row" ON public.brand_profiles;

-- Nettoyer la contrainte et l'ancienne colonne user_id
ALTER TABLE public.brand_profiles DROP CONSTRAINT IF EXISTS brand_profiles_user_id_key;
ALTER TABLE public.brand_profiles DROP CONSTRAINT IF EXISTS brand_profiles_user_id_fkey;
ALTER TABLE public.brand_profiles DROP COLUMN IF EXISTS user_id;


-- 3.4 SOCIAL BASELINES
-- Gestion dynamique si la table n'existe pas encore
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'social_baselines') THEN
        -- La table existe : on la migre dynamiquement pour éviter les erreurs de compilation SQL
        EXECUTE 'ALTER TABLE public.social_baselines ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE';
        
        UPDATE public.social_baselines sb
        SET organization_id = u.temp_org_id
        FROM public.users u
        WHERE sb.user_id = u.id;

        EXECUTE 'ALTER TABLE public.social_baselines ALTER COLUMN organization_id SET NOT NULL';

        -- Suppression des politiques et contraintes dépendantes
        EXECUTE 'DROP POLICY IF EXISTS "social_baselines: own rows" ON public.social_baselines';
        EXECUTE 'ALTER TABLE public.social_baselines DROP CONSTRAINT IF EXISTS social_baselines_user_id_platform_key';
        EXECUTE 'ALTER TABLE public.social_baselines DROP CONSTRAINT IF EXISTS social_baselines_user_id_platform_idx';
        EXECUTE 'ALTER TABLE public.social_baselines ADD CONSTRAINT social_baselines_org_platform_unique UNIQUE (organization_id, platform)';

        EXECUTE 'ALTER TABLE public.social_baselines DROP COLUMN IF EXISTS user_id';
    ELSE
        -- La table n'existe pas : on la crée directement avec le schéma cible
        CREATE TABLE public.social_baselines (
            id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
            platform            TEXT NOT NULL,
            baseline_followers  INTEGER DEFAULT 0,
            current_followers   INTEGER DEFAULT 0,
            posts_count         INTEGER DEFAULT 0,
            baseline_at         TIMESTAMPTZ DEFAULT NOW(),
            refreshed_at        TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(organization_id, platform)
        );
        ALTER TABLE public.social_baselines ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;


-- 3.5 SUBSCRIPTIONS
-- Remplacement de user_id par organization_id
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

UPDATE public.subscriptions s
SET organization_id = u.temp_org_id
FROM public.users u
WHERE s.user_id = u.id;

ALTER TABLE public.subscriptions ALTER COLUMN organization_id SET NOT NULL;

-- Suppression des RLS policies existantes dépendantes de user_id
DROP POLICY IF EXISTS "subscriptions: own rows" ON public.subscriptions;

-- Supprimer l'ancienne colonne
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS user_id;


-- 3.6 NOTIFICATIONS
-- Ajouter organization_id pour le filtrage
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

UPDATE public.notifications n
SET organization_id = u.temp_org_id
FROM public.users u
WHERE n.user_id = u.id;

-- Suppression des RLS policies existantes dépendantes de user_id
DROP POLICY IF EXISTS "Les utilisateurs voient leurs propres notifications" ON public.notifications;
DROP POLICY IF EXISTS "Les utilisateurs peuvent marquer leurs notifications comme lues" ON public.notifications;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs notifications" ON public.notifications;

-- Index de filtrage
CREATE INDEX IF NOT EXISTS idx_notifications_org ON public.notifications(organization_id);


-- ─── 4. POLITIQUES RLS MIGRÉES (Membres de l'organisation) ────────────────────

-- 4.1 Politiques RLS pour 'social_accounts'
DROP POLICY IF EXISTS "social_accounts: select" ON public.social_accounts;
CREATE POLICY "social_accounts: select" ON public.social_accounts
  FOR SELECT USING (is_org_member(organization_id));

DROP POLICY IF EXISTS "social_accounts: write" ON public.social_accounts;
CREATE POLICY "social_accounts: write" ON public.social_accounts
  FOR ALL 
  USING (is_org_member(organization_id, ARRAY['owner', 'cm']))
  WITH CHECK (is_org_member(organization_id, ARRAY['owner', 'cm']));


-- 4.2 Politiques RLS pour 'posts'
DROP POLICY IF EXISTS "posts: select" ON public.posts;
CREATE POLICY "posts: select" ON public.posts
  FOR SELECT USING (is_org_member(organization_id));

DROP POLICY IF EXISTS "posts: write" ON public.posts;
CREATE POLICY "posts: write" ON public.posts
  FOR ALL 
  USING (is_org_member(organization_id, ARRAY['owner', 'cm']))
  WITH CHECK (is_org_member(organization_id, ARRAY['owner', 'cm']));


-- 4.3 Politiques RLS pour 'brand_profiles'
DROP POLICY IF EXISTS "brand_profiles: select" ON public.brand_profiles;
CREATE POLICY "brand_profiles: select" ON public.brand_profiles
  FOR SELECT USING (is_org_member(organization_id));

DROP POLICY IF EXISTS "brand_profiles: write" ON public.brand_profiles;
CREATE POLICY "brand_profiles: write" ON public.brand_profiles
  FOR ALL 
  USING (is_org_member(organization_id, ARRAY['owner', 'cm']))
  WITH CHECK (is_org_member(organization_id, ARRAY['owner', 'cm']));


-- 4.4 Politiques RLS pour 'social_baselines'
DROP POLICY IF EXISTS "social_baselines: select" ON public.social_baselines;
CREATE POLICY "social_baselines: select" ON public.social_baselines
  FOR SELECT USING (is_org_member(organization_id));

DROP POLICY IF EXISTS "social_baselines: write" ON public.social_baselines;
CREATE POLICY "social_baselines: write" ON public.social_baselines
  FOR ALL 
  USING (is_org_member(organization_id, ARRAY['owner', 'cm']))
  WITH CHECK (is_org_member(organization_id, ARRAY['owner', 'cm']));


-- 4.5 Politiques RLS pour 'subscriptions'
DROP POLICY IF EXISTS "subscriptions: select" ON public.subscriptions;
CREATE POLICY "subscriptions: select" ON public.subscriptions
  FOR SELECT USING (is_org_member(organization_id));


-- 4.6 Politiques RLS pour 'notifications'
DROP POLICY IF EXISTS "notifications: select" ON public.notifications;
CREATE POLICY "notifications: select" ON public.notifications
  FOR SELECT USING (user_id = auth.uid() AND is_org_member(organization_id));

DROP POLICY IF EXISTS "notifications: write" ON public.notifications;
CREATE POLICY "notifications: write" ON public.notifications
  FOR ALL 
  USING (user_id = auth.uid() AND is_org_member(organization_id))
  WITH CHECK (user_id = auth.uid() AND is_org_member(organization_id));


-- ─── 5. NETTOYAGE TABLE USERS & RECONSTRUCTION VUES ───────────────────────────
-- La vue public.vw_community_posts dépend de la colonne plan de la table users.
-- On supprime la vue temporairement avant de supprimer la colonne, puis on la recrée.
DROP VIEW IF EXISTS public.vw_community_posts;

-- On supprime les attributs migrés vers la table organizations
ALTER TABLE public.users DROP COLUMN IF EXISTS temp_org_id;
ALTER TABLE public.users DROP COLUMN IF EXISTS plan;
ALTER TABLE public.users DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE public.users DROP COLUMN IF EXISTS zernio_profile_id;

-- Recréation de la vue vw_community_posts
-- Pour préserver la compatibilité frontend, la colonne plan est maintenant récupérée
-- dynamiquement à partir de l'organisation dont l'utilisateur est le propriétaire (owner).
CREATE VIEW public.vw_community_posts AS
SELECT
  p.id,
  p.user_id,
  p.group_id,
  p.content,
  p.image_url,
  p.created_at,
  p.updated_at,
  u.full_name,
  u.avatar_url,
  COALESCE(
    (SELECT o.plan FROM public.organizations o 
     JOIN public.memberships m ON o.id = m.organization_id 
     WHERE m.user_id = u.id AND m.role = 'owner' 
     LIMIT 1), 
    'free'
  ) AS plan,
  u.username,
  (SELECT COUNT(*) FROM public.community_likes l  WHERE l.post_id = p.id)::int AS likes_count,
  (SELECT COUNT(*) FROM public.community_comments c WHERE c.post_id = p.id)::int AS comments_count
FROM public.community_posts p
JOIN public.users u ON u.id = p.user_id;

COMMIT;

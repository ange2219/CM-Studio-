-- ==============================================================================
-- Script de Sécurisation : Row Level Security (RLS)
-- Ce script active et configure le RLS sur toutes les tables existantes
-- et les nouvelles tables communautaires.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLES COMMUNAUTAIRES (Nouvelles tables)
-- ------------------------------------------------------------------------------

-- Table : community_posts
ALTER TABLE IF EXISTS public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tout le monde peut voir les posts communautaires" ON public.community_posts;
CREATE POLICY "Tout le monde peut voir les posts communautaires" ON public.community_posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres posts" ON public.community_posts;
CREATE POLICY "Les utilisateurs peuvent créer leurs propres posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres posts" ON public.community_posts;
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres posts" ON public.community_posts;
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = user_id);


-- Table : community_comments
ALTER TABLE IF EXISTS public.community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tout le monde peut voir les commentaires" ON public.community_comments;
CREATE POLICY "Tout le monde peut voir les commentaires" ON public.community_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs commentaires" ON public.community_comments;
CREATE POLICY "Les utilisateurs peuvent créer leurs commentaires" ON public.community_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs commentaires" ON public.community_comments;
CREATE POLICY "Les utilisateurs peuvent modifier leurs commentaires" ON public.community_comments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs commentaires" ON public.community_comments;
CREATE POLICY "Les utilisateurs peuvent supprimer leurs commentaires" ON public.community_comments
  FOR DELETE USING (auth.uid() = user_id);


-- Table : community_likes
ALTER TABLE IF EXISTS public.community_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tout le monde peut voir les likes" ON public.community_likes;
CREATE POLICY "Tout le monde peut voir les likes" ON public.community_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Les utilisateurs peuvent liker en leur nom" ON public.community_likes;
CREATE POLICY "Les utilisateurs peuvent liker en leur nom" ON public.community_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent retirer leur like" ON public.community_likes;
CREATE POLICY "Les utilisateurs peuvent retirer leur like" ON public.community_likes
  FOR DELETE USING (auth.uid() = user_id);


-- ------------------------------------------------------------------------------
-- 2. VÉRIFICATION DES TABLES EXISTANTES
-- (S'assure que le RLS n'a pas été désactivé par erreur)
-- ------------------------------------------------------------------------------

ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.social_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_generation_log ENABLE ROW LEVEL SECURITY;

-- Note : Les politiques pour ces tables sont déjà définies dans votre schema.sql
-- d'origine. Cette commande garantit juste que le RLS est bien actif au niveau de la table.

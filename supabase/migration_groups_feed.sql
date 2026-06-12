-- ==============================================================================
-- Migration : Liaison des publications communautaires aux Groupes — Étape 4+
-- À exécuter dans l'onglet "SQL Editor" de votre projet Supabase
-- ==============================================================================

-- ─── 1. AJOUT DE LA COLONNE DE GROUPE DANS LES POSTS ─────────────────────────
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE;

-- Indexation du group_id pour accélérer le filtrage par groupe
CREATE INDEX IF NOT EXISTS idx_community_posts_group_id ON public.community_posts(group_id);

-- ─── 2. MISE À JOUR DE LA VUE DÉNORMALISÉE ───────────────────────────────────
-- Reconstruire la vue pour y inclure la colonne group_id
DROP VIEW IF EXISTS public.vw_community_posts;

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
  u.plan,
  u.username,
  (SELECT COUNT(*) FROM public.community_likes l  WHERE l.post_id = p.id)::int AS likes_count,
  (SELECT COUNT(*) FROM public.community_comments c WHERE c.post_id = p.id)::int AS comments_count
FROM public.community_posts p
JOIN public.users u ON u.id = p.user_id;

-- ─── 3. MISE À JOUR DU RLS POUR SÉCURISER L'ACCÈS AUX POSTS DE GROUPE ────────
-- Permet de lire les publications uniquement si :
-- - Elles sont globales (group_id IS NULL)
-- - Ou si l'utilisateur est membre du groupe correspondant (dans group_members)
DROP POLICY IF EXISTS "community_posts_select" ON public.community_posts;

CREATE POLICY "community_posts_select" ON public.community_posts
  FOR SELECT USING (
    group_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = community_posts.group_id AND user_id = auth.uid()
    )
  );

-- Permet de publier uniquement si :
-- - La publication est globale (group_id IS NULL)
-- - Ou si l'utilisateur est membre du groupe correspondant (dans group_members)
DROP POLICY IF EXISTS "community_posts_insert" ON public.community_posts;

CREATE POLICY "community_posts_insert" ON public.community_posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      group_id IS NULL OR 
      EXISTS (
        SELECT 1 FROM public.group_members 
        WHERE group_id = community_posts.group_id AND user_id = auth.uid()
      )
    )
  );

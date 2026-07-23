-- ============================================================
-- Migration : Partages & Sauvegardes (community_shares, community_bookmarks)
-- À exécuter dans le "SQL Editor" de Supabase
-- ============================================================

-- 1. Table des partages (community_shares)
CREATE TABLE IF NOT EXISTS public.community_shares (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_shares_post_user_unique UNIQUE (post_id, user_id)
);

ALTER TABLE public.community_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_shares_select" ON public.community_shares FOR SELECT USING (true);
CREATE POLICY "community_shares_insert" ON public.community_shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_shares_delete" ON public.community_shares FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_community_shares_post_id ON public.community_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_community_shares_user_id ON public.community_shares(user_id);


-- 2. Table des sauvegardes / marque-pages (community_bookmarks)
CREATE TABLE IF NOT EXISTS public.community_bookmarks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_bookmarks_post_user_unique UNIQUE (post_id, user_id)
);

ALTER TABLE public.community_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_bookmarks_select" ON public.community_bookmarks FOR SELECT USING (true);
CREATE POLICY "community_bookmarks_insert" ON public.community_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_bookmarks_delete" ON public.community_bookmarks FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_community_bookmarks_post_id ON public.community_bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_community_bookmarks_user_id ON public.community_bookmarks(user_id);


-- 3. Mise à jour de la vue vw_community_posts (Utilisation de CREATE OR REPLACE VIEW en conservant l'ordre exact des colonnes)
CREATE OR REPLACE VIEW public.vw_community_posts AS
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
  public.get_post_likes_count(p.id) AS likes_count,
  (SELECT COUNT(*) FROM public.community_comments c WHERE c.post_id = p.id)::int AS comments_count,
  (SELECT COUNT(*) FROM public.community_shares s   WHERE s.post_id = p.id)::int AS shares_count
FROM public.community_posts p
JOIN public.user_public_profiles u ON u.id = p.user_id;

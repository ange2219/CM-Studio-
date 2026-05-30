-- ==============================================================================
-- Correction d'Urgence : Ajout de parent_id et image_url
-- Exécutez ce script dans le SQL Editor de Supabase.
-- ==============================================================================

-- 1. Ajout de parent_id pour les commentaires
ALTER TABLE IF EXISTS public.community_comments 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.community_comments(id) ON DELETE CASCADE;

-- 2. Ajout de image_url pour les posts
ALTER TABLE IF EXISTS public.community_posts
ADD COLUMN IF NOT EXISTS image_url text;

-- 3. Mise à jour de la vue (Très important !)
DROP VIEW IF EXISTS public.vw_community_posts;
CREATE OR REPLACE VIEW public.vw_community_posts AS
SELECT
  p.id,
  p.user_id,
  p.content,
  p.image_url,
  p.created_at,
  p.updated_at,
  u.full_name,
  u.avatar_url,
  u.plan,
  (SELECT COUNT(*) FROM public.community_likes l WHERE l.post_id = p.id)::int    AS likes_count,
  (SELECT COUNT(*) FROM public.community_comments c WHERE c.post_id = p.id)::int AS comments_count
FROM public.community_posts p
JOIN public.users u ON u.id = p.user_id;

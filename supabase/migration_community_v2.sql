-- ============================================================
-- Migration : Communauté V2 (Réponses, Likes, Notifications)
-- À exécuter dans l'onglet "SQL Editor" de Supabase
-- ============================================================

-- 1. Ajouter parent_id à community_comments pour le threading
ALTER TABLE public.community_comments 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.community_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_community_comments_parent_id ON public.community_comments(parent_id);

-- 2. Table des likes sur les commentaires
CREATE TABLE IF NOT EXISTS public.community_comment_likes (
  comment_id uuid NOT NULL REFERENCES public.community_comments(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);
ALTER TABLE public.community_comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_comment_likes_select" ON public.community_comment_likes FOR SELECT USING (true);
CREATE POLICY "community_comment_likes_insert" ON public.community_comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_comment_likes_delete" ON public.community_comment_likes FOR DELETE USING (auth.uid() = user_id);

-- 3. Table des notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- destinataire
  actor_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- celui qui fait l'action
  type        text NOT NULL CHECK (type IN ('post_like', 'comment_like', 'comment_reply')),
  post_id     uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id  uuid REFERENCES public.community_comments(id) ON DELETE CASCADE,
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (true); -- Autorise la création de notifications pour les autres

-- 4. Fonction RPC pour compter les likes des commentaires
CREATE OR REPLACE FUNCTION public.get_comment_likes_counts(post_id_val uuid)
RETURNS TABLE (comment_id uuid, count bigint) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT l.comment_id, COUNT(*)
  FROM public.community_comment_likes l
  JOIN public.community_comments c ON c.id = l.comment_id
  WHERE c.post_id = post_id_val
  GROUP BY l.comment_id;
END;
$$;

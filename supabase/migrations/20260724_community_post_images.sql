-- ══════════════════════════════════════════════════════════════════════════════
-- 20260724_community_post_images.sql
-- Table pour le multi-upload d'images sur les publications communautaires
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.community_post_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  image_url   text NOT NULL,
  position    int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index d'accès rapide trié par ordre d'affichage
CREATE INDEX IF NOT EXISTS idx_community_post_images_post_id
  ON public.community_post_images (post_id, position ASC);

-- Sécurité RLS
ALTER TABLE public.community_post_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des images de posts"
  ON public.community_post_images FOR SELECT
  USING (true);

CREATE POLICY "Création d'images par l'auteur du post"
  ON public.community_post_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.community_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Suppression d'images par l'auteur du post"
  ON public.community_post_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.community_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

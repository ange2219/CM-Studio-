-- ==============================================================================
-- Migration : Profil public — Étape 2
-- À exécuter dans l'onglet "SQL Editor" de votre projet Supabase
-- (Après migration_follows.sql)
-- ==============================================================================

-- ─── 1. Ajout de la colonne bio sur la table users ────────────────────────────

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;

-- ─── 2. Mise à jour de la vue vw_community_posts ──────────────────────────────
-- CREATE OR REPLACE ne peut pas réordonner les colonnes existantes → DROP + CREATE.

DROP VIEW IF EXISTS public.vw_community_posts;

CREATE VIEW public.vw_community_posts AS
SELECT
  p.id,
  p.user_id,
  p.content,
  p.image_url,
  p.created_at,
  u.full_name,
  u.avatar_url,
  u.plan,
  u.username,
  (SELECT COUNT(*) FROM public.community_likes l  WHERE l.post_id = p.id)::int AS likes_count,
  (SELECT COUNT(*) FROM public.community_comments c WHERE c.post_id = p.id)::int AS comments_count
FROM public.community_posts p
JOIN public.users u ON u.id = p.user_id;

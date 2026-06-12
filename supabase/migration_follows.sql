-- ==============================================================================
-- Migration : Système de Suivi (Follow) entre utilisateurs
-- À exécuter dans l'onglet "SQL Editor" de votre projet Supabase
-- ==============================================================================

-- ─── 1. TABLE ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_follows (
  follower_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Clé primaire composite : un utilisateur ne peut suivre qu'une fois le même compte
  PRIMARY KEY (follower_id, following_id),

  -- Un utilisateur ne peut pas se suivre lui-même
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

-- ─── 2. INDEX DE PERFORMANCE ──────────────────────────────────────────────────

-- Accélérer la requête "qui suit untel ?" (liste de ses followers)
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id
  ON public.user_follows (following_id);

-- Accélérer la requête "qui est-ce qu'untel suit ?" (liste des comptes suivis)
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id
  ON public.user_follows (follower_id);

-- ─── 3. ROW LEVEL SECURITY ────────────────────────────────────────────────────

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Tout le monde (connecté) peut consulter les relations de suivi
CREATE POLICY "user_follows_select"
  ON public.user_follows
  FOR SELECT
  USING (true);

-- Seul l'utilisateur connecté peut créer son propre suivi (il est forcément le follower)
CREATE POLICY "user_follows_insert"
  ON public.user_follows
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Seul l'utilisateur connecté peut supprimer ses propres abonnements
CREATE POLICY "user_follows_delete"
  ON public.user_follows
  FOR DELETE
  USING (auth.uid() = follower_id);

-- ─── 4. VUES UTILITAIRES ──────────────────────────────────────────────────────

-- Nombre de followers et d'abonnements par utilisateur
-- (Pratique pour afficher les compteurs sur le profil)
CREATE OR REPLACE VIEW public.vw_follow_counts AS
SELECT
  u.id                                                                          AS user_id,
  (SELECT COUNT(*) FROM public.user_follows f WHERE f.following_id = u.id)::int AS followers_count,
  (SELECT COUNT(*) FROM public.user_follows f WHERE f.follower_id  = u.id)::int AS following_count
FROM public.users u;

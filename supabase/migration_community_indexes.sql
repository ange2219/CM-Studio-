-- =====================================================================
-- Migration : Index de performance pour la communauté
-- À exécuter dans l'onglet SQL Editor de Supabase
-- =====================================================================

-- Index pour accélérer la recherche des posts par utilisateur (ex: affichage profil)
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id 
  ON public.community_posts (user_id);

-- Index pour accélérer la recherche des posts aimés par un utilisateur (ex: feed accueil/communauté)
CREATE INDEX IF NOT EXISTS idx_community_likes_user_id 
  ON public.community_likes (user_id);

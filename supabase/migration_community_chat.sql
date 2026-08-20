-- ══════════════════════════════════════════════════════════════════
-- CM Studio — Chat Public Général de la Communauté
-- Migration : Table dédiée public.community_chat_messages + RLS + Realtime
-- ══════════════════════════════════════════════════════════════════

-- 1. CRÉATION DE LA TABLE
CREATE TABLE IF NOT EXISTS public.community_chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL CHECK (char_length(trim(content)) > 0 AND char_length(content) <= 4000),
  attachment_url  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. INDEX POUR LES PERFORMANCES (tri chronologique et filtres utilisateur)
CREATE INDEX IF NOT EXISTS idx_community_chat_created_at 
  ON public.community_chat_messages(created_at ASC);

CREATE INDEX IF NOT EXISTS idx_community_chat_user_id 
  ON public.community_chat_messages(user_id);

-- 3. ACTIVATION DU ROW LEVEL SECURITY (RLS)
ALTER TABLE public.community_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy SELECT : Tout utilisateur authentifié peut lire le chat général
DROP POLICY IF EXISTS "community_chat: lecture par les utilisateurs connectes" ON public.community_chat_messages;
CREATE POLICY "community_chat: lecture par les utilisateurs connectes" 
  ON public.community_chat_messages
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Policy INSERT : Un utilisateur authentifié peut envoyer des messages sous son propre identifiant
DROP POLICY IF EXISTS "community_chat: envoi par son auteur" ON public.community_chat_messages;
CREATE POLICY "community_chat: envoi par son auteur" 
  ON public.community_chat_messages
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Policy DELETE : Un utilisateur peut supprimer ses propres messages
DROP POLICY IF EXISTS "community_chat: suppression par son auteur" ON public.community_chat_messages;
CREATE POLICY "community_chat: suppression par son auteur" 
  ON public.community_chat_messages
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- 4. ACTIVATION DU REALTIME SUPABASE SUR LA TABLE
-- Permet aux abonnements supabase.channel().on('postgres_changes', ...) de recevoir les nouveaux messages en direct
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_chat_messages;

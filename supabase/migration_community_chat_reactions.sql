-- ══════════════════════════════════════════════════════════════════
-- CM Studio — Persistance des Réactions du Chat Général
-- Migration : Table public.community_chat_reactions + RLS + Realtime
-- À exécuter dans le SQL Editor de Supabase
-- ══════════════════════════════════════════════════════════════════

-- 1. CRÉATION DE LA TABLE DES RÉACTIONS
CREATE TABLE IF NOT EXISTS public.community_chat_reactions (
  message_id  UUID NOT NULL REFERENCES public.community_chat_messages(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  emoji       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id, emoji)
);

-- 2. INDEX POUR LES PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_community_chat_reactions_msg 
  ON public.community_chat_reactions(message_id);

CREATE INDEX IF NOT EXISTS idx_community_chat_reactions_user 
  ON public.community_chat_reactions(user_id);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.community_chat_reactions ENABLE ROW LEVEL SECURITY;

-- Lecture par tout le monde
DROP POLICY IF EXISTS "community_chat_reactions: lecture" ON public.community_chat_reactions;
CREATE POLICY "community_chat_reactions: lecture" 
  ON public.community_chat_reactions
  FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Ajout d'une réaction par son auteur
DROP POLICY IF EXISTS "community_chat_reactions: ajout" ON public.community_chat_reactions;
CREATE POLICY "community_chat_reactions: ajout" 
  ON public.community_chat_reactions
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Suppression d'une réaction par son auteur
DROP POLICY IF EXISTS "community_chat_reactions: suppression" ON public.community_chat_reactions;
CREATE POLICY "community_chat_reactions: suppression" 
  ON public.community_chat_reactions
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- 4. ACTIVATION DU TEMPS RÉEL (REALTIME)
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_chat_reactions;

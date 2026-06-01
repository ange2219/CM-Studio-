-- ══════════════════════════════════════════════════════════════════
-- CM Studio — Messagerie Interne
-- Migration : conversations + participants + messages
-- ORDRE CORRIGÉ : tables d'abord, puis policies
-- ══════════════════════════════════════════════════════════════════

-- ─── ÉTAPE 1 : CRÉER TOUTES LES TABLES ───────────────────────────

CREATE TABLE IF NOT EXISTS public.conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content          TEXT NOT NULL DEFAULT '',
  attachment_url   TEXT,
  attachment_name  TEXT,
  attachment_type  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.message_reads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  read_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);


-- ─── ÉTAPE 2 : INDEX ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS conv_participants_conv_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS conv_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS messages_conversation_id  ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_sender_id        ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS message_reads_user        ON public.message_reads(user_id, message_id);


-- ─── ÉTAPE 3 : ACTIVER RLS ────────────────────────────────────────

ALTER TABLE public.conversations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads            ENABLE ROW LEVEL SECURITY;


-- ─── ÉTAPE 4 : POLICIES ───────────────────────────────────────────

-- conversations
CREATE POLICY "conv: visible aux participants" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = conversations.id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "conv: creer" ON public.conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "conv: mise a jour par participant" ON public.conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = conversations.id
        AND user_id = auth.uid()
    )
  );

-- conversation_participants
CREATE POLICY "participants: visibles par membre" ON public.conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "participants: insertion libre" ON public.conversation_participants
  FOR INSERT WITH CHECK (true);

-- messages
CREATE POLICY "messages: lisibles par les participants" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "messages: envoi par participant" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
    )
  );

-- message_reads
CREATE POLICY "message_reads: propre" ON public.message_reads
  FOR ALL USING (user_id = auth.uid());


-- ─── ÉTAPE 5 : TRIGGER updated_at ────────────────────────────────

CREATE OR REPLACE FUNCTION public.touch_conversation_on_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_message_inserted ON public.messages;
CREATE TRIGGER on_message_inserted
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_conversation_on_message();


-- ─── ÉTAPE 6 : HELPER find_or_create_dm ──────────────────────────

CREATE OR REPLACE FUNCTION public.find_or_create_dm(other_user_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_conv_id UUID;
  v_me UUID := auth.uid();
BEGIN
  SELECT cp1.conversation_id INTO v_conv_id
  FROM public.conversation_participants cp1
  JOIN public.conversation_participants cp2
    ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = v_me
    AND cp2.user_id = other_user_id
    AND (
      SELECT COUNT(*) FROM public.conversation_participants
      WHERE conversation_id = cp1.conversation_id
    ) = 2
  LIMIT 1;

  IF v_conv_id IS NULL THEN
    INSERT INTO public.conversations DEFAULT VALUES
    RETURNING id INTO v_conv_id;

    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES (v_conv_id, v_me), (v_conv_id, other_user_id);
  END IF;

  RETURN v_conv_id;
END;
$$;

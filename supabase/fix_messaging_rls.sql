-- 1. Fonction d'aide pour vérifier la participation à une conversation sans récursion RLS
CREATE OR REPLACE FUNCTION public.check_is_conversation_member(p_conv_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = p_conv_id AND user_id = p_user_id
  );
END;
$$;

-- 2. Nettoyer les anciennes politiques RLS
DROP POLICY IF EXISTS "conv: visible aux participants" ON public.conversations;
DROP POLICY IF EXISTS "conv: creer" ON public.conversations;
DROP POLICY IF EXISTS "conv: mise a jour par participant" ON public.conversations;

DROP POLICY IF EXISTS "participants: visibles par membre" ON public.conversation_participants;
DROP POLICY IF EXISTS "participants: insertion libre" ON public.conversation_participants;

DROP POLICY IF EXISTS "messages: lisibles par les participants" ON public.messages;
DROP POLICY IF EXISTS "messages: envoi par participant" ON public.messages;

-- 3. Nouvelles politiques RLS pour public.conversations
CREATE POLICY "conv: visible aux participants" ON public.conversations
  FOR SELECT USING (
    public.check_is_conversation_member(id, auth.uid())
  );

CREATE POLICY "conv: creer" ON public.conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "conv: mise a jour par participant" ON public.conversations
  FOR UPDATE USING (
    public.check_is_conversation_member(id, auth.uid())
  );

-- 4. Nouvelles politiques RLS pour public.conversation_participants
-- Un utilisateur peut voir un participant s'il participe lui-même à la conversation OU si le participant est lui-même
CREATE POLICY "participants: visibles par membre" ON public.conversation_participants
  FOR SELECT USING (
    user_id = auth.uid() OR public.check_is_conversation_member(conversation_id, auth.uid())
  );

CREATE POLICY "participants: insertion libre" ON public.conversation_participants
  FOR INSERT WITH CHECK (true);

-- 5. Nouvelles politiques RLS pour public.messages
CREATE POLICY "messages: lisibles par les participants" ON public.messages
  FOR SELECT USING (
    public.check_is_conversation_member(conversation_id, auth.uid())
  );

CREATE POLICY "messages: envoi par participant" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND public.check_is_conversation_member(conversation_id, auth.uid())
  );

-- 6. Nouvelles politiques RLS pour public.message_reads
DROP POLICY IF EXISTS "message_reads: propre" ON public.message_reads;
DROP POLICY IF EXISTS "message_reads: select par participant" ON public.message_reads;
DROP POLICY IF EXISTS "message_reads: insert/update par soi-meme" ON public.message_reads;

-- Permettre de voir les lectures si on fait partie de la conversation
CREATE POLICY "message_reads: select par participant" ON public.message_reads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_reads.message_id
        AND public.check_is_conversation_member(m.conversation_id, auth.uid())
    )
  );

-- Interdire d'enregistrer une lecture pour un autre utilisateur
CREATE POLICY "message_reads: insert/update par soi-meme" ON public.message_reads
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "message_reads: propre" ON public.message_reads
  FOR ALL USING (user_id = auth.uid());

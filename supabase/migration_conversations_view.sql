-- =====================================================================
-- Migration : Vue optimisée pour la liste des conversations (Messagerie)
-- À exécuter dans l'onglet SQL Editor de Supabase
-- =====================================================================

CREATE OR REPLACE VIEW public.vw_conversations_list AS
SELECT 
  cp.user_id AS my_user_id,
  c.id AS conversation_id,
  c.updated_at,
  -- Profil public de l'autre participant
  other_cp.user_id AS other_user_id,
  u.full_name AS other_full_name,
  u.username AS other_username,
  u.avatar_url AS other_avatar_url,
  -- Contenu et métadonnées du dernier message
  m.content AS last_message_content,
  m.created_at AS last_message_created_at,
  m.attachment_name AS last_message_attachment_name
FROM public.conversation_participants cp
JOIN public.conversations c ON c.id = cp.conversation_id
-- Joindre pour trouver l'autre participant
LEFT JOIN public.conversation_participants other_cp 
  ON other_cp.conversation_id = cp.conversation_id 
  AND other_cp.user_id != cp.user_id
-- Infos du profil de l'autre participant
LEFT JOIN public.users u ON u.id = other_cp.user_id
-- Jointure latérale optimisée pour le dernier message
LEFT JOIN LATERAL (
  SELECT content, created_at, attachment_name
  FROM public.messages
  WHERE conversation_id = cp.conversation_id
  ORDER BY created_at DESC
  LIMIT 1
) m ON true;

-- Accorder les permissions de lecture
GRANT SELECT ON public.vw_conversations_list TO authenticated;
GRANT SELECT ON public.vw_conversations_list TO service_role;

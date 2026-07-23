-- ══════════════════════════════════════════════════════════════════════════════
-- 20260723_comment_likes_notifications.sql
-- Trigger de notification lors d'un j'aime sur un commentaire ou une réponse
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_comment_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comment_author UUID;
  v_post_id UUID;
  v_liker_name TEXT;
  v_existing_notif_id UUID;
BEGIN
  -- Récupérer l'auteur du commentaire et le post_id associé
  SELECT user_id, post_id INTO v_comment_author, v_post_id
  FROM public.community_comments
  WHERE id = NEW.comment_id;

  -- Ne pas notifier si l'utilisateur aime son propre commentaire
  IF v_comment_author IS NOT NULL AND v_comment_author != NEW.user_id THEN
    SELECT full_name INTO v_liker_name FROM public.users WHERE id = NEW.user_id;

    -- Anti-spam / Anti-doublon : Chercher si une notif non lue existe déjà pour ce commentaire
    SELECT id INTO v_existing_notif_id
    FROM public.notifications
    WHERE user_id = v_comment_author
      AND action_url = '/home#comment_' || NEW.comment_id || '_' || v_post_id
      AND is_read = false
    LIMIT 1;

    IF v_existing_notif_id IS NOT NULL THEN
      -- Mettre à jour la date au lieu de créer un doublon
      UPDATE public.notifications
      SET created_at = NOW(),
          message = COALESCE(v_liker_name, 'Un utilisateur') || ' a aimé votre commentaire.'
      WHERE id = v_existing_notif_id;
    ELSE
      -- Insérer la notification
      INSERT INTO public.notifications (user_id, type, title, message, action_url, platform)
      VALUES (
        v_comment_author,
        'comment_like',
        'Nouveau j''aime',
        COALESCE(v_liker_name, 'Un utilisateur') || ' a aimé votre commentaire.',
        '/home#comment_' || NEW.comment_id || '_' || v_post_id,
        'cm_studio'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_comment_like ON public.community_comment_likes;
CREATE TRIGGER on_comment_like
  AFTER INSERT ON public.community_comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_comment_like();

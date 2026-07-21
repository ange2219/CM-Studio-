-- aggregated_notifications.sql
-- A executer dans le Supabase Dashboard > SQL Editor

-- 1. MIGRATION SCHEMA
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS contributors JSONB DEFAULT '[]'::jsonb;

-- 2. INDEX UNIQUE PARTIEL
CREATE UNIQUE INDEX IF NOT EXISTS notifications_aggregated_unique
  ON public.notifications (user_id, type, action_url)
  WHERE type IN ('like', 'comment');

-- 3. FONCTION format_notification_message
CREATE OR REPLACE FUNCTION public.format_notification_message(
  p_contributors JSONB,
  p_action_verb  TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_name1 TEXT;
  v_name2 TEXT;
BEGIN
  v_count := jsonb_array_length(p_contributors);
  IF v_count = 0 THEN RETURN NULL; END IF;

  SELECT full_name INTO v_name1 FROM public.users WHERE id = (p_contributors ->> 0)::UUID;
  v_name1 := COALESCE(v_name1, 'Un utilisateur');

  IF v_count = 1 THEN
    RETURN v_name1 || ' a ' || p_action_verb || '.';
  END IF;

  SELECT full_name INTO v_name2 FROM public.users WHERE id = (p_contributors ->> 1)::UUID;
  v_name2 := COALESCE(v_name2, 'Un utilisateur');

  IF v_count = 2 THEN
    RETURN v_name1 || ' et ' || v_name2 || ' ont ' || p_action_verb || '.';
  END IF;

  -- 3+ : accord singulier/pluriel sur autre(s)
  RETURN v_name1 || ', ' || v_name2 || ' et ' || (v_count - 2)::TEXT
         || CASE WHEN (v_count - 2) = 1 THEN ' autre' ELSE ' autres' END
         || ' ont ' || p_action_verb || '.';
END;
$$;

-- 4. handle_new_like
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author        UUID;
  v_existing_notif_id  UUID;
  v_contributors       JSONB;
  v_new_message        TEXT;
BEGIN
  SELECT user_id INTO v_post_author FROM public.community_posts WHERE id = NEW.post_id;
  IF v_post_author IS NULL OR v_post_author = NEW.user_id THEN RETURN NEW; END IF;

  SELECT id, contributors
    INTO v_existing_notif_id, v_contributors
    FROM public.notifications
   WHERE user_id = v_post_author AND type = 'like' AND action_url = '/home#post-' || NEW.post_id
   LIMIT 1 FOR UPDATE;

  IF v_existing_notif_id IS NOT NULL THEN
    IF NOT (v_contributors @> jsonb_build_array(NEW.user_id::TEXT)) THEN
      v_contributors := v_contributors || jsonb_build_array(NEW.user_id::TEXT);
    END IF;
    v_new_message := public.format_notification_message(v_contributors, 'aimé votre publication');
    UPDATE public.notifications
       SET contributors = v_contributors, message = v_new_message, is_read = false, created_at = NOW()
     WHERE id = v_existing_notif_id;
  ELSE
    v_contributors := jsonb_build_array(NEW.user_id::TEXT);
    v_new_message  := public.format_notification_message(v_contributors, 'aimé votre publication');
    INSERT INTO public.notifications (user_id, type, title, message, action_url, platform, contributors)
    VALUES (v_post_author, 'like', 'Nouveau j''aime', v_new_message, '/home#post-' || NEW.post_id, 'cm_studio', v_contributors)
    ON CONFLICT (user_id, type, action_url) WHERE type IN ('like', 'comment') DO UPDATE SET
      contributors = CASE
        WHEN NOT (notifications.contributors @> jsonb_build_array(NEW.user_id::TEXT))
        THEN notifications.contributors || jsonb_build_array(NEW.user_id::TEXT)
        ELSE notifications.contributors
      END,
      message = public.format_notification_message(
        CASE WHEN NOT (notifications.contributors @> jsonb_build_array(NEW.user_id::TEXT))
             THEN notifications.contributors || jsonb_build_array(NEW.user_id::TEXT)
             ELSE notifications.contributors END,
        'aimé votre publication'),
      is_read = false, created_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_community_like ON public.community_likes;
CREATE TRIGGER on_community_like
  AFTER INSERT ON public.community_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_like();

-- 5. handle_unlike
CREATE OR REPLACE FUNCTION public.handle_unlike()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author        UUID;
  v_existing_notif_id  UUID;
  v_contributors       JSONB;
  v_new_contributors   JSONB;
  v_new_message        TEXT;
BEGIN
  SELECT user_id INTO v_post_author FROM public.community_posts WHERE id = OLD.post_id;
  IF v_post_author IS NULL OR v_post_author = OLD.user_id THEN RETURN OLD; END IF;

  SELECT id, contributors
    INTO v_existing_notif_id, v_contributors
    FROM public.notifications
   WHERE user_id = v_post_author AND type = 'like' AND action_url = '/home#post-' || OLD.post_id
   LIMIT 1 FOR UPDATE;

  IF v_existing_notif_id IS NULL THEN RETURN OLD; END IF;

  SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
    INTO v_new_contributors
    FROM jsonb_array_elements_text(v_contributors) AS elem
   WHERE elem != OLD.user_id::TEXT;

  IF jsonb_array_length(v_new_contributors) = 0 THEN
    DELETE FROM public.notifications WHERE id = v_existing_notif_id;
  ELSE
    v_new_message := public.format_notification_message(v_new_contributors, 'aimé votre publication');
    UPDATE public.notifications
       SET contributors = v_new_contributors, message = v_new_message, is_read = false, created_at = NOW()
     WHERE id = v_existing_notif_id;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_community_unlike ON public.community_likes;
CREATE TRIGGER on_community_unlike
  AFTER DELETE ON public.community_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_unlike();

-- 6. handle_new_comment
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_user        UUID;
  v_commenter_name     TEXT;
  v_existing_notif_id  UUID;
  v_contributors       JSONB;
  v_message            TEXT;
  v_excerpt            TEXT;
BEGIN
  SELECT full_name INTO v_commenter_name FROM public.users WHERE id = NEW.user_id;

  -- CAS 1 : Reponse a un commentaire (non agregee)
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO v_target_user FROM public.community_comments WHERE id = NEW.parent_id;
    IF v_target_user IS NOT NULL AND v_target_user != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, type, title, message, action_url, platform, contributors)
      VALUES (
        v_target_user, 'comment_reply', 'Nouvelle réponse',
        COALESCE(v_commenter_name, 'Un utilisateur') || ' a répondu à votre commentaire.',
        '/home#comment_' || NEW.id || '_' || NEW.post_id,
        'cm_studio', jsonb_build_array(NEW.user_id::TEXT)
      );
    END IF;
    RETURN NEW;
  END IF;

  -- CAS 2 : Commentaire direct (agrege)
  SELECT user_id INTO v_target_user FROM public.community_posts WHERE id = NEW.post_id;
  IF v_target_user IS NULL OR v_target_user = NEW.user_id THEN RETURN NEW; END IF;

  SELECT id, contributors
    INTO v_existing_notif_id, v_contributors
    FROM public.notifications
   WHERE user_id = v_target_user AND type = 'comment' AND action_url = '/home#post-' || NEW.post_id || '-comments'
   LIMIT 1 FOR UPDATE;

  IF v_existing_notif_id IS NOT NULL THEN
    IF NOT (v_contributors @> jsonb_build_array(NEW.user_id::TEXT)) THEN
      v_contributors := v_contributors || jsonb_build_array(NEW.user_id::TEXT);
    END IF;
    v_message := public.format_notification_message(v_contributors, 'commenté votre publication');
    UPDATE public.notifications
       SET contributors = v_contributors, message = v_message, is_read = false, created_at = NOW()
     WHERE id = v_existing_notif_id;
  ELSE
    v_contributors := jsonb_build_array(NEW.user_id::TEXT);
    v_excerpt := CASE WHEN char_length(NEW.content) > 60 THEN left(NEW.content, 60) || '…' ELSE NEW.content END;
    v_message := COALESCE(v_commenter_name, 'Un utilisateur') || ' a commenté : ' || v_excerpt;
    INSERT INTO public.notifications (user_id, type, title, message, action_url, platform, contributors)
    VALUES (v_target_user, 'comment', 'Nouveau commentaire', v_message, '/home#post-' || NEW.post_id || '-comments', 'cm_studio', v_contributors)
    ON CONFLICT (user_id, type, action_url) WHERE type IN ('like', 'comment') DO UPDATE SET
      contributors = CASE
        WHEN NOT (notifications.contributors @> jsonb_build_array(NEW.user_id::TEXT))
        THEN notifications.contributors || jsonb_build_array(NEW.user_id::TEXT)
        ELSE notifications.contributors
      END,
      message = public.format_notification_message(
        CASE WHEN NOT (notifications.contributors @> jsonb_build_array(NEW.user_id::TEXT))
             THEN notifications.contributors || jsonb_build_array(NEW.user_id::TEXT)
             ELSE notifications.contributors END,
        'commenté votre publication'),
      is_read = false, created_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_community_comment ON public.community_comments;
CREATE TRIGGER on_community_comment
  AFTER INSERT ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_comment();
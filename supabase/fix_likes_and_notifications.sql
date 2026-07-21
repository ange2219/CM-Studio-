-- ══════════════════════════════════════════════════════════════════════════════
-- fix_likes_and_notifications.sql
-- 1. Fonction sécurisée pour le comptage public des likes
-- 2. Politique RLS publique sur community_likes
-- 3. Vue vw_community_posts mise à jour (JOIN sur user_public_profiles)
-- 4. Triggers de notifications anti-doublon et anti-spam (likes & commentaires)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. FONCTION DE COMPTAGE DES LIKES (SECURITY DEFINER) ───────────────────────
CREATE OR REPLACE FUNCTION public.get_post_likes_count(p_post_id UUID)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM public.community_likes
  WHERE post_id = p_post_id;
$$;

-- ── 2. POLITIQUE RLS PUBLIQUE SUR COMMUNITY_LIKES ─────────────────────────────
ALTER TABLE IF EXISTS public.community_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_likes_select" ON public.community_likes;
DROP POLICY IF EXISTS "Tout le monde peut voir les likes" ON public.community_likes;

CREATE POLICY "community_likes_select" ON public.community_likes
  FOR SELECT USING (true);

-- ── 3. VUE COMMUNAUTAIRE MISE À JOUR (JOIN SUR USER_PUBLIC_PROFILES) ─────────
CREATE OR REPLACE VIEW public.vw_community_posts AS
SELECT
  p.id,
  p.user_id,
  p.group_id,
  p.content,
  p.image_url,
  p.created_at,
  p.updated_at,
  u.full_name,
  u.avatar_url,
  COALESCE(
    (SELECT o.plan FROM public.organizations o 
     JOIN public.memberships m ON o.id = m.organization_id 
     WHERE m.user_id = u.id AND m.role = 'owner' 
     LIMIT 1), 
    'free'
  ) AS plan,
  u.username,
  public.get_post_likes_count(p.id) AS likes_count,
  (SELECT COUNT(*) FROM public.community_comments c WHERE c.post_id = p.id)::int AS comments_count
FROM public.community_posts p
JOIN public.user_public_profiles u ON u.id = p.user_id;

-- ── 4. TRIGGER NOTIFICATION LIKE (ANTI-SPAM & ANTI-DOUBLON) ───────────────────
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author UUID;
  v_liker_name TEXT;
  v_existing_notif_id UUID;
BEGIN
  -- Récupérer l'auteur du post
  SELECT user_id INTO v_post_author FROM public.community_posts WHERE id = NEW.post_id;

  -- Ne pas notifier si l'auteur aime son propre post
  IF v_post_author IS NOT NULL AND v_post_author != NEW.user_id THEN
    SELECT full_name INTO v_liker_name FROM public.users WHERE id = NEW.user_id;

    -- Anti-spam : Chercher si une notification non lue existe déjà pour ce post et cette personne
    SELECT id INTO v_existing_notif_id
    FROM public.notifications
    WHERE user_id = v_post_author
      AND action_url = '/home#post-' || NEW.post_id
      AND is_read = false
    LIMIT 1;

    IF v_existing_notif_id IS NOT NULL THEN
      -- Mettre à jour la date au lieu de créer un doublon
      UPDATE public.notifications
      SET created_at = NOW(),
          message = COALESCE(v_liker_name, 'Un utilisateur') || ' a aimé votre publication.'
      WHERE id = v_existing_notif_id;
    ELSE
      -- Insérer une nouvelle notification
      INSERT INTO public.notifications (user_id, type, title, message, action_url, platform)
      VALUES (
        v_post_author,
        'like',
        'Nouveau j''aime',
        COALESCE(v_liker_name, 'Un utilisateur') || ' a aimé votre publication.',
        '/home#post-' || NEW.post_id,
        'cm_studio'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_community_like ON public.community_likes;
CREATE TRIGGER on_community_like
  AFTER INSERT ON public.community_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_like();

-- ── 5. TRIGGER NOTIFICATION COMMENTAIRES ET RÉPONSES ──────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_user UUID;
  v_commenter_name TEXT;
  v_title TEXT;
  v_type TEXT;
  v_message TEXT;
BEGIN
  SELECT full_name INTO v_commenter_name FROM public.users WHERE id = NEW.user_id;

  IF NEW.parent_id IS NOT NULL THEN
    -- Réponse à un commentaire
    SELECT user_id INTO v_target_user FROM public.community_comments WHERE id = NEW.parent_id;
    v_type := 'comment_reply';
    v_title := 'Nouvelle réponse';
    v_message := COALESCE(v_commenter_name, 'Un utilisateur') || ' a répondu à votre commentaire.';
  ELSE
    -- Commentaire direct sur un post
    SELECT user_id INTO v_target_user FROM public.community_posts WHERE id = NEW.post_id;
    v_type := 'comment';
    v_title := 'Nouveau commentaire';
    v_message := COALESCE(v_commenter_name, 'Un utilisateur') || ' a commenté votre publication.';
  END IF;

  -- Ne pas se notifier soi-même
  IF v_target_user IS NOT NULL AND v_target_user != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, action_url, platform)
    VALUES (
      v_target_user,
      v_type,
      v_title,
      v_message,
      '/home#comment_' || NEW.id || '_' || NEW.post_id,
      'cm_studio'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_community_comment ON public.community_comments;
CREATE TRIGGER on_community_comment
  AFTER INSERT ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_comment();

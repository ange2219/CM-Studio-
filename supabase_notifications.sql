-- ==============================================================================
-- Migration : Système de Notifications
-- À exécuter dans l'onglet "SQL Editor" de Supabase
-- ==============================================================================

-- 1. Création de la table des notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL, -- e.g., 'like', 'comment', 'system', 'mention'
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  action_url text, -- Lien de redirection au clic
  platform text NOT NULL DEFAULT 'cm_studio', -- 'cm_studio', 'facebook', 'instagram', 'linkedin', etc.
  platform_icon text, -- Nom ou chemin de l'icône SVG
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Sécurité RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs voient leurs propres notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent marquer leurs notifications comme lues" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Trigger : Notification lors d'un Like communautaire
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author uuid;
  v_liker_name text;
BEGIN
  -- Récupérer l'auteur du post
  SELECT user_id INTO v_post_author FROM public.community_posts WHERE id = NEW.post_id;
  
  -- Ne pas notifier si l'utilisateur like son propre post
  IF v_post_author != NEW.user_id THEN
    -- Récupérer le nom du liker
    SELECT full_name INTO v_liker_name FROM public.users WHERE id = NEW.user_id;
    
    INSERT INTO public.notifications (user_id, type, title, message, action_url, platform)
    VALUES (
      v_post_author,
      'like',
      'Nouveau like',
      COALESCE(v_liker_name, 'Un utilisateur') || ' a aimé votre publication.',
      '/community#post-' || NEW.post_id,
      'cm_studio'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà pour éviter les erreurs
DROP TRIGGER IF EXISTS on_community_like ON public.community_likes;
CREATE TRIGGER on_community_like
  AFTER INSERT ON public.community_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_like();

-- 4. Trigger : Notification lors d'un Commentaire ou d'une Réponse
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_target_user uuid;
  v_commenter_name text;
  v_title text;
  v_message text;
BEGIN
  -- Récupérer le nom du commentateur
  SELECT full_name INTO v_commenter_name FROM public.users WHERE id = NEW.user_id;

  IF NEW.parent_id IS NOT NULL THEN
    -- C'est une réponse à un commentaire
    SELECT user_id INTO v_target_user FROM public.community_comments WHERE id = NEW.parent_id;
    v_title := 'Nouvelle réponse';
    v_message := COALESCE(v_commenter_name, 'Un utilisateur') || ' a répondu à votre commentaire.';
  ELSE
    -- C'est un commentaire direct sur un post
    SELECT user_id INTO v_target_user FROM public.community_posts WHERE id = NEW.post_id;
    v_title := 'Nouveau commentaire';
    v_message := COALESCE(v_commenter_name, 'Un utilisateur') || ' a commenté votre publication.';
  END IF;

  -- Ne pas notifier si l'utilisateur commente son propre post/commentaire
  IF v_target_user != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, action_url, platform)
    VALUES (
      v_target_user,
      'comment',
      v_title,
      v_message,
      '/community#post-' || NEW.post_id,
      'cm_studio'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_community_comment ON public.community_comments;
CREATE TRIGGER on_community_comment
  AFTER INSERT ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_comment();

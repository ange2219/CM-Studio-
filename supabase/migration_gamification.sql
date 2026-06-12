-- ==============================================================================
-- Migration : Gamification par seuils d'abonnés — Étape 4
-- À exécuter dans l'onglet "SQL Editor" de votre projet Supabase
-- ==============================================================================

-- ─── 1. TABLE : GROUP UNLOCK THRESHOLDS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.group_unlock_thresholds (
  threshold   INT PRIMARY KEY,
  label       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insertion des seuils de base
INSERT INTO public.group_unlock_thresholds (threshold, label)
VALUES 
  (10, 'Bronze / Initiés'),
  (50, 'Argent / Experts'),
  (100, 'Or / Leaders'),
  (500, 'Diamant / Légendes')
ON CONFLICT (threshold) DO UPDATE SET label = EXCLUDED.label;

-- ─── 2. TABLE : GROUPS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.groups (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    TEXT NOT NULL UNIQUE,
  description             TEXT,
  min_followers_required  INT NOT NULL REFERENCES public.group_unlock_thresholds(threshold) ON UPDATE CASCADE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insertion des groupes initiaux
INSERT INTO public.groups (name, description, min_followers_required)
VALUES 
  ('Cercle des Initiés', 'Un espace pour les créateurs qui commencent à se faire un nom.', 10),
  ('Experts de la Création', 'Partagez vos astuces avec d''autres créateurs chevronnés.', 50),
  ('Le Club des Cent', 'Réservé aux profils influents comptant au moins 100 abonnés.', 100),
  ('L''Élite Sociale', 'Le cercle très fermé des leaders à plus de 500 abonnés.', 500)
ON CONFLICT (name) DO NOTHING;

-- ─── 3. TABLE : GROUP MEMBERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.group_members (
  group_id   UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- ─── 4. ROW LEVEL SECURITY (RLS) ──────────────────────────────────────────────

ALTER TABLE public.group_unlock_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Lecture libre pour tous les utilisateurs connectés
CREATE POLICY "thresholds_select_policy" 
  ON public.group_unlock_thresholds 
  FOR SELECT USING (true);

CREATE POLICY "groups_select_policy" 
  ON public.groups 
  FOR SELECT USING (true);

CREATE POLICY "group_members_select_policy" 
  ON public.group_members 
  FOR SELECT USING (true);

-- Permet de rejoindre manuellement uniquement si le seuil requis est atteint
CREATE POLICY "group_members_insert_policy" 
  ON public.group_members 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    (
      SELECT COUNT(*)::int 
      FROM public.user_follows 
      WHERE following_id = auth.uid()
    ) >= (
      SELECT min_followers_required 
      FROM public.groups 
      WHERE id = group_id
    )
  );

-- Permet de quitter un groupe librement
CREATE POLICY "group_members_delete_policy" 
  ON public.group_members 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ─── 5. TRIGGER AUTOMATIQUE DE DÉBLOCAGE ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.check_group_unlocks()
RETURNS TRIGGER AS $$
DECLARE
  v_follower_count INT;
  v_group RECORD;
BEGIN
  -- Calcul du nombre actuel d'abonnés du profil cible (NEW.following_id)
  SELECT COUNT(*)::int INTO v_follower_count
  FROM public.user_follows
  WHERE following_id = NEW.following_id;

  -- Recherche des groupes liés au seuil atteint (ou inférieur en cas de saut de paliers)
  FOR v_group IN 
    SELECT id, name, min_followers_required 
    FROM public.groups 
    WHERE min_followers_required <= v_follower_count
  LOOP
    -- S'assurer que l'utilisateur n'est pas déjà membre
    IF NOT EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = v_group.id AND user_id = NEW.following_id
    ) THEN
      -- Auto-join du membre
      INSERT INTO public.group_members (group_id, user_id)
      VALUES (v_group.id, NEW.following_id);

      -- Insertion de la notification système
      INSERT INTO public.notifications (user_id, type, title, message, action_url, platform)
      VALUES (
        NEW.following_id,
        'system',
        '🏆 Nouveau groupe débloqué !',
        'Félicitations ! Vous avez atteint ' || v_follower_count || ' abonnés et rejoint le groupe "' || v_group.name || '".',
        '/community?tab=groups',
        'cm_studio'
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activation du trigger après insertion d'un nouvel abonné
DROP TRIGGER IF EXISTS on_follow_check_groups ON public.user_follows;
CREATE TRIGGER on_follow_check_groups
  AFTER INSERT ON public.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION public.check_group_unlocks();

-- ─── 6. BACKFILL POUR LES UTILISATEURS EXISTANTS ──────────────────────────────
DO $$
DECLARE
  v_user RECORD;
  v_group RECORD;
  v_count INT;
BEGIN
  FOR v_user IN SELECT id FROM public.users LOOP
    SELECT COUNT(*)::int INTO v_count FROM public.user_follows WHERE following_id = v_user.id;
    FOR v_group IN SELECT id, name, min_followers_required FROM public.groups WHERE min_followers_required <= v_count LOOP
      IF NOT EXISTS (SELECT 1 FROM public.group_members WHERE group_id = v_group.id AND user_id = v_user.id) THEN
        INSERT INTO public.group_members (group_id, user_id) VALUES (v_group.id, v_user.id);
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

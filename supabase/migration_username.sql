-- ==============================================================================
-- Migration : Ajout des pseudos (usernames) uniques pour les utilisateurs
-- ==============================================================================

-- 1. Ajouter la colonne username
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Fonction pour générer un username unique à partir d'un email ou d'un nom
CREATE OR REPLACE FUNCTION public.generate_unique_username(p_email TEXT, p_full_name TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v_base TEXT;
  v_username TEXT;
  v_counter INT := 0;
  v_exists BOOLEAN;
BEGIN
  -- 1. Créer la base du username (depuis l'email ou le nom complet)
  IF p_email IS NOT NULL AND p_email != '' THEN
    v_base := LOWER(SPLIT_PART(p_email, '@', 1));
  ELSIF p_full_name IS NOT NULL AND p_full_name != '' THEN
    v_base := LOWER(REGEXP_REPLACE(p_full_name, '[^a-zA-Z0-9]', '', 'g'));
  ELSE
    v_base := 'user';
  END IF;

  -- Nettoyer la base (garder uniquement lettres, chiffres, underscores, tirets)
  v_base := REGEXP_REPLACE(v_base, '[^a-z0-9_-]', '', 'g');
  
  -- S'assurer d'une longueur minimale
  IF LENGTH(v_base) < 3 THEN
    v_base := v_base || 'user';
  END IF;

  v_username := v_base;

  -- 2. Boucler pour garantir l'unicité
  LOOP
    SELECT EXISTS (SELECT 1 FROM public.users WHERE username = v_username) INTO v_exists;
    IF NOT v_exists THEN
      RETURN v_username;
    END IF;
    
    v_counter := v_counter + 1;
    v_username := LEFT(v_base, 25) || v_counter::TEXT;
  END LOOP;
END;
$$;

-- 3. Initialiser les usernames pour les utilisateurs existants
UPDATE public.users 
SET username = public.generate_unique_username(email, full_name)
WHERE username IS NULL;

-- 4. Rendre la colonne NOT NULL et UNIQUE
ALTER TABLE public.users ALTER COLUMN username SET NOT NULL;
ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
-- Optionnel : s'assurer que le format du pseudo est correct (min 3 caractères, max 30, alphanumérique + _ et -)
ALTER TABLE public.users ADD CONSTRAINT users_username_check CHECK (username ~ '^[a-zA-Z0-9_-]{3,30}$');

-- 5. Mettre à jour la fonction handle_new_user pour l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_username TEXT;
BEGIN
  v_username := public.generate_unique_username(NEW.email, NEW.raw_user_meta_data->>'full_name');

  INSERT INTO public.users (id, email, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    v_username
  );
  RETURN NEW;
END;
$$;

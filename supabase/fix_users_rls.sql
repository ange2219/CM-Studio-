-- ─── 1. RESTRICTION DE LA POLICY SELECT SUR USERS ─────────────────────────────
-- Suppression des anciennes politiques RLS
DROP POLICY IF EXISTS "users: select public" ON public.users;
DROP POLICY IF EXISTS "users: own row" ON public.users;

-- Nouvelle politique RLS stricte : L'utilisateur ne peut voir/modifier que sa propre ligne
CREATE POLICY "users: own row" ON public.users
  FOR ALL TO authenticated, anon USING (auth.uid() = id);

-- ─── 2. CRÉATION DE LA VUE RESTREINTE EN LECTURE SEULE ────────────────────────
CREATE OR REPLACE VIEW public.user_public_profiles AS
  SELECT id, full_name, avatar_url, username, bio, created_at
  FROM public.users;

-- Autorisation de lecture à tous les rôles pour la messagerie et la communauté
GRANT SELECT ON public.user_public_profiles TO authenticated, anon;

-- ─── 3. FONCTION DE SIMULATION POUR LE TEST RLS ───────────────────────────────
CREATE OR REPLACE FUNCTION public.test_rls_simulation(user_id_a UUID, user_id_b UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  res_users_own_a JSONB;
  res_users_b_from_a JSONB;
  res_view_b_from_a JSONB;
BEGIN
  -- Simuler la session de l'utilisateur A
  PERFORM set_config('request.jwt.claim.sub', user_id_a::text, true);
  
  -- Passer en session non-administrateur (role et session authorization) pour forcer RLS
  SET SESSION AUTHORIZATION authenticated;

  -- 1. Lire le propre profil de A sur 'users' (doit réussir)
  BEGIN
    SELECT jsonb_build_object(
      'id', id,
      'email', email,
      'ayrshare_profile_key', ayrshare_profile_key
    ) INTO res_users_own_a
    FROM public.users
    WHERE id = user_id_a;
    IF res_users_own_a IS NULL THEN
      res_users_own_a := '{"status": "no rows returned"}'::jsonb;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    res_users_own_a := jsonb_build_object('error', SQLERRM);
  END;

  -- 2. Lire le profil de B sur 'users' (devrait retourner vide / NULL car RLS bloque)
  BEGIN
    SELECT jsonb_build_object(
      'id', id,
      'email', email
    ) INTO res_users_b_from_a
    FROM public.users
    WHERE id = user_id_b;
    IF res_users_b_from_a IS NULL THEN
      res_users_b_from_a := '{"status": "no rows returned (blocked by RLS)"}'::jsonb;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    res_users_b_from_a := jsonb_build_object('error', SQLERRM);
  END;

  -- 3. Lire le profil de B sur la vue 'user_public_profiles' (doit réussir)
  BEGIN
    SELECT jsonb_build_object(
      'id', id,
      'full_name', full_name,
      'username', username,
      'bio', bio,
      'created_at', created_at
    ) INTO res_view_b_from_a
    FROM public.user_public_profiles
    WHERE id = user_id_b;
    IF res_view_b_from_a IS NULL THEN
      res_view_b_from_a := '{"status": "no rows returned"}'::jsonb;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    res_view_b_from_a := jsonb_build_object('error', SQLERRM);
  END;

  -- Rétablir le rôle original
  RESET SESSION AUTHORIZATION;

  RETURN jsonb_build_object(
    '1_profile_A_by_A', res_users_own_a,
    '2_profile_B_by_A_on_users', res_users_b_from_a,
    '3_profile_B_by_A_on_view', res_view_b_from_a
  );
END;
$$;

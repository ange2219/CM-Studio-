-- ==============================================================================
-- Migration : create_organization atomique (inclut brand_profile)
-- Exécuter dans l'onglet "SQL Editor" de Supabase
--
-- OBJECTIF : Quand on crée une organisation, créer AUSSI un brand_profile minimal
-- en même temps (même transaction). Cela garantit que le middleware trouve
-- toujours un brand_profile et ne redirige PAS vers /onboarding.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.create_organization(org_name TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_org_id UUID;
  current_user_id UUID := auth.uid();
BEGIN
  -- Vérification d'authentification
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;

  -- 1. Créer l'organisation
  INSERT INTO public.organizations (name)
  VALUES (org_name)
  RETURNING id INTO new_org_id;

  -- 2. Créer l'adhésion en tant que propriétaire (owner)
  INSERT INTO public.memberships (organization_id, user_id, role)
  VALUES (new_org_id, current_user_id, 'owner');

  -- 3. Créer un brand_profile minimal (évite la redirection /onboarding du middleware)
  INSERT INTO public.brand_profiles (organization_id, brand_name)
  VALUES (new_org_id, org_name)
  ON CONFLICT (organization_id) DO NOTHING;

  RETURN new_org_id;
END;
$$;

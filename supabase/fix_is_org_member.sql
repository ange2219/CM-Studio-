-- Correction de la fonction is_org_member pour supporter la comparaison d'enum avec du texte
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID, allowed_roles TEXT[] DEFAULT NULL)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND (allowed_roles IS NULL OR role::text = ANY(allowed_roles))
  );
END;
$$ LANGUAGE plpgsql;

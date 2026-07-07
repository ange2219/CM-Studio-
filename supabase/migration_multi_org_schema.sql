-- ==============================================================================
-- Migration : Étape 1 - Création des tables d'organisation et sécurité RLS
-- À exécuter dans l'onglet "SQL Editor" de votre console Supabase
-- ==============================================================================

-- ─── 1. TABLE ORGANIZATIONS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  avatar_url            TEXT,
  plan                  TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','premium','business')),
  stripe_customer_id    TEXT,
  zernio_profile_id     TEXT, -- Identifiant Zernio/Ayrshare propre à l'organisation
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour accélérer la recherche par Stripe customer ID
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_cust ON public.organizations(stripe_customer_id);

-- Activer Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;


-- ─── 2. TABLE MEMBERSHIPS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('owner', 'cm', 'viewer')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

-- Index de performance
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org ON public.memberships(organization_id);

-- Activer Row Level Security
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;


-- ─── 3. FONCTIONS HELPER ET RLS PROCEDURES ─────────────────────────────────────

-- Helper pour vérifier l'appartenance d'un utilisateur à une organisation
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID, allowed_roles TEXT[] DEFAULT NULL)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND (allowed_roles IS NULL OR role = ANY(allowed_roles))
  );
END;
$$ LANGUAGE plpgsql;


-- RPC atomique pour créer une organisation et son owner (contourne l'œuf-et-la-poule RLS)
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

  RETURN new_org_id;
END;
$$;


-- ─── 4. POLITIQUES RLS INITIALES ──────────────────────────────────────────────

-- Politiques RLS pour 'organizations'
DROP POLICY IF EXISTS "org: select" ON public.organizations;
CREATE POLICY "org: select" ON public.organizations
  FOR SELECT USING (is_org_member(id));

DROP POLICY IF EXISTS "org: update" ON public.organizations;
CREATE POLICY "org: update" ON public.organizations
  FOR UPDATE 
  USING (is_org_member(id, ARRAY['owner']))
  WITH CHECK (is_org_member(id, ARRAY['owner']));

-- Politiques RLS pour 'memberships'
DROP POLICY IF EXISTS "memberships: select" ON public.memberships;
CREATE POLICY "memberships: select" ON public.memberships
  FOR SELECT USING (user_id = auth.uid() OR is_org_member(organization_id));

DROP POLICY IF EXISTS "memberships: all_admin" ON public.memberships;
CREATE POLICY "memberships: all_admin" ON public.memberships
  FOR ALL 
  USING (is_org_member(organization_id, ARRAY['owner']))
  WITH CHECK (is_org_member(organization_id, ARRAY['owner']));

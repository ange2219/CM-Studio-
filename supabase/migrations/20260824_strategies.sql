-- ==============================================================================
-- Migration : Table Strategies (Stratégie par organisation et période mensuelle)
-- ==============================================================================

-- 1. Table strategies
CREATE TABLE IF NOT EXISTS public.strategies (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  period              VARCHAR(7) NOT NULL, -- Format standard 'YYYY-MM', ex: '2026-08'
  monthly_objective   TEXT NOT NULL,
  target_audience     TEXT,
  editorial_line      JSONB NOT NULL DEFAULT '{
    "tone": "",
    "pillars": [],
    "platform_priorities": []
  }'::jsonb,
  kpis                JSONB NOT NULL DEFAULT '[]'::jsonb,
  status              TEXT NOT NULL DEFAULT 'up_to_date' CHECK (status IN ('up_to_date', 'to_review', 'archived')),
  created_by          UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_strategies_org_period UNIQUE (organization_id, period)
);

-- Index pour recherche rapide par org et période décroissante
CREATE INDEX IF NOT EXISTS idx_strategies_org_period ON public.strategies(organization_id, period DESC);

-- 2. Activer Row Level Security
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- 3. Politiques RLS conformes au modèle multi-organisation
DROP POLICY IF EXISTS "strategies: select" ON public.strategies;
CREATE POLICY "strategies: select" ON public.strategies
  FOR SELECT USING (is_org_member(organization_id));

DROP POLICY IF EXISTS "strategies: write" ON public.strategies;
CREATE POLICY "strategies: write" ON public.strategies
  FOR ALL
  USING (is_org_member(organization_id, ARRAY['owner', 'cm']))
  WITH CHECK (is_org_member(organization_id, ARRAY['owner', 'cm']));

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const Schema = z.object({
  org_id: z.string().uuid(),
  brand_name: z.string().min(1).max(100),
})

/**
 * POST /api/brand/init
 * Crée un profil de marque minimal pour un org donné.
 * Utilisé après la création d'une nouvelle organisation pour éviter
 * la redirection vers l'onboarding.
 */
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = Schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const { org_id, brand_name } = parsed.data

  // Vérifier que l'utilisateur est bien membre de cette organisation
  const admin = createAdminClient()
  const { data: membership } = await admin
    .from('memberships')
    .select('id')
    .eq('organization_id', org_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  // Créer un profil de marque minimal (upsert pour éviter les conflits)
  const { data, error } = await admin
    .from('brand_profiles')
    .upsert(
      {
        organization_id: org_id,
        brand_name,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'organization_id', ignoreDuplicates: true }
    )
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || { ok: true })
}

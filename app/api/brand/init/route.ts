import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const Schema = z.object({
  org_id: z.string().uuid(),
  brand_name: z.string().min(1).max(100),
})

/**
 * POST /api/brand/init
 * Crée un profil de marque minimal pour un org donné.
 * Sécurisé par les politiques RLS de brand_profiles.
 */
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = Schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  const { org_id, brand_name } = parsed.data

  // Insérer le profil de marque minimal via le client standard de l'utilisateur (sécurisé par RLS)
  const { data, error } = await supabase
    .from('brand_profiles')
    .upsert(
      {
        organization_id: org_id,
        brand_name,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'organization_id' }
    )
    .select()
    .maybeSingle()

  if (error) {
    console.error('[Brand Init Error]:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || { ok: true })
}

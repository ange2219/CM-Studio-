import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateBrandSchema = z.object({
  brand_name:        z.string().min(1, 'Le nom de la marque est obligatoire.').max(100),
  industry:          z.string().min(1, "Le secteur d'activité est obligatoire.").max(100),
  description:       z.string().min(1, 'La description est obligatoire.').max(2000),
  website:           z.string().url().optional().or(z.literal('')),
  target_audience:   z.string().min(1, 'Le public cible est obligatoire.').max(500),
  value_proposition: z.string().min(1, 'La proposition de valeur est obligatoire.').max(2000),
  tone:              z.string().min(1).max(50),
  posts_per_week:    z.number().int().min(1).max(21),
  objectives:        z.array(z.string().max(100)).min(1, 'Choisissez au moins un objectif.'),
  content_pillars:   z.array(z.string().max(100)).min(1, 'Choisissez au moins un type de contenu.'),
  platforms:         z.array(z.string().max(50)).min(1, 'Choisissez au moins une plateforme.'),
  avoid_words:       z.string().max(500).optional(),
  logo_url:          z.string().optional(),
  color_primary:     z.string().max(20).optional(),
  color_secondary:   z.string().max(20).optional(),
})

/**
 * POST /api/brand/create
 * Crée une nouvelle organisation + son brand_profile complet en une seule transaction.
 * Retourne l'ID de la nouvelle organisation.
 */
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const parsed = CreateBrandSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }
  const d = parsed.data

  // 1. Créer l'organisation + membership via RPC (utilise auth.uid())
  const { data: orgId, error: orgError } = await supabase.rpc('create_organization', {
    org_name: d.brand_name,
  })
  if (orgError || !orgId) {
    console.error('[CreateBrand] RPC error:', orgError?.message)
    return NextResponse.json({ error: orgError?.message || 'Impossible de créer la marque.' }, { status: 500 })
  }

  // 2. Créer le brand_profile complet via admin (bypass RLS pour écriture complète)
  const audienceLocationJson = JSON.stringify({
    logo_url:        d.logo_url || '',
    color_primary:   d.color_primary || '#1E57CD',
    color_secondary: d.color_secondary || '#059669',
    platforms:       d.platforms,
  })

  const { error: brandError } = await admin
    .from('brand_profiles')
    .upsert({
      organization_id:    orgId,
      brand_name:         d.brand_name,
      account_type:       'business',
      industry:           d.industry,
      description:        d.description,
      website:            d.website || '',
      target_audience:    d.target_audience,
      tone:               d.tone,
      objectives:         d.objectives,
      content_pillars:    d.content_pillars,
      audience_interests: d.value_proposition,
      audience_location:  audienceLocationJson,
      avoid_words:        d.avoid_words || '',
      posts_per_week:     d.posts_per_week,
      updated_at:         new Date().toISOString(),
    }, { onConflict: 'organization_id' })

  if (brandError) {
    console.error('[CreateBrand] Brand profile error:', brandError.message)
    // On tente de nettoyer l'org créée si le brand échoue
    await admin.from('organizations').delete().eq('id', orgId)
    return NextResponse.json({ error: brandError.message }, { status: 500 })
  }

  // 3. Retourner l'ID de l'org pour que le client bascule dessus
  return NextResponse.json({ org_id: orgId, success: true })
}

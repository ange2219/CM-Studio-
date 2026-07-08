import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const Schema = z.object({
  org_id: z.string().uuid(),
})

/**
 * DELETE /api/brand/delete
 * Supprime une organisation (marque) et toutes ses données associées.
 * L'utilisateur doit être propriétaire (owner) de l'organisation.
 */
export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const parsed = Schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'org_id invalide' }, { status: 400 })

  const { org_id } = parsed.data

  // Vérifier que l'utilisateur est bien owner de cette organisation
  const { data: membership, error: memberErr } = await supabase
    .from('memberships')
    .select('role')
    .eq('organization_id', org_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (memberErr || !membership) {
    return NextResponse.json({ error: 'Organisation introuvable ou accès refusé' }, { status: 403 })
  }
  if (membership.role !== 'owner') {
    return NextResponse.json({ error: 'Seul le propriétaire peut supprimer une marque' }, { status: 403 })
  }

  // Vérifier qu'il reste au moins une autre organisation pour cet utilisateur
  const { count } = await admin
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) <= 1) {
    return NextResponse.json({
      error: 'Impossible de supprimer votre seule marque. Créez-en une autre d\'abord.'
    }, { status: 400 })
  }

  // Supprimer dans l'ordre pour respecter les FK
  // 1. Brand profile
  await admin.from('brand_profiles').delete().eq('organization_id', org_id)
  // 2. Memberships
  await admin.from('memberships').delete().eq('organization_id', org_id)
  // 3. Organisation elle-même
  const { error: deleteErr } = await admin.from('organizations').delete().eq('id', org_id)

  if (deleteErr) {
    console.error('[DeleteBrand]', deleteErr.message)
    return NextResponse.json({ error: deleteErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

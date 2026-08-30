import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function DELETE() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const errors: string[] = []

  // 1. Récupérer toutes les organisations dont l'utilisateur est propriétaire
  const { data: ownedOrgs } = await admin
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('role', 'owner')

  const orgIds = ownedOrgs?.map(m => m.organization_id) || []
  console.log('[delete-account] Organisations détenues:', orgIds)

  // 2. Supprimer les données liées aux organisations détenues
  for (const orgId of orgIds) {
    // social_accounts (clé: organization_id)
    const { error: saErr } = await admin.from('social_accounts').delete().eq('organization_id', orgId)
    if (saErr) { console.error('[delete-account] social_accounts:', saErr.message); errors.push(`social_accounts: ${saErr.message}`) }

    // brand_profiles (clé: organization_id)
    const { error: bpErr } = await admin.from('brand_profiles').delete().eq('organization_id', orgId)
    if (bpErr) { console.error('[delete-account] brand_profiles:', bpErr.message); errors.push(`brand_profiles: ${bpErr.message}`) }

    // posts (gardent user_id mais aussi organization_id)
    const { error: postsErr } = await admin.from('posts').delete().eq('organization_id', orgId)
    if (postsErr) { console.error('[delete-account] posts:', postsErr.message); errors.push(`posts: ${postsErr.message}`) }

    // subscriptions (clé: organization_id)
    const { error: subErr } = await admin.from('subscriptions').delete().eq('organization_id', orgId)
    if (subErr) { console.error('[delete-account] subscriptions:', subErr.message); errors.push(`subscriptions: ${subErr.message}`) }

    // social_baselines (clé: organization_id)
    const { error: sbErr } = await admin.from('social_baselines').delete().eq('organization_id', orgId)
    if (sbErr) { console.error('[delete-account] social_baselines:', sbErr.message); errors.push(`social_baselines: ${sbErr.message}`) }

    // notifications (clé: organization_id, peut être null)
    const { error: notifErr } = await admin.from('notifications').delete().eq('organization_id', orgId)
    if (notifErr) { console.error('[delete-account] notifications:', notifErr.message); errors.push(`notifications: ${notifErr.message}`) }
  }

  // 3. Supprimer les notifications personnelles (user_id)
  const { error: notifUserErr } = await admin.from('notifications').delete().eq('user_id', user.id)
  if (notifUserErr) { console.error('[delete-account] notifications user:', notifUserErr.message); errors.push(`notifications: ${notifUserErr.message}`) }

  // 4. Supprimer les memberships
  const { error: memErr } = await admin.from('memberships').delete().eq('user_id', user.id)
  if (memErr) { console.error('[delete-account] memberships:', memErr.message); errors.push(`memberships: ${memErr.message}`) }

  // 5. Supprimer les organisations détenues (cascade des dépendances restantes)
  for (const orgId of orgIds) {
    const { error: orgErr } = await admin.from('organizations').delete().eq('id', orgId)
    if (orgErr) { console.error('[delete-account] organizations:', orgErr.message); errors.push(`organizations: ${orgErr.message}`) }
  }

  // 6. Supprimer le profil utilisateur
  const { error: userErr } = await admin.from('users').delete().eq('id', user.id)
  if (userErr) { console.error('[delete-account] users:', userErr.message); errors.push(`users: ${userErr.message}`) }

  // 7. Supprimer le compte auth Supabase (opération critique)
  const { error: authError } = await admin.auth.admin.deleteUser(user.id)
  if (authError) {
    console.error('[delete-account] Erreur suppression auth:', authError.message)
    return NextResponse.json({ error: authError.message, dataErrors: errors }, { status: 500 })
  }

  console.log('[delete-account] Compte supprimé avec succès:', user.id, 'organisations:', orgIds)
  return NextResponse.json({ success: true, dataErrors: errors.length > 0 ? errors : undefined })
}

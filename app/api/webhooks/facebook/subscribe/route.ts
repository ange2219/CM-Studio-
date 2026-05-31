import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/utils'

export const dynamic = 'force-dynamic'

/**
 * GET /api/webhooks/facebook/subscribe
 * Abonne toutes les Pages Facebook connectées au webhook 'feed' de l'application.
 * Facebook exige que chaque Page autorise explicitement l'app à recevoir ses événements.
 * À appeler une fois après avoir configuré le webhook dans le portail Meta.
 */
export async function GET() {
  const admin = createAdminClient()

  // Récupérer tous les comptes Facebook actifs
  const { data: accounts, error } = await admin
    .from('social_accounts')
    .select('platform_user_id, access_token, platform_username')
    .eq('platform', 'facebook')
    .eq('is_active', true)

  if (error || !accounts || accounts.length === 0) {
    return NextResponse.json({ error: 'Aucun compte Facebook actif trouvé', details: error?.message }, { status: 404 })
  }

  const results = []

  for (const account of accounts) {
    let pageToken: string
    try {
      pageToken = decryptToken(account.access_token)
    } catch {
      results.push({ page: account.platform_username, status: 'error', reason: 'Token invalide' })
      continue
    }

    const pageId = account.platform_user_id

    // Souscrire la Page au webhook de l'application (champs feed)
    const subscribeRes = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/subscribed_apps`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscribed_fields: ['feed'],
          access_token: pageToken,
        }),
      }
    )

    const subscribeData = await subscribeRes.json()

    if (subscribeRes.ok && subscribeData.success) {
      results.push({ page: account.platform_username, pageId, status: 'subscribed' })
      console.log(`[Webhook Subscribe] Page "${account.platform_username}" (${pageId}) abonnée avec succès`)
    } else {
      console.error(`[Webhook Subscribe] Échec pour la page "${account.platform_username}":`, subscribeData)
      results.push({
        page: account.platform_username,
        pageId,
        status: 'error',
        reason: subscribeData?.error?.message || JSON.stringify(subscribeData),
      })
    }
  }

  return NextResponse.json({ results })
}

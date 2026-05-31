import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/webhooks/debug — Vérification challenge (même que le vrai webhook)
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')
  const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'cm_studio_testing_token_2026'
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

/**
 * POST /api/webhooks/debug — Stocke le payload brut dans la table notifications pour debug
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const headers: Record<string, string> = {}
    req.headers.forEach((v, k) => { headers[k] = v })

    console.log('[Webhook DEBUG] Headers:', JSON.stringify(headers))
    console.log('[Webhook DEBUG] Body brut:', rawBody)

    // Stocker dans notifications pour inspection facile
    const admin = createAdminClient()
    await admin.from('notifications').insert({
      user_id: '1513cee4-b32a-4276-a4e5-c712ffd8c883', // ton user_id principal
      type: 'webhook_debug',
      title: '🔍 Webhook reçu',
      message: rawBody.substring(0, 500),
      action_url: '/notifications',
      platform: 'facebook',
    })

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Webhook DEBUG] Erreur:', err)
    return NextResponse.json({ error: 'error' }, { status: 500 })
  }
}

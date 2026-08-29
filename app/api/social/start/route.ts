import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient, getActiveOrgOrThrow } from '@/lib/supabase/server'
import { createProfile, getConnectUrl } from '@/lib/zernio'

/**
 * GET /api/social/start?platform=twitter
 * Proxy de connexion OAuth — cache Zernio derrière notre domaine.
 * L'utilisateur voit uniquement notre URL, puis est redirigé vers
 * l'OAuth de la plateforme (Twitter, LinkedIn, TikTok…).
 */
export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const platform = req.nextUrl.searchParams.get('platform')
  if (!platform) {
    return NextResponse.redirect(new URL('/profile?error=missing_platform', req.url))
  }

  // Récupère ou valide l'organisation active
  let orgId: string
  let activeOrg: any
  try {
    activeOrg = await getActiveOrgOrThrow()
    orgId = activeOrg.organizationId
  } catch (err: any) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const admin = createAdminClient()
  const { data: userProfile } = await admin
    .from('users')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  if (!process.env.ZERNIO_API_KEY) {
    console.error('[social/start] ZERNIO_API_KEY non configurée')
    const payload = JSON.stringify({ type: 'zernio_oauth', success: false, error: 'ZERNIO_API_KEY manquante dans les variables d\'environnement', platform })
      .replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
    const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px;text-align:center;color:#ef4444">
      <h3>Configuration manquante</h3>
      <p style="color:#666;font-size:14px">ZERNIO_API_KEY n'est pas configurée dans les variables d'environnement.</p>
      <script>
        var d = ${payload};
        try { window.opener.postMessage(d, '*') } catch(e) {}
        try { localStorage.setItem('_oauth_result', JSON.stringify(d)) } catch(e) {}
        setTimeout(function() { window.close() }, 3000);
      </script>
    </body></html>`
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
  }

  try {
    let profileId = activeOrg.organization?.zernio_profile_id as string | null | undefined

    if (!profileId) {
      console.log('[social/start] Création profil Zernio pour l\'organisation', orgId)
      profileId = await createProfile(orgId, activeOrg.organization?.name || userProfile?.full_name || userProfile?.email || orgId)
      console.log('[social/start] Profil Zernio créé:', profileId)
      await admin.from('organizations').update({ zernio_profile_id: profileId } as any).eq('id', orgId)
    }

    // Récupère l'URL exacte du domaine actuel (ex: https://cms12.vercel.app)
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host
    const proto = req.headers.get('x-forwarded-proto') || (req.nextUrl.protocol.replace(':', '') || 'https')
    const appUrl = `${proto}://${host}`.replace(/\/$/, '')
    const redirectUrl = `${appUrl}/api/social/callback?platform=${platform}&userId=${user.id}&orgId=${orgId}`

    console.log('[social/start] Récupération URL OAuth Zernio pour', platform, 'avec profileId:', profileId, 'redirectUrl:', redirectUrl)
    let connectUrl: string
    try {
      connectUrl = await getConnectUrl(profileId, platform, redirectUrl)
    } catch (connectErr: any) {
      console.warn('[social/start] Échec connectUrl avec profileId existant:', connectErr.message, 'Tentative de recréation de profil...')
      // Si le profileId en base est invalide ou expiré côté Zernio, régénérer un profil valide
      profileId = await createProfile(orgId, `${activeOrg.organization?.name || 'Workspace'}-${orgId.slice(0, 6)}`)
      console.log('[social/start] Nouveau profil Zernio créé avec succès:', profileId)
      await admin.from('organizations').update({ zernio_profile_id: profileId } as any).eq('id', orgId)
      connectUrl = await getConnectUrl(profileId, platform, redirectUrl)
    }
    console.log('[social/start] Redirection vers:', connectUrl.slice(0, 80))

    return NextResponse.redirect(connectUrl)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur de connexion'
    console.error('[social/start] Erreur:', msg)
    const payload = JSON.stringify({ type: 'zernio_oauth', success: false, error: msg, platform })
      .replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
    const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px;text-align:center;color:#ef4444">
      <h3>Erreur de connexion ${platform}</h3>
      <p style="color:#666;font-size:14px">${msg}</p>
      <script>
        var d = ${payload};
        try { window.opener.postMessage(d, '*') } catch(e) {}
        try { localStorage.setItem('_oauth_result', JSON.stringify(d)) } catch(e) {}
        setTimeout(function() { window.close() }, 4000);
      </script>
    </body></html>`
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
  }
}


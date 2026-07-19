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
    return NextResponse.redirect(new URL('/profile?error=ZERNIO_API_KEY+manquante+dans+Vercel', req.url))
  }

  try {
    let profileId = activeOrg.organization?.zernio_profile_id as string | null | undefined

    if (!profileId) {
      console.log('[social/start] Création profil Zernio pour l\'organisation', orgId)
      profileId = await createProfile(orgId, activeOrg.organization?.name || userProfile?.full_name || userProfile?.email || orgId)
      console.log('[social/start] Profil Zernio créé:', profileId)
      await admin.from('organizations').update({ zernio_profile_id: profileId } as any).eq('id', orgId)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    const redirectUrl = `${appUrl}/api/social/callback?platform=${platform}&userId=${user.id}&orgId=${orgId}`

    console.log('[social/start] Récupération URL OAuth Zernio pour', platform)
    const connectUrl = await getConnectUrl(profileId, platform, redirectUrl)
    console.log('[social/start] Redirection vers:', connectUrl.slice(0, 80))

    return NextResponse.redirect(connectUrl)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur de connexion'
    console.error('[social/start] Erreur:', msg)
    return NextResponse.redirect(new URL(`/profile?error=${encodeURIComponent(msg)}`, req.url))
  }
}


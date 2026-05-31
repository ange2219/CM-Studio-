import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const platform = searchParams.get('platform')
  const pid = searchParams.get('pid') // platform_user_id

  if (!platform || !pid) {
    return new NextResponse('Missing parameters', { status: 400 })
  }

  // Pour Facebook, l'URL Graph API renvoie directement vers l'image (redirection 302 gérée par Facebook)
  if (platform === 'facebook') {
    return NextResponse.redirect(`https://graph.facebook.com/v19.0/${pid}/picture?type=large`)
  }

  // Pour Instagram, il faut récupérer l'URL (qui expire) dynamiquement via le token
  if (platform === 'instagram') {
    const admin = createAdminClient()
    const { data: account } = await admin
      .from('social_accounts')
      .select('access_token, connected_via')
      .eq('platform_user_id', pid)
      .eq('platform', 'instagram')
      .maybeSingle()

    if (!account) {
      return new NextResponse('Account not found', { status: 404 })
    }

    try {
      const token = decryptToken(account.access_token)
      
      let apiUrl = ''
      // L'API est différente si c'est un login direct IG (Basic Display/Graph) ou via Page Facebook (Business)
      // Actuellement l'app utilise l'Instagram Graph API classique pour les logins directs
      apiUrl = `https://graph.instagram.com/${pid}?fields=profile_picture_url&access_token=${token}`

      const res = await fetch(apiUrl)
      if (res.ok) {
        const data = await res.json()
        if (data.profile_picture_url) {
          // Redirige vers la vraie URL de l'image (fraîche)
          return NextResponse.redirect(data.profile_picture_url)
        }
      }
    } catch (e) {
      console.error('[Avatar Proxy] Instagram Error:', e)
    }
  }

  // Fallback si on ne trouve pas l'image
  return new NextResponse('Not found', { status: 404 })
}

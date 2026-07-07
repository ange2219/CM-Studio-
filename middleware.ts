import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/register', '/reset-password', '/update-password', '/api/auth', '/api/billing/webhook', '/api/webhooks', '/auth', '/onboarding', '/privacy', '/terms']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const isPublic = PUBLIC_PATHS.some(p => p === '/' ? path === '/' : path.startsWith(p))

  // Helper pour rediriger tout en conservant les cookies Supabase (très important en middleware)
  const redirect = (to: string) => {
    const res = NextResponse.redirect(new URL(to, request.url))
    supabaseResponse.cookies.getAll().forEach(cookie => {
      res.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
      })
    })
    return res
  }

  if (!user) {
    if (!isPublic) {
      const redirectResponse = redirect('/login')
      redirectResponse.cookies.delete('onboarded')
      return redirectResponse
    }
    supabaseResponse.cookies.delete('onboarded')
  }

  if (user && (path === '/login' || path === '/register')) {
    return redirect('/home')
  }

  // Vérification onboarding & active_org_id — utilise des cookies pour éviter des DB queries répétées
  if (user && !isPublic && !path.startsWith('/onboarding') && !path.startsWith('/api')) {
    const onboardedOrgId = request.cookies.get('onboarded')?.value
    const activeOrgId = request.cookies.get('active_org_id')?.value

    if (onboardedOrgId !== activeOrgId || !activeOrgId) {
      // Cookie absent, expiré ou ne correspondant pas à l'organisation active -> vérifier en DB une seule fois
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
      if (serviceKey) {
        const { createServerClient: createAdmin } = await import('@supabase/ssr')
        const adminSupabase = createAdmin(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceKey,
          { cookies: { getAll() { return request.cookies.getAll() }, setAll() {} } }
        )

        // 1. Récupérer ou valider l'activeOrgId par défaut si absent
        let finalOrgId = activeOrgId
        if (!finalOrgId) {
          const { data: firstMembership } = await adminSupabase
            .from('memberships')
            .select('organization_id')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle()

          if (firstMembership) {
            finalOrgId = firstMembership.organization_id
            supabaseResponse.cookies.set('active_org_id', firstMembership.organization_id, {
              httpOnly: false, // Doit être lisible côté client (React)
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 365, // 1 an
              path: '/',
            })
          }
        }

        // Si aucun active_org_id n'a pu être défini (ex: nouvel utilisateur sans marque/membership)
        if (!finalOrgId) {
          return redirect('/onboarding')
        }

        // 2. Vérifier si cette organisation est onboardée (a un brand profile configuré)
        let isOnboarded = false
        const { data: brandProfile } = await adminSupabase
          .from('brand_profiles')
          .select('id')
          .eq('organization_id', finalOrgId)
          .maybeSingle()
        isOnboarded = !!brandProfile

        if (!isOnboarded) {
          return redirect('/onboarding')
        }

        // Poser le cookie d'onboarding lié à cette organisation
        supabaseResponse.cookies.set('onboarded', finalOrgId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 jours
          path: '/',
        })
      } else {
        return redirect('/onboarding')
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

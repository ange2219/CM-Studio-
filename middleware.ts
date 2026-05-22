import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/register', '/reset-password', '/update-password', '/api/auth', '/api/billing/webhook', '/auth']

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

  // Vérification onboarding — utilise un cookie pour éviter une DB query par request
  if (user && !isPublic && !path.startsWith('/onboarding') && !path.startsWith('/api')) {
    const onboardedCookie = request.cookies.get('onboarded')?.value

    if (onboardedCookie !== '1') {
      // Cookie absent ou expiré → vérifier en DB une seule fois
      const { createServerClient: createAdmin } = await import('@supabase/ssr')
      const adminSupabase = createAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!,
        { cookies: { getAll() { return request.cookies.getAll() }, setAll() {} } }
      )

      let isOnboarded = false

      // On tente d'abord sur la table profiles (onboarding_completed)
      const { data: profileObj } = await adminSupabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle()

      if (profileObj && typeof profileObj.onboarding_completed === 'boolean') {
        isOnboarded = profileObj.onboarding_completed
      } else {
        // Fallback si la table users et onboarded existent (actuelle dans l'application)
        const { data: userProfile } = await adminSupabase
          .from('users')
          .select('onboarded')
          .eq('id', user.id)
          .maybeSingle()
        if (userProfile && typeof userProfile.onboarded === 'boolean') {
          isOnboarded = userProfile.onboarded
        }
      }

      if (!isOnboarded) {
        return redirect('/onboarding')
      }

      // User onboardé : poser le cookie (7 jours) pour éviter future DB query
      supabaseResponse.cookies.set('onboarded', '1', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

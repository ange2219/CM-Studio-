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

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
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

  // La vérification de l'onboarding a été déplacée dans app/(dashboard)/layout.tsx
  // pour éviter les timeouts 504 MIDDLEWARE_INVOCATION_TIMEOUT sur Vercel Edge.

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

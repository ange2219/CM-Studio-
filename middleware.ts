import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/register', '/reset-password', '/update-password', '/api/auth', '/api/billing/webhook', '/api/webhooks', '/auth', '/onboarding', '/privacy', '/terms']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublic = PUBLIC_PATHS.some(p => p === '/' ? path === '/' : path.startsWith(p))

  // Vérifier la présence d'un cookie de session Supabase
  // Les cookies Supabase Auth commencent par "sb-" et finissent par "-auth-token"
  const hasAuthCookie = request.cookies.getAll().some(cookie =>
    cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')
  )

  if (!hasAuthCookie && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasAuthCookie && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

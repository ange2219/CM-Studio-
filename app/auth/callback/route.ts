import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const from = searchParams.get('from')
  const next = searchParams.get('next')

  if (code) {
    const supabase = createClient()
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && sessionData.user) {
      if (from === 'popup') {
        return NextResponse.redirect(`${origin}/auth/popup-done`)
      }

      // Vérifier si l'utilisateur possède déjà une organisation / marque
      const admin = createAdminClient()
      const { data: memberships } = await admin
        .from('memberships')
        .select('organization_id')
        .eq('user_id', sessionData.user.id)
        .limit(1)

      const hasOnboarded = memberships && memberships.length > 0
      const target = next || (hasOnboarded ? '/workspace' : '/onboarding')
      return NextResponse.redirect(`${origin}${target}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`)
}


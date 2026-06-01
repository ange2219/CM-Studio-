import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = new URL(req.url).searchParams.get('q') || ''
  if (q.length < 2) return NextResponse.json([])

  // Utilise le client admin pour rechercher parmi tous les utilisateurs
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('users')
    .select('id, full_name, avatar_url')
    .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
    .neq('id', user.id)
    .limit(10)

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

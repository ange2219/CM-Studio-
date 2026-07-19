import { NextRequest, NextResponse } from 'next/server'
import { createClient, getActiveOrgOrThrow } from '@/lib/supabase/server'

export async function GET() {
  let orgId: string
  try {
    const activeOrg = await getActiveOrgOrThrow()
    orgId = activeOrg.organizationId
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('social_accounts')
    .select('id, platform, platform_username, platform_avatar_url, connected_via, is_active, created_at')
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const { id, platform_username } = await req.json()
  if (!id || !platform_username) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  let orgId: string
  try {
    const activeOrg = await getActiveOrgOrThrow()
    orgId = activeOrg.organizationId
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()
  const { error } = await supabase
    .from('social_accounts')
    .update({ platform_username })
    .eq('id', id)
    .eq('organization_id', orgId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  let orgId: string
  try {
    const activeOrg = await getActiveOrgOrThrow()
    orgId = activeOrg.organizationId
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()
  const { error } = await supabase
    .from('social_accounts')
    .update({ is_active: false })
    .eq('id', id)
    .eq('organization_id', orgId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}


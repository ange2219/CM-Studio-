import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkGenerationLimit } from '@/lib/server-utils'
import { z } from 'zod'

const PatchMeSchema = z.object({
  full_name: z.string().min(1).max(200).optional(),
  username:  z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, { message: "Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores" }).optional(),
})

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  let { data } = await admin.from('users').select('id, email, full_name, username, plan, avatar_url').eq('id', user.id).single()
  if (!data) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Synchronisation dynamique du nom complet et de l'avatar issus d'OAuth (ex: Google) s'ils sont vides
  const meta = user.user_metadata
  const metaFullName = meta?.full_name || meta?.name
  const metaAvatarUrl = meta?.avatar_url || meta?.picture

  let needsUpdate = false
  const updateData: any = {}

  if (!data.full_name && metaFullName) {
    updateData.full_name = metaFullName
    data.full_name = metaFullName
    needsUpdate = true
  }
  if (!data.avatar_url && metaAvatarUrl) {
    updateData.avatar_url = metaAvatarUrl
    data.avatar_url = metaAvatarUrl
    needsUpdate = true
  }

  if (needsUpdate) {
    await admin.from('users').update(updateData).eq('id', user.id)
  }

  const quota = await checkGenerationLimit(user.id, data.plan)

  return NextResponse.json({ ...data, generationsUsed: quota.used, generationsLimit: quota.limit })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = PatchMeSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }
  const admin = createAdminClient()
  const updateData: any = {}
  if (parsed.data.full_name !== undefined) updateData.full_name = parsed.data.full_name
  
  if (parsed.data.username !== undefined) {
    const cleanUsername = parsed.data.username.toLowerCase().trim()
    // Vérifier l'unicité
    const { data: existing } = await admin.from('users').select('id').eq('username', cleanUsername).neq('id', user.id).maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'Ce pseudo est déjà pris' }, { status: 400 })
    }
    updateData.username = cleanUsername
  }

  const { error } = await admin.from('users').update(updateData).eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

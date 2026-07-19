import { NextRequest, NextResponse } from 'next/server'
import { getActiveOrgOrThrow } from '@/lib/supabase/server'
import { rewritePost } from '@/lib/ai'
import type { Platform, Plan } from '@/types'
import { z } from 'zod'

const ALLOWED_PLATFORMS = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest'] as const

const RewriteSchema = z.object({
  content:     z.string().min(1).max(10000),
  platform:    z.enum(ALLOWED_PLATFORMS),
  instruction: z.string().min(1).max(500),
})

export async function POST(req: NextRequest) {
  let activeOrg: any
  try {
    activeOrg = await getActiveOrgOrThrow()
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }

  const plan = (activeOrg.organization?.plan || 'free') as Plan

  const parsed = RewriteSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }
  const { content, platform, instruction } = parsed.data

  try {
    const result = await rewritePost(content, platform as Platform, instruction, plan)
    return NextResponse.json({ content: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Rewrite failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


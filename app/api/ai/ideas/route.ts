import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, getActiveOrgOrThrow } from '@/lib/supabase/server'
import { generateIdeas } from '@/lib/ai'
import type { Plan } from '@/types'
import { z } from 'zod'

const IdeasRequestSchema = z.object({
  platform: z.string().max(50),
})

export async function POST(req: NextRequest) {
  let orgId: string
  let activeOrg: any
  try {
    activeOrg = await getActiveOrgOrThrow()
    orgId = activeOrg.organizationId
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }

  const plan = (activeOrg.organization?.plan || 'free') as Plan

  const bodyData = await req.json()
  const parsed = IdeasRequestSchema.safeParse(bodyData)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: brandProfile } = await admin
    .from('brand_profiles')
    .select('brand_name, description, industry, target_audience, content_pillars, objectives')
    .eq('organization_id', orgId)
    .single()

  const reqBody = {
    platform: parsed.data.platform as any,
    brand_name: brandProfile?.brand_name || undefined,
    brand_description: brandProfile?.description || undefined,
    brand_industry: brandProfile?.industry || undefined,
    brand_audience: brandProfile?.target_audience || undefined,
    brand_pillars: Array.isArray(brandProfile?.content_pillars) ? brandProfile.content_pillars : undefined,
    brand_objectives: Array.isArray(brandProfile?.objectives) ? brandProfile.objectives : undefined,
  }

  try {
    const result = await generateIdeas(reqBody, plan)
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


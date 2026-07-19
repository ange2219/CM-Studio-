import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, getActiveOrgOrThrow } from '@/lib/supabase/server'
import { generateBrief } from '@/lib/ai'
import type { Plan } from '@/types'
import { z } from 'zod'

const BriefRequestSchema = z.object({
  angle: z.string(),
  post_type: z.string(),
  accroche: z.string(),
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
  const parsed = BriefRequestSchema.safeParse(bodyData)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: brandProfile } = await admin
    .from('brand_profiles')
    .select('brand_name, description, industry')
    .eq('organization_id', orgId)
    .single()

  const reqBody = {
    angle: parsed.data.angle,
    post_type: parsed.data.post_type,
    accroche: parsed.data.accroche,
    brand_name: brandProfile?.brand_name || undefined,
    brand_description: brandProfile?.description || undefined,
    brand_industry: brandProfile?.industry || undefined,
  }

  try {
    const result = await generateBrief(reqBody, plan)
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


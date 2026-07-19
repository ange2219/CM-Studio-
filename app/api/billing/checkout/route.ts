import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, getActiveOrgOrThrow } from '@/lib/supabase/server'
import { stripe, PLANS } from '@/lib/stripe'

async function getOrCreateCustomerForOrg(orgId: string, email: string): Promise<string> {
  // Chercher d'abord par orgId dans les métadonnées (résistant aux changements d'email)
  const byOrgId = await stripe.customers.search({ query: `metadata['orgId']:'${orgId}'`, limit: 1 })
  if (byOrgId.data.length > 0) return byOrgId.data[0].id

  // Fallback : chercher par email
  const byEmail = await stripe.customers.list({ email, limit: 1 })
  if (byEmail.data.length > 0) return byEmail.data[0].id

  const customer = await stripe.customers.create({
    email,
    metadata: { orgId },
  })
  return customer.id
}

export async function POST(req: NextRequest) {
  let orgId: string
  let activeOrg: any
  try {
    activeOrg = await getActiveOrgOrThrow()
    orgId = activeOrg.organizationId
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }

  const { plan } = await req.json()
  if (!plan || !PLANS[plan as keyof typeof PLANS]) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  const customerId = await getOrCreateCustomerForOrg(orgId, activeOrg.userEmail || '')

  const admin = createAdminClient()
  if (!activeOrg.organization?.stripe_customer_id) {
    await admin.from('organizations').update({ stripe_customer_id: customerId }).eq('id', orgId)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: PLANS[plan as keyof typeof PLANS].priceId, quantity: 1 }],
    success_url: `${appUrl}/home?upgrade=success`,
    cancel_url: `${appUrl}/settings?upgrade=canceled`,
    metadata: { orgId },
    subscription_data: { metadata: { orgId } },
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}


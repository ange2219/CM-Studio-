import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createCheckoutSession, getOrCreateCustomer, PLANS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  if (!plan || !PLANS[plan as keyof typeof PLANS]) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: userProfile } = await admin
    .from('users')
    .select('email, stripe_customer_id')
    .eq('id', user.id)
    .single()

  const customerId = await getOrCreateCustomer(user.id, userProfile?.email || user.email!)

  if (!userProfile?.stripe_customer_id) {
    await admin.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const session = await createCheckoutSession({
    userId: user.id,
    email: userProfile?.email || user.email!,
    priceId: PLANS[plan as keyof typeof PLANS].priceId,
    successUrl: `${appUrl}/home?upgrade=success`,
    cancelUrl: `${appUrl}/settings?upgrade=canceled`,
  })

  return NextResponse.json({ url: session.url })
}

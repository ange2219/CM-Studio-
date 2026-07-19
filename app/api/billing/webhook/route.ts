import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

const PRICE_TO_PLAN: Record<string, 'premium' | 'business'> = {
  [process.env.STRIPE_PRICE_PREMIUM!]: 'premium',
  [process.env.STRIPE_PRICE_BUSINESS!]: 'business',
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orgId = session.metadata?.orgId
      if (!orgId || !session.subscription) break

      const sub = await stripe.subscriptions.retrieve(session.subscription as string)
      const priceId = sub.items.data[0]?.price.id
      const plan = PRICE_TO_PLAN[priceId]
      if (!plan) break

      await admin.from('organizations').update({ plan }).eq('id', orgId)
      await admin.from('subscriptions').upsert({
        organization_id: orgId,
        stripe_subscription_id: sub.id,
        stripe_price_id: priceId,
        plan,
        status: sub.status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }, { onConflict: 'stripe_subscription_id' })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const orgId = sub.metadata?.orgId
      if (!orgId) break

      const priceId = sub.items.data[0]?.price.id
      const plan = PRICE_TO_PLAN[priceId] || 'free'

      await admin.from('organizations').update({ plan: sub.status === 'active' ? plan : 'free' }).eq('id', orgId)
      await admin.from('subscriptions').update({
        status: sub.status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }).eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const orgId = sub.metadata?.orgId
      if (!orgId) break

      await admin.from('organizations').update({ plan: 'free' }).eq('id', orgId)
      await admin.from('subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', sub.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}


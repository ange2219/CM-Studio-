import { NextRequest, NextResponse } from 'next/server'
import { getActiveOrgOrThrow } from '@/lib/supabase/server'
import { createBillingPortalSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  let activeOrg: any
  try {
    activeOrg = await getActiveOrgOrThrow()
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }

  const customerId = activeOrg.organization?.stripe_customer_id

  if (!customerId) {
    return NextResponse.json({ error: 'Aucun abonnement actif' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const session = await createBillingPortalSession(
    customerId,
    `${appUrl}/settings`
  )

  return NextResponse.json({ url: session.url })
}


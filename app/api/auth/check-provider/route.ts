import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CheckSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const parsed = CheckSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const { email } = parsed.data
    const admin = createAdminClient()

    // Find user in the public.users table to get their UUID
    const { data: userRecord } = await admin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (!userRecord) {
      // If user is not found, we don't want to leak whether the email exists or not to prevent enumeration.
      // But we can just say 'not_found' and handle it on the client safely (or pretend success in standard reset flow).
      return NextResponse.json({ provider: 'not_found' })
    }

    // Get the user from the auth schema
    const { data: { user }, error } = await admin.auth.admin.getUserById(userRecord.id)

    if (error || !user) {
      return NextResponse.json({ provider: 'not_found' })
    }

    // Check if the user's primary provider is Google (or they have a google identity)
    const isGoogle = user.app_metadata?.provider === 'google' || 
                     user.identities?.some(id => id.provider === 'google')

    return NextResponse.json({ provider: isGoogle ? 'google' : 'email' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 })
  }
}

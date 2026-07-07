import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const revalidate = 0

export default async function ProfileRedirectPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('username')
    .eq('id', user.id)
    .maybeSingle()

  redirect(`/profile/${profile?.username || user.id}`)
}

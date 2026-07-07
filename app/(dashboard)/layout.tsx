import { redirect } from 'next/navigation'
import { cache } from 'react'
import { createClient, createAdminClient, getActiveOrgOrThrow } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { ToastProvider } from '@/components/ui/Toast'
import { UserProvider } from '@/components/context/UserContext'
import { OrgProvider } from '@/components/context/OrgContext'
import type { User } from '@/types'

const getUser = cache(async (id: string) => {
  const admin = createAdminClient()
  const { data } = await admin.from('users').select('*').eq('id', id).single()
  return data
})

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const user = await getUser(authUser.id)
  if (!user) redirect('/login')

  // Récupérer toutes les organisations associées à l'utilisateur
  const { data: membershipsData } = await supabase
    .from('memberships')
    .select('organization:organizations(*)')
    .eq('user_id', authUser.id)

  const initialOrganizations = (membershipsData || [])
    .map((m: any) => m.organization)
    .filter(Boolean)

  let initialActiveOrg = null
  let initialMembership = null

  try {
    const activeOrgInfo = await getActiveOrgOrThrow()
    initialActiveOrg = activeOrgInfo.organization

    const { data: memb } = await supabase
      .from('memberships')
      .select('*, organization:organizations(*)')
      .eq('organization_id', activeOrgInfo.organizationId)
      .eq('user_id', authUser.id)
      .maybeSingle()

    initialMembership = memb
  } catch (err) {
    // En cas d'erreur de récupération (ex : première connexion sans cookies/onboarding)
  }

  return (
    <ToastProvider>
      <UserProvider initialUser={user as any}>
        <OrgProvider
          initialOrganizations={initialOrganizations}
          initialActiveOrg={initialActiveOrg}
          initialMembership={initialMembership as any}
        >
          <DashboardShell user={user as User} key="shell">
            {children}
          </DashboardShell>
        </OrgProvider>
      </UserProvider>
    </ToastProvider>
  )
}

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            )
          } catch {}
        },
      },
    }
  )
}

export function createAdminClient() {
  const cookieStore = cookies()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    key,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            )
          } catch {}
        },
      },
    }
  )
}

export async function getActiveOrgOrThrow() {
  const supabase = createClient()
  
  // 1. Récupérer l'utilisateur connecté
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Non authentifié')
  }

  const cookieStore = cookies()
  let activeOrgId = cookieStore.get('active_org_id')?.value

  // 2. Si le cookie est absent, on prend la première organisation disponible pour cet utilisateur
  if (!activeOrgId) {
    const { data: firstMembership, error: membershipError } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (membershipError || !firstMembership) {
      throw new Error('Aucune organisation trouvée pour cet utilisateur.')
    }

    activeOrgId = firstMembership.organization_id
  }

  // 3. Valider l'accès de l'utilisateur à cette organisation et charger les rôles/infos
  const { data: membership, error: verifyError } = await supabase
    .from('memberships')
    .select('role, organization:organizations(*)')
    .eq('organization_id', activeOrgId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (verifyError || !membership) {
    // Si le cookie active_org_id pointe vers une organisation invalide, chercher la première organisation membre
    const { data: fallbackMemb } = await supabase
      .from('memberships')
      .select('role, organization:organizations(*), organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (fallbackMemb && fallbackMemb.organization) {
      return {
        organizationId: fallbackMemb.organization_id as string,
        role: fallbackMemb.role as 'owner' | 'cm' | 'viewer',
        organization: fallbackMemb.organization as any,
        userId: user.id,
        userEmail: user.email
      }
    }

    throw new Error('Accès non autorisé à cette organisation')
  }

  return {
    organizationId: activeOrgId as string,
    role: membership.role as 'owner' | 'cm' | 'viewer',
    organization: membership.organization as any,
    userId: user.id,
    userEmail: user.email
  }
}

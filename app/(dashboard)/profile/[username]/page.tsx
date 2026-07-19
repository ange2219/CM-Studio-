import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PublicProfileClient from '@/components/profile/PublicProfileClient'

export const revalidate = 0

export async function generateMetadata({ params }: { params: { username: string } }) {
  return {
    title: `@${params.username} · CM Studio`,
    description: `Profil public de ${params.username} sur CM Studio`,
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const supabase = createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const admin = createAdminClient()

  // ── Fetch profile by username OR ID ─────────────────────────────────────────
  const isUuid = params.username.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  let query = admin
    .from('user_public_profiles')
    .select('id, full_name, avatar_url, username, bio, created_at')

  if (isUuid) {
    query = query.eq('id', params.username)
  } else {
    query = query.eq('username', params.username)
  }

  const { data: profile, error: profileError } = await query.maybeSingle()
  if (profileError) {
    console.error('[Profile Page] Error fetching profile:', profileError)
  }

  if (!profile) notFound()

  // Déterminer le plan de cet utilisateur (propriétaire d'une organisation)
  const { data: firstMembership } = await admin
    .from('memberships')
    .select('organization:organizations(plan)')
    .eq('user_id', profile.id)
    .eq('role', 'owner')
    .limit(1)
    .maybeSingle()

  const userPlan = (firstMembership as any)?.organization?.plan || 'free'
  const enrichedProfile = {
    ...profile,
    plan: userPlan
  }

  // ── Fetch user's posts ─────────────────────────────────────────────────────
  const { data: postsData } = await admin
    .from('vw_community_posts')
    .select('*')
    .eq('user_id', profile.id)
    .is('group_id', null)
    .order('created_at', { ascending: false })
    .limit(30)

  // ── Fetch follow counts & thresholds ──────────────────────────────────────
  const [
    { count: followersCount },
    { count: followingCount },
    { data: thresholdsData }
  ] = await Promise.all([
    admin
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.id),
    admin
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.id),
    admin
      .from('group_unlock_thresholds')
      .select('threshold, label')
      .order('threshold', { ascending: true })
  ])

  // ── Is current user following this profile? ────────────────────────────────
  let isFollowing = false
  if (authUser.id !== profile.id) {
    const { data: followRow } = await admin
      .from('user_follows')
      .select('follower_id')
      .eq('follower_id', authUser.id)
      .eq('following_id', profile.id)
      .maybeSingle()
    isFollowing = !!followRow
  }

  // ── Likes of the current user on these posts ───────────────────────────────
  const { data: userLikes } = await admin
    .from('community_likes')
    .select('post_id')
    .eq('user_id', authUser.id)

  const likedIds = (userLikes || []).map((l: any) => l.post_id)

  return (
    <PublicProfileClient
      profile={enrichedProfile as any}
      currentUserId={authUser.id}
      isFollowing={isFollowing}
      posts={(postsData || []) as any[]}
      followersCount={followersCount ?? 0}
      followingCount={followingCount ?? 0}
      initialLikedIds={likedIds}
      thresholds={(thresholdsData || []) as { threshold: number; label: string }[]}
    />
  )
}

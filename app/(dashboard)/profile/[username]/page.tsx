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

  // ── Fetch profile by username ──────────────────────────────────────────────
  const { data: profile } = await admin
    .from('users')
    .select('id, full_name, avatar_url, username, plan, bio, created_at')
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  // ── Fetch user's posts ─────────────────────────────────────────────────────
  const { data: postsData } = await admin
    .from('vw_community_posts')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(30)

  // ── Fetch follow counts ────────────────────────────────────────────────────
  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    admin
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.id),
    admin
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.id),
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
      profile={profile as any}
      currentUserId={authUser.id}
      isFollowing={isFollowing}
      posts={(postsData || []) as any[]}
      followersCount={followersCount ?? 0}
      followingCount={followingCount ?? 0}
      initialLikedIds={likedIds}
    />
  )
}

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GroupsClient from '@/components/groups/GroupsClient'

export const revalidate = 0

export default async function GroupsPage() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const admin = createAdminClient()

  // 1. Fetch user profile (to get plan)
  const { data: profile } = await admin
    .from('users')
    .select('id, full_name, avatar_url, username, plan')
    .eq('id', authUser.id)
    .single()

  const userProfile = profile || { id: authUser.id, full_name: authUser.email, avatar_url: null, username: authUser.email, plan: 'free' }
  const isPremiumOrBusiness = userProfile.plan === 'premium' || userProfile.plan === 'business'

  // 2. Fetch follower counts, groups, thresholds and user group memberships in parallel
  const [
    { count: followersCount },
    { data: groupsData },
    { data: thresholdsData },
    { data: membershipsData },
    { data: userLikesData }
  ] = await Promise.all([
    admin
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', authUser.id),
    admin
      .from('groups')
      .select('*')
      .order('min_followers_required', { ascending: true }),
    admin
      .from('group_unlock_thresholds')
      .select('*')
      .order('threshold', { ascending: true }),
    admin
      .from('group_members')
      .select('group_id')
      .eq('user_id', authUser.id),
    admin
      .from('community_likes')
      .select('post_id')
      .eq('user_id', authUser.id)
  ])

  const followersCountNum = followersCount ?? 0
  const joinedGroupIds = (membershipsData || []).map((m: any) => m.group_id)
  const likedPostIds = (userLikesData || []).map((l: any) => l.post_id)

  return (
    <GroupsClient
      currentUser={userProfile}
      allGroups={groupsData || []}
      joinedGroupIds={joinedGroupIds}
      followersCount={followersCountNum}
      isPremiumOrBusiness={isPremiumOrBusiness}
      thresholds={thresholdsData || []}
      initialLikedIds={likedPostIds}
    />
  )
}

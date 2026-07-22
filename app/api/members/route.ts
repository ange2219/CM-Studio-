import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim().toLowerCase() || ''

    // 1. Récupérer les identifiants suivis par l'utilisateur connecté
    const { data: followRows } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = new Set((followRows || []).map((f: any) => f.following_id))

    // 2. Récupérer les groupes auxquels l'utilisateur connecté appartient
    const { data: myGroupMemberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id)

    const myGroupIds = new Set((myGroupMemberships || []).map((g: any) => g.group_id))

    // 3. Récupérer tous les membres des groupes rejoints par d'autres utilisateurs
    let memberGroupCounts: Record<string, number> = {}
    if (myGroupIds.size > 0) {
      const { data: otherGroupMembers } = await supabase
        .from('group_members')
        .select('user_id, group_id')
        .in('group_id', Array.from(myGroupIds))
        .neq('user_id', user.id)

      if (otherGroupMembers) {
        otherGroupMembers.forEach((gm: any) => {
          memberGroupCounts[gm.user_id] = (memberGroupCounts[gm.user_id] || 0) + 1
        })
      }
    }

    // 4. Récupérer tous les profils publics (hors soi-même et comptes déjà suivis)
    const { data: profiles, error: profilesErr } = await supabase
      .from('user_public_profiles')
      .select('*')
      .neq('id', user.id)
      .order('created_at', { ascending: false })

    if (profilesErr) {
      return NextResponse.json({ error: profilesErr.message }, { status: 500 })
    }

    let candidateProfiles = (profiles || []).filter(p => !followingIds.has(p.id))

    // Filtre de recherche textuelle
    if (search) {
      candidateProfiles = candidateProfiles.filter(p =>
        (p.full_name && p.full_name.toLowerCase().includes(search)) ||
        (p.username && p.username.toLowerCase().includes(search)) ||
        (p.bio && p.bio.toLowerCase().includes(search))
      )
    }

    // Récupérer le nombre total de followers pour chaque candidat
    const candidateIds = candidateProfiles.map(p => p.id)
    let followCountsMap: Record<string, number> = {}

    if (candidateIds.length > 0) {
      const { data: counts } = await supabase
        .from('user_follows')
        .select('following_id')
        .in('following_id', candidateIds)

      if (counts) {
        counts.forEach((row: any) => {
          followCountsMap[row.following_id] = (followCountsMap[row.following_id] || 0) + 1
        })
      }
    }

    // 5. Calculer le motif de suggestion et la pertinence
    const suggestions = candidateProfiles.map(p => {
      const commonGroups = memberGroupCounts[p.id] || 0
      let reason = 'Recommandé pour vous'

      if (commonGroups > 0) {
        reason = `${commonGroups} ${commonGroups > 1 ? 'groupes en commun' : 'groupe en commun'}`
      } else if ((followCountsMap[p.id] || 0) > 0) {
        reason = 'Membre populaire de la communauté'
      }

      return {
        id: p.id,
        full_name: p.full_name || 'Utilisateur',
        username: p.username || '',
        avatar_url: p.avatar_url || null,
        bio: p.bio || null,
        created_at: p.created_at,
        is_following: false,
        followers_count: followCountsMap[p.id] || 0,
        suggestion_reason: reason,
        relevance_score: (commonGroups * 10) + (followCountsMap[p.id] || 0)
      }
    })

    // Trier par pertinence décroissante
    suggestions.sort((a, b) => b.relevance_score - a.relevance_score)

    return NextResponse.json({ suggestions })
  } catch (err: any) {
    console.error('Error in /api/members:', err)
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 })
  }
}

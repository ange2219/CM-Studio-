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
    const tab = searchParams.get('tab') || 'all' // 'all' | 'following' | 'suggestions'

    // 1. Récupérer les identifiants suivis par l'utilisateur connecté
    const { data: followRows } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = new Set((followRows || []).map((f: any) => f.following_id))

    // 2. Récupérer tous les comptes publics sauf soi-même
    let query = supabase
      .from('user_public_profiles')
      .select('*')
      .neq('id', user.id)
      .order('created_at', { ascending: false })

    const { data: profiles, error: profilesErr } = await query

    if (profilesErr) {
      return NextResponse.json({ error: profilesErr.message }, { status: 500 })
    }

    let filtered = profiles || []

    // Filtre par texte (nom, pseudo, bio)
    if (search) {
      filtered = filtered.filter(p => 
        (p.full_name && p.full_name.toLowerCase().includes(search)) ||
        (p.username && p.username.toLowerCase().includes(search)) ||
        (p.bio && p.bio.toLowerCase().includes(search))
      )
    }

    // Filtre par onglet
    if (tab === 'following') {
      filtered = filtered.filter(p => followingIds.has(p.id))
    } else if (tab === 'suggestions') {
      // Suggestion = comptes qu'on ne suit pas encore
      filtered = filtered.filter(p => !followingIds.has(p.id))
    }

    // Récupérer les compteurs de followers
    const memberIds = filtered.map(p => p.id)
    let followCountsMap: Record<string, number> = {}

    if (memberIds.length > 0) {
      const { data: counts } = await supabase
        .from('user_follows')
        .select('following_id')
        .in('following_id', memberIds)

      if (counts) {
        counts.forEach((row: any) => {
          followCountsMap[row.following_id] = (followCountsMap[row.following_id] || 0) + 1
        })
      }
    }

    // Formater la réponse
    const members = filtered.map(p => ({
      id: p.id,
      full_name: p.full_name || 'Utilisateur',
      username: p.username || '',
      avatar_url: p.avatar_url || null,
      bio: p.bio || null,
      created_at: p.created_at,
      is_following: followingIds.has(p.id),
      followers_count: followCountsMap[p.id] || 0,
    }))

    return NextResponse.json({ members })
  } catch (err: any) {
    console.error('Error in /api/members:', err)
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 })
  }
}

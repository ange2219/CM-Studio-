import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { target_user_id } = body

    if (!target_user_id || target_user_id === user.id) {
      return NextResponse.json({ error: 'ID utilisateur cible invalide' }, { status: 400 })
    }

    // Vérifier si la relation existe déjà
    const { data: existing } = await supabase
      .from('user_follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', target_user_id)
      .maybeSingle()

    let isFollowing = false

    if (existing) {
      // Unfollow
      const { error: delErr } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', target_user_id)

      if (delErr) {
        return NextResponse.json({ error: delErr.message }, { status: 500 })
      }
      isFollowing = false
    } else {
      // Follow
      const { error: insErr } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: target_user_id,
        })

      if (insErr) {
        return NextResponse.json({ error: insErr.message }, { status: 500 })
      }
      isFollowing = true

      // Essayer d'insérer une notification de suivi pour la cible
      try {
        await supabase.from('notifications').insert({
          user_id: target_user_id,
          actor_id: user.id,
          type: 'follow',
          content: 'a commencé à vous suivre',
          is_read: false,
        })
      } catch (e) {
        // Silencieux si la table de notifications a des contraintes spécifiques
      }
    }

    return NextResponse.json({ success: true, is_following: isFollowing })
  } catch (err: any) {
    console.error('Error in /api/members/follow:', err)
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 })
  }
}

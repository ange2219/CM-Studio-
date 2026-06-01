import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/utils'
import { deletePostMediaFiles } from '@/lib/storage'

export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { ids } = await req.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs invalides' }, { status: 400 })
    }

    const admin = createAdminClient()

    // 1. Récupérer tous les posts concernés pour les médias et tokens
    const { data: posts } = await admin
      .from('posts')
      .select('id, meta_post_ids, platforms, status, media_urls')
      .in('id', ids)
      .eq('user_id', user.id)

    if (!posts || posts.length === 0) {
      return NextResponse.json({ success: true, count: 0 })
    }

    // 2. Traiter les suppressions externes pour les posts publiés
    const publishedPosts = posts.filter(p => p.status === 'published' && p.meta_post_ids)
    if (publishedPosts.length > 0) {
      const { data: accounts } = await admin
        .from('social_accounts')
        .select('platform, access_token, platform_user_id')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (accounts && accounts.length > 0) {
        const GRAPH = 'https://graph.facebook.com/v19.0'
        const IG_GRAPH = 'https://graph.instagram.com/v19.0'

        const deletePromises: Promise<any>[] = []

        for (const account of accounts) {
          let token: string
          try {
            token = decryptToken(account.access_token)
          } catch {
            continue
          }

          for (const post of publishedPosts) {
            const metaPostIds = post.meta_post_ids as Record<string, string>
            const postId = metaPostIds[account.platform]
            if (!postId) continue

            if (account.platform === 'facebook') {
              deletePromises.push(
                fetch(`${GRAPH}/${postId}?access_token=${token}`, { method: 'DELETE' }).catch(() => {})
              )
            } else if (account.platform === 'instagram') {
              deletePromises.push(
                fetch(`${IG_GRAPH}/${postId}?access_token=${token}`, { method: 'DELETE' }).catch(() => {})
              )
            }
          }
        }

        if (deletePromises.length > 0) {
          await Promise.all(deletePromises)
        }
      }
    }

    // 3. Effectuer le soft delete groupé en base de données
    const { error } = await admin
      .from('posts')
      .update({ status: 'deleted' })
      .in('id', ids)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // 4. Nettoyage des fichiers média en arrière-plan
    const mediaUrlsToClean = posts.flatMap(p => (p.media_urls as string[]) || [])
    if (mediaUrlsToClean.length > 0) {
      deletePostMediaFiles(mediaUrlsToClean).catch(() => {})
    }

    return NextResponse.json({ success: true, count: posts.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

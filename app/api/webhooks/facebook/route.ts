import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export const runtime = 'nodejs'

const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'cm_studio_testing_token_2026'
const APP_SECRET = process.env.FACEBOOK_APP_SECRET || ''

// ============================================================================
// 1. VERIFICATION CHALLENGE (GET)
// ============================================================================
// Utilisé par Facebook pour vérifier que tu es bien le propriétaire de l'URL
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Webhook FB] Vérification réussie !')
    // Next.js Response attend une chaîne texte pour le challenge
    return new NextResponse(challenge, { status: 200 })
  }

  console.warn('[Webhook FB] Échec de la vérification. Token reçu :', token)
  return new NextResponse('Forbidden', { status: 403 })
}

// ============================================================================
// 2. RECEPTION DES NOTIFICATIONS (POST)
// ============================================================================
// Appelé par Facebook à chaque nouvel événement (Like, Commentaire)
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-hub-signature-256')

    // Sécurité : Vérifier que ça vient bien de Facebook (si APP_SECRET est configuré)
    if (APP_SECRET && signature) {
      const expectedSignature = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(rawBody).digest('hex')
      if (signature !== expectedSignature) {
        console.warn('[Webhook FB] Signature invalide')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const body = JSON.parse(rawBody)

    // Vérifier si c'est un événement de page FB ou IG
    if (body.object === 'page' || body.object === 'instagram') {
      const admin = createAdminClient()

      for (const entry of body.entry) {
        for (const change of entry.changes) {
          
          let platform = body.object === 'page' ? 'facebook' : 'instagram'
          let eventType = null
          let postId = null
          let authorName = "Quelqu'un"

          // ----- PARSING FACEBOOK -----
          if (platform === 'facebook' && change.field === 'feed') {
            const val = change.value
            // On ignore les posts qu'on a créés nous-mêmes (verb = 'add', item = 'post')
            if (val.verb !== 'add') continue
            
            if (val.item === 'comment') {
              eventType = 'comment'
              postId = val.post_id // ex: "PAGEID_POSTID"
              authorName = val.from?.name || authorName
            } else if (val.item === 'like' || val.item === 'reaction') {
              eventType = 'like'
              postId = val.post_id
              authorName = val.from?.name || authorName
            }
          }
          
          // ----- PARSING INSTAGRAM -----
          else if (platform === 'instagram' && change.field === 'comments') {
            eventType = 'comment'
            postId = change.value.media_id
          } else if (platform === 'instagram' && change.field === 'likes') {
            eventType = 'like'
            postId = change.value.media_id
          }

          // Si ce n'est ni un like ni un commentaire sur un post, on passe
          if (!eventType || !postId) continue

          // 1. Chercher à qui appartient ce post dans CM Studio
          // On cherche dans le JSON meta_post_ids
          const { data: posts } = await admin
            .from('posts')
            .select('id, user_id, content')
            .contains('meta_post_ids', { [platform]: postId })
            .limit(1)

          if (!posts || posts.length === 0) {
            console.log(`[Webhook FB] Post ${postId} non trouvé dans la DB`)
            continue // Ce post n'a pas été publié via CM Studio ou a été supprimé
          }

          const post = posts[0]

          // 2. Insérer la notification
          let notifTitle = eventType === 'like' ? `Nouveau like sur ${platform === 'facebook' ? 'Facebook' : 'Instagram'}` : `Nouveau commentaire sur ${platform === 'facebook' ? 'Facebook' : 'Instagram'}`
          let notifMessage = eventType === 'like' ? `${authorName} a aimé votre publication.` : `${authorName} a commenté votre publication.`

          await admin.from('notifications').insert({
            user_id: post.user_id,
            type: eventType,
            title: notifTitle,
            message: notifMessage,
            action_url: `/posts`, // Redirection vers la liste des posts
            platform: platform,
            platform_icon: platform
          })

          console.log(`[Webhook FB] Notification insérée pour l'utilisateur ${post.user_id}`)
        }
      }
    }

    // Répondre 200 OK le plus vite possible pour que Facebook sache qu'on a bien reçu
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[Webhook FB] Erreur interne:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

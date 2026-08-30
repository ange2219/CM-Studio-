import type { Platform } from '@/types'

const ZERNIO_BASE = 'https://zernio.com/api/v1'
const API_KEY = process.env.ZERNIO_API_KEY!
const TIMEOUT_MS = 20000

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ZernioPostResult {
  id: string
  postIds: Partial<Record<Platform, string>>
  errors?: { platform: Platform; message: string }[]
  status: 'success' | 'error' | 'partial'
}

// ─── Requête de base avec timeout ─────────────────────────────────────────────

async function zernioRequest(path: string, options: RequestInit = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${ZERNIO_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    clearTimeout(timer)

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      const errorMsg = (typeof err.error === 'string' ? err.error : err.error?.message)
        || err.message
        || (typeof err.detail === 'string' ? err.detail : null)
        || (err.code ? `Zernio error ${res.status}: ${err.code}` : `Zernio error ${res.status}`)
      console.error(`[zernio] Request failed (${res.status} ${res.statusText}):`, JSON.stringify(err))
      const customErr: any = new Error(errorMsg)
      customErr.status = res.status
      customErr.data = err
      throw customErr
    }

    return res.json()
  } catch (err) {
    clearTimeout(timer)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Zernio timeout — service indisponible, réessayez dans quelques instants')
    }
    throw err
  }
}

// ─── Profil ───────────────────────────────────────────────────────────────────

/** Crée un profil Zernio pour un utilisateur */
export async function createProfile(userId: string, name: string): Promise<string> {
  try {
    const data = await zernioRequest('/profiles', {
      method: 'POST',
      body: JSON.stringify({ name, description: `User ${userId}` }),
    })
    const id = data.profile?._id || data.profile?.id || data._id || data.id
    if (!id) throw new Error('Profil Zernio créé sans identifiant retourné')
    return id as string
  } catch (err: any) {
    // Si un profil avec ce nom existe déjà (409 conflict), récupérer l'ID existant
    if (err.data?.details?.existingProfileId) {
      return err.data.details.existingProfileId as string
    }
    try {
      const list = await zernioRequest(`/profiles?name=${encodeURIComponent(name)}`)
      const existing = list.profiles?.[0]
      if (existing?._id || existing?.id) {
        return (existing._id || existing.id) as string
      }
    } catch {}
    throw err
  }
}

/** Retourne l'URL OAuth Zernio pour connecter un réseau social (mode headless par défaut pour marque blanche) */
export async function getConnectUrl(profileId: string, platform: string, redirectUrl: string, headless = true): Promise<string> {
  const params = new URLSearchParams({ 
    profileId, 
    redirect_url: redirectUrl,
    headless: String(headless)
  })
  const data = await zernioRequest(`/connect/${platform}?${params}`)
  console.log('[zernio] getConnectUrl response (headless=' + headless + '):', JSON.stringify(data))
  const url = data.url || data.connectUrl || data.authUrl || data.link || data.redirectUrl || data.oauth_url
  if (!url) throw new Error(`Zernio: champ URL introuvable dans la réponse: ${JSON.stringify(data)}`)
  return url as string
}

/** Liste les pages Facebook disponibles pour un profil en mode headless */
export async function listFacebookPages(profileId: string, tempToken: string): Promise<Array<{ id: string; name: string; category?: string }>> {
  const data = await zernioRequest(`/connect/facebook/select-page?profileId=${encodeURIComponent(profileId)}&tempToken=${encodeURIComponent(tempToken)}`)
  return data.pages || []
}

/** Sélectionne et lie une page Facebook en mode headless */
export async function selectFacebookPage(params: {
  profileId: string
  pageId: string
  tempToken: string
  userProfile: any
}): Promise<{ account: any }> {
  const data = await zernioRequest('/connect/facebook/select-page', {
    method: 'POST',
    body: JSON.stringify(params),
  })
  return data
}

/** Liste les organisations LinkedIn disponibles pour un profil en mode headless */
export async function listLinkedInOrganizations(profileId: string, tempToken: string): Promise<Array<{ id: string; urn: string; name: string; logoUrl?: string }>> {
  const data = await zernioRequest(`/connect/linkedin/select-organization?profileId=${encodeURIComponent(profileId)}&tempToken=${encodeURIComponent(tempToken)}`)
  return data.organizations || []
}

/** Sélectionne et lie un compte ou organisation LinkedIn en mode headless */
export async function selectLinkedInOrganization(params: {
  profileId: string
  tempToken: string
  userProfile: any
  accountType: 'personal' | 'organization'
  selectedOrganization?: any
}): Promise<{ account: any }> {
  const data = await zernioRequest('/connect/linkedin/select-organization', {
    method: 'POST',
    body: JSON.stringify(params),
  })
  return data
}

/** Liste les comptes connectés d'un profil Zernio et extrait leurs informations */
export async function listAccounts(profileId: string): Promise<Array<any>> {
  const data = await zernioRequest(`/accounts?profileId=${encodeURIComponent(profileId)}`)
  const list = data.accounts || data.data || data.socialAccounts || (Array.isArray(data) ? data : [])
  return list as Array<any>
}

// ─── Publication ──────────────────────────────────────────────────────────────

/** Publie un post via Zernio avec gestion des résultats par plateforme */
export async function publishPost(params: {
  platforms: { platform: Platform; accountId: string }[]
  content: string
  mediaUrls?: string[]
  scheduleDate?: string
  contentVariants?: Partial<Record<Platform, string>>
}): Promise<ZernioPostResult> {
  if (!params.platforms.length) {
    throw new Error('Aucun compte Zernio configuré pour ces plateformes.')
  }

  const body: Record<string, unknown> = {
    content: params.content,
    platforms: params.platforms,
    publishNow: !params.scheduleDate, // publication immédiate si pas de date programmée
  }

  // Variantes par plateforme
  if (params.contentVariants) {
    const overrides: Record<string, string> = {}
    for (const { platform } of params.platforms) {
      if (params.contentVariants[platform]) {
        overrides[platform] = params.contentVariants[platform]!
      }
    }
    if (Object.keys(overrides).length > 0) {
      body.contentVariants = overrides
    }
  }

  // mediaItems (format Zernio) — détecte video vs image par extension
  if (params.mediaUrls?.length) {
    body.mediaItems = params.mediaUrls.map(url => {
      const isVideo = /\.(mp4|mov|webm|avi|mkv)$/i.test(url)
      return { type: isVideo ? 'video' : 'image', url }
    })
  }

  // TikTok settings au niveau racine (obligatoire pour Direct Post)
  if (params.platforms.some(p => p.platform === 'tiktok')) {
    body.tiktokSettings = {
      privacy_level: 'PUBLIC_TO_EVERYONE',
      allow_comment: true,
      allow_duet: true,
      allow_stitch: true,
      content_preview_confirmed: true,
      express_consent_given: true,
    }
  }

  if (params.scheduleDate) {
    body.scheduledFor = params.scheduleDate
    body.timezone = 'UTC'
  }

  const raw = await zernioRequest('/posts', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  // Normaliser la réponse Zernio
  console.log('[zernio/publish] raw response:', JSON.stringify(raw))

  const postIds: Partial<Record<Platform, string>> = {}
  const errors: { platform: Platform; message: string }[] = []

  const zernioPostId: string = raw.post?._id || raw._id || ''
  const zernioStatus: string = raw.post?.status || raw.status || ''

  // Format 1 : post.postIds ou post.platformPostIds (objet {platform: id})
  const rawPostIds = raw.post?.postIds || raw.post?.platformPostIds || raw.postIds || raw.platformPostIds || {}
  for (const [platform, value] of Object.entries(rawPostIds)) {
    if (value && typeof value === 'string') {
      postIds[platform as Platform] = value
    }
  }

  // Format 2 : post.platforms[].platformPostId (tableau des plateformes publiées)
  if (Array.isArray(raw.post?.platforms)) {
    for (const p of raw.post.platforms) {
      const pid = p.platformPostId || p.platformId || p.postId
      if (pid && p.platform && p.status === 'published') {
        postIds[p.platform as Platform] = pid
      }
    }
  }

  // Format 3 : file d'attente (draft/pending) → stocker l'ID Zernio comme référence
  if (Object.keys(postIds).length === 0 && zernioPostId && ['draft', 'pending', 'queued', 'scheduled'].includes(zernioStatus)) {
    for (const { platform } of params.platforms) {
      postIds[platform] = `zernio:${zernioPostId}`
    }
  }

  // Erreurs par plateforme
  const rawErrors = raw.post?.errors || raw.post?.platformErrors || raw.errors || raw.platformErrors || []
  for (const e of rawErrors) {
    errors.push({ platform: e.platform as Platform, message: e.message || e.error || 'Échec inconnu' })
  }

  const successCount = Object.keys(postIds).length
  const status: ZernioPostResult['status'] =
    successCount === 0 ? 'error'
    : errors.length > 0 ? 'partial'
    : 'success'

  if (status === 'error') {
    const errMsg = errors.length
      ? errors.map(e => `${e.platform}: ${e.message}`).join(', ')
      : 'Zernio n\'a pas confirmé la publication'
    throw new Error(`Publication Zernio échouée. ${errMsg}`)
  }

  return { id: zernioPostId, postIds, errors, status }
}

// ─── Suppression ──────────────────────────────────────────────────────────────

/** Supprime un post Zernio */
export async function deletePost(zernioPostId: string) {
  return zernioRequest(`/posts/${zernioPostId}`, { method: 'DELETE' })
}

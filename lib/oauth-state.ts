import crypto from 'crypto'

if (!process.env.OAUTH_STATE_SECRET) {
  throw new Error("La variable d'environnement OAUTH_STATE_SECRET est obligatoire pour sécuriser les états OAuth.")
}
const STATE_SECRET = process.env.OAUTH_STATE_SECRET

export interface OAuthStatePayload {
  orgId: string
  userId: string
  platform: string
}

/**
 * Signe de façon cryptographique les informations d'authentification OAuth (orgId, userId, platform)
 * pour éviter toute falsification de scope côté client lors du callback.
 */
export function signState(payload: OAuthStatePayload): string {
  const data = JSON.stringify({
    ...payload,
    exp: Date.now() + 15 * 60 * 1000 // Expire après 15 minutes
  })
  const signature = crypto
    .createHmac('sha256', STATE_SECRET)
    .update(data)
    .digest('hex')
    
  // Concatène les données et la signature en un jeton base64url-encoded
  return Buffer.from(JSON.stringify({ data, signature })).toString('base64url')
}

/**
 * Décode et vérifie la signature cryptographique d'un paramètre state OAuth.
 * Utilise crypto.timingSafeEqual pour prévenir les attaques par timing.
 */
export function verifyState(state: string): OAuthStatePayload | null {
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'))
    const expectedSignature = crypto
      .createHmac('sha256', STATE_SECRET)
      .update(decoded.data)
      .digest('hex')

    const sigBuffer = Buffer.from(decoded.signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')

    // Comparaison à temps constant pour éviter les attaques par timing
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      console.error('[OAuth State] Signature invalide')
      return null
    }

    const payload = JSON.parse(decoded.data)
    if (Date.now() > payload.exp) {
      console.error('[OAuth State] Paramètre state expiré')
      return null
    }

    return { 
      orgId: payload.orgId, 
      userId: payload.userId, 
      platform: payload.platform 
    }
  } catch (err) {
    console.error('[OAuth State] Échec du décodage du state:', err)
    return null
  }
}

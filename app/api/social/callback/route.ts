import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { 
  listAccounts, 
  listFacebookPages, 
  selectFacebookPage, 
  listLinkedInOrganizations, 
  selectLinkedInOrganization 
} from '@/lib/zernio'

async function saveAccountAndClose(
  admin: any,
  orgId: string,
  platform: string,
  accountId: string,
  username: string,
  avatarUrl: string | null
) {
  const { data: existing } = await admin
    .from('social_accounts')
    .select('access_token, connected_via')
    .eq('organization_id', orgId)
    .eq('platform', platform)
    .eq('platform_user_id', accountId)
    .maybeSingle()

  const hasMetaToken = existing?.access_token && existing.access_token !== 'zernio_managed'
  const connectedVia = hasMetaToken ? 'both' : 'zernio'

  const upsertPayload: Record<string, unknown> = {
    organization_id:      orgId,
    platform,
    is_active:            true,
    platform_username:    username,
    platform_avatar_url:  avatarUrl,
    connected_via:        connectedVia,
    platform_user_id:     accountId,
  }
  if (!hasMetaToken) {
    upsertPayload.access_token = 'zernio_managed'
  }

  const { error } = await admin
    .from('social_accounts')
    .upsert(upsertPayload, { onConflict: 'organization_id,platform,platform_user_id' })

  if (error) {
    console.error('[social/callback] DB upsert error:', error.message)
    const html = `<!DOCTYPE html><html><body><script>
      var d = { type: 'zernio_oauth', success: false, error: 'Erreur d\\'enregistrement base de données' };
      try { window.opener.postMessage(d, '*') } catch(e) {}
      try { localStorage.setItem('_oauth_result', JSON.stringify(d)) } catch(e) {}
      window.close()
    </script></body></html>`
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
  }

  const payload = JSON.stringify({ type: 'zernio_oauth', success: true, platform, username })
    .replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
  const html = `<!DOCTYPE html><html><body style="font-family:'Plus Jakarta Sans',sans-serif;background:#0F172A;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
    <script>
      var d = ${payload};
      try { window.opener.postMessage(d, '*') } catch(e) {}
      try { localStorage.setItem('_oauth_result', JSON.stringify(d)) } catch(e) {}
      setTimeout(function() { window.close() }, 600);
    </script>
    <div style="text-align:center;padding:20px">
      <div style="width:48px;height:48px;border-radius:50%;background:#1677FF;color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:22px;font-weight:bold">✓</div>
      <h3 style="margin:0 0 8px;font-size:18px">Connexion réussie</h3>
      <p style="margin:0;font-size:13px;color:#94A3B8">Compte @${username} relié à CM Studio.</p>
    </div>
  </body></html>`
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  console.log('[social/callback] params:', Object.fromEntries(searchParams.entries()))

  const platform = searchParams.get('platform')
  const userId   = searchParams.get('userId')
  const orgId    = searchParams.get('orgId')
  const accountId = searchParams.get('accountId') || searchParams.get('account_id') || searchParams.get('id')
  const step = searchParams.get('step')
  const tempToken = searchParams.get('tempToken')
  const userProfileRaw = searchParams.get('userProfile')

  if (!platform || !userId || !orgId) {
    const html = `<!DOCTYPE html><html><body><script>
      var d = { type: 'zernio_oauth', success: false, error: 'Paramètres de callback manquants' };
      try { window.opener.postMessage(d, '*') } catch(e) {}
      try { localStorage.setItem('_oauth_result', JSON.stringify(d)) } catch(e) {}
      window.close()
    </script></body></html>`
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
  }

  const admin = createAdminClient()
  const { data: orgProfile } = await admin
    .from('organizations')
    .select('zernio_profile_id')
    .eq('id', orgId)
    .single()

  const profileId = orgProfile?.zernio_profile_id

  if (!profileId) {
    const html = `<!DOCTYPE html><html><body><script>
      var d = { type: 'zernio_oauth', success: false, error: 'Profil organisation introuvable' };
      try { window.opener.postMessage(d, '*') } catch(e) {}
      try { localStorage.setItem('_oauth_result', JSON.stringify(d)) } catch(e) {}
      window.close()
    </script></body></html>`
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
  }

  let decodedProfile: any = {}
  try {
    decodedProfile = userProfileRaw ? JSON.parse(decodeURIComponent(userProfileRaw)) : {}
  } catch {
    decodedProfile = typeof userProfileRaw === 'object' ? userProfileRaw : {}
  }

  // ── Mode Headless : Sélection de Page Facebook ──
  if (step === 'select_page' && tempToken) {
    try {
      console.log('[social/callback] Headless: Récupération des pages Facebook...')
      const pages = await listFacebookPages(profileId, tempToken)
      console.log('[social/callback] Pages disponibles:', pages.length)

      if (pages.length === 0) {
        throw new Error('Aucune page Facebook trouvée pour ce compte. Vous devez être administrateur d\'au moins une page Facebook.')
      }

      // Si une seule page est trouvée, on la sélectionne automatiquement sans étape intermédiaire
      if (pages.length === 1) {
        const page = pages[0]
        console.log('[social/callback] Auto-sélection de la seule page Facebook:', page.name)
        const result = await selectFacebookPage({
          profileId,
          pageId: page.id,
          tempToken,
          userProfile: decodedProfile
        })
        const finalId = result.account?.accountId || page.id
        const finalName = page.name || result.account?.username || 'Facebook Page'
        return saveAccountAndClose(admin, orgId, platform, finalId, finalName, null)
      }

      // Plusieurs pages : on affiche l'interface de sélection 100% Marque Blanche CM Studio
      const pagesHtml = pages.map(p => `
        <form method="POST" action="/api/social/callback" style="margin-bottom:10px">
          <input type="hidden" name="action" value="select_facebook_page" />
          <input type="hidden" name="profileId" value="${profileId}" />
          <input type="hidden" name="pageId" value="${p.id}" />
          <input type="hidden" name="pageName" value="${p.name.replace(/"/g, '&quot;')}" />
          <input type="hidden" name="tempToken" value="${tempToken}" />
          <input type="hidden" name="userProfile" value="${encodeURIComponent(JSON.stringify(decodedProfile))}" />
          <input type="hidden" name="orgId" value="${orgId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <input type="hidden" name="platform" value="${platform}" />
          <button type="submit" style="width:100%;text-align:left;background:#1E293B;border:1px solid #334155;border-radius:12px;padding:14px 16px;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:all 0.15s">
            <div>
              <div style="font-weight:700;font-size:14px">${p.name}</div>
              <div style="font-size:12px;color:#94A3B8">${p.category || 'Page Facebook'}</div>
            </div>
            <span style="background:#1677FF;color:#fff;font-size:12px;font-weight:600;padding:6px 12px;border-radius:8px">Connecter</span>
          </button>
        </form>
      `).join('')

      const html = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Sélectionnez votre Page - CM Studio</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0F172A; color: #fff; margin: 0; padding: 24px; box-sizing: border-box; }
          button:hover { border-color: #1677FF !important; transform: translateY(-1px); }
        </style>
      </head>
      <body>
        <div style="max-width: 440px; margin: 0 auto;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:18px">
            <div style="width:28px;height:28px;border-radius:8px;background:#1677FF;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px">CM</div>
            <span style="font-weight:800;font-size:18px;letter-spacing:-0.02em">CM Studio</span>
          </div>
          <h2 style="font-size:20px;font-weight:800;margin:0 0 6px 0">Sélectionnez votre Page Facebook</h2>
          <p style="font-size:13px;color:#94A3B8;margin:0 0 20px 0">Choisissez la page que vous souhaitez gérer depuis votre espace CM Studio.</p>
          ${pagesHtml}
        </div>
      </body>
      </html>`
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
    } catch (err: any) {
      console.error('[social/callback] Erreur sélection page Facebook:', err.message)
      const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px;text-align:center;color:#ef4444;background:#0F172A">
        <h3>Erreur de connexion</h3>
        <p style="color:#94A3B8;font-size:14px">${err.message}</p>
      </body></html>`
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
    }
  }

  // ── Mode Headless : Sélection de profil ou organisation LinkedIn ──
  if (step === 'select_organization' && tempToken) {
    try {
      console.log('[social/callback] Headless: Récupération des organisations LinkedIn...')
      const orgs = await listLinkedInOrganizations(profileId, tempToken)
      console.log('[social/callback] Organisations disponibles:', orgs.length)

      // Si aucune organisation, liaison automatique en tant que profil personnel
      if (orgs.length === 0) {
        const result = await selectLinkedInOrganization({
          profileId,
          tempToken,
          userProfile: decodedProfile,
          accountType: 'personal'
        })
        const finalId = result.account?.accountId || result.account?.id || 'linkedin_user'
        const finalName = result.account?.username || decodedProfile?.displayName || 'LinkedIn'
        return saveAccountAndClose(admin, orgId, platform, finalId, finalName, null)
      }

      // Si une seule organisation, on la sélectionne directement
      if (orgs.length === 1) {
        const org = orgs[0]
        const result = await selectLinkedInOrganization({
          profileId,
          tempToken,
          userProfile: decodedProfile,
          accountType: 'organization',
          selectedOrganization: org
        })
        const finalId = result.account?.accountId || org.id
        const finalName = org.name || result.account?.username || 'LinkedIn Org'
        return saveAccountAndClose(admin, orgId, platform, finalId, finalName, org.logoUrl || null)
      }

      // Plusieurs organisations : sélecteur CM Studio
      const orgsHtml = orgs.map(o => `
        <form method="POST" action="/api/social/callback" style="margin-bottom:10px">
          <input type="hidden" name="action" value="select_linkedin_org" />
          <input type="hidden" name="profileId" value="${profileId}" />
          <input type="hidden" name="orgJson" value="${encodeURIComponent(JSON.stringify(o))}" />
          <input type="hidden" name="tempToken" value="${tempToken}" />
          <input type="hidden" name="userProfile" value="${encodeURIComponent(JSON.stringify(decodedProfile))}" />
          <input type="hidden" name="orgId" value="${orgId}" />
          <input type="hidden" name="userId" value="${userId}" />
          <input type="hidden" name="platform" value="${platform}" />
          <button type="submit" style="width:100%;text-align:left;background:#1E293B;border:1px solid #334155;border-radius:12px;padding:14px 16px;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:all 0.15s">
            <div style="font-weight:700;font-size:14px">${o.name}</div>
            <span style="background:#1677FF;color:#fff;font-size:12px;font-weight:600;padding:6px 12px;border-radius:8px">Connecter</span>
          </button>
        </form>
      `).join('')

      const html = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Sélectionnez votre Page Entreprise - CM Studio</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0F172A; color: #fff; margin: 0; padding: 24px; box-sizing: border-box; }
          button:hover { border-color: #1677FF !important; transform: translateY(-1px); }
        </style>
      </head>
      <body>
        <div style="max-width: 440px; margin: 0 auto;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:18px">
            <div style="width:28px;height:28px;border-radius:8px;background:#1677FF;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px">CM</div>
            <span style="font-weight:800;font-size:18px;letter-spacing:-0.02em">CM Studio</span>
          </div>
          <h2 style="font-size:20px;font-weight:800;margin:0 0 6px 0">Sélectionnez votre Page Entreprise</h2>
          <p style="font-size:13px;color:#94A3B8;margin:0 0 20px 0">Choisissez l'entreprise LinkedIn à connecter.</p>
          ${orgsHtml}
        </div>
      </body>
      </html>`
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
    } catch (err: any) {
      console.error('[social/callback] Erreur sélection LinkedIn:', err.message)
      const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px;text-align:center;color:#ef4444;background:#0F172A">
        <h3>Erreur de connexion</h3>
        <p style="color:#94A3B8;font-size:14px">${err.message}</p>
      </body></html>`
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
    }
  }

  // ── Mode standard / Plateformes directes (TikTok, Instagram, Twitter, YouTube, etc.) ──
  let finalAccountId = accountId
  let platformUsername: string = platform
  let platformAvatarUrl: string | null = null

  try {
    console.log('[social/callback] Interroge Zernio API pour les infos du compte', platform)
    const accounts = await listAccounts(profileId)
    console.log('[social/callback] comptes Zernio trouvés:', accounts.length)

    const match = accounts.find((a: any) =>
      a.platform?.toLowerCase() === platform.toLowerCase()
    ) as any

    if (match) {
      finalAccountId = finalAccountId || match._id || match.id || match.accountId || match.platformId
      platformUsername = match.displayName || match.name || match.display_name || match.username || match.handle || match.profile?.username || match.profile?.name || platform
      platformAvatarUrl = match.avatar || match.profilePicture || match.picture || match.avatarUrl || match.profile_picture_url || match.profile?.avatar || match.profile?.picture || null
    }
  } catch (err: any) {
    console.error('[social/callback] Erreur listAccounts:', err.message)
  }

  if (!finalAccountId) {
    console.error('[social/callback] accountId introuvable pour', platform)
    const html = `<!DOCTYPE html><html><body><script>
      var d = { type: 'zernio_oauth', success: false, error: 'Compte ${platform} introuvable dans Zernio' };
      try { window.opener.postMessage(d, '*') } catch(e) {}
      try { localStorage.setItem('_oauth_result', JSON.stringify(d)) } catch(e) {}
      window.close()
    </script></body></html>`
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
  }

  return saveAccountAndClose(admin, orgId, platform, finalAccountId, platformUsername, platformAvatarUrl)
}

/** Gestion des soumissions de formulaires de sélection (Marque Blanche) */
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const action = formData.get('action') as string
  const profileId = formData.get('profileId') as string
  const tempToken = formData.get('tempToken') as string
  const orgId = formData.get('orgId') as string
  const platform = formData.get('platform') as string
  const userProfileRaw = formData.get('userProfile') as string

  let userProfile: any = {}
  try {
    userProfile = userProfileRaw ? JSON.parse(decodeURIComponent(userProfileRaw)) : {}
  } catch {
    userProfile = {}
  }

  const admin = createAdminClient()

  if (action === 'select_facebook_page') {
    const pageId = formData.get('pageId') as string
    const pageName = formData.get('pageName') as string
    try {
      const result = await selectFacebookPage({
        profileId,
        pageId,
        tempToken,
        userProfile
      })
      const finalId = result.account?.accountId || pageId
      const finalName = pageName || result.account?.username || 'Facebook Page'
      return saveAccountAndClose(admin, orgId, platform, finalId, finalName, null)
    } catch (err: any) {
      console.error('[social/callback] POST Facebook select error:', err.message)
      return new NextResponse(`Erreur: ${err.message}`, { status: 500 })
    }
  }

  if (action === 'select_linkedin_org') {
    const orgJson = formData.get('orgJson') as string
    try {
      const selectedOrg = orgJson ? JSON.parse(decodeURIComponent(orgJson)) : {}
      const result = await selectLinkedInOrganization({
        profileId,
        tempToken,
        userProfile,
        accountType: 'organization',
        selectedOrganization: selectedOrg
      })
      const finalId = result.account?.accountId || selectedOrg.id
      const finalName = selectedOrg.name || 'LinkedIn Org'
      return saveAccountAndClose(admin, orgId, platform, finalId, finalName, selectedOrg.logoUrl || null)
    } catch (err: any) {
      console.error('[social/callback] POST LinkedIn select error:', err.message)
      return new NextResponse(`Erreur: ${err.message}`, { status: 500 })
    }
  }

  return new NextResponse('Action non reconnue', { status: 400 })
}

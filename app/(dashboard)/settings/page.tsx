'use client'

import { useState, useEffect, useCallback, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { useOrg } from '@/components/context/OrgContext'
import { PLATFORM_NAMES, PLATFORM_COLORS } from '@/types'
import type { Platform, SocialAccount } from '@/types'
import { User, Camera, CreditCard, Trash2, Shield, RefreshCw, Sparkles, Upload, Building2, Plus, X } from 'lucide-react'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import { ProfileSkeleton } from '@/components/ui/Skeleton'

const NAV_ITEMS = [
  { id: 'identity', label: 'Identité & Marque', icon: User },
  { id: 'billing', label: 'Abonnements', icon: CreditCard },
  { id: 'security', label: 'Compte & Sécurité', icon: Shield },
  { id: 'danger', label: 'Zone dangereuse', icon: Trash2 },
]

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--t3)' }}><ProfileSkeleton /></div>}>
      <SettingsContent />
    </Suspense>
  )
}

function SettingsContent() {
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  
  const tab = searchParams.get('tab') || 'identity'
  const [active, setActive] = useState(tab)

  useEffect(() => {
    if (tab) setActive(tab)
  }, [tab])

  // --- Profile / Identity States ---
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [initialFullName, setInitialFullName] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [initialUsername, setInitialUsername] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [savingUser, setSavingUser] = useState(false)

  // --- Brand States ---
  const [isEditingBrand, setIsEditingBrand] = useState(false)
  const [initialBrand, setInitialBrand] = useState<any>(null)
  const [brandName, setBrandName] = useState('')
  const [brandDesc, setBrandDesc] = useState('')
  const [sector, setSector] = useState('')
  const [defaultTone, setDefaultTone] = useState('professionnel')
  const [postsPerWeek, setPostsPerWeek] = useState(5)
  const [website, setWebsite] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [contentPillars, setContentPillars] = useState<string[]>([])
  const [avoidWords, setAvoidWords] = useState('')
  const [objectives, setObjectives] = useState<string[]>([])
  const [valueProposition, setValueProposition] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [colorPrimary, setColorPrimary] = useState('#1E57CD')
  const [colorSecondary, setColorSecondary] = useState('#059669')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [savingBrand, setSavingBrand] = useState(false)

  // --- Org context ---
  const { activeOrganization, organizations, switchOrganization } = useOrg()

  // --- Platform popup state ---
  const [platformPopup, setPlatformPopup] = useState<Platform | null>(null)
  const platformPopupRef = useRef<HTMLDivElement>(null)

  // --- Add Brand modal state ---
  const [showAddBrandModal, setShowAddBrandModal] = useState(false)
  const [addBrandName, setAddBrandName] = useState('')
  const [addingBrand, setAddingBrand] = useState(false)

  // --- Social / Billing / Security States ---
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [userPlan, setUserPlan] = useState<'free' | 'premium' | 'business'>('free')
  
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [lang, setLang] = useState<'fr' | 'en'>('fr')
  const [emailNotifs, setEmailNotifs] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)
  const [pwdStep, setPwdStep] = useState<'idle' | 'verified'>('idle')
  const [authProvider, setAuthProvider] = useState<string>('email')

  const [confirmDelete, setConfirmDelete] = useState('')
  const [deleting, setDeleting] = useState(false)

  const loadAccounts = useCallback(async () => {
    const res = await fetch('/api/social/accounts')
    if (res.ok) setAccounts(await res.json())
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        setAuthProvider(user.app_metadata?.provider || 'email')
      }
      const me = await fetch('/api/auth/me').then(r => r.json())
      if (me?.full_name) {
        setFullName(me.full_name)
        setInitialFullName(me.full_name)
      }
      if (me?.username) {
        setUsername(me.username)
        setInitialUsername(me.username)
      }
      if (me?.plan) setUserPlan(me.plan)
      if (me?.avatar_url) setAvatarUrl(me.avatar_url)
      
      const brand = await fetch('/api/brand').then(r => r.ok ? r.json() : null)
      if (brand) {
        setBrandName(brand.brand_name || '')
        setBrandDesc(brand.description || '')
        setSector(brand.industry || '')
        setDefaultTone(brand.tone || 'professionnel')
        setPostsPerWeek(brand.posts_per_week || 5)
        setWebsite(brand.website || '')
        setTargetAudience(brand.target_audience || '')
        setContentPillars(brand.content_pillars || [])
        setAvoidWords(brand.avoid_words || '')
        setObjectives(brand.objectives || [])
        
        setValueProposition(brand.audience_interests || '')
        
        let logo = ''
        let primary = '#1E57CD'
        let secondary = '#059669'
        let platArr: string[] = []
        try {
          if (brand.audience_location && brand.audience_location.startsWith('{')) {
            const parsed = JSON.parse(brand.audience_location)
            logo = parsed.logo_url || ''
            primary = parsed.color_primary || '#1E57CD'
            secondary = parsed.color_secondary || '#059669'
            platArr = parsed.platforms || []
          }
        } catch (e) {}
        
        setLogoUrl(logo)
        setColorPrimary(primary)
        setColorSecondary(secondary)
        setPlatforms(platArr)

        setInitialBrand({
          brandName: brand.brand_name || '',
          brandDesc: brand.description || '',
          sector: brand.industry || '',
          defaultTone: brand.tone || 'professionnel',
          postsPerWeek: brand.posts_per_week || 5,
          website: brand.website || '',
          targetAudience: brand.target_audience || '',
          contentPillars: brand.content_pillars || [],
          avoidWords: brand.avoid_words || '',
          objectives: brand.objectives || [],
          valueProposition: brand.audience_interests || '',
          logoUrl: logo,
          colorPrimary: primary,
          colorSecondary: secondary,
          platforms: platArr,
        })
      } else {
        setInitialBrand({
          brandName: '', brandDesc: '', sector: '', defaultTone: 'professionnel',
          postsPerWeek: 5, website: '', targetAudience: '', contentPillars: [], 
          avoidWords: '', objectives: [], valueProposition: '', logoUrl: '', 
          colorPrimary: '#1E57CD', colorSecondary: '#059669', platforms: [],
        })
      }
      await loadAccounts()
      
      const saved = localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'dark'
      setTheme(saved as 'dark' | 'light')

      if (searchParams.get('action') === 'delete') {
        setActive('danger')
      }

      setLoading(false)
    }
    load()
  }, [loadAccounts, supabase.auth, searchParams])

  // --- OAuth Handlers ---
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (!e.data) return
      if (e.data.type === 'meta_oauth') {
        const { success, page, error } = e.data
        if (success) toast(`Facebook "${page}" connecté !`, 'success')
        else if (error) toast(`Erreur Facebook : ${error}`, 'error')
        loadAccounts()
      } else if (e.data.type === 'instagram_oauth') {
        const { success, username, error } = e.data
        if (success) toast(`Instagram @${username} connecté !`, 'success')
        else if (error) toast(`Erreur Instagram : ${error}`, 'error')
        loadAccounts()
      } else if (e.data.type === 'zernio_oauth') {
        const { success, platform } = e.data
        if (success) toast(`${platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Compte'} connecté !`, 'success')
        loadAccounts()
      }
    }
    function handleStorage(e: StorageEvent) {
      if (e.key !== '_oauth_result' || !e.newValue) return
      try {
        const d = JSON.parse(e.newValue)
        if (d.type === 'meta_oauth') {
          if (d.success) toast(`Facebook "${d.page}" connecté !`, 'success')
          else if (d.error) toast(`Erreur Facebook : ${d.error}`, 'error')
          loadAccounts()
        } else if (d.type === 'instagram_oauth') {
          if (d.success) toast(`Instagram @${d.username} connecté !`, 'success')
          else if (d.error) toast(`Erreur Instagram : ${d.error}`, 'error')
          loadAccounts()
        } else if (d.type === 'zernio_oauth') {
          if (d.success) toast(`${d.platform ? d.platform.charAt(0).toUpperCase() + d.platform.slice(1) : 'Compte'} connecté !`, 'success')
          loadAccounts()
        }
      } catch {}
    }
    window.addEventListener('message', handleMessage)
    window.addEventListener('storage', handleStorage)
    return () => { window.removeEventListener('message', handleMessage); window.removeEventListener('storage', handleStorage) }
  }, [loadAccounts, toast])

  function openOAuthPopup(platform: string) {
    const w = 600, h = 700
    const left = Math.round(window.screen.width / 2 - w / 2)
    const top = Math.round(window.screen.height / 2 - h / 2)
    window.open(`/api/social/start?platform=${platform}`, `${platform}_oauth`, `width=${w},height=${h},left=${left},top=${top}`)
  }

  function openPlatformOAuth(platform: Platform) {
    if (platform === 'facebook') {
      window.open('/api/auth/meta/start', 'meta_oauth', `width=600,height=700,left=${Math.round(window.screen.width/2-300)},top=${Math.round(window.screen.height/2-350)}`)
    } else if (platform === 'instagram') {
      window.open('/api/auth/instagram/start', 'instagram_oauth', `width=600,height=700,left=${Math.round(window.screen.width/2-300)},top=${Math.round(window.screen.height/2-350)}`)
    } else {
      openOAuthPopup(platform)
    }
  }

  async function handleAddBrand() {
    if (!addBrandName.trim()) return
    setAddingBrand(true)
    try {
      const { data: orgId, error } = await supabase.rpc('create_organization', { org_name: addBrandName })
      if (error) throw new Error(error.message)

      // Basculer vers la nouvelle marque et recharger les paramètres
      const secureFlag = window.location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `active_org_id=${orgId}; path=/; max-age=${60 * 60 * 24 * 365}${secureFlag}; SameSite=Lax`
      sessionStorage.setItem('toast_message', `Marque "${addBrandName}" créée ! Complétez son profil ici.`)
      sessionStorage.setItem('toast_type', 'success')
      window.location.href = '/settings?tab=identity'
    } catch (err: any) {
      toast(err.message || 'Erreur lors de la création', 'error')
      setAddingBrand(false)
    }
  }


  // --- Profile Actions ---
  async function saveUserInfo() {
    setSavingUser(true)
    const res = await fetch('/api/auth/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ full_name: fullName, username: username }) })
    setSavingUser(false)
    if (res.ok) {
      setInitialFullName(fullName)
      setInitialUsername(username)
      setIsEditingPersonal(false)
      toast('Profil mis à jour', 'success')
    } else {
      const data = await res.json()
      toast(data.error || 'Erreur lors de la mise à jour', 'error')
    }
  }

  async function saveBrand() {
    setSavingBrand(true)
    const audienceLocationJson = JSON.stringify({
      logo_url: logoUrl || '',
      color_primary: colorPrimary || '',
      color_secondary: colorSecondary || '',
      platforms: platforms || [],
    })
    const res = await fetch('/api/brand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand_name: brandName, description: brandDesc, sector,
        default_tone: defaultTone, posts_per_week: postsPerWeek,
        website, target_audience: targetAudience,
        audience_interests: valueProposition, // Stores value proposition
        audience_location: audienceLocationJson, // Stores logo, colors, platforms JSON
        content_pillars: contentPillars,
        avoid_words: avoidWords, objectives,
      }),
    })
    setSavingBrand(false)
    if (res.ok) {
      setInitialBrand({
        brandName, brandDesc, sector, defaultTone, postsPerWeek, website,
        targetAudience, contentPillars, avoidWords, objectives,
        valueProposition, logoUrl, colorPrimary, colorSecondary, platforms
      })
      setIsEditingBrand(false)
      toast('Profil de marque sauvegardé', 'success')
    } else {
      toast('Erreur', 'error')
    }
  }

  function cancelBrandEdit() {
    if (initialBrand) {
      setBrandName(initialBrand.brandName)
      setBrandDesc(initialBrand.brandDesc)
      setSector(initialBrand.sector)
      setDefaultTone(initialBrand.defaultTone)
      setPostsPerWeek(initialBrand.postsPerWeek)
      setWebsite(initialBrand.website)
      setTargetAudience(initialBrand.targetAudience)
      setContentPillars(initialBrand.contentPillars)
      setAvoidWords(initialBrand.avoidWords)
      setObjectives(initialBrand.objectives)
      setValueProposition(initialBrand.valueProposition)
      setLogoUrl(initialBrand.logoUrl)
      setColorPrimary(initialBrand.colorPrimary)
      setColorSecondary(initialBrand.colorSecondary)
      setPlatforms(initialBrand.platforms)
    }
    setIsEditingBrand(false)
  }

  async function renameAccount(id: string, name: string) {
    const res = await fetch('/api/social/accounts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, platform_username: name }) })
    if (res.ok) {
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, platform_username: name } : a))
      toast('Nom mis à jour', 'success')
    } else toast('Erreur lors de la mise à jour', 'error')
  }

  async function disconnect(id: string) {
    const res = await fetch(`/api/social/accounts?id=${id}`, { method: 'DELETE' })
    if (res.ok) { setAccounts(prev => prev.filter(a => a.id !== id)); toast('Compte déconnecté', 'success') }
  }

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/upload/avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAvatarUrl(data.url)
      toast('Photo de profil mise à jour', 'success')
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur upload', 'error')
    } finally { setUploadingAvatar(false) }
  }

  // --- Security / Billing Actions ---
  async function handleDeleteAccount() {
    setDeleting(true)
    const res = await fetch('/api/auth/delete-account', { method: 'DELETE' })
    if (res.ok) { await supabase.auth.signOut(); window.location.href = '/login' }
    else { const d = await res.json(); toast(d.error || 'Erreur', 'error'); setDeleting(false) }
  }

  async function verifyCurrentPassword() {
    if (!currentPassword) { toast('Entrez votre mot de passe actuel', 'error'); return }
    setSavingPwd(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
    setSavingPwd(false)
    if (error) { toast('Mot de passe actuel incorrect', 'error'); return }
    setPwdStep('verified')
    toast('Identité vérifiée', 'success')
  }

  async function changePassword() {
    if (newPassword.length < 8) { toast('8 caractères minimum', 'error'); return }
    if (newPassword !== confirmPassword) { toast('Les mots de passe ne correspondent pas', 'error'); return }
    setSavingPwd(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPwd(false)
    if (error) { toast(error.message, 'error'); return }
    toast('Mot de passe modifié avec succès', 'success')
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPwdStep('idle')
  }

  async function handleUpgrade(plan: 'premium' | 'business') {
    const res = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  const initials = (fullName || email || 'U').slice(0, 2).toUpperCase()

  const [isMobileSettings, setIsMobileSettings] = useState(false)
  useEffect(() => {
    const check = () => setIsMobileSettings(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (loading) return <ProfileSkeleton />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* ── En-tête des paramètres ── */}
      <div style={{ padding: isMobileSettings ? '1.5rem 1rem 1rem' : '2rem 2rem 1rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--t1)', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Paramètres</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--b1)' }} />
              : <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--b1)' }}><User size={26} strokeWidth={1.5} color="var(--t3)" /></div>
            }
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{fullName || 'Mon compte'}</div>
            <div style={{ fontSize: '.9rem', color: 'var(--t3)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{email}</div>
          </div>
        </div>
      </div>

      {/* ── Top Tabs ── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--b1)',
        gap: '4px',
        marginBottom: '2rem',
        justifyContent: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg)',
        paddingTop: '8px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => { setActive(item.id); router.replace(`/settings?tab=${item.id}`, { scroll: false }); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                padding: '10px 22px',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--accent)' : 'var(--t3)',
                cursor: 'pointer',
                transition: 'all .15s',
                marginBottom: '-1px',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} />
              {item.label}
            </button>
          )
        })}
      </div>

      {/* ── Main Content ── */}
      <main style={{ padding: isMobileSettings ? '0 1rem 2rem' : '0 2rem 2rem' }}>
        
        {/* ── 1. IDENTITÉ & MARQUE ── */}
        {active === 'identity' && (
          <div className="anim-fade-up">
            <SectionHeader title="Identité & Marque" desc="Gérez vos informations personnelles et les profils de vos marques." />

            {/* ── Section 1 : Informations personnelles ── */}
            <div style={{ padding: '1.25rem', background: 'var(--card-bg)', border: '1px solid var(--b1)', borderRadius: '12px', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '.92rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--t1)' }}>Informations personnelles</h3>
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ position: 'relative', display: 'inline-block', cursor: 'pointer', flexShrink: 0 }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--b1)' }} />
                    : <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--b1)' }}><User size={28} strokeWidth={1.5} color="var(--t3)" /></div>
                  }
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.55)', opacity: 0, transition: '.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                    <Camera size={15} color="#fff" />
                  </div>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f) }} />
                </label>
                <div>
                  <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--t1)' }}>Photo de profil</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--t3)', marginTop: '.15rem' }}>Cliquez sur l'image pour la modifier (JPG, PNG).</div>
                </div>
              </div>

              <Row label="Nom complet">
                <input className="input" style={{ maxWidth: '320px' }} placeholder="Votre nom" value={fullName} onChange={e => setFullName(e.target.value)} disabled={!isEditingPersonal} />
              </Row>
              <Row label="Pseudo unique">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '320px' }}>
                  <span style={{ color: 'var(--t3)', fontSize: '.88rem', fontWeight: 600 }}>@</span>
                  <input className="input" style={{ flex: 1 }} placeholder="pseudo" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, ''))} disabled={!isEditingPersonal} />
                </div>
              </Row>
              <Row label="Adresse email">
                <input className="input" style={{ maxWidth: '320px', opacity: .45, cursor: 'not-allowed' }} value={email} disabled />
              </Row>
              
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--b1)' }}>
                {!isEditingPersonal ? (
                  <button onClick={() => setIsEditingPersonal(true)} className="btn-primary" style={{ padding: '5px 14px', fontSize: '.82rem' }}>Modifier</button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={saveUserInfo} disabled={savingUser} className="btn-primary" style={{ padding: '5px 14px', fontSize: '.82rem' }}>{savingUser ? '...' : 'Sauvegarder'}</button>
                    <button onClick={() => { setFullName(initialFullName); setUsername(initialUsername); setIsEditingPersonal(false) }} className="btn-secondary" style={{ padding: '5px 14px', fontSize: '.82rem', border: '1px solid var(--b1)', background: 'transparent' }}>Annuler</button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Section 2 : Mes marques ── */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--t1)', margin: 0 }}>Mes marques</h3>
                  <div style={{ fontSize: '.72rem', color: 'var(--t3)', marginTop: '.2rem' }}>{organizations.length} marque{organizations.length !== 1 ? 's' : ''}</div>
                </div>
                <button
                  onClick={() => setShowAddBrandModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--b1)', background: 'transparent', color: 'var(--t2)', cursor: 'pointer', fontSize: '.78rem', fontWeight: 600, transition: '0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b1)'; (e.currentTarget as HTMLElement).style.color = 'var(--t2)' }}
                >
                  <Plus size={13} /> Ajouter une marque
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                {/* ── Carte marque active (détails complets) ── */}
                {activeOrganization && (
                  <div style={{ padding: '1.25rem', background: 'var(--card-bg)', border: '1px solid var(--b1)', borderRadius: '12px' }}>

                    {/* En-tête de la carte */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: colorPrimary ? colorPrimary + '22' : 'var(--s2)', border: `1px solid ${colorPrimary ? colorPrimary + '40' : 'var(--b1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          {logoUrl ? <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Logo" /> : <Building2 size={16} color={colorPrimary || 'var(--t3)'} />}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--t1)' }}>{brandName || activeOrganization.name}</span>
                            <span style={{ fontSize: '.62rem', fontWeight: 600, background: 'var(--accent)18', color: 'var(--accent)', padding: '1px 7px', borderRadius: '20px', border: '1px solid var(--accent)28', letterSpacing: '.02em' }}>Active</span>
                          </div>
                          {sector && <div style={{ fontSize: '.7rem', color: 'var(--t3)', marginTop: '.1rem' }}>{sector}</div>}
                        </div>
                      </div>
                      {!isEditingBrand && (
                        <button onClick={() => setIsEditingBrand(true)} style={{ padding: '4px 11px', fontSize: '.75rem', borderRadius: '7px', border: '1px solid var(--b1)', background: 'transparent', color: 'var(--t2)', cursor: 'pointer', fontWeight: 600 }}>Modifier</button>
                      )}
                    </div>

                    {/* Icônes réseaux sociaux — cliquer → popup connect/disconnect */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--b1)', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '.68rem', color: 'var(--t3)', fontWeight: 700, marginRight: '2px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Réseaux</span>
                      {(['facebook', 'instagram', 'tiktok', 'twitter', 'linkedin'] as Platform[]).map(platform => {
                        const acc = accounts.find(a => a.platform === platform)
                        const pColor = PLATFORM_COLORS[platform]
                        const isOpen = platformPopup === platform
                        return (
                          <div key={platform} style={{ position: 'relative' }}>
                            <button
                              onClick={() => setPlatformPopup(isOpen ? null : platform)}
                              title={acc ? `${PLATFORM_NAMES[platform]}: ${acc.platform_username || 'Connecté'} — cliquez pour gérer` : `Connecter ${PLATFORM_NAMES[platform]}`}
                              style={{
                                width: 32, height: 32, borderRadius: 8, cursor: 'pointer', transition: '0.15s',
                                border: acc ? `1.5px solid ${pColor}50` : '1.5px dashed var(--b1)',
                                background: acc ? pColor + '18' : 'var(--bg)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative', outline: isOpen ? `2px solid ${pColor}40` : 'none',
                                outlineOffset: '1px',
                              }}
                            >
                              <PlatformIcon platform={platform} size={15} />
                              {acc && <div style={{ position: 'absolute', top: -3, right: -3, width: 9, height: 9, borderRadius: '50%', background: '#22C55E', border: '2px solid var(--card-bg)' }} />}
                            </button>

                            {/* Popup connect/disconnect */}
                            {isOpen && (
                              <div style={{
                                position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
                                background: 'var(--card-bg)', border: '1px solid var(--b1)',
                                borderRadius: '10px', padding: '12px', zIndex: 300,
                                boxShadow: '0 12px 35px rgba(0,0,0,0.4)', minWidth: '168px',
                                animation: 'fadeIn 0.12s ease-out',
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                  <PlatformIcon platform={platform} size={13} />
                                  <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--t1)', flex: 1 }}>{PLATFORM_NAMES[platform]}</span>
                                  <button onClick={() => setPlatformPopup(null)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', padding: '1px', lineHeight: 1, display: 'flex' }}><X size={12} /></button>
                                </div>
                                {acc ? (
                                  <>
                                    <div style={{ fontSize: '.7rem', color: '#22C55E', marginBottom: '8px', padding: '3px 6px', background: 'rgba(34,197,94,0.08)', borderRadius: '6px', fontWeight: 600 }}>
                                      ✓ {acc.platform_username || 'Connecté'}
                                    </div>
                                    <button onClick={() => { disconnect(acc.id); setPlatformPopup(null) }} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(239,68,68,.25)', background: 'rgba(239,68,68,.06)', color: '#ef4444', cursor: 'pointer', fontSize: '.73rem', fontWeight: 600 }}>
                                      Déconnecter
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <div style={{ fontSize: '.7rem', color: 'var(--t3)', marginBottom: '8px' }}>Non connecté</div>
                                    <button onClick={() => { openPlatformOAuth(platform); setPlatformPopup(null) }} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: '.73rem', fontWeight: 600 }}>
                                      Connecter
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Contenu : mode édition ou affichage */}
                    {isEditingBrand ? (
                      <div>
                        <Row label="Nom de la marque">
                          <input className="input" style={{ maxWidth: '320px' }} value={brandName} onChange={e => setBrandName(e.target.value)} />
                        </Row>
                        <Row label="Secteur d'activité">
                          <select className="input" style={{ maxWidth: '320px', cursor: 'pointer' }} value={sector} onChange={e => setSector(e.target.value)}>
                            <option value="">Choisir un secteur...</option>
                            {['Mode & Beauté', 'Tech & SaaS', 'E-commerce', 'Santé & Bien-être', 'Finance & Crypto', 'Restauration & Food', 'Immobilier', 'Sport & Fitness', 'Éducation', 'Art & Créativité', 'Voyage & Tourisme', 'Autre'].map(ind => <option key={ind} value={ind}>{ind}</option>)}
                          </select>
                        </Row>
                        <Row label="Site web">
                          <input className="input" style={{ maxWidth: '320px' }} value={website} onChange={e => setWebsite(e.target.value)} />
                        </Row>
                        <Row label="Ton par défaut">
                          <select className="input" style={{ maxWidth: '200px' }} value={defaultTone} onChange={e => setDefaultTone(e.target.value)}>
                            <option value="professionnel">Professionnel</option>
                            <option value="moderne">Moderne</option>
                            <option value="decontracte">Décontracté</option>
                            <option value="inspirant">Inspirant</option>
                            <option value="premium">Premium</option>
                            <option value="humoristique">Humoristique</option>
                          </select>
                        </Row>
                        <Row label="Public cible">
                          <select className="input" style={{ maxWidth: '320px', cursor: 'pointer' }} value={targetAudience} onChange={e => setTargetAudience(e.target.value)}>
                          <option value="">Choisir la cible principale...</option>
                          {['Grand public', 'Entrepreneurs', 'Étudiants', 'Parents', 'Professionnels', 'Entreprises', 'Autre'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        </Row>
                        <Row label="Proposition de valeur" desc="Pourquoi les clients choisissent cette marque.">
                          <textarea className="input resize-none" rows={2} style={{ maxWidth: '100%' }} value={valueProposition} onChange={e => setValueProposition(e.target.value)} />
                        </Row>
                        <Row label="Logo de la marque">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--b1)', flexShrink: 0 }}>
                              {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Upload size={16} style={{ color: 'var(--t3)' }} />}
                            </div>
                            <div>
                              <input type="file" accept="image/*" id="logo-settings" style={{ display: 'none' }} onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setLogoUrl(URL.createObjectURL(file))
                                  const reader = new FileReader()
                                  reader.onload = (el) => {
                                    const img = new Image()
                                    img.onload = () => {
                                      const canvas = document.createElement('canvas')
                                      const ctx = canvas.getContext('2d')
                                      if (!ctx) return
                                      canvas.width = 50; canvas.height = 50
                                      ctx.drawImage(img, 0, 0, 50, 50)
                                      const imgData = ctx.getImageData(0, 0, 50, 50).data
                                      const colorCounts: Record<string, number> = {}
                                      for (let i = 0; i < imgData.length; i += 4) {
                                        const r = imgData[i], g = imgData[i+1], b = imgData[i+2], a = imgData[i+3]
                                        if (a < 150) continue
                                        const qr = Math.round(r / 16) * 16, qg = Math.round(g / 16) * 16, qb = Math.round(b / 16) * 16
                                        const qhex = '#' + [qr, qg, qb].map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join('')
                                        colorCounts[qhex] = (colorCounts[qhex] || 0) + 1
                                      }
                                      const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])
                                      if (sorted.length >= 2) { setColorPrimary(sorted[0][0]); setColorSecondary(sorted[1][0]) }
                                      else if (sorted.length >= 1) { setColorPrimary(sorted[0][0]); setColorSecondary(sorted[0][0]) }
                                    }
                                    img.src = el.target?.result as string
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }} />
                              <label htmlFor="logo-settings" style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', padding: '.3rem .6rem', background: 'var(--accent-light)', borderRadius: '6px', border: '1px solid var(--accent)', display: 'inline-block' }}>Changer le logo</label>
                            </div>
                          </div>
                        </Row>
                        <Row label="Couleurs de marque">
                          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                              <input type="color" value={colorPrimary} onChange={e => setColorPrimary(e.target.value)} style={{ border: 'none', padding: 0, width: 26, height: 26, cursor: 'pointer', background: 'transparent' }} />
                              <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t1)' }}>{colorPrimary} (Primaire)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                              <input type="color" value={colorSecondary} onChange={e => setColorSecondary(e.target.value)} style={{ border: 'none', padding: 0, width: 26, height: 26, cursor: 'pointer', background: 'transparent' }} />
                              <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--t1)' }}>{colorSecondary} (Secondaire)</span>
                            </div>
                          </div>
                        </Row>
                        <Row label="Types de contenus" desc="Astuces, Témoignages, Coulisses, etc.">
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                            {['Conseils', 'Tutoriels', 'Coulisses', 'Promotions', 'Témoignages', 'Storytelling', 'Actualités', 'Divertissement', 'Éducation'].map(opt => {
                              const selected = contentPillars.includes(opt)
                              return (
                                <button key={opt} type="button" onClick={() => setContentPillars(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt])} style={{ padding: '.3rem .7rem', borderRadius: '20px', fontSize: '.75rem', fontWeight: 500, cursor: 'pointer', border: selected ? '1px solid var(--accent)' : '1px solid var(--b1)', background: selected ? 'var(--accent-light)' : 'transparent', color: selected ? 'var(--accent)' : 'var(--t3)', transition: '0.15s', outline: 'none' }}>{opt}</button>
                              )
                            })}
                          </div>
                        </Row>
                        <Row label="Objectifs">
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                            {[{ value: 'notoriete', label: 'Notoriété' }, { value: 'engagement', label: 'Engagement' }, { value: 'ventes', label: 'Ventes' }, { value: 'leads', label: 'Prospects' }, { value: 'fidelisation', label: 'Fidélisation' }, { value: 'communaute', label: 'Communauté' }].map(obj => {
                              const selected = objectives.includes(obj.value)
                              return (
                                <button key={obj.value} type="button" onClick={() => setObjectives(prev => prev.includes(obj.value) ? prev.filter(x => x !== obj.value) : [...prev, obj.value])} style={{ padding: '.3rem .7rem', borderRadius: '20px', fontSize: '.75rem', fontWeight: 500, cursor: 'pointer', border: selected ? '1px solid var(--accent)' : '1px solid var(--b1)', background: selected ? 'var(--accent-light)' : 'transparent', color: selected ? 'var(--accent)' : 'var(--t3)', transition: '0.15s', outline: 'none' }}>{obj.label}</button>
                              )
                            })}
                          </div>
                        </Row>
                        <Row label="Mots à éviter">
                          <input className="input" style={{ maxWidth: '100%' }} value={avoidWords} onChange={e => setAvoidWords(e.target.value)} />
                        </Row>
                        <Row label="Posts / semaine">
                          <input className="input" style={{ maxWidth: '100px' }} type="number" min={1} max={21} value={postsPerWeek} onChange={e => setPostsPerWeek(Number(e.target.value))} />
                        </Row>
                        <Row label="Description">
                          <textarea className="input resize-none" rows={3} style={{ maxWidth: '100%' }} value={brandDesc} onChange={e => setBrandDesc(e.target.value)} />
                        </Row>
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--b1)', display: 'flex', gap: '8px' }}>
                          <button onClick={saveBrand} disabled={savingBrand} className="btn-primary" style={{ padding: '5px 14px', fontSize: '.82rem' }}>{savingBrand ? '...' : 'Sauvegarder'}</button>
                          <button onClick={cancelBrandEdit} className="btn-secondary" style={{ padding: '5px 14px', fontSize: '.82rem', border: '1px solid var(--b1)', background: 'transparent' }}>Annuler</button>
                        </div>
                      </div>
                    ) : (
                      brandName ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
                          {[
                            { label: 'Site web', value: website || '—' },
                            { label: 'Ton', value: defaultTone.charAt(0).toUpperCase() + defaultTone.slice(1) },
                            { label: 'Public cible', value: targetAudience || '—' },
                            { label: 'Posts / semaine', value: String(postsPerWeek) },
                          ].map(({ label, value }) => (
                            <div key={label} style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--b1)' }}>
                              <div style={{ fontSize: '.65rem', color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.2rem' }}>{label}</div>
                              <div style={{ fontSize: '.8rem', color: 'var(--t1)', fontWeight: 500 }}>{value}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '1.25rem', color: 'var(--t3)', fontSize: '.82rem' }}>
                          Aucun profil de marque configuré.{' '}
                          <button onClick={() => setIsEditingBrand(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: '.82rem' }}>Configurer maintenant →</button>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* ── Autres marques (cartes compactes) ── */}
                {organizations.filter(o => o.id !== activeOrganization?.id).map(org => (
                  <div key={org.id} style={{ padding: '1rem 1.25rem', background: 'var(--card-bg)', border: '1px solid var(--b1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--b1)', flexShrink: 0 }}>
                        <Building2 size={15} color="var(--t3)" />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.name}</div>
                    </div>
                    <button
                      onClick={() => switchOrganization(org.id)}
                      style={{ padding: '4px 12px', borderRadius: '7px', border: '1px solid var(--b1)', background: 'transparent', color: 'var(--t3)', cursor: 'pointer', fontSize: '.75rem', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      Basculer
                    </button>
                  </div>
                ))}

              </div>
            </div>
          </div>
        )}

        {/* ── 2. ABONNEMENTS ── */}
        {active === 'billing' && (
          <div className="anim-fade-up">
            <SectionHeader title="Abonnements" desc="Gérez votre forfait et vos informations de paiement." />
            <div style={{ padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--b1)', borderRadius: '16px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--t1)' }}>Plan actuel</div>
                <span style={{ padding: '.4rem 1rem', borderRadius: '999px', fontSize: '.8rem', fontWeight: 700, background: 'var(--accent-light)', color: 'var(--accent)' }}>
                  {userPlan.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: '.9rem', color: 'var(--t3)', margin: 0, lineHeight: 1.6 }}>
                {userPlan === 'free' ? 'Plan Gratuit : Fonctionnalités de base incluses.' : 'Plan Pro/Business : Accès complet.'}
              </p>
            </div>
            {userPlan === 'free' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <PlanCard name="Premium" price="29€/mois" features={['IA illimitée', '5 plateformes', 'Support 24/7']} color="var(--accent)" onUpgrade={() => handleUpgrade('premium')} />
                <PlanCard name="Business" price="79€/mois" features={['Equipe (3 pers.)', 'Analytiques Pro', 'API Access']} color="#FBBF24" onUpgrade={() => handleUpgrade('business')} />
              </div>
            )}
          </div>
        )}

        {/* ── 3. COMPTE & SÉCURITÉ ── */}
        {active === 'security' && (
          <div className="anim-fade-up">
            <SectionHeader title="Compte & Sécurité" desc="Apparence, alertes et sécurité de votre compte." />
            
            {/* Apparence */}
            <div style={{ padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--b1)', borderRadius: '16px', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--t1)' }}>Apparence</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {(['dark', 'light'] as const).map(t => (
                  <button key={t} onClick={() => { setTheme(t); localStorage.setItem('theme', t); document.documentElement.setAttribute('data-theme', t) }} style={{ 
                    flex: 1, padding: '1.25rem', borderRadius: '12px', border: `2px solid ${theme === t ? 'var(--accent)' : 'var(--b1)'}`, 
                    background: theme === t ? 'var(--accent-light)' : 'transparent', cursor: 'pointer', transition: '0.2s',
                  }}>
                    <div style={{ fontWeight: 700, color: theme === t ? 'var(--accent)' : 'var(--t2)', fontSize: '.9rem' }}>{t === 'dark' ? 'Mode Sombre' : 'Mode Clair'}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Langue & Notifications */}
            <div style={{ padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--b1)', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--t1)' }}>Langue et alertes</h3>
              <SettingRow label="Langue de l'interface" desc="Choisissez votre langue.">
                <select className="input" value={lang} onChange={e => setLang(e.target.value as any)} style={{ maxWidth: '160px' }}>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </SettingRow>
              <SettingRow label="Alertes Email" desc="Recevez des notifications par email.">
                <Toggle value={emailNotifs} onChange={setEmailNotifs} />
              </SettingRow>
            </div>

            {/* Sécurité */}
            {authProvider !== 'google' && (
              <div style={{ padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--b1)', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--t1)' }}>Changer de mot de passe</h3>
                {pwdStep === 'idle' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input className="input" style={{ maxWidth: '320px' }} type="password" placeholder="Mot de passe actuel" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                    <div><button onClick={verifyCurrentPassword} disabled={savingPwd} className="btn-primary" style={{ padding: '8px 24px' }}>{savingPwd ? '...' : 'Vérifier'}</button></div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ color: '#22C55E', fontSize: '.85rem', fontWeight: 600 }}>✓ Identité vérifiée</div>
                    <input className="input" style={{ maxWidth: '320px' }} type="password" placeholder="Nouveau mot de passe" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <input className="input" style={{ maxWidth: '320px' }} type="password" placeholder="Confirmer" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem' }}>
                      <button onClick={changePassword} disabled={savingPwd || !newPassword || newPassword !== confirmPassword} className="btn-primary" style={{ padding: '8px 24px' }}>Enregistrer</button>
                      <button onClick={() => setPwdStep('idle')} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer' }}>Annuler</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── 4. ZONE DANGEREUSE ── */}
        {active === 'danger' && (
          <div className="anim-fade-up">
            <SectionHeader title="Zone dangereuse" desc="Suppression définitive de votre compte." />
            <div style={{ border: '1px solid rgba(239,68,68,0.2)', padding: '2rem', borderRadius: '16px', background: 'rgba(239,68,68,0.02)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.75rem' }}>Supprimer le compte</h3>
              <p style={{ fontSize: '.85rem', color: 'var(--t3)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Cette action est irréversible. Toutes vos données, posts générés, et abonnements seront définitivement effacés.</p>
              
              {authProvider === 'google' ? (
                <button 
                  onClick={async () => {
                    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/settings?tab=danger&action=delete` } })
                    if (error) toast('Erreur Google', 'error')
                  }} 
                  className="btn-danger" 
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '0.75rem 2rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Confirmer avec Google
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                  <input className="input" placeholder="Tapez 'supprimer' pour confirmer" value={confirmDelete} onChange={e => setConfirmDelete(e.target.value)} style={{ borderColor: confirmDelete === 'supprimer' ? '#ef4444' : 'var(--b1)', maxWidth: '300px' }} />
                  <button onClick={handleDeleteAccount} disabled={confirmDelete !== 'supprimer' || deleting} className="btn-danger" style={{ background: confirmDelete === 'supprimer' ? '#ef4444' : 'rgba(239,68,68,0.2)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 2rem', fontWeight: 600 }}>
                    {deleting ? '...' : 'Supprimer'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ── Overlay pour fermer les popups réseaux ── */}
      {platformPopup && (
        <div
          onClick={() => setPlatformPopup(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 250 }}
        />
      )}

      {/* ── Modale : Ajouter une marque ── */}
      {showAddBrandModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(4px)', animation: 'fadeIn 0.18s ease-out' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--accent)" />
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)' }}>Nouvelle marque</span>
              </div>
              <button onClick={() => { setShowAddBrandModal(false); setAddBrandName('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex' }}><X size={16} /></button>
            </div>
            <p style={{ fontSize: '.8rem', color: 'var(--t3)', lineHeight: 1.5, margin: 0 }}>Chaque marque dispose de ses propres comptes, publications et statistiques. Complétez le profil depuis cet onglet après création.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--t2)' }}>Nom de la marque</label>
              <input
                type="text"
                placeholder="Ex : Acme Corp, MyBrand..."
                value={addBrandName}
                onChange={e => setAddBrandName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && addBrandName.trim()) handleAddBrand() }}
                autoFocus
                disabled={addingBrand}
                style={{ width: '100%', height: '38px', background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: '8px', padding: '0 12px', color: 'var(--t1)', fontSize: '.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => { setShowAddBrandModal(false); setAddBrandName('') }} disabled={addingBrand} style={{ padding: '7px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--b1)', color: 'var(--t2)', cursor: 'pointer', fontSize: '.82rem', fontWeight: 600 }}>Annuler</button>
              <button onClick={handleAddBrand} disabled={addingBrand || !addBrandName.trim()} className="btn-primary" style={{ padding: '7px 16px', fontSize: '.82rem' }}>
                {addingBrand ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// ── Composants locaux ──

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em', color: 'var(--t1)' }}>{title}</h1>
      <p style={{ color: 'var(--t3)', fontSize: '0.9rem' }}>{desc}</p>
    </div>
  )
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) 2fr', gap: '1rem', alignItems: 'start', padding: '1rem 0', borderBottom: '1px solid var(--b1)' }}>
      <div>
        <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--t1)' }}>{label}</div>
        {desc && <div style={{ fontSize: '.75rem', color: 'var(--t3)', marginTop: '.25rem', lineHeight: 1.4 }}>{desc}</div>}
      </div>
      <div style={{ width: '100%' }}>{children}</div>
    </div>
  )
}

function SettingRow({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '.25rem', color: 'var(--t1)' }}>{label}</div>
        <div style={{ fontSize: '.8rem', color: 'var(--t3)' }}>{desc}</div>
      </div>
      <div>{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', background: value ? 'var(--accent)' : 'var(--b1)', cursor: 'pointer', position: 'relative', transition: '0.2s' }}>
      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: value ? '23px' : '3px', transition: '0.2s' }} />
    </button>
  )
}

function PlanCard({ name, price, features, color, onUpgrade }: { name: string; price: string; features: string[]; color: string; onUpgrade: () => void }) {
  return (
    <div style={{ padding: '1.5rem', borderRadius: '16px', border: `1px solid ${color}30`, background: 'var(--card-bg)' }}>
      <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '.25rem', color: 'var(--t1)' }}>{name}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 800, color, marginBottom: '1rem' }}>{price}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        {features.map(f => <li key={f} style={{ fontSize: '.8rem', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>• {f}</li>)}
      </ul>
      <button onClick={onUpgrade} className="btn-primary" style={{ width: '100%', background: color, border: 'none' }}>S'abonner</button>
    </div>
  )
}

function AccountListItem({ platform, acc, onConnect, onDisconnect, onRename, isLast, locked }: {
  platform: Platform
  acc: SocialAccount | undefined
  onConnect: () => void
  onDisconnect: (id: string) => void
  onRename: (id: string, name: string) => void
  isLast?: boolean
  locked?: boolean
}) {
  const color = PLATFORM_COLORS[platform]
  const displayName = acc?.platform_username && acc.platform_username !== platform ? acc.platform_username : null
  const accountType = platform === 'facebook' ? 'Page' : 'Compte'
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(displayName || '')

  function startEdit() { setEditVal(displayName || ''); setEditing(true) }
  function cancelEdit() { setEditing(false) }
  async function saveEdit() { if (acc && editVal.trim()) { await onRename(acc.id, editVal.trim()); setEditing(false) } }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: isLast ? 'none' : '1px solid var(--b1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {acc ? <AvatarWithFallback avatarUrl={(acc as any).platform_avatar_url} label={displayName || platform} color={color} /> : <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px dashed var(--b1)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: .5 }}><PlatformIcon platform={platform} size={22} /></div>}
          {acc && <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlatformIcon platform={platform} size={20} /></div>}
        </div>
        {acc ? (
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }} style={{ fontSize: '.85rem', fontWeight: 600, background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: '6px', color: 'var(--t1)', padding: '.2rem .5rem', outline: 'none', width: '160px' }} />
                <button onClick={saveEdit} style={{ fontSize: '.72rem', color: '#22C55E', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '2px 4px' }}>OK</button>
                <button onClick={cancelEdit} style={{ fontSize: '.72rem', color: 'var(--t3)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}>✕</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                <span style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName || PLATFORM_NAMES[platform]}</span>
                <button onClick={startEdit} title="Modifier" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: '2px' }}>✏️</button>
              </div>
            )}
            <div style={{ fontSize: '.75rem', color: 'var(--t3)' }}>{accountType}</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '.88rem', fontWeight: 500, color: 'var(--t3)' }}>Connecter {PLATFORM_NAMES[platform]}</div>
            <div style={{ fontSize: '.75rem', color: 'var(--t3)', opacity: .6 }}>Non connecté</div>
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0, marginLeft: '1rem' }}>
        {acc ? (
          <button onClick={() => onDisconnect(acc.id)} style={{ padding: '.4rem .85rem', borderRadius: '7px', border: '1px solid rgba(239,68,68,.22)', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '.78rem', fontWeight: 500 }}>Déconnecter</button>
        ) : (
          <button onClick={onConnect} style={{ padding: '.4rem .85rem', borderRadius: '7px', border: '1px solid var(--b1)', background: 'transparent', color: 'var(--t1)', cursor: 'pointer', fontSize: '.78rem', fontWeight: 500 }}>Connecter</button>
        )}
      </div>
    </div>
  )
}

function AvatarWithFallback({ avatarUrl, label, color }: { avatarUrl?: string | null; label: string; color: string }) {
  const [imgFailed, setImgFailed] = useState(false)
  if (avatarUrl && !imgFailed) return <img src={avatarUrl} alt={label} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}40`, display: 'block' }} onError={() => setImgFailed(true)} />
  return <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color }}>{label.slice(0, 1).toUpperCase()}</div>
}

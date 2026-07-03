'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { PLATFORM_NAMES, PLATFORM_COLORS } from '@/types'
import type { Platform, SocialAccount } from '@/types'
import { User, Link2, Unlink, Save, Camera, CreditCard, Trash2, Shield, RefreshCw, LogOut, Sparkles } from 'lucide-react'
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
  const [audienceAge, setAudienceAge] = useState('')
  const [audienceLocation, setAudienceLocation] = useState('')
  const [contentPillars, setContentPillars] = useState<string[]>([])
  const [avoidWords, setAvoidWords] = useState('')
  const [objectives, setObjectives] = useState<string[]>([])
  const [savingBrand, setSavingBrand] = useState(false)

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
        setAudienceAge(brand.audience_age || '')
        setAudienceLocation(brand.audience_location || '')
        setContentPillars(brand.content_pillars || [])
        setAvoidWords(brand.avoid_words || '')
        setObjectives(brand.objectives || [])

        setInitialBrand({
          brandName: brand.brand_name || '',
          brandDesc: brand.description || '',
          sector: brand.industry || '',
          defaultTone: brand.tone || 'professionnel',
          postsPerWeek: brand.posts_per_week || 5,
          website: brand.website || '',
          targetAudience: brand.target_audience || '',
          audienceAge: brand.audience_age || '',
          audienceLocation: brand.audience_location || '',
          contentPillars: brand.content_pillars || [],
          avoidWords: brand.avoid_words || '',
          objectives: brand.objectives || [],
        })
      } else {
        setInitialBrand({
          brandName: '', brandDesc: '', sector: '', defaultTone: 'professionnel',
          postsPerWeek: 5, website: '', targetAudience: '', audienceAge: '',
          audienceLocation: '', contentPillars: [], avoidWords: '', objectives: [],
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
    const res = await fetch('/api/brand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand_name: brandName, description: brandDesc, sector,
        default_tone: defaultTone, posts_per_week: postsPerWeek,
        website, target_audience: targetAudience, audience_age: audienceAge,
        audience_location: audienceLocation, content_pillars: contentPillars,
        avoid_words: avoidWords, objectives,
      }),
    })
    setSavingBrand(false)
    if (res.ok) {
      setInitialBrand({ brandName, brandDesc, sector, defaultTone, postsPerWeek, website, targetAudience, audienceAge, audienceLocation, contentPillars, avoidWords, objectives })
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
      setAudienceAge(initialBrand.audienceAge)
      setAudienceLocation(initialBrand.audienceLocation)
      setContentPillars(initialBrand.contentPillars)
      setAvoidWords(initialBrand.avoidWords)
      setObjectives(initialBrand.objectives)
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
    <div style={{ display: 'flex', flexDirection: isMobileSettings ? 'column' : 'row', minHeight: '100%', margin: isMobileSettings ? '0' : '-20px' }}>
      
      {/* ── Sidebar / Mobile Tabs ── */}
      {isMobileSettings ? (
        <div style={{ borderBottom: '1px solid var(--b1)', padding: '12px 0 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '2px', overflowX: 'auto', padding: '0 12px', WebkitOverflowScrolling: 'touch' }}>
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const isActive = active === item.id
              return (
                <button key={item.id} onClick={() => setActive(item.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', background: 'none', border: 'none',
                  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  color: isActive ? 'var(--t1)' : 'var(--t3)',
                  cursor: 'pointer', fontSize: '.78rem', fontWeight: isActive ? 600 : 400,
                  transition: '.15s', whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  <Icon size={14} style={{ color: isActive ? 'var(--accent)' : 'var(--t3)' }} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <aside style={{
          width: '240px', flexShrink: 0,
          borderRight: '1px solid var(--b1)',
          padding: '1.5rem 0',
          position: 'sticky', top: 0, alignSelf: 'flex-start', maxHeight: '100vh', overflowY: 'auto',
        }}>
          {/* Section rapide utilisateur */}
          <div style={{ padding: '0 1.25rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--t1)', marginBottom: '1.5rem' }}>Paramètres</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  : <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', fontWeight: 700, color: 'var(--accent)' }}>{initials}</div>
                }
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--t1)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{fullName || 'Mon compte'}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--t3)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{email}</div>
              </div>
            </div>
          </div>

          {/* Navigation interne */}
          <nav>
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const isActive = active === item.id
              return (
                <button key={item.id} onClick={() => { setActive(item.id); router.replace(`/settings?tab=${item.id}`); }} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '.6rem',
                  padding: '.55rem 1.25rem', background: isActive ? 'var(--accent-light)' : 'none', border: 'none',
                  borderRight: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  color: isActive ? 'var(--accent)' : 'var(--t2)',
                  cursor: 'pointer', fontSize: '.85rem', fontWeight: isActive ? 600 : 500,
                  transition: '.15s', textAlign: 'left',
                }}>
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>
      )}

      {/* ── Main Content ── */}
      <main style={{ flex: 1, padding: isMobileSettings ? '1.5rem' : '2.5rem', maxWidth: '800px' }}>
        
        {/* ── 1. IDENTITÉ & MARQUE ── */}
        {active === 'identity' && (
          <div className="anim-fade-up">
            <SectionHeader title="Identité & Marque" desc="Gérez vos informations personnelles et le profil de votre marque." />

            {/* Informations personnelles */}
            <div style={{ padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--b1)', borderRadius: '16px', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--t1)' }}>Informations personnelles</h3>
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--b1)' }} />
                    : <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)', border: '2px solid var(--b1)' }}>{initials}</div>
                  }
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.55)', opacity: 0, transition: '.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                    <Camera size={16} color="#fff" />
                  </div>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f) }} />
                </label>
                <div>
                  <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--t1)' }}>Photo de profil</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--t3)' }}>Cliquez sur l'image pour la modifier (JPG, PNG).</div>
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
              
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--b1)' }}>
                {!isEditingPersonal ? (
                  <button onClick={() => setIsEditingPersonal(true)} className="btn-primary" style={{ padding: '6px 14px', fontSize: '.85rem' }}>Modifier</button>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={saveUserInfo} disabled={savingUser} className="btn-primary" style={{ padding: '6px 14px', fontSize: '.85rem' }}>{savingUser ? '...' : 'Sauvegarder'}</button>
                    <button onClick={() => { setFullName(initialFullName); setUsername(initialUsername); setIsEditingPersonal(false) }} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '.85rem', border: '1px solid var(--b1)', background: 'transparent' }}>Annuler</button>
                  </div>
                )}
              </div>
            </div>

            {/* Réseaux Sociaux */}
            <div style={{ padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--b1)', borderRadius: '16px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--t1)' }}>Réseaux sociaux</h3>
                <button onClick={loadAccounts} title="Rafraîchir" style={{ background: 'none', border: '1px solid var(--b1)', cursor: 'pointer', color: 'var(--t3)', padding: '6px', borderRadius: '7px' }}><RefreshCw size={14} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {([
                  { platform: 'facebook'  as Platform, proOnly: false, onConnect: () => window.open('/api/auth/meta/start', 'meta_oauth', `width=600,height=700,left=${window.screen.width/2-300},top=${window.screen.height/2-350}`) },
                  { platform: 'instagram' as Platform, proOnly: false, onConnect: () => window.open('/api/auth/instagram/start', 'instagram_oauth', `width=600,height=700,left=${window.screen.width/2-300},top=${window.screen.height/2-350}`) },
                  { platform: 'tiktok'    as Platform, proOnly: true,  onConnect: () => openOAuthPopup('tiktok') },
                  { platform: 'twitter'   as Platform, proOnly: true,  onConnect: () => openOAuthPopup('twitter') },
                  { platform: 'linkedin'  as Platform, proOnly: true,  onConnect: () => openOAuthPopup('linkedin') },
                ] as { platform: Platform; proOnly: boolean; onConnect: () => void }[]).map(({ platform, onConnect }, i, arr) => (
                  <AccountListItem key={platform} platform={platform} acc={accounts.find(a => a.platform === platform)} onConnect={onConnect} onDisconnect={disconnect} onRename={renameAccount} isLast={i === arr.length - 1} locked={false} />
                ))}
              </div>
            </div>

            {/* Profil de marque */}
            <div style={{ padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--b1)', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--t1)' }}>Profil de marque</h3>
              <Row label="Nom de la marque">
                <input className="input" style={{ maxWidth: '320px' }} value={brandName} onChange={e => setBrandName(e.target.value)} disabled={!isEditingBrand} />
              </Row>
              <Row label="Secteur d'activité">
                <input className="input" style={{ maxWidth: '320px' }} value={sector} onChange={e => setSector(e.target.value)} disabled={!isEditingBrand} />
              </Row>
              <Row label="Site web">
                <input className="input" style={{ maxWidth: '320px' }} value={website} onChange={e => setWebsite(e.target.value)} disabled={!isEditingBrand} />
              </Row>
              <Row label="Ton par défaut">
                <select className="input" style={{ maxWidth: '200px' }} value={defaultTone} onChange={e => setDefaultTone(e.target.value)} disabled={!isEditingBrand}>
                  <option value="direct">Direct</option><option value="inspirant">Inspirant</option><option value="emotionnel">Émotionnel</option><option value="humoristique">Humoristique</option><option value="professionnel">Professionnel</option>
                </select>
              </Row>
              <Row label="Audience cible">
                <input className="input" style={{ maxWidth: '320px' }} value={targetAudience} onChange={e => setTargetAudience(e.target.value)} disabled={!isEditingBrand} />
              </Row>
              <Row label="Tranche d'âge">
                <select className="input" style={{ maxWidth: '200px' }} value={audienceAge} onChange={e => setAudienceAge(e.target.value)} disabled={!isEditingBrand}>
                  <option value="">Non précisé</option>{['13-17','18-24','25-34','35-44','45-54','55+','Tous âges'].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </Row>
              <Row label="Portée géographique">
                <select className="input" style={{ maxWidth: '200px' }} value={audienceLocation} onChange={e => setAudienceLocation(e.target.value)} disabled={!isEditingBrand}>
                  <option value="">Non précisé</option><option value="locale">Locale</option><option value="nationale">Nationale</option><option value="internationale">Internationale</option>
                </select>
              </Row>
              <Row label="Piliers de contenu" desc="Séparés par des virgules.">
                <input className="input" style={{ maxWidth: '100%' }} value={contentPillars.join(', ')} onChange={e => setContentPillars(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} disabled={!isEditingBrand} />
              </Row>
              <Row label="Objectifs" desc="Séparés par des virgules.">
                <input className="input" style={{ maxWidth: '100%' }} value={objectives.join(', ')} onChange={e => setObjectives(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} disabled={!isEditingBrand} />
              </Row>
              <Row label="Mots à éviter">
                <input className="input" style={{ maxWidth: '100%' }} value={avoidWords} onChange={e => setAvoidWords(e.target.value)} disabled={!isEditingBrand} />
              </Row>
              <Row label="Posts / semaine">
                <input className="input" style={{ maxWidth: '100px' }} type="number" min={1} max={21} value={postsPerWeek} onChange={e => setPostsPerWeek(Number(e.target.value))} disabled={!isEditingBrand} />
              </Row>
              <Row label="Description">
                <textarea className="input resize-none" rows={4} style={{ maxWidth: '100%' }} value={brandDesc} onChange={e => setBrandDesc(e.target.value)} disabled={!isEditingBrand} />
              </Row>
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--b1)' }}>
                {!isEditingBrand ? (
                  <button onClick={() => setIsEditingBrand(true)} className="btn-primary" style={{ padding: '6px 14px', fontSize: '.85rem' }}>Modifier</button>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={saveBrand} disabled={savingBrand} className="btn-primary" style={{ padding: '6px 14px', fontSize: '.85rem' }}>{savingBrand ? '...' : 'Sauvegarder'}</button>
                    <button onClick={cancelBrandEdit} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '.85rem', border: '1px solid var(--b1)', background: 'transparent' }}>Annuler</button>
                  </div>
                )}
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

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useOrg } from '@/components/context/OrgContext'
import { useToast } from '@/components/ui/Toast'
import { 
  Home, Layout, Users, MessageCircle, Search, Bell,
  User, CreditCard, BellRing, Settings, ShieldCheck, LogOut, Moon, Sun,
  Sparkles, BarChart2, Zap, ChevronDown, Building2, Plus, X
} from 'lucide-react'

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])
  return isMobile
}

export function DashboardShell({ user: initialUser, children }: { 
  user: any
  children: React.ReactNode 
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  // Contexte organisationnel
  const { activeOrganization, organizations, switchOrganization } = useOrg()
  const { toast } = useToast()
  
  const [user, setUser] = useState<any>(initialUser)
  const [profileOpen, setProfileOpen] = useState(false)
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [isCreatingOrg, setIsCreatingOrg] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [showBrandModal, setShowBrandModal] = useState(false)
  
  const profileRef = useRef<HTMLDivElement>(null)
  const orgRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const msg = sessionStorage.getItem('toast_message')
      const type = sessionStorage.getItem('toast_type') as any
      if (msg) {
        toast(msg, type || 'info')
        sessionStorage.removeItem('toast_message')
        sessionStorage.removeItem('toast_type')
      }
    }
  }, [toast])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (!initialUser) {
      supabase.auth.getUser().then(({ data: { user: authUser } }) => {
        if (authUser) {
          supabase.from('users').select('*').eq('id', authUser.id).single().then(({ data }) => {
            if (data) setUser(data)
          })
        }
      })
    } else {
      setUser(initialUser)
    }
  }, [initialUser, supabase])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) {
        setOrgDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return
    setIsCreatingOrg(true)
    try {
      const { data: orgId, error } = await supabase.rpc('create_organization', { org_name: newOrgName })
      if (error) {
        toast('Erreur lors de la création de la marque : ' + error.message, 'error')
        return
      }

      // Initialiser un profil de marque minimal pour éviter la redirection vers l'onboarding
      const initRes = await fetch('/api/brand/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId, brand_name: newOrgName }),
      })
      if (!initRes.ok) {
        const initErr = await initRes.json().catch(() => ({}))
        throw new Error(initErr.error || 'Erreur lors de l\'initialisation de la marque')
      }

      setShowCreateOrgModal(false)
      setNewOrgName('')

      // Toast affiché après rechargement complet
      sessionStorage.setItem('toast_message', `Marque "${newOrgName}" créée ! Configurez-la dans les Paramètres.`)
      sessionStorage.setItem('toast_type', 'success')

      // Basculer automatiquement vers la nouvelle marque (recharge la page)
      await switchOrganization(orgId)
    } catch (err: any) {
      console.error(err)
      toast(err.message || 'Une erreur est survenue lors de la création de la marque.', 'error')
    } finally {
      setIsCreatingOrg(false)
    }
  }

  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0)

  const loadUnreadCount = useCallback(async () => {
    if (!user?.id) return
    const { data: myParts } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', user.id)
    if (!myParts?.length) { setUnreadCount(0); return }
    const ids = myParts.map(p => p.conversation_id)
    const { data, error } = await supabase
      .from('messages')
      .select('id, message_reads!left(user_id)')
      .in('conversation_id', ids)
      .neq('sender_id', user.id)
    if (data && !error) {
      const unread = data.filter(m => {
        const reads = (m as any).message_reads || []
        return !reads.some((r: any) => r.user_id === user.id)
      })
      setUnreadCount(unread.length)
    }
  }, [user?.id, supabase])

  const loadUnreadNotifsCount = useCallback(async () => {
    if (!user?.id) return
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    if (!error) {
      setUnreadNotifsCount(count || 0)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    if (!user?.id) return
    loadUnreadCount()
    loadUnreadNotifsCount()

    const msgChannel = supabase.channel('sidebar-messages-unread')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => loadUnreadCount())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_reads' }, () => loadUnreadCount())
      .subscribe()

    const notifChannel = supabase.channel('sidebar-notifications-unread')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => loadUnreadNotifsCount())
      .subscribe()

    return () => {
      supabase.removeChannel(msgChannel)
      supabase.removeChannel(notifChannel)
    }
  }, [user?.id, loadUnreadCount, loadUnreadNotifsCount, supabase])

  if (pathname === '/onboarding') return <>{children}</>

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = (user?.full_name || user?.email || 'U').slice(0, 2).toUpperCase()

  const navItems = [
    { label: 'Accueil',       icon: Home,          href: '/home'          },
    { label: 'Workspace',     icon: Layout,        href: '/workspace'     },
    { label: 'Messagerie',    icon: MessageCircle, href: '/messages'      },
    { label: 'Notifications', icon: Bell,          href: '/notifications' },
    { label: 'Groupes',       icon: Users,         href: '/groups'        },
  ]

  const shortcuts = [
    { label: 'Générer un post', icon: Sparkles,   href: '/workspace/posts/create' },
    { label: 'Analytics',       icon: BarChart2,  href: '/workspace/analytics'    },
    { label: 'Abonnements',     icon: CreditCard, href: '/settings?tab=billing'   },
    { label: 'Paramètres',      icon: Settings,   href: '/settings'   },
    { label: 'Mon profil',      icon: User,       href: `/profile/${user?.username || ''}` },
  ]

  const bottomNavItems = navItems

  // ── TOPBAR HEIGHT ──
  const TOPBAR_H = isMobile ? 56 : 64
  // ── SIDEBAR WIDTH ──
  const SIDEBAR_W = 240

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', color: 'var(--text)', overflow: 'hidden' }}>

      {/* ══════════════════════════
          TOPBAR FIXE
      ══════════════════════════ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: `${TOPBAR_H}px`,
        background: 'var(--nav-bg)',
        borderBottom: '1px solid var(--b1)',
        display: 'flex', alignItems: 'center',
        padding: isMobile ? '0 12px' : '0 20px',
        gap: isMobile ? '8px' : '16px',
        zIndex: 100,
        flexShrink: 0,
      }}>

        {/* LEFT: Logo & Brand Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <Image src="/logo.png" alt="CM Studio Logo" width={44} height={44} style={{ objectFit: 'contain' }} />
            {!isMobile && (
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: '-0.02em' }}>
                CM Studio
              </span>
            )}
          </Link>
        </div>

        {/* CENTER: Search (desktop only) */}
        {!isMobile && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input
                type="text"
                placeholder="Rechercher sur CM Studio..."
                style={{
                  width: '100%', height: '38px',
                  background: 'var(--s2)', border: '1px solid var(--b1)',
                  borderRadius: '20px', padding: '0 12px 0 36px',
                  color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
                }}
              />
            </div>
          </div>
        )}

        {isMobile && <span style={{ flex: 1, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: '-0.02em' }}>CM Studio</span>}

        {/* RIGHT: Theme toggle + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--s2)', border: '1px solid var(--b1)',
              color: 'var(--text2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>


          {/* Avatar + dropdown (always visible) */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'none', border: 'none',
                cursor: 'pointer', padding: '4px 6px',
                borderRadius: '24px', transition: 'background 0.15s', flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--s2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Avatar circle */}
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'rgba(var(--accent-rgb), 0.2)',
                border: '2px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                {user?.avatar_url && user.avatar_url.trim() !== ''
                  ? <Image src={user.avatar_url} width={34} height={34} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  : <User size={18} strokeWidth={1.5} color="var(--accent)" />}
              </div>
              {/* Name + email + chevron (desktop only) */}
              {!isMobile && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--t1)', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                      {user?.full_name || user?.username || 'Utilisateur'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600, whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                      {activeOrganization?.name || 'Sélectionner...'}
                    </span>
                  </div>
                  <ChevronDown size={14} color="var(--t3)" style={{ transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </>
              )}
            </button>

            {profileOpen && (
              <div className="profile-dropdown" style={{ background: 'var(--card)', right: 0, left: 'auto', minWidth: '220px' }}>
                <div className="dropdown-header">
                  <div className="av-large" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {user?.avatar_url && user.avatar_url.trim() !== ''
                      ? <Image src={user.avatar_url} alt="" width={50} height={50} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <User size={28} strokeWidth={1.5} color="var(--accent)" />}
                  </div>
                  <div className="u-info">
                    <div className="u-name">{user?.full_name || 'Utilisateur'}</div>
                    <div className="u-email">{user?.email}</div>
                  </div>
                </div>
                 <div className="dropdown-divider" />
                <Link href={`/profile/${user?.username || ''}`} className="dropdown-item" onClick={() => setProfileOpen(false)} style={{ textDecoration: 'none', color: 'var(--text2)' }}><User size={16} /> Profil</Link>
                <button 
                  className="dropdown-item" 
                  onClick={() => { setProfileOpen(false); setShowBrandModal(true) }}
                >
                  <Building2 size={16} /> Mes marques
                </button>
                <Link href="/settings" className="dropdown-item" onClick={() => setProfileOpen(false)} style={{ textDecoration: 'none', color: 'var(--text2)' }}><Settings size={16} /> Paramètres</Link>
                <div className="dropdown-divider" />
                <button className="dropdown-item logout" onClick={handleLogout}><LogOut size={16} /> Se déconnecter</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════
          BODY = SIDEBAR + CONTENT
      ══════════════════════════ */}
      <div style={{
        display: 'flex',
        marginTop: `${TOPBAR_H}px`,
        height: `calc(100vh - ${TOPBAR_H}px)`,
        overflow: 'hidden',
      }}>

        {/* ── LEFT SIDEBAR (desktop only) ── */}
        {!isMobile && (
          <aside
            className="sb-scroll"
            style={{
              width: `${SIDEBAR_W}px`,
              flexShrink: 0,
              background: 'var(--sidebar-bg)',
              borderRight: '1px solid var(--b1)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '12px 8px',
              gap: 0,
            }}
          >
            {/* Titre Navigation */}
            <div style={{ padding: '4px 12px 8px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Navigation
            </div>

            {/* Nav Items */}
            <div style={{ marginBottom: '4px' }}>
              {navItems.map(item => {
                let active = pathname === item.href || (item.href !== '/home' && pathname?.startsWith(item.href))
                
                // Ne pas afficher Workspace comme actif si on est sur la création de post
                if (item.href === '/workspace' && pathname?.startsWith('/workspace/posts/create')) {
                  active = false
                }

                const isMessages = item.label === 'Messagerie'
                const isNotifications = item.label === 'Notifications'
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 12px', borderRadius: '10px',
                      textDecoration: 'none',
                      color: 'var(--text)',
                      background: active ? 'var(--accent-light)' : 'transparent',
                      marginBottom: '2px',
                      transition: 'all 0.15s',
                      fontWeight: active ? 600 : 500,
                      position: 'relative',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--s2)' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <item.icon size={20} color={active ? 'var(--accent)' : 'currentColor'} style={{ flexShrink: 0 }} />
                      {isMessages && unreadCount > 0 && (
                        <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 8, height: 8 }} />
                      )}
                      {isNotifications && unreadNotifsCount > 0 && (
                        <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 8, height: 8 }} />
                      )}
                    </div>
                    <span style={{ fontSize: '0.88rem', whiteSpace: 'nowrap', flex: 1 }}>{item.label}</span>
                    {isMessages && unreadCount > 0 && (
                      <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, padding: '1px 6px', fontSize: '.7rem', fontWeight: 700 }}>{unreadCount}</span>
                    )}
                    {isNotifications && unreadNotifsCount > 0 && (
                      <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, padding: '1px 6px', fontSize: '.7rem', fontWeight: 700 }}>{unreadNotifsCount}</span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Espace flexible pour pousser la carte en bas */}
            <div style={{ flex: 1 }} />

            {/* Carte Passez à Pro */}
            <div style={{
              background: 'var(--accent-light)',
              borderRadius: '12px',
              padding: '16px',
              margin: '12px 8px',
              border: '1px solid rgba(var(--accent-rgb), 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={16} color="var(--accent)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)' }}>Passez à Pro</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--t2)', marginBottom: '12px', lineHeight: 1.4 }}>
                Plus d'outils, plus d'options, plus de puissance.
              </p>
              <Link href="/settings?tab=billing" style={{
                display: 'block',
                width: '100%',
                padding: '8px',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: '8px',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.15s'
              }}>
                Découvrir
              </Link>
            </div>
          </aside>
        )}

        {/* ── MAIN CONTENT ── */}
        <main
          className="sb-scroll"
          style={{
            flex: 1,
            overflowY: pathname?.startsWith('/messages') ? 'hidden' : 'auto',
            display: pathname?.startsWith('/messages') ? 'flex' : 'block',
            flexDirection: 'column',
            paddingBottom: isMobile ? '64px' : 0,
          }}
        >
          {children}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: '64px', background: 'var(--sidebar-bg)',
          borderTop: '1px solid var(--b1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          zIndex: 30, padding: '0 4px',
          backdropFilter: 'blur(12px)',
        }}>
          {bottomNavItems.map(item => {
            const active = pathname === item.href || (item.href !== '/home' && pathname?.startsWith(item.href))
            const isMessages = item.href === '/messages'
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '3px', flex: 1, padding: '6px 0',
                textDecoration: 'none', color: active ? 'var(--accent)' : 'var(--text3)',
                transition: 'color 0.15s', position: 'relative',
              }}>
                <div style={{ position: 'relative', display: 'flex' }}>
                  <item.icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                  {isMessages && unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: -5, right: -10, background: '#ef4444', color: '#fff', borderRadius: 99, padding: '1px 5px', fontSize: '.6rem', fontWeight: 700, minWidth: 12, textAlign: 'center' }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.6rem', fontWeight: active ? 600 : 500 }}>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      )}

      {/* MODAL CRÉATION DE MARQUE */}
      {showCreateOrgModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--b1)',
            borderRadius: '12px',
            padding: '20px',
            width: '100%', maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--accent)" />
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
                Créer une nouvelle marque
              </span>
            </div>
            
            <p style={{ fontSize: '0.82rem', color: 'var(--text3)', lineHeight: 1.4 }}>
              Chaque marque dispose de ses propres comptes réseaux sociaux, publications, calendriers et statistiques de façon étanche.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)' }}>Nom de la marque</label>
              <input
                type="text"
                placeholder="Ex : Acme Corp, MyBrand..."
                value={newOrgName}
                onChange={e => setNewOrgName(e.target.value)}
                style={{
                  width: '100%', height: '38px',
                  background: 'var(--s2)', border: '1px solid var(--b1)',
                  borderRadius: '8px', padding: '0 12px',
                  color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
                }}
                disabled={isCreatingOrg}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={() => {
                  setShowCreateOrgModal(false)
                  setNewOrgName('')
                }}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  background: 'transparent', border: '1px solid var(--b1)',
                  color: 'var(--text2)', cursor: 'pointer', fontSize: '0.85rem',
                  fontWeight: 600
                }}
                disabled={isCreatingOrg}
              >
                Annuler
              </button>
              <button
                onClick={handleCreateOrg}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  background: 'var(--accent)', border: 'none',
                  color: '#fff', cursor: 'pointer', fontSize: '0.85rem',
                  fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
                }}
                disabled={isCreatingOrg || !newOrgName.trim()}
              >
                {isCreatingOrg ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Selection Modal */}
      {showBrandModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--b1)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '400px',
            padding: '20px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--t1)', margin: 0 }}>Choisir une marque</h3>
              <button 
                onClick={() => setShowBrandModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {organizations.map(org => {
                const isActive = org.id === activeOrganization?.id
                return (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchOrganization(org.id)
                      setShowBrandModal(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: isActive ? '1px solid var(--accent)' : '1px solid var(--b1)',
                      background: isActive ? 'var(--accent-light)' : 'var(--s2)',
                      color: isActive ? 'var(--accent)' : 'var(--t1)',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? 700 : 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '6px',
                      background: isActive ? 'var(--accent)' : 'var(--b1)',
                      color: isActive ? '#fff' : 'var(--t3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 800
                    }}>
                      {org.name.slice(0, 1).toUpperCase()}
                    </div>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.name}</span>
                    {isActive && <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>✓</span>}
                  </button>
                )
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--b1)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowBrandModal(false)
                  router.push('/settings?tab=identity&action=add_brand')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.15s'
                }}
              >
                <Plus size={14} />
                <span>Créer une marque</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sb-scroll::-webkit-scrollbar { width: 4px; }
        .sb-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 2px; }
        .sb-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { 
  Home, Layout, Users, MessageCircle, Search, Bell,
  User, CreditCard, BellRing, Settings, ShieldCheck, LogOut, Moon, Sun,
  Sparkles, BarChart2, Zap, Plus, ChevronDown
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
  const [user, setUser] = useState<any>(initialUser)
  const [profileOpen, setProfileOpen] = useState(false)
  const [theme, setTheme] = useState('dark')
  const profileRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) setTheme(saved)
  }, [])

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
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const [unreadCount, setUnreadCount] = useState(0)

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

  useEffect(() => {
    if (!user?.id) return
    loadUnreadCount()
    const channel = supabase.channel('sidebar-messages-unread')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => loadUnreadCount())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_reads' }, () => loadUnreadCount())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id, loadUnreadCount, supabase])

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

        {/* LEFT: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, minWidth: isMobile ? 'auto' : '220px' }}>
          <Image src="/logo.png" alt="CM Studio Logo" width={44} height={44} style={{ objectFit: 'contain' }} />
          {!isMobile && (
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', whiteSpace: 'nowrap' }}>
              CM Studio
            </span>
          )}
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

        {isMobile && <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', fontFamily: "'Syne', sans-serif" }}>CM Studio</span>}

        {/* RIGHT: Top Actions + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '18px', flexShrink: 0 }}>
          
          {/* Create Action Button (+) */}
          <Link href="/workspace/posts/create" style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1.5px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)', cursor: 'pointer', background: 'transparent'
          }}>
            <Plus size={18} strokeWidth={2.5} />
          </Link>

          {/* Notifications & Messages */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Bell icon */}
            <Link href="/notifications" style={{ position: 'relative', color: 'var(--t2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={20} strokeWidth={1.8} />
              <span style={{ position: 'absolute', top: '-5px', right: '-6px', background: 'var(--accent)', color: '#fff', borderRadius: '50%', fontSize: '0.65rem', fontWeight: 800, width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--nav-bg)' }}>
                3
              </span>
            </Link>

            {/* Message icon */}
            <Link href="/messages" style={{ position: 'relative', color: 'var(--t2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={20} strokeWidth={1.8} />
              <span style={{ position: 'absolute', top: '-5px', right: '-6px', background: 'var(--accent)', color: '#fff', borderRadius: '50%', fontSize: '0.65rem', fontWeight: 800, width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--nav-bg)' }}>
                2
              </span>
            </Link>
          </div>

          {!isMobile && <div style={{ width: '1px', height: '24px', background: 'var(--b1)', margin: '0 4px' }} />}

          {/* Avatar + Name dropdown */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                borderRadius: '24px', transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--s2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Avatar */}
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--b1)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--t2)', overflow: 'hidden', flexShrink: 0,
              }}>
                {user?.avatar_url
                  ? <Image src={user.avatar_url} width={36} height={36} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  : <User size={20} strokeWidth={1.5} />}
              </div>
              
              {/* Name (Desktop only) */}
              {!isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '4px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--t1)', whiteSpace: 'nowrap' }}>
                    {user?.full_name || user?.username || 'Utilisateur'}
                  </span>
                  <ChevronDown size={14} color="var(--t3)" style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div className="profile-dropdown" style={{ background: 'var(--card)', right: 0, left: 'auto', minWidth: '220px' }}>
                <div className="dropdown-header">
                  <div className="av-large" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--b1)', color: 'var(--t2)' }}>
                    {user?.avatar_url
                      ? <Image src={user.avatar_url} alt="" width={50} height={50} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <User size={28} strokeWidth={1.5} />}
                  </div>
                  <div className="u-info">
                    <div className="u-name">{user?.full_name || 'Utilisateur'}</div>
                    <div className="u-email">{user?.email}</div>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <Link href={`/profile/${user?.username || ''}`} className="dropdown-item" onClick={() => setProfileOpen(false)}><User size={16} /> Profil</Link>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setProfileOpen(false); }}>
                  {theme === 'dark' ? <><Sun size={16} /> Mode Clair</> : <><Moon size={16} /> Mode Sombre</>}
                </button>
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
                    </div>
                    <span style={{ fontSize: '0.88rem', whiteSpace: 'nowrap', flex: 1 }}>{item.label}</span>
                    {isMessages && unreadCount > 0 && (
                      <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, padding: '1px 6px', fontSize: '.7rem', fontWeight: 700 }}>{unreadCount}</span>
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

      <style jsx>{`
        .sb-scroll::-webkit-scrollbar { width: 4px; }
        .sb-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 2px; }
        .sb-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Home, Layout, Users, MessageCircle, Search, Bell,
  User, CreditCard, BellRing, Settings, ShieldCheck, LogOut, Moon, Sun, Menu, X
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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const profileRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  // On mobile, sidebar is closed by default and acts as overlay
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
    else setSidebarOpen(true)
  }, [isMobile])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [pathname, isMobile])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
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
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Messages non lus en temps réel pour le badge de la sidebar / navigation
  const [unreadCount, setUnreadCount] = useState(0)

  const loadUnreadCount = useCallback(async () => {
    if (!user?.id) return
    const { data: myParts } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', user.id)
    if (!myParts?.length) { setUnreadCount(0); return }
    const ids = myParts.map(p => p.conversation_id)
    
    let total = 0
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
      total = unread.length
    }
    setUnreadCount(total)
  }, [user?.id, supabase])

  useEffect(() => {
    if (!user?.id) return
    loadUnreadCount()

    const channel = supabase.channel('sidebar-messages-unread')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        loadUnreadCount()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_reads' }, () => {
        loadUnreadCount()
      })
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
    { label: 'Home',        icon: Home,          href: '/home'          },
    { label: 'Workspace',   icon: Layout,        href: '/workspace'     },
    { label: 'Notifications', icon: Bell,        href: '/notifications' },
    { label: 'Messagerie',  icon: MessageCircle, href: '/messages'      },
    { label: 'Community',   icon: Users,         href: '/community'     },
  ]

  const bottomNavItems = [
    { label: 'Home',      icon: Home,          href: '/home'      },
    { label: 'Workspace', icon: Layout,        href: '/workspace' },
    { label: 'Messages',  icon: MessageCircle, href: '/messages'  },
    { label: 'Profil',    icon: User,          href: '/profile'   },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', color: 'var(--text)', overflow: 'hidden', transition: 'background 0.3s, color 0.3s' }}>
      
      {/* Mobile Overlay Backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', zIndex: 40,
            animation: 'fadeIn 0.2s ease',
          }} 
        />
      )}

      {/* Sidebar */}
      <div 
        className="sb-scroll" 
        style={{ 
          width: isMobile ? (sidebarOpen ? '280px' : '0px') : ((sidebarOpen && pathname !== '/messages') ? '260px' : '64px'), 
          opacity: isMobile ? (sidebarOpen ? 1 : 0) : 1,
          background: 'var(--sidebar-bg)', 
          borderRight: '1px solid var(--b1)', 
          display: 'flex', flexDirection: 'column', flexShrink: 0, 
          overflowY: 'auto', overflowX: 'hidden', 
          transition: 'all 0.3s ease',
          ...(isMobile ? {
            position: 'fixed', top: 0, left: 0, bottom: 0,
            zIndex: 50,
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
          } : {}),
        }}
      >
        {(() => {
          const isExpanded = isMobile ? sidebarOpen : (sidebarOpen && pathname !== '/messages');
          return (
            <>
              <div style={{ padding: isExpanded ? '24px' : '24px 16px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: isExpanded ? 'space-between' : 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Image src="/logo.png" alt="CM Studio Logo" width={32} height={32} style={{ borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  {isExpanded && <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text)', whiteSpace: 'nowrap' }}>CM Studio</span>}
                </div>
                {isMobile && (
                  <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                    <X size={20} />
                  </button>
                )}
              </div>
      
              <div style={{ flex: 1, padding: isExpanded ? '0 12px' : '0 8px' }}>
                {isExpanded ? (
                  <div style={{ padding: '0 12px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px', marginTop: '12px', whiteSpace: 'nowrap' }}>Navigation</div>
                ) : (
                  <div style={{ height: '36px' }} />
                )}
                
                {navItems.map(item => {
                  const active = pathname === item.href || (item.href !== '/home' && pathname?.startsWith(item.href))
                  const isMessages = item.href === '/messages'
                  return (
                    <Link key={item.label} href={item.href} title={!isExpanded ? item.label : undefined} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: isExpanded ? '10px 12px' : '10px', borderRadius: '10px', textDecoration: 'none', color: active ? 'var(--text)' : 'var(--text2)', background: active ? 'var(--accent-light)' : 'transparent', marginBottom: '4px', transition: 'all 0.2s', justifyContent: isExpanded ? 'flex-start' : 'center', position: 'relative' }}>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <item.icon size={20} color={active ? 'var(--accent)' : 'currentColor'} style={{ flexShrink: 0 }} />
                        {isMessages && unreadCount > 0 && !isExpanded && (
                          <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 8, height: 8 }} />
                        )}
                      </div>
                      {isExpanded && <span style={{ fontSize: '0.85rem', fontWeight: active ? 600 : 500, whiteSpace: 'nowrap', flex: 1 }}>{item.label}</span>}
                      {isExpanded && isMessages && unreadCount > 0 && (
                        <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, padding: '1px 6px', fontSize: '.7rem', fontWeight: 700 }}>{unreadCount}</span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </>
          )
        })()}
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: isMobile ? '64px' : 0 }}>
        
        {/* Header */}
        <header style={{ 
          height: isMobile ? '56px' : '72px', 
          borderBottom: '1px solid var(--b1)', 
          display: 'flex', alignItems: 'center', 
          padding: isMobile ? '0 12px' : '0 32px', 
          gap: isMobile ? '8px' : '24px', 
          flexShrink: 0 
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '8px', transition: '0.2s', flexShrink: 0 }}>
            <Menu size={isMobile ? 20 : 22} />
          </button>

          {!isMobile && (
            <div style={{ minWidth: '120px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                {pathname === '/workspace' && 'Workspace'}
                {pathname === '/messages' && 'Messagerie'}
                {pathname === '/home' && 'Accueil'}
                {pathname === '/community' && 'Communauté'}
                {pathname === '/notifications' && 'Notifications'}
                {pathname === '/profile' && 'Profil'}
                {pathname?.startsWith('/settings') && 'Paramètres'}
              </span>
            </div>
          )}

          {/* Search bar - hidden on mobile */}
          {!isMobile && (
            <div style={{ position: 'relative', flex: 1, maxWidth: '500px', margin: '0 auto' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input type="text" placeholder="Rechercher sur CM Studio..." style={{ width: '100%', height: '44px', background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '0 16px 0 48px', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' }} />
            </div>
          )}

          {/* Mobile: show page title */}
          {isMobile && (
            <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', fontFamily: "'Syne', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              CM Studio
            </span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '12px', flexShrink: 0 }}>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ width: isMobile ? '34px' : '40px', height: isMobile ? '34px' : '40px', borderRadius: '12px', background: 'var(--s2)', border: '1px solid var(--b1)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {theme === 'dark' ? <Sun size={isMobile ? 16 : 20} /> : <Moon size={isMobile ? 16 : 20} />}
            </button>
            {/* Redundant message/notification icons removed as per user request */}
            
            
            <div ref={profileRef} style={{ position: 'relative', marginLeft: isMobile ? '0' : '8px' }}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                style={{ 
                  width: isMobile ? '32px' : '38px', height: isMobile ? '32px' : '38px', borderRadius: '50%', background: 'rgba(var(--accent-rgb), 0.2)', border: '2px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', flexShrink: 0
                }}
              >
                {user?.avatar_url ? <Image src={user.avatar_url} width={38} height={38} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/> : initials}
              </button>

              {profileOpen && (
                <div className="profile-dropdown" style={{ background: '#11111F' }}>
                  <div className="dropdown-header">
                    <div className="av-large" style={{ overflow: 'hidden' }}>
                      {user?.avatar_url ? (
                        <Image src={user.avatar_url} alt="" width={50} height={50} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="u-info">
                      <div className="u-name">{user?.full_name || 'Utilisateur'}</div>
                      <div className="u-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link href="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                    <User size={16} /> Profil
                  </Link>
                  <Link href="/settings?tab=billing" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                    <CreditCard size={16} /> Abonnements
                  </Link>
                  <Link href="/settings?tab=notifications" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                    <BellRing size={16} /> Language et notifications
                  </Link>
                  <div className="dropdown-divider" />
                  <Link href="/settings?tab=general" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                    <Settings size={16} /> Réglages
                  </Link>
                  <Link href="/settings?tab=privacy" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                    <ShieldCheck size={16} /> Confidentialité
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={16} /> Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="sb-scroll" style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 12px' : '32px' }}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
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
                transition: 'color 0.15s',
                position: 'relative',
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

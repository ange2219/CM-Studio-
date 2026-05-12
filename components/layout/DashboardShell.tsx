'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Home, Layout, BarChart3, Users, MessageCircle, Search, Plus, Bell,
  User, CreditCard, BellRing, Settings, ShieldCheck, LogOut, HelpCircle, Moon, Sun
} from 'lucide-react'

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

  if (pathname === '/onboarding') return <>{children}</>

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = (user?.full_name || user?.email || 'U').slice(0, 2).toUpperCase()

  const navItems = [
    { label: 'Home', icon: Home, href: '/home' },
    { label: 'Workspace', icon: Layout, href: '/posts' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { label: 'Community', icon: Users, href: '/community' },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', color: 'var(--text)', overflow: 'hidden', transition: 'background 0.3s, color 0.3s' }}>
      
      {/* Sidebar - Clean Version */}
      <div className="sb-scroll" style={{ width: '260px', background: 'var(--sidebar-bg)', borderRight: '1px solid var(--b1)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto', transition: 'background 0.3s' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>C</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>CM Studio</span>
        </div>

        <div style={{ flex: 1, padding: '0 12px' }}>
          <div style={{ padding: '0 12px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px', marginTop: '12px' }}>Navigation</div>
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: active ? 'var(--text)' : 'var(--text2)', background: active ? 'var(--accent-light)' : 'transparent', marginBottom: '4px', transition: 'all 0.2s' }}>
                <item.icon size={18} color={active ? 'var(--accent)' : 'currentColor'} />
                <span style={{ fontSize: '0.85rem', fontWeight: active ? 600 : 500 }}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header - Fixed & Centered Search */}
        <header style={{ height: '72px', borderBottom: '1px solid var(--b1)', display: 'flex', alignItems: 'center', padding: '0 32px', gap: '32px', flexShrink: 0 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '500px', margin: '0 auto' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input type="text" placeholder="Rechercher sur CM Studio..." style={{ width: '100%', height: '44px', background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '0 16px 0 48px', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--s2)', border: '1px solid var(--b1)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--s2)', border: '1px solid var(--b1)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={20} /></button>
            <button style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--s2)', border: '1px solid var(--b1)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={20} /></button>
            
            <div ref={profileRef} style={{ position: 'relative', marginLeft: '8px' }}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                style={{ 
                  width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(var(--accent-rgb), 0.2)', border: '2px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden'
                }}
              >
                {user?.avatar_url ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/> : initials}
              </button>

              {profileOpen && (
                <div className="profile-dropdown" style={{ background: '#11111F' }}>
                  <div className="dropdown-header">
                    <div className="av-large">{initials}</div>
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

        <main className="sb-scroll" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {children}
        </main>
      </div>

      <style jsx>{`
        .sb-scroll::-webkit-scrollbar { width: 4px; }
        .sb-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 2px; }
        .sb-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  )
}

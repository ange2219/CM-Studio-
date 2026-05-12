'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Home, Layout, Calendar, Users, BarChart3, Sparkles, 
  Settings, HelpCircle, LogOut, Bell, MessageCircle, Plus, Search,
  Menu, ChevronLeft, User, CreditCard, BellRing, ShieldCheck
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
  const profileRef = useRef<HTMLDivElement>(null)

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

  // Click outside listener for profile menu
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
    { label: 'Messages', icon: MessageCircle, href: '/messages' },
  ]

  const shortcuts = [
    { label: 'Calendrier éditorial', href: '/calendar' },
    { label: 'Générateur IA', href: '/home' },
    { label: 'Mes publications', href: '/posts' },
    { label: 'Mes visuels', href: '/home', badge: 'Pro' },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#070709', color: '#fff', overflow: 'hidden' }}>
      
      {/* Sidebar - Strict Sync with Mockup */}
      <div className="sb-scroll" style={{ width: '260px', background: '#0D0D1A', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>C</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>CM Studio</span>
        </div>

        <div style={{ flex: 1, padding: '0 12px' }}>
          <div style={{ padding: '0 12px', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px', marginTop: '12px' }}>Navigation</div>
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: active ? '#fff' : 'rgba(255,255,255,0.5)', background: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent', marginBottom: '4px', transition: 'all 0.2s' }}>
                <item.icon size={18} color={active ? '#6366f1' : 'currentColor'} />
                <span style={{ fontSize: '0.85rem', fontWeight: active ? 600 : 500 }}>{item.label}</span>
              </Link>
            )
          })}

          <div style={{ padding: '0 12px', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px', marginTop: '24px' }}>Raccourcis</div>
          {shortcuts.map(item => (
            <Link key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.label}</span>
              {item.badge && <span style={{ fontSize: '0.65rem', background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{item.badge}</span>}
            </Link>
          ))}
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', padding: '16px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>Besoin d&apos;aide ?</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '12px' }}>Consultez notre documentation</div>
              <Link href="/help" style={{ background: '#fff', color: '#4f46e5', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>Ouvrir</Link>
            </div>
            <HelpCircle style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1, width: '80px', height: '80px' }} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header - Fixed & Centered Search */}
        <header style={{ height: '72px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 32px', gap: '32px', flexShrink: 0 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '500px', margin: '0 auto' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input type="text" placeholder="Rechercher sur CM Studio..." style={{ width: '100%', height: '44px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0 16px 0 48px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={20} /></button>
            <button style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={20} /></button>
            <button style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={20} /></button>
            
            {/* Profile Dropdown Restoration */}
            <div ref={profileRef} style={{ position: 'relative', marginLeft: '8px' }}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                style={{ 
                  width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', border: '2px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6366f1', fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden'
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

        {/* Content Area */}
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

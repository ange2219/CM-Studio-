'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Home, 
  Users, 
  Layout, 
  Calendar, 
  BarChart3, 
  Sparkles, 
  LogOut,
  HelpCircle,
  Settings,
  Search,
  MessageCircle,
  Bell,
  Menu,
  Plus,
  Monitor,
  Image as ImageIcon,
  FileText,
  User as UserIcon,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import type { User } from '@/types'

export function DashboardShell({ user: initialUser, children }: {
  user: User
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(initialUser)
  const [expanded, setExpanded] = useState(true)
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
  }, [initialUser])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (pathname === '/onboarding') return <>{children}</>

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const ni = (href: string) => {
    const active = pathname === href || (href !== '/home' && pathname.startsWith(href))
    return {
      width: '100%',
      height: '42px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      padding: expanded ? '0 16px' : '0',
      justifyContent: expanded ? 'flex-start' : 'center',
      gap: '12px',
      color: active ? '#fff' : 'rgba(255,255,255,0.6)',
      background: active ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      textDecoration: 'none',
      overflow: 'hidden',
      whiteSpace: 'nowrap' as const,
      fontSize: '0.9rem',
      fontWeight: active ? 600 : 500,
    }
  }

  const categoryLabel = {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    margin: '24px 0 12px 16px',
    display: expanded ? 'block' : 'none'
  }

  const initials = (user?.full_name || user?.email || 'U').slice(0, 2).toUpperCase()

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0D0D1A', overflow: 'hidden', color: '#fff' }}>
      
      {/* COLUMN 1: SIDEBAR (Strict mockup sync) */}
      <div style={{ 
        width: expanded ? '260px' : '80px', 
        borderRight: '1px solid rgba(255,255,255,0.06)', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '20px 12px',
        flexShrink: 0,
        zIndex: 100,
        background: '#0D0D1A',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Logo Section */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: expanded ? 'space-between' : 'center',
          marginBottom: '32px',
          padding: '0 8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '8px', 
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff'
            }}>
              <Sparkles size={18} fill="currentColor" />
            </div>
            {expanded && <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.02em' }}>CM Studio</span>}
          </div>
          <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            <Menu size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingRight: '4px' }} className="sb-scroll">
          
          <div style={categoryLabel}>Navigation</div>
          <Link href="/home" style={ni('/home')}><Home size={18} /> {expanded && 'Home'}</Link>
          <Link href="/posts" style={ni('/posts')}><Layout size={18} /> {expanded && 'Workspace'}</Link>
          <Link href="/analytics" style={ni('/analytics')}><BarChart3 size={18} /> {expanded && 'Analytics'}</Link>
          <Link href="/community" style={ni('/community')}><Users size={18} /> {expanded && 'Community'}</Link>
          <Link href="/messages" style={ni('/messages')}><MessageCircle size={18} /> {expanded && 'Messages'}</Link>

          <div style={categoryLabel}>Raccourcis</div>
          <Link href="/calendar" style={ni('/calendar')}><Calendar size={18} /> {expanded && 'Calendrier éditorial'}</Link>
          <Link href="/ai-gen" style={ni('/ai-gen')}><Sparkles size={18} /> {expanded && 'Générateur IA'}</Link>
          <Link href="/posts" style={ni('/posts')}><FileText size={18} /> {expanded && 'Mes publications'}</Link>
          <Link href="/visuals" style={ni('/visuals')} title="Mes visuels">
            <ImageIcon size={18} style={{ flexShrink: 0 }} />
            {expanded && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Mes visuels</span>
                <span style={{fontSize:'0.65rem', background:'linear-gradient(135deg, #6366f1, #4f46e5)', color:'#fff', padding:'1px 6px', borderRadius:'6px', fontWeight: 800}}>Pro</span>
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#070709' }}>
        
        {/* GLOBAL HEADER */}
        <div style={{ 
          height: '72px',
          padding: '0 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'transparent',
          zIndex: 90,
          flexShrink: 0,
        }}>
          {/* Centered Search Bar */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
              <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input 
                type="text" 
                placeholder="Rechercher sur CM Studio..." 
                style={{ 
                  width: '100%', padding: '10px 16px 10px 44px', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '0.85rem', color: '#fff', outline: 'none'
                }}
              />
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>⌘K</div>
            </div>
          </div>
          
          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            <button style={{ position: 'relative', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={20} />
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #070709' }}>4</div>
            </button>
            <button style={{ position: 'relative', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={20} />
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #070709' }}>7</div>
            </button>
            
            <button style={{ 
              width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer'
            }}>
              <Plus size={20} />
            </button>

            {/* Profile Dropdown */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', borderRadius: '50%', 
                  background: 'transparent', border: 'none', cursor: 'pointer' 
                }}
              >
                <div style={{ 
                  width: '38px', height: '38px', borderRadius: '50%', 
                  background: 'rgba(99, 102, 241, 0.2)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', fontWeight: 700, color: '#6366f1',
                  border: '2px solid rgba(255,255,255,0.1)', overflow: 'hidden'
                }}>
                  {initials}
                </div>
              </button>

              {profileOpen && (
                <div style={{ 
                  position: 'absolute', top: '100%', right: 0, marginTop: '12px', width: '220px', 
                  background: '#11111F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)', padding: '8px', zIndex: 1000
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{user?.full_name || 'Utilisateur'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{user?.email}</div>
                  </div>
                  <Link href="/settings?tab=general" style={{ 
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '8px',
                    textDecoration: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem'
                  }} onClick={() => setProfileOpen(false)}>
                    <Settings size={16} /> Paramètres
                  </Link>
                  <Link href="/help" style={{ 
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '8px',
                    textDecoration: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem'
                  }} onClick={() => setProfileOpen(false)}>
                    <HelpCircle size={16} /> Aide
                  </Link>
                  <button onClick={handleLogout} style={{ 
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '8px',
                    background: 'none', border: 'none', color: '#EF4444', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left'
                  }}>
                    <LogOut size={16} /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', position: 'relative', background: '#070709' }}>
          {children}
        </div>
      </div>

      <style jsx>{`
        .sb-scroll::-webkit-scrollbar { width: 4px; }
        .sb-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 2px; }
        .sb-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  )
}

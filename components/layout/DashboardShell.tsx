'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
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
  Image as ImageIcon
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

  if (pathname === '/onboarding') return <>{children}</>

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const ni = (href: string) => {
    const active = pathname === href || (href !== '/home' && pathname.startsWith(href))
    return {
      width: '100%',
      height: '40px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      padding: expanded ? '0 12px' : '0',
      justifyContent: expanded ? 'flex-start' : 'center',
      gap: '12px',
      color: active ? '#fff' : 'var(--text2)',
      background: active ? 'var(--accent)' : 'transparent',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      textDecoration: 'none',
      overflow: 'hidden',
      whiteSpace: 'nowrap' as const,
      fontSize: '0.85rem',
      fontWeight: active ? 600 : 400,
    }
  }

  const categoryLabel = {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--text3)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '16px 0 8px 12px',
    display: expanded ? 'block' : 'none'
  }

  const initials = (user?.full_name || user?.email || 'U').slice(0, 2).toUpperCase()

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      
      {/* COLUMN 1: SIDEBAR */}
      <div style={{ 
        width: expanded ? '260px' : '80px', 
        borderRight: '1px solid var(--border)', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '20px 12px',
        flexShrink: 0,
        zIndex: 100,
        background: 'var(--bg)',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Header Logo */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: expanded ? 'space-between' : 'center',
          marginBottom: '28px',
          padding: '0 8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '8px', 
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff'
            }}>
              <Sparkles size={18} fill="currentColor" />
            </div>
            {expanded && <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>CM Studio</span>}
          </div>
          <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>
            <Menu size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingRight: '4px' }} className="sb-scroll">
          
          <div style={categoryLabel}>Navigation</div>
          <Link href="/home" style={ni('/home')}><Home size={18} /> {expanded && 'Home'}</Link>
          <Link href="/posts" style={ni('/posts')}><Monitor size={18} /> {expanded && 'Workspace'}</Link>
          <Link href="/analytics" style={ni('/analytics')}><BarChart3 size={18} /> {expanded && 'Analytics'}</Link>
          <Link href="/community" style={ni('/community')}><Users size={18} /> {expanded && 'Community'}</Link>
          <Link href="/messages" style={ni('/messages')}><MessageCircle size={18} /> {expanded && 'Messages'}</Link>

          <div style={categoryLabel}>Raccourcis</div>
          <Link href="/calendar" style={ni('/calendar')}><Calendar size={18} /> {expanded && 'Calendrier éditorial'}</Link>
          <Link href="/ai-gen" style={ni('/ai-gen')}><Sparkles size={18} /> {expanded && 'Générateur IA'}</Link>
          <Link href="/posts" style={ni('/posts')}><Layout size={18} /> {expanded && 'Mes publications'}</Link>
          <Link href="/visuals" style={ni('/visuals')} title="Mes visuels">
            <ImageIcon size={18} style={{ flexShrink: 0 }} />
            {expanded && <span>Mes visuels <span style={{fontSize:'0.65rem', background:'var(--accent)', color:'#fff', padding:'1px 5px', borderRadius:'4px', marginLeft:'4px'}}>PRO</span></span>}
          </Link>
        </div>

        <div style={{ flex: 1 }} />

        <Link href="/settings" style={ni('/settings')} title="Paramètres">
          <Settings size={18} style={{ flexShrink: 0 }} />
          {expanded && <span style={{ fontSize: '0.85rem' }}>Paramètres</span>}
        </Link>
        <Link href="/help" style={ni('/help')} title="Aide">
          <HelpCircle size={18} style={{ flexShrink: 0 }} />
          {expanded && <span style={{ fontSize: '0.85rem' }}>Aide</span>}
        </Link>
        <button onClick={handleLogout} style={{ ...ni('/logout'), color: 'var(--red)' }}>
          <LogOut size={18} /> {expanded && 'Déconnexion'}
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* GLOBAL HEADER */}
        <div style={{ 
          height: '64px',
          padding: '0 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg)',
          zIndex: 90,
          flexShrink: 0,
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ width: '200px' }} />

          <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input 
              type="text" 
              placeholder="Rechercher un post, un utilisateur, un groupe..." 
              style={{ 
                width: '100%', padding: '10px 16px 10px 44px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                fontSize: '0.85rem', color: 'var(--text)', outline: 'none'
              }}
            />
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', color: 'var(--text3)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>⌘K</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '200px', justifyContent: 'flex-end' }}>
            <button style={{ position: 'relative', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>
              <Bell size={20} />
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>4</div>
            </button>
            <button style={{ position: 'relative', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>
              <MessageCircle size={20} />
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>7</div>
            </button>
            <button style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
              <Plus size={18} />
            </button>
            <Link href="/settings?tab=general" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '50%', 
                background: 'var(--accent-light)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)',
                border: '2px solid var(--border)', overflow: 'hidden'
              }}>
                {initials}
              </div>
            </Link>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', position: 'relative', background: 'var(--bg)' }}>
          {children}
        </div>
      </div>

      <style jsx>{`
        .sb-scroll::-webkit-scrollbar { width: 4px; }
        .sb-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 2px; }
        .sb-scroll:hover::-webkit-scrollbar-thumb { background: var(--border); }
      `}</style>
    </div>
  )
}

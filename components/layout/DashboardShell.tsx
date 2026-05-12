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
  ChevronRight,
  ChevronLeft,
  Menu
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
  const [expanded, setExpanded] = useState(false)

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
      height: '44px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      padding: expanded ? '0 16px' : '0',
      justifyContent: expanded ? 'flex-start' : 'center',
      gap: '12px',
      color: active ? 'var(--accent)' : 'var(--t3)',
      background: active ? 'var(--accent-light)' : 'transparent',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      textDecoration: 'none',
      overflow: 'hidden',
      whiteSpace: 'nowrap' as const
    }
  }

  const initials = (user?.full_name || user?.email || 'U').slice(0, 2).toUpperCase()

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      
      {/* COLUMN 1: EXPANDABLE NAVIGATION (Fixed) */}
      <div style={{ 
        width: expanded ? '240px' : '80px', 
        borderRight: '1px solid var(--b1)', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: expanded ? 'flex-start' : 'center', 
        padding: '24px 16px',
        gap: '8px',
        flexShrink: 0,
        zIndex: 100,
        background: 'var(--bg)',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: expanded ? 'space-between' : 'center',
          marginBottom: '32px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '12px', 
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0
            }}>C</div>
            {expanded && <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--t1)' }}>CM Studio</span>}
          </div>
        </div>

        <button 
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%', height: '40px', borderRadius: '10px', border: '1px solid var(--b1)',
            background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--t2)', marginBottom: '16px'
          }}
        >
          {expanded ? <ChevronLeft size={18} /> : <Menu size={18} />}
        </button>

        <Link href="/home" style={ni('/home')} title="Accueil">
          <Home size={18} style={{ flexShrink: 0 }} />
          {expanded && <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Accueil</span>}
        </Link>
        
        <Link href="/posts" style={ni('/posts')} title="Contenu">
          <Layout size={18} style={{ flexShrink: 0 }} />
          {expanded && <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Contenu</span>}
        </Link>

        <Link href="/calendar" style={ni('/calendar')} title="Planning">
          <Calendar size={18} style={{ flexShrink: 0 }} />
          {expanded && <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Planning</span>}
        </Link>

        <Link href="/community" style={ni('/community')} title="Communauté">
          <Users size={18} style={{ flexShrink: 0 }} />
          {expanded && <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Communauté</span>}
        </Link>

        <Link href="/analytics" style={ni('/analytics')} title="Analytiques">
          <BarChart3 size={18} style={{ flexShrink: 0 }} />
          {expanded && <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Analytiques</span>}
        </Link>

        <Link href="/home" style={ni('/studio')} title="Studio IA">
          <Sparkles size={18} style={{ flexShrink: 0 }} />
          {expanded && <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Studio IA</span>}
        </Link>
        
        <div style={{ flex: 1 }} />
        
        <Link href="/settings" style={ni('/settings')} title="Paramètres">
          <Settings size={18} style={{ flexShrink: 0 }} />
          {expanded && <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Paramètres</span>}
        </Link>

        <Link href="/help" style={ni('/help')} title="Aide">
          <HelpCircle size={18} style={{ flexShrink: 0 }} />
          {expanded && <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Aide</span>}
        </Link>

        <button onClick={handleLogout} style={{ ...ni('/logout'), border: 'none' }} title="Déconnexion">
          <LogOut size={18} style={{ color: 'var(--red)', flexShrink: 0 }} />
          {expanded && <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--red)' }}>Déconnexion</span>}
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* GLOBAL HEADER (Unified Search & Profile) */}
        <div style={{ 
          padding: '16px 32px',
          display: 'flex', alignItems: 'center', gap: '24px',
          background: 'var(--bg)',
          zIndex: 90,
          flexShrink: 0
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }} />
            <input 
              type="text" 
              placeholder="Rechercher sur CM Studio..." 
              style={{ 
                width: '100%', padding: '10px 10px 10px 40px', borderRadius: '14px',
                background: 'var(--s2)', border: '1px solid var(--b1)',
                fontSize: '0.9rem', color: 'var(--t1)', outline: 'none'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button style={{ 
              width: '38px', height: '38px', borderRadius: '10px', background: 'var(--s2)', border: '1px solid var(--b1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', cursor: 'pointer'
            }}>
              <MessageCircle size={18} />
            </button>
            <button style={{ 
              width: '38px', height: '38px', borderRadius: '10px', background: 'var(--s2)', border: '1px solid var(--b1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', cursor: 'pointer'
            }}>
              <Bell size={18} />
            </button>
            <Link href="/settings?tab=profile" style={{ textDecoration: 'none' }}>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '50%', 
                background: 'var(--accent-light)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)',
                border: '2px solid var(--b1)'
              }}>
                {initials}
              </div>
            </Link>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

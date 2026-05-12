'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PLAN_LIMITS } from '@/types'
import type { User } from '@/types'

const PLAN_LABELS = { free: 'Plan Gratuit', premium: 'Plan Premium', business: 'Plan Business' }

export function Sidebar({ user, open }: { user: User; open: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const initials = (user.full_name || user.email || 'U').slice(0, 2).toUpperCase()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function ni(href: string) {
    return pathname === href || (href !== '/home' && pathname.startsWith(href))
      ? 'ni on' : 'ni'
  }

  const [used, setUsed] = useState(0)
  const limit = PLAN_LIMITS[user.plan].generationsPerWeek

  useEffect(() => {
    async function fetchQuota() {
      const now = new Date()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - 6)
      weekStart.setHours(0,0,0,0)

      const { count } = await supabase
        .from('ai_generation_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', weekStart.toISOString())
      
      setUsed(count || 0)
    }
    fetchQuota()
  }, [user.id])

  const progress = typeof limit === 'number' ? Math.min((used / limit) * 100, 100) : 0

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>

      {/* Logo */}
      <div className="sb-logo">
        <Link href="/home" className="sb-logo-link">
          <span className="logo-s">C</span>
          <span className="logo-rest">M</span>
          <span className="logo-ai">&nbsp;Studio</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="sb-nav">
        <div className="ns">Principal</div>

        <Link href="/home" className={ni('/home')} title="Accueil">
          <span className="sb-icon">
            <svg viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </span>
          <span className="sb-label">Accueil</span>
        </Link>

        <Link href="/community" className={ni('/community')} title="Espace Communauté">
          <span className="sb-icon">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </span>
          <span className="sb-label">Communauté</span>
        </Link>

        <div className="ns">Studio & Outils</div>

        <Link href="/posts" className={ni('/posts')} title="Gestion de Contenu">
          <span className="sb-icon">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          </span>
          <span className="sb-label">Gestion Contenu</span>
        </Link>

        <Link href="/calendar" className={ni('/calendar')} title="Espace Planification">
          <span className="sb-icon">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </span>
          <span className="sb-label">Planification</span>
        </Link>

        <Link href="/analytics" className={ni('/analytics')} title="Espace Analytique">
          <span className="sb-icon">
            <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </span>
          <span className="sb-label">Analytiques</span>
        </Link>

        <Link href="/home" className="ni" title="Studio IA">
          <span className="sb-icon">
            <svg viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </span>
          <span className="sb-label">Studio IA</span>
        </Link>

        <Link href="/home" className="ni" title="Workspace IA">
          <span className="sb-icon">
            <svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </span>
          <span className="sb-label">Workspace IA</span>
        </Link>


        {/* Upgrade Card - Inspired by user screenshot */}
        {user.plan === 'free' && open && (
          <div className="upgrade-card-sidebar">
            <div className="upgrade-card-content">
              <div className="upgrade-title">Passer à la version Pro</div>
              <div className="upgrade-sub">Obtenez plus de générations et de fonctionnalités.</div>
              
              <div className="quota-bar-container">
                <div className="quota-bar-info">
                  <span>Quota utilisé</span>
                  <span>{used}/{limit}</span>
                </div>
                <div className="quota-bar-bg">
                  <div className="quota-bar-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <Link href="/settings?tab=plan" className="upgrade-pro-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                Passer en Pro
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sb-footer">
        {/* Aide / Support */}
        <Link href="/help" className="ni" title="Besoin d'aide ?" style={{ borderTop: '1px solid var(--border)', borderRadius: 0, marginTop: 4 }}>
          <span className="sb-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </span>
          <span className="sb-label">Besoin d'aide ?</span>
        </Link>

        {/* Déconnexion */}
        <button onClick={handleLogout} className="ni" title="Se déconnecter" style={{ color: 'var(--red)', background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
          <span className="sb-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          <span className="sb-label">Se déconnecter</span>
        </button>
      </div>
    </aside>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CommunityFeed } from '@/components/community/CommunityFeed'
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { AiAssistantPanel } from '@/components/dashboard/AiAssistantPanel'
import { PopularGroups } from '@/components/dashboard/PopularGroups'
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel'
import { StoriesSection } from '@/components/dashboard/StoriesSection'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        setUser(data)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) return <div style={{ padding: '2rem', color: 'var(--t3)' }}>Chargement...</div>
  if (!user) return null

  const firstName = user.full_name?.split(' ')[0] || 'Ami'

  return (
    <div style={{ 
      display: 'flex', 
      gap: '32px', 
      padding: '0 32px 40px', 
      maxWidth: '1300px', 
      margin: '0 auto', 
      width: '100%' 
    }}>
      
      {/* COLUMN 1: FEED (Center) */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <StoriesSection />
        <div style={{ marginTop: '24px' }}>
          <CommunityFeed 
            initialPosts={[]} 
            userId={user.id} 
            userRole={user.role} 
          />
        </div>
      </div>

      {/* COLUMN 2: WIDGETS (Right - Sticky) */}
      <div style={{ 
        width: '350px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        flexShrink: 0,
        position: 'sticky',
        top: '0',
        height: 'fit-content'
      }} className="hidden xl:flex">
        <NotificationsPanel />
        <PopularGroups />
        <AiAssistantPanel firstName={firstName} />
        
        <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--accent-light)', border: '1px solid var(--b1)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent)', marginBottom: '8px' }}>CM Studio IA</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--t2)', lineHeight: 1.5 }}>
            Boostez votre engagement avec nos outils de génération assistée.
          </p>
        </div>
      </div>

      <WelcomeBanner firstName={firstName} />
      
      <style jsx>{`
        @media (max-width: 1280px) {
          .hidden.xl\:flex { display: none !important; }
        }
      `}</style>
    </div>
  )
}

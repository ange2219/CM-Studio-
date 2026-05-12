'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CommunityFeed } from '@/components/community/CommunityFeed'
import { WelcomeBanner } from '@/components/home/WelcomeBanner'
import { AiAssistantPanel } from '@/components/home/AiAssistantPanel'
import { PopularGroups } from '@/components/home/PopularGroups'
import { NotificationsPanel } from '@/components/home/NotificationsPanel'
import { StoriesSection } from '@/components/home/StoriesSection'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    document.title = 'Accueil — CM Studio'
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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text3)', fontSize: '0.9rem' }}>
       Chargement de votre espace...
    </div>
  )
  
  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text3)', fontSize: '0.9rem' }}>
       Erreur : Profil introuvable. Veuillez vous reconnecter.
    </div>
  )

  const firstName = user.full_name?.split(' ')[0] || 'Ulrich'

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 340px',
      gap: '32px', 
      padding: '24px 32px 40px', 
      maxWidth: '1400px', 
      margin: '0 auto', 
      width: '100%' 
    }}>
      
      {/* COLUMN 1: FEED (Exactly like mockup) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <StoriesSection />
        
        <CommunityFeed 
          initialPosts={[]} 
          currentUserId={user.id} 
          initialLikedIds={[]}
          userId={user.id} 
          userRole={user.role} 
        />
      </div>

      {/* COLUMN 2: WIDGETS (Right - Fixed like mockup) */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        position: 'sticky',
        top: '24px',
        height: 'fit-content'
      }} className="hidden xl:flex">
        <NotificationsPanel />
        <PopularGroups />
        <AiAssistantPanel firstName={firstName} />
        
        {/* Additional help/info card */}
        <div style={{ 
          padding: '20px', 
          borderRadius: '16px', 
          background: 'rgba(79, 70, 229, 0.05)', 
          border: '1px solid rgba(79, 70, 229, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#818CF8' }}>CM Studio IA</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text3)', lineHeight: 1.5 }}>
            Boostez votre engagement avec nos nouveaux outils de génération de visuels assistée.
          </p>
        </div>
      </div>

      {/* Hidden Banner or moved to header/welcome */}
      <WelcomeBanner firstName={firstName} />
    </div>
  )
}

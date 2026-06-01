'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/context/UserContext'
import { CommunityFeed } from '@/components/community/CommunityFeed'
import { WelcomeBanner } from '@/components/home/WelcomeBanner'
import { PopularGroups } from '@/components/home/PopularGroups'
import { NotificationsPanel } from '@/components/home/NotificationsPanel'
import { StoriesSection } from '@/components/home/StoriesSection'

export default function HomePage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [initialPosts, setInitialPosts] = useState<any[]>([])
  const [initialLikedIds, setInitialLikedIds] = useState<string[]>([])
  const supabase = createClient()

  const [isMobileHome, setIsMobileHome] = useState(false)

  useEffect(() => {
    const check = () => setIsMobileHome(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    document.title = 'Accueil — CM Studio'
    if (!user) return
    async function init() {
      // Profile already in context — fetch only posts and likes in parallel
      const [postsRes, likesRes] = await Promise.all([
        supabase.from('vw_community_posts').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('community_likes').select('post_id').eq('user_id', user!.id)
      ])
      if (postsRes.data) setInitialPosts(postsRes.data)
      if (likesRes.data) setInitialLikedIds(likesRes.data.map(l => l.post_id))
      setLoading(false)
    }
    init()
  }, [user])

  if (loading || !user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text3)', fontSize: '0.9rem' }}>
       Chargement de votre espace...
    </div>
  )

  const firstName = user.full_name?.split(' ')[0] || 'Ulrich'

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center',
      gap: isMobileHome ? '0' : '32px', 
      height: isMobileHome ? 'auto' : 'calc(100vh - 72px - 64px)',
      maxWidth: '1200px', 
      margin: '0 auto', 
      width: '100%',
      overflow: isMobileHome ? 'visible' : 'hidden'
    }}>
      
      {/* COLUMN 1: FEED — only this scrolls */}
      <div className="sb-scroll" style={{ 
        flex: 1, 
        maxWidth: '680px', 
        overflowY: 'auto', 
        padding: '24px 0 40px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <StoriesSection />
          
          <CommunityFeed 
            initialPosts={initialPosts} 
            currentUser={user} 
            initialLikedIds={initialLikedIds}
          />
        </div>
      </div>

      {/* COLUMN 2: WIDGETS — stays fixed, no scroll */}
      <div className="hidden xl:flex" style={{ 
        width: '340px', 
        flexShrink: 0, 
        flexDirection: 'column', 
        gap: '16px',
        padding: '24px 0 24px',
        overflow: 'hidden'
      }}>
        <NotificationsPanel />
        <PopularGroups />
      </div>

      <WelcomeBanner firstName={firstName} />
    </div>
  )
}

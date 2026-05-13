'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CommunityFeed } from '@/components/community/CommunityFeed'
import { WelcomeBanner } from '@/components/home/WelcomeBanner'
import { PopularGroups } from '@/components/home/PopularGroups'
import { NotificationsPanel } from '@/components/home/NotificationsPanel'
import { StoriesSection } from '@/components/home/StoriesSection'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [initialPosts, setInitialPosts] = useState<any[]>([])
  const [initialLikedIds, setInitialLikedIds] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    document.title = 'Accueil — CM Studio'
    async function init() {
      // 1. Get User
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        setUser(profile)

        // 2. Get Posts
        const { data: posts } = await supabase
          .from('vw_community_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        if (posts) {
          setInitialPosts(posts)
        }

        // 3. Get User Likes
        const { data: likes } = await supabase
          .from('community_likes')
          .select('post_id')
          .eq('user_id', authUser.id)
        
        if (likes) {
          setInitialLikedIds(likes.map(l => l.post_id))
        }
      }
      setLoading(false)
    }
    init()
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
      display: 'flex', 
      justifyContent: 'center',
      gap: '32px', 
      height: 'calc(100vh - 72px - 64px)',
      maxWidth: '1200px', 
      margin: '0 auto', 
      width: '100%',
      overflow: 'hidden'
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

      {/* COLUMN 2: WIDGETS — stays fixed, never scrolls with feed */}
      <div className="hidden xl:flex sb-scroll" style={{ 
        width: '340px', 
        flexShrink: 0, 
        flexDirection: 'column', 
        gap: '24px',
        padding: '24px 0 40px',
        overflowY: 'auto'
      }}>
        <NotificationsPanel />
        <PopularGroups />
      </div>

      <WelcomeBanner firstName={firstName} />
    </div>
  )
}

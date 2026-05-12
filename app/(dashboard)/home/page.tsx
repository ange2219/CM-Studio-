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
          .from('community_posts')
          .select(`
            *,
            users (full_name, avatar_url, plan),
            likes_count:community_likes(count),
            comments_count:community_comments(count)
          `)
          .order('created_at', { ascending: false })
          .limit(20)

        if (posts) {
          const formatted = posts.map(p => {
            const u = Array.isArray(p.users) ? p.users[0] : p.users
            return {
              ...p,
              full_name: u?.full_name || 'Utilisateur',
              avatar_url: u?.avatar_url,
              plan: u?.plan || 'Free',
              likes_count: p.likes_count?.[0]?.count || 0,
              comments_count: p.comments_count?.[0]?.count || 0
            }
          })
          setInitialPosts(formatted)
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
      display: 'grid', 
      gridTemplateColumns: '1fr 340px',
      gap: '32px', 
      padding: '24px 32px 40px', 
      maxWidth: '1400px', 
      margin: '0 auto', 
      width: '100%' 
    }}>
      
      {/* COLUMN 1: FEED */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <StoriesSection />
        
        <CommunityFeed 
          initialPosts={initialPosts} 
          currentUserId={user.id} 
          initialLikedIds={initialLikedIds}
          userId={user.id} 
          userRole={user.role} 
        />
      </div>

      {/* COLUMN 2: WIDGETS */}
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

      <WelcomeBanner firstName={firstName} />
    </div>
  )
}

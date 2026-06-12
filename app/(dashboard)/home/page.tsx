'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/context/UserContext'
import { HomeSkeleton } from '@/components/ui/Skeleton'
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
  const [followingCount, setFollowingCount] = useState<number | null>(null)
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
      // 1. Récupère la liste des utilisateurs suivis
      const { data: followsData } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user!.id)

      const followedIds = (followsData || []).map(f => f.following_id)
      setFollowingCount(followedIds.length)

      if (followedIds.length === 0) {
        // Pas d'abonnements → pas de posts à charger
        setLoading(false)
        return
      }

      // 2. Fetch uniquement les posts des personnes suivies + likes en parallèle
      const [postsRes, likesRes] = await Promise.all([
        supabase
          .from('vw_community_posts')
          .select('*')
          .in('user_id', followedIds)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('community_likes').select('post_id').eq('user_id', user!.id)
      ])

      if (postsRes.data) setInitialPosts(postsRes.data)
      if (likesRes.data) setInitialLikedIds(likesRes.data.map(l => l.post_id))
      setLoading(false)
    }
    init()
  }, [user])

  if (loading || !user) return <HomeSkeleton />

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

          {followingCount === 0 ? (
            /* ── Empty state : pas encore d'abonnements ── */
            <div style={{
              background: 'var(--card)',
              border: '1px dashed var(--b1)',
              borderRadius: '20px',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{ fontSize: '3rem', lineHeight: 1 }}>🌱</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--t1)', marginBottom: '8px' }}>
                  Votre fil est vide pour l'instant
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--t2)', maxWidth: '340px', lineHeight: 1.6, margin: '0 auto' }}>
                  Suivez des créateurs pour voir leurs publications apparaître ici en priorité.
                </p>
              </div>
              <a
                href="/community"
                style={{
                  marginTop: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--accent)',
                  color: '#fff',
                  padding: '11px 24px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'opacity .15s',
                }}
              >
                Découvrir des créateurs →
              </a>
            </div>
          ) : (
            <CommunityFeed
              initialPosts={initialPosts}
              currentUser={user}
              initialLikedIds={initialLikedIds}
            />
          )}
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

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

type Tab = 'general' | 'suivi'

export default function HomePage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('general')

  const [generalPosts, setGeneralPosts] = useState<any[]>([])
  const [suiviPosts, setSuiviPosts] = useState<any[]>([])
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [followingCount, setFollowingCount] = useState(0)

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
      // 1. Abonnements + posts généraux + likes en parallèle
      const [followsRes, generalRes, likesRes] = await Promise.all([
        supabase.from('user_follows').select('following_id').eq('follower_id', user!.id),
        supabase
          .from('vw_community_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('community_likes').select('post_id').eq('user_id', user!.id),
      ])

      const followedIds = (followsRes.data || []).map((f: any) => f.following_id)
      setFollowingCount(followedIds.length)
      if (generalRes.data) setGeneralPosts(generalRes.data)
      if (likesRes.data) setLikedIds(likesRes.data.map((l: any) => l.post_id))

      // 2. "Suivi" = sous-ensemble des posts généraux déjà chargés → 0 requête extra
      if (generalRes.data && followedIds.length > 0) {
        setSuiviPosts(generalRes.data.filter((p: any) => followedIds.includes(p.user_id)))
      }

      setLoading(false)
    }
    init()
  }, [user])

  if (loading || !user) return <HomeSkeleton />

  const firstName = user.full_name?.split(' ')[0] || 'Ulrich'
  const activePosts = activeTab === 'general' ? generalPosts : suiviPosts

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

      {/* ── COLONNE 1 : FIL ── */}
      <div className="sb-scroll" style={{
        flex: 1,
        maxWidth: '680px',
        overflowY: 'auto',
        padding: '24px 0 40px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <StoriesSection />

          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--b1)',
            gap: '4px',
          }}>
            {(['general', 'suivi'] as Tab[]).map(tab => {
              const labels: Record<Tab, string> = { general: 'Général', suivi: 'Suivi' }
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    padding: '10px 22px',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--accent)' : 'var(--t3)',
                    cursor: 'pointer',
                    transition: 'all .15s',
                    marginBottom: '-1px',
                  }}
                >
                  {labels[tab]}
                </button>
              )
            })}
          </div>

          {/* Contenu du fil */}
          {activeTab === 'suivi' && followingCount === 0 ? (
            /* Empty state — onglet Suivi sans abonnements */
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
                  Vous ne suivez personne encore
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--t2)', maxWidth: '340px', lineHeight: 1.6, margin: '0 auto' }}>
                  Abonnez-vous à des créateurs depuis leur profil ou rejoignez les groupes de discussion.
                </p>
              </div>
              <a
                href="/groups"
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
                }}
              >
                Rejoindre les groupes →
              </a>
            </div>
          ) : (
            <CommunityFeed
              initialPosts={activePosts}
              currentUser={user}
              initialLikedIds={likedIds}
            />
          )}
        </div>
      </div>

      {/* ── COLONNE 2 : WIDGETS ── */}
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

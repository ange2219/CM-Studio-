'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/context/UserContext'
import { HomeSkeleton } from '@/components/ui/Skeleton'
import { CommunityFeed } from '@/components/community/CommunityFeed'
import { WelcomeBanner } from '@/components/home/WelcomeBanner'

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

  useEffect(() => {
    document.title = 'Accueil — CM Studio'
    if (!user) return
    async function init() {
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

      if (generalRes.data && followedIds.length > 0) {
        setSuiviPosts(generalRes.data.filter((p: any) => followedIds.includes(p.user_id)))
      }

      setLoading(false)
    }
    init()
  }, [user])

  if (loading || !user) return <HomeSkeleton />

  const firstName = user.full_name?.split(' ')[0] || 'Utilisateur'
  const activePosts = activeTab === 'general' ? generalPosts : suiviPosts

  return (
    <div style={{
      width: '100%',
      padding: '20px 24px 40px 24px',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── Tabs Général / Suivi ── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--b1)',
        gap: '4px',
        marginBottom: '12px',
        justifyContent: 'center',
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

      {/* ── Feed ── */}
      {activeTab === 'suivi' && followingCount === 0 ? (
        <div style={{
          background: 'var(--card)',
          border: '1px dashed var(--b1)',
          borderRadius: '12px',
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
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'var(--accent)', color: '#fff',
              padding: '11px 24px', borderRadius: '12px',
              fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
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

      <WelcomeBanner firstName={firstName} />
    </div>
  )
}

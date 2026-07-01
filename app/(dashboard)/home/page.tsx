'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/context/UserContext'
import { HomeSkeleton } from '@/components/ui/Skeleton'
import { CommunityFeed } from '@/components/community/CommunityFeed'
import { WelcomeBanner } from '@/components/home/WelcomeBanner'
import { SquarePen } from 'lucide-react'
import { CreatePostModal } from '@/components/community/CreatePostModal'

type Tab = 'general' | 'suivi'

export default function HomePage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('general')

  const [generalPosts, setGeneralPosts] = useState<any[]>([])
  const [suiviPosts, setSuiviPosts] = useState<any[]>([])
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [followingCount, setFollowingCount] = useState(0)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handlePostCreated = (newPost: any) => {
    setGeneralPosts([newPost, ...generalPosts])
    if (activeTab === 'suivi') {
      setSuiviPosts([newPost, ...suiviPosts])
    }
  }

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
      maxWidth: '680px',
      margin: '0',
      padding: '20px 16px 40px 24px',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── CREATE POST TRIGGER ── */}
      <div 
        onClick={() => setIsCreateModalOpen(true)}
        style={{
        background: 'var(--card)',
        borderRadius: '30px',
        padding: '8px 16px 8px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        cursor: 'pointer',
        border: '1px solid var(--b1)',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          overflow: 'hidden', flexShrink: 0,
          background: 'rgba(var(--accent-rgb), 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)', fontWeight: 700
        }}>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>{firstName.slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <div style={{ flex: 1, color: 'var(--t3)', fontSize: '0.95rem' }}>
          Quoi de neuf ?
        </div>
        <button style={{
          background: 'var(--accent)',
          border: 'none',
          borderRadius: '50%',
          width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
          cursor: 'pointer'
        }}>
          <SquarePen size={18} />
        </button>
      </div>

      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        currentUser={user} 
        onPostCreated={handlePostCreated} 
      />

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
          hideCreatePost={true}
        />
      )}

      <WelcomeBanner firstName={firstName} />
    </div>
  )
}

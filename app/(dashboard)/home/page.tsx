'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/context/UserContext'
import { HomeSkeleton } from '@/components/ui/Skeleton'
import { CommunityFeed } from '@/components/community/CommunityFeed'
import { WelcomeBanner } from '@/components/home/WelcomeBanner'
import { SquarePen, UserPlus, Flame, Rocket, Code, Megaphone, User } from 'lucide-react'
import { CreatePostModal } from '@/components/community/CreatePostModal'
import Link from 'next/link'

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
    <div style={{ display: 'flex', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto', gap: '24px', padding: '20px 16px 40px 16px', alignItems: 'flex-start' }}>
      <style>{`
        @media (max-width: 900px) {
          .right-sidebar { display: none !important; }
        }
      `}</style>

      {/* ── Main Feed Column ── */}
      <div style={{
        flex: 1,
        maxWidth: '680px',
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
            <User size={22} strokeWidth={1.5} color="var(--accent)" />
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
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg)',
        paddingTop: '8px',
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

      {/* ── Right Sidebar Column (Desktop Only) ── */}
      <div className="right-sidebar" style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0, position: 'sticky', top: '20px' }}>
        
        {/* Carte 1: Suggestions à suivre */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--t1)' }}>
              <UserPlus size={18} color="var(--accent)" /> Suggestions à suivre
            </h3>
            <Link href="/network" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Voir tout</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { name: 'Daniel K.', desc: '12 abonnés en commun' },
              { name: 'Sarah M.', desc: '8 abonnés en commun' },
              { name: 'Moussa T.', desc: '5 abonnés en commun' }
            ].map(u => (
              <div key={u.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--s2, #e5e7eb)', border: '1px solid var(--b1, #e5e7eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={18} strokeWidth={1.5} color="var(--t3, #9ca3af)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--t1)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--t3)' }}>{u.desc}</div>
                  </div>
                </div>
                <button style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}>Suivre</button>
              </div>
            ))}
          </div>
        </div>

        {/* Carte 2: Groupes actifs */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--t1)' }}>
              <Flame size={18} color="var(--accent)" /> Groupes actifs
            </h3>
            <Link href="/groups" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Voir tout</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { name: 'Entrepreneurs 360', desc: '128 membres actifs', icon: <Rocket size={18} color="#fff" />, color: '#4F46E5' },
              { name: 'Développeurs CM', desc: '96 discussions', icon: <Code size={18} color="#059669" />, color: '#D1FAE5', iconCol: '#064E3B' },
              { name: 'Marketing & Growth', desc: '74 membres actifs', icon: <Megaphone size={18} color="#D97706" />, color: '#FEF3C7', iconCol: '#78350F' }
            ].map(g => (
              <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: g.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {g.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--t1)' }}>{g.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)' }}/> {g.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carte 3: En ligne maintenant */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--t1)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)' }}/> En ligne maintenant
            </h3>
            <Link href="/network" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Voir tout</Link>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['D', 'S', 'M', 'A', 'L'].map((u, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--s2, #e5e7eb)', border: '1px solid var(--b1, #e5e7eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={18} strokeWidth={1.5} color="var(--t3, #9ca3af)" />
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', border: '2px solid var(--card)' }} />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Users, ChevronRight, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CommunityFeed } from '@/components/community/CommunityFeed'

type Group = {
  id: string
  name: string
  description: string | null
  min_followers_required: number
  created_at: string
}

type Threshold = {
  threshold: number
  label: string
}

export default function GroupsClient({
  currentUser,
  allGroups,
  joinedGroupIds,
  followersCount,
  isPremiumOrBusiness,
  thresholds,
  initialLikedIds,
}: {
  currentUser: any
  allGroups: Group[]
  joinedGroupIds: string[]
  followersCount: number
  isPremiumOrBusiness: boolean
  thresholds: Threshold[]
  initialLikedIds: string[]
}) {
  const router = useRouter()
  const supabase = createClient()

  // Find unlocked groups
  const unlockedGroups = allGroups.filter(
    (g) => isPremiumOrBusiness || followersCount >= g.min_followers_required
  )

  const hasUnlockedAnyGroup = unlockedGroups.length > 0
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)

  // Auto-select first unlocked group on mount
  useEffect(() => {
    if (hasUnlockedAnyGroup && !selectedGroupId) {
      setSelectedGroupId(unlockedGroups[0].id)
    }
  }, [unlockedGroups, selectedGroupId, hasUnlockedAnyGroup])

  // Load posts for the selected group reactively
  useEffect(() => {
    if (!selectedGroupId) return
    async function loadGroupPosts() {
      setLoadingPosts(true)
      try {
        const { data, error } = await supabase
          .from('vw_community_posts')
          .select('*')
          .eq('group_id', selectedGroupId)
          .order('created_at', { ascending: false })
        if (!error && data) {
          setPosts(data)
        }
      } catch (err) {
        console.error('Failed to load group posts:', err)
      } finally {
        setLoadingPosts(false)
      }
    }
    loadGroupPosts()
  }, [selectedGroupId, supabase])

  // If user has unlocked absolutely zero groups (followers < 10 and not premium/business)
  if (!hasUnlockedAnyGroup) {
    const firstThreshold = thresholds[0]?.threshold || 10
    const firstGroupName = allGroups[0]?.name || 'Cercle des Initiés'
    const progressPercent = Math.min(100, Math.max(0, (followersCount / firstThreshold) * 100))

    return (
      <div style={{
        maxWidth: 600,
        margin: '3rem auto',
        padding: '2.5rem 2rem',
        background: 'var(--card)',
        border: '1px solid var(--b1)',
        borderRadius: 20,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}>
        {/* Padlock Icon with glow */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(var(--accent-rgb), 0.1)',
          border: '1px solid rgba(var(--accent-rgb), 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)',
          boxShadow: '0 0 20px rgba(var(--accent-rgb), 0.15)',
        }}>
          <Lock size={36} />
        </div>

        {/* Lock Screen Messages */}
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>
            Espaces Groupes Verrouillés
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--t2)', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto' }}>
            Cette fonctionnalité est réservée aux membres ayant atteint un certain niveau.
          </p>
        </div>

        {/* Subscriber Progress Bar */}
        <div style={{
          width: '100%',
          padding: '16px 20px',
          borderRadius: 14,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--b1)',
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--t3)', marginBottom: 8, fontWeight: 600 }}>
            <span>Progression abonnés</span>
            <span>{followersCount} / {firstThreshold}</span>
          </div>

          <div style={{
            width: '100%',
            height: 8,
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 999,
            overflow: 'hidden',
            marginBottom: 8,
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent) 0%, #10b981 100%)',
              borderRadius: 999,
              transition: 'width 0.4s ease',
            }} />
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--t2)', textAlign: 'left' }}>
            Plus que <strong>{firstThreshold - followersCount}</strong> {firstThreshold - followersCount > 1 ? 'abonnés' : 'abonné'} pour débloquer le groupe <strong>{firstGroupName}</strong>.
          </div>
        </div>

        {/* Upgrade / Pro Access Section */}
        <div style={{
          width: '100%',
          padding: '20px',
          borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
          border: '1px solid rgba(var(--accent-rgb), 0.2)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginTop: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <ShieldCheck size={16} />
            Ou débloquez immédiatement avec la version Pro
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--t2)', margin: 0, lineHeight: 1.5 }}>
            Accédez instantanément à tous les groupes de discussion exclusifs sans attendre d'atteindre les seuils d'abonnés.
          </p>
          <Link href="/settings?tab=billing" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'var(--accent)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 10,
            fontSize: '0.88rem',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.2s',
            marginTop: 6,
            boxShadow: '0 4px 14px rgba(var(--accent-rgb), 0.3)',
          }}>
            Passer à la version Pro
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    )
  }

  // Selected Group Details
  const activeGroup = allGroups.find((g) => g.id === selectedGroupId)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      maxWidth: 1200,
      margin: '0 auto',
      paddingBottom: '3rem',
    }}>
      {/* Header Summary */}
      <header>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
          Groupes de Discussion
        </h1>
        <p style={{ color: 'var(--t2)', fontSize: '0.92rem', margin: 0 }}>
          Échangez dans les salons exclusifs débloqués grâce à votre audience ou votre abonnement.
        </p>
      </header>

      {/* Main Workspace Layout */}
      <div style={{
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        flexWrap: 'wrap',
      }}>
        {/* Left Column: Group Selector Sidebar */}
        <aside style={{
          width: '100%',
          maxWidth: 300,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--t3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            paddingLeft: 4,
          }}>
            Vos Salons Débloqués
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allGroups.map((group) => {
              const isUnlocked = isPremiumOrBusiness || followersCount >= group.min_followers_required
              const isActive = selectedGroupId === group.id

              return (
                <button
                  key={group.id}
                  disabled={!isUnlocked}
                  onClick={() => setSelectedGroupId(group.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid',
                    borderColor: isActive
                      ? 'rgba(var(--accent-rgb), 0.25)'
                      : isUnlocked
                      ? 'var(--b1)'
                      : 'rgba(255,255,255,0.03)',
                    background: isActive
                      ? 'rgba(var(--accent-rgb), 0.08)'
                      : isUnlocked
                      ? 'var(--card)'
                      : 'rgba(255,255,255,0.01)',
                    color: isActive ? 'var(--accent)' : 'var(--t1)',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    textAlign: 'left',
                    opacity: isUnlocked ? 1 : 0.45,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#fff' : 'var(--t2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isUnlocked ? <MessageSquare size={14} /> : <Lock size={12} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {group.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: isActive ? 'rgba(var(--accent-rgb), 0.8)' : 'var(--t3)', marginTop: 2 }}>
                      {isUnlocked ? 'Accès autorisé' : `Requis: ${group.min_followers_required} abonnés`}
                    </div>
                  </div>

                  {isUnlocked && <ChevronRight size={14} style={{ color: isActive ? 'var(--accent)' : 'var(--t3)' }} />}
                </button>
              )
            })}
          </div>
        </aside>

        {/* Right Column: Group Feed Area */}
        <section style={{
          flex: 1,
          minWidth: 320,
          background: 'var(--card)',
          border: '1px solid var(--b1)',
          borderRadius: 12,
          padding: '16px',
          boxSizing: 'border-box',
        }}>
          {activeGroup ? (
            <div>
              {/* Group Discussion Header */}
              <div style={{
                paddingBottom: 12,
                borderBottom: '1px solid var(--b1)',
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                    # {activeGroup.name}
                  </h2>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'rgba(var(--accent-rgb), 0.1)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(var(--accent-rgb), 0.2)',
                  }}>
                    Seuil: {activeGroup.min_followers_required} abonnés
                  </span>
                </div>
                {activeGroup.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--t3)', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                    {activeGroup.description}
                  </p>
                )}
              </div>

              {/* Feed Renderer */}
              {loadingPosts ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--t2)', fontSize: '0.9rem' }}>
                  Chargement des discussions...
                </div>
              ) : (
                <CommunityFeed
                  initialPosts={posts}
                  currentUser={currentUser}
                  initialLikedIds={initialLikedIds}
                  groupId={selectedGroupId || undefined}
                />
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--t3)', fontSize: '0.92rem' }}>
              Sélectionnez un groupe à gauche pour rejoindre la discussion.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

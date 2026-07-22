'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, UserPlus, UserCheck, MessageCircle, Sparkles, Users, RefreshCw } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useToast } from '@/components/ui/Toast'

interface Member {
  id: string
  full_name: string
  username: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  is_following: boolean
  followers_count: number
}

export default function MembersPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'suggestions'>('all')
  const [followingLoading, setFollowingLoading] = useState<Record<string, boolean>>({})

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      params.set('tab', activeTab)

      const res = await fetch(`/api/members?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setMembers(data.members || [])
      } else {
        toast(data.error || 'Erreur lors du chargement des membres', 'error')
      }
    } catch (err) {
      console.error(err)
      toast('Impossible de charger les membres', 'error')
    } finally {
      setLoading(false)
    }
  }, [search, activeTab, toast])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers()
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchMembers])

  const handleToggleFollow = async (member: Member) => {
    const targetId = member.id
    setFollowingLoading(prev => ({ ...prev, [targetId]: true }))

    // Mise à jour optimiste du state local
    const newStatus = !member.is_following
    setMembers(prev =>
      prev.map(m =>
        m.id === targetId
          ? {
              ...m,
              is_following: newStatus,
              followers_count: newStatus ? m.followers_count + 1 : Math.max(0, m.followers_count - 1),
            }
          : m
      )
    )

    try {
      const res = await fetch('/api/members/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: targetId }),
      })
      const data = await res.json()

      if (!res.ok) {
        // Rollback en cas d'erreur
        setMembers(prev =>
          prev.map(m => (m.id === targetId ? { ...m, is_following: member.is_following, followers_count: member.followers_count } : m))
        )
        toast(data.error || 'Erreur lors de la mise à jour du suivi', 'error')
      } else {
        toast(data.is_following ? `Vous suivez maintenant ${member.full_name}` : `Vous ne suivez plus ${member.full_name}`, 'success')
      }
    } catch (err) {
      console.error(err)
      setMembers(prev =>
        prev.map(m => (m.id === targetId ? { ...m, is_following: member.is_following, followers_count: member.followers_count } : m))
      )
      toast('Erreur réseau lors de la mise à jour', 'error')
    } finally {
      setFollowingLoading(prev => ({ ...prev, [targetId]: false }))
    }
  }

  const handleSendMessage = (memberId: string) => {
    router.push(`/messages?user=${memberId}`)
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* ── EN-TÊTE DE PAGE ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={24} color="var(--accent)" />
            Membres & Réseau
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text3)', margin: '4px 0 0 0' }}>
            Découvrez la communauté, connectez-vous avec d'autres membres et développez votre réseau.
          </p>
        </div>

        <button
          onClick={fetchMembers}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 12px', borderRadius: '10px',
            background: 'var(--s2)', border: '1px solid var(--b1)',
            color: 'var(--text2)', fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s'
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* ── BARRE DE RECHERCHE ET ONGLETS ── */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--b1)',
        borderRadius: '12px', padding: '12px 16px',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px'
      }}>
        
        {/* Onglets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { key: 'all', label: 'Tous les membres' },
            { key: 'following', label: 'Mes abonnements' },
            { key: 'suggestions', label: 'Suggestions' },
          ].map(tab => {
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: '6px 14px', borderRadius: '8px',
                  border: 'none',
                  background: active ? 'var(--accent-light)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text2)',
                  fontSize: '0.84rem', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Champ de recherche */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1', maxWidth: '340px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input
            type="text"
            placeholder="Rechercher par nom, pseudo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', height: '36px',
              background: 'var(--s2)', border: '1px solid var(--b1)',
              borderRadius: '8px', padding: '0 12px 0 36px',
              color: 'var(--text)', fontSize: '0.85rem', outline: 'none'
            }}
          />
        </div>
      </div>

      {/* ── LISTE GRILLE DES MEMBRES ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{
              background: 'var(--card)', border: '1px solid var(--b1)',
              borderRadius: '12px', padding: '16px', height: '170px',
              display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--s2)' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ width: '60%', height: '14px', background: 'var(--s2)', borderRadius: '4px' }} />
                  <div style={{ width: '40%', height: '10px', background: 'var(--s2)', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--b1)',
          borderRadius: '12px', padding: '40px 20px',
          textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
        }}>
          <Users size={40} color="var(--text3)" />
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>Aucun membre trouvé</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text3)', maxWidth: '380px', margin: 0 }}>
            {search
              ? `Aucun résultat pour "${search}". Essayez de modifier votre recherche.`
              : activeTab === 'following'
              ? 'Vous ne suivez aucun membre pour le moment.'
              : 'Aucun membre suggéré pour le moment.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {members.map(member => {
            const isPending = followingLoading[member.id]
            return (
              <div
                key={member.id}
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--b1)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'border-color 0.15s, transform 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--b1)'
                }}
              >
                {/* Haut de carte : Avatar + Infos */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Link href={`/profile/${member.username || ''}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <UserAvatar
                      avatarUrl={member.avatar_url}
                      size={48}
                      accentBg
                      fallbackColor="var(--accent)"
                    />
                  </Link>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/profile/${member.username || ''}`}
                      style={{
                        textDecoration: 'none',
                        color: 'var(--text)',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {member.full_name}
                    </Link>

                    {member.username && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text3)', display: 'block' }}>
                        @{member.username}
                      </span>
                    )}

                    {member.bio && (
                      <p style={{
                        fontSize: '0.78rem',
                        color: 'var(--text2)',
                        margin: '4px 0 0 0',
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {member.bio}
                      </p>
                    )}

                    <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600, marginTop: '6px' }}>
                      {member.followers_count} {member.followers_count > 1 ? 'abonnés' : 'abonné'}
                    </div>
                  </div>
                </div>

                {/* Bas de carte : Boutons d'action */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--b1)' }}>
                  <button
                    onClick={() => handleToggleFollow(member)}
                    disabled={isPending}
                    style={{
                      flex: 1,
                      height: '34px',
                      borderRadius: '8px',
                      border: member.is_following ? '1px solid var(--b1)' : 'none',
                      background: member.is_following ? 'var(--s2)' : 'var(--accent)',
                      color: member.is_following ? 'var(--text)' : '#fff',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: isPending ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s',
                      opacity: isPending ? 0.7 : 1
                    }}
                  >
                    {member.is_following ? (
                      <>
                        <UserCheck size={15} color="var(--accent)" />
                        <span>Abonné</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={15} />
                        <span>Suivre</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleSendMessage(member.id)}
                    title="Envoyer un message"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: 'var(--s2)',
                      border: '1px solid var(--b1)',
                      color: 'var(--text2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      flexShrink: 0
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--accent)'
                      e.currentTarget.style.borderColor = 'var(--accent)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--text2)'
                      e.currentTarget.style.borderColor = 'var(--b1)'
                    }}
                  >
                    <MessageCircle size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style jsx global>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

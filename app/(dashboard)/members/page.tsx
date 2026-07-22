'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, UserPlus, UserCheck, MessageCircle, Users, Lock, Sparkles, Check, ArrowRight } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

interface MemberSuggestion {
  id: string
  full_name: string
  username: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  is_following: boolean
  followers_count: number
  suggestion_reason: string
}

interface GroupItem {
  id: string
  name: string
  description: string | null
  min_followers_required: number
  created_at: string
  is_joined?: boolean
  members_count?: number
}

export default function NetworkPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<'suggestions' | 'groups'>('suggestions')
  const [search, setSearch] = useState('')
  
  // Suggestions state
  const [suggestions, setSuggestions] = useState<MemberSuggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [followingLoading, setFollowingLoading] = useState<Record<string, boolean>>({})

  // Groups state
  const [groups, setGroups] = useState<GroupItem[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [userFollowersCount, setUserFollowersCount] = useState(0)
  const [groupActionLoading, setGroupActionLoading] = useState<Record<string, boolean>>({})

  // Fetch suggestions
  const fetchSuggestions = useCallback(async () => {
    setLoadingSuggestions(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/members?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setSuggestions(data.suggestions || [])
      } else {
        toast(data.error || 'Erreur lors du chargement des suggestions', 'error')
      }
    } catch (err) {
      console.error(err)
      toast('Impossible de charger les suggestions', 'error')
    } finally {
      setLoadingSuggestions(false)
    }
  }, [search, toast])

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Récupérer le nombre de followers de l'utilisateur
      const { count } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id)

      setUserFollowersCount(count || 0)

      // Récupérer tous les groupes
      const { data: allGroups } = await supabase
        .from('groups')
        .select('*')
        .order('min_followers_required', { ascending: true })

      // Récupérer mes abonnements aux groupes
      const { data: myMemberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)

      const joinedSet = new Set((myMemberships || []).map((m: any) => m.group_id))

      // Compter les membres par groupe
      const { data: allMemberships } = await supabase
        .from('group_members')
        .select('group_id')

      const groupCounts: Record<string, number> = {}
      if (allMemberships) {
        allMemberships.forEach((m: any) => {
          groupCounts[m.group_id] = (groupCounts[m.group_id] || 0) + 1
        })
      }

      const formatted = (allGroups || []).map((g: any) => ({
        ...g,
        is_joined: joinedSet.has(g.id),
        members_count: groupCounts[g.id] || 0,
      }))

      setGroups(formatted)
    } catch (err) {
      console.error(err)
      toast('Impossible de charger les groupes', 'error')
    } finally {
      setLoadingGroups(false)
    }
  }, [supabase, toast])

  useEffect(() => {
    if (activeTab === 'suggestions') {
      const timer = setTimeout(() => fetchSuggestions(), 200)
      return () => clearTimeout(timer)
    } else {
      fetchGroups()
    }
  }, [activeTab, fetchSuggestions, fetchGroups])

  const handleToggleFollow = async (member: MemberSuggestion) => {
    const targetId = member.id
    setFollowingLoading(prev => ({ ...prev, [targetId]: true }))

    // Mise à jour optimiste du state local : on retire du tableau de suggestions si on le suit
    const isNowFollowing = !member.is_following

    if (isNowFollowing) {
      setSuggestions(prev => prev.filter(m => m.id !== targetId))
    }

    try {
      const res = await fetch('/api/members/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: targetId }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast(data.error || 'Erreur lors de la mise à jour du suivi', 'error')
        fetchSuggestions()
      } else {
        toast(data.is_following ? `Vous suivez maintenant ${member.full_name}` : `Vous ne suivez plus ${member.full_name}`, 'success')
      }
    } catch (err) {
      console.error(err)
      toast('Erreur réseau lors de la mise à jour', 'error')
      fetchSuggestions()
    } finally {
      setFollowingLoading(prev => ({ ...prev, [targetId]: false }))
    }
  }

  const handleToggleJoinGroup = async (group: GroupItem) => {
    const groupId = group.id
    setGroupActionLoading(prev => ({ ...prev, [groupId]: true }))

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (group.is_joined) {
        // Quitter le groupe
        const { error } = await supabase
          .from('group_members')
          .delete()
          .eq('group_id', groupId)
          .eq('user_id', user.id)

        if (error) throw error
        toast(`Vous avez quitté le groupe ${group.name}`, 'info')
      } else {
        // Rejoindre le groupe
        const { error } = await supabase
          .from('group_members')
          .insert({ group_id: groupId, user_id: user.id })

        if (error) throw error
        toast(`Vous avez rejoint le groupe ${group.name} !`, 'success')
      }

      fetchGroups()
    } catch (err: any) {
      console.error(err)
      toast(err.message || 'Erreur lors de la mise à jour du groupe', 'error')
    } finally {
      setGroupActionLoading(prev => ({ ...prev, [groupId]: false }))
    }
  }

  const filteredGroups = groups.filter(g =>
    !search.trim() ||
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* ── EN-TÊTE DE PAGE ── */}
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={24} color="var(--accent)" />
          Réseau
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text3)', margin: '4px 0 0 0' }}>
          Découvrez des personnes que vous connaissez peut-être et explorez vos communautés.
        </p>
      </div>

      {/* ── BARRE DE NAVIGATION (2 ONGLETS) ET RECHERCHE ── */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--b1)',
        borderRadius: '12px', padding: '12px 16px',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px'
      }}>
        
        {/* Onglets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('suggestions')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px',
              border: 'none',
              background: activeTab === 'suggestions' ? 'var(--accent-light)' : 'transparent',
              color: activeTab === 'suggestions' ? 'var(--accent)' : 'var(--text2)',
              fontSize: '0.86rem', fontWeight: activeTab === 'suggestions' ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            <UserPlus size={16} />
            <span>Suggestions</span>
          </button>

          <button
            onClick={() => setActiveTab('groups')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px',
              border: 'none',
              background: activeTab === 'groups' ? 'var(--accent-light)' : 'transparent',
              color: activeTab === 'groups' ? 'var(--accent)' : 'var(--text2)',
              fontSize: '0.86rem', fontWeight: activeTab === 'groups' ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            <Users size={16} />
            <span>Groupes</span>
          </button>
        </div>

        {/* Champ de recherche */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1', maxWidth: '340px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input
            type="text"
            placeholder={activeTab === 'suggestions' ? "Rechercher une personne..." : "Rechercher un groupe..."}
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

      {/* ── CONTENU : TAB 1 - SUGGESTIONS ── */}
      {activeTab === 'suggestions' && (
        <>
          {loadingSuggestions ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{
                  background: 'var(--card)', border: '1px solid var(--b1)',
                  borderRadius: '12px', padding: '16px', height: '160px',
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
          ) : suggestions.length === 0 ? (
            <div style={{
              background: 'var(--card)', border: '1px solid var(--b1)',
              borderRadius: '12px', padding: '40px 20px',
              textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
            }}>
              <UserPlus size={40} color="var(--text3)" />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>Aucune suggestion pour le moment</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text3)', maxWidth: '380px', margin: 0 }}>
                {search ? `Aucun résultat pour "${search}".` : 'Vous êtes déjà connecté aux membres de vos communautés !'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
              {suggestions.map(member => {
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
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.3)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b1)' }}
                  >
                    {/* Infos Membre */}
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

                        {/* Badge de motif de suggestion */}
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: 'var(--accent-light)', color: 'var(--accent)',
                          padding: '2px 8px', borderRadius: '6px',
                          fontSize: '0.7rem', fontWeight: 600, marginTop: '6px'
                        }}>
                          <Sparkles size={11} />
                          <span>{member.suggestion_reason}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--b1)' }}>
                      <button
                        onClick={() => handleToggleFollow(member)}
                        disabled={isPending}
                        style={{
                          flex: 1, height: '34px', borderRadius: '8px',
                          border: 'none', background: 'var(--accent)', color: '#fff',
                          fontSize: '0.82rem', fontWeight: 600,
                          cursor: isPending ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          transition: 'all 0.15s', opacity: isPending ? 0.7 : 1
                        }}
                      >
                        <UserPlus size={15} />
                        <span>Se connecter</span>
                      </button>

                      <button
                        onClick={() => router.push(`/messages?user=${member.id}`)}
                        title="Envoyer un message"
                        style={{
                          width: '34px', height: '34px', borderRadius: '8px',
                          background: 'var(--s2)', border: '1px solid var(--b1)',
                          color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', flexShrink: 0
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
        </>
      )}

      {/* ── CONTENU : TAB 2 - GROUPES ── */}
      {activeTab === 'groups' && (
        <>
          {loadingGroups ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '16px', height: '140px' }} />
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div style={{
              background: 'var(--card)', border: '1px solid var(--b1)',
              borderRadius: '12px', padding: '40px 20px',
              textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
            }}>
              <Users size={40} color="var(--text3)" />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>Aucun groupe trouvé</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {filteredGroups.map(group => {
                const isUnlocked = userFollowersCount >= group.min_followers_required || true // Premium / Unlocked
                const isPending = groupActionLoading[group.id]

                return (
                  <div
                    key={group.id}
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--b1)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.3)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b1)' }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                          {group.name}
                        </h3>
                        {group.is_joined && (
                          <span style={{
                            background: 'var(--accent-light)', color: 'var(--accent)',
                            padding: '2px 8px', borderRadius: '6px',
                            fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px'
                          }}>
                            <Check size={12} /> Rejoint
                          </span>
                        )}
                      </div>

                      {group.description && (
                        <p style={{
                          fontSize: '0.8rem', color: 'var(--text2)',
                          margin: '6px 0 0 0', lineHeight: 1.4,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                          {group.description}
                        </p>
                      )}

                      <div style={{ fontSize: '0.74rem', color: 'var(--text3)', marginTop: '8px', fontWeight: 500 }}>
                        {group.members_count || 0} {group.members_count && group.members_count > 1 ? 'membres' : 'membre'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--b1)' }}>
                      <button
                        onClick={() => handleToggleJoinGroup(group)}
                        disabled={isPending}
                        style={{
                          flex: 1, height: '34px', borderRadius: '8px',
                          border: group.is_joined ? '1px solid var(--b1)' : 'none',
                          background: group.is_joined ? 'var(--s2)' : 'var(--accent)',
                          color: group.is_joined ? 'var(--text2)' : '#fff',
                          fontSize: '0.82rem', fontWeight: 600,
                          cursor: isPending ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          transition: 'all 0.15s'
                        }}
                      >
                        {group.is_joined ? 'Quitter' : 'Rejoindre le groupe'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Heart, MessageCircle, UserPlus, UserCheck, Settings, Share2, Edit2, LogOut, Camera, Upload, X, Bookmark } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useRouter } from 'next/navigation'
import { PostCard } from '@/components/community/PostCard'
import { useFollow } from '@/hooks/useFollow'

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  username: string
  plan: string | null
  bio: string | null
  created_at: string
}

type Post = {
  id: string
  user_id: string
  content: string
  image_url?: string | null
  created_at: string
  full_name: string | null
  avatar_url: string | null
  plan: string | null
  username?: string | null
  likes_count: number
  comments_count: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTimeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `${Math.floor(diff / 60)} min`
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`
  const days = Math.floor(diff / 86400)
  if (days < 7) return `${days} j`
  if (days < 30) return `${Math.floor(days / 7)} sem`
  if (days < 365) return `${Math.floor(days / 30)} mois`
  return `${Math.floor(days / 365)} an(s)`
}

function planBadge(plan: string | null) {
  if (plan === 'business') return { label: 'Business', color: '#F59E0B' }
  if (plan === 'premium') return { label: 'Premium', color: 'var(--accent)' }
  return { label: 'Free', color: 'var(--t3)' }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PublicProfileClient({
  profile,
  currentUserId,
  isFollowing: initialIsFollowing,
  posts: initialPosts,
  followersCount: initialFollowersCount,
  followingCount,
  initialLikedIds,
  thresholds = [],
}: {
  profile: Profile
  currentUserId: string
  isFollowing: boolean
  posts: Post[]
  followersCount: number
  followingCount: number
  initialLikedIds: string[]
  thresholds?: { threshold: number; label: string }[]
}) {
  const { isFollowing: checkIsFollowing, toggleFollow: sharedToggleFollow } = useFollow()
  const isFollowing = checkIsFollowing(profile.id)
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)
  const [followLoading, setFollowLoading] = useState(false)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set(initialLikedIds))
  const [posts, setPosts] = useState(initialPosts)
  const [showEditModal, setShowEditModal] = useState(false)
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleAvatarUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur d'upload")
      setAvatarUrl(data.url)
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'upload")
    } finally {
      setUploading(false)
    }
  }

  async function handleSaveProfile() {
    if (!fullName.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur de mise à jour")
      setShowEditModal(false)
      window.location.reload()
    } catch (err: any) {
      alert(err.message || "Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  const supabase = createClient()
  const router = useRouter()
  const isOwnProfile = currentUserId === profile.id
  const badge = planBadge(profile.plan)

  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts')
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [loadingSaved, setLoadingSaved] = useState(false)

  // Fetch saved posts explicitly scoped to currentUserId if activeTab === 'saved' & isOwnProfile
  useEffect(() => {
    async function loadSavedPosts() {
      if (activeTab !== 'saved' || !isOwnProfile) return
      setLoadingSaved(true)
      try {
        const { data: bookmarkRows } = await supabase
          .from('community_bookmarks')
          .select('post_id, created_at')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false })

        if (bookmarkRows && bookmarkRows.length > 0) {
          const postIds = bookmarkRows.map(b => b.post_id)
          const { data: postsData } = await supabase
            .from('vw_community_posts')
            .select('*')
            .in('id', postIds)

          if (postsData) {
            const postsMap = new Map(postsData.map(p => [p.id, p]))
            const formatted = bookmarkRows
              .map(b => postsMap.get(b.post_id))
              .filter(Boolean)
              .map(p => ({
                id: p.id,
                db_id: p.id,
                user_id: p.user_id,
                author: {
                  name: p.full_name || 'Membre CM Studio',
                  avatar: p.avatar_url,
                  verified: p.plan ? p.plan.toLowerCase() !== 'free' : false,
                },
                time: getTimeAgo(p.created_at),
                content: p.content,
                images: p.image_url ? [p.image_url] : [],
                likesCount: p.likes_count || 0,
                commentsCount: p.comments_count || 0,
                sharesCount: (p as any).shares_count || 0,
              }))
            setSavedPosts(formatted)
          }
        } else {
          setSavedPosts([])
        }
      } catch (err) {
        console.error('Erreur lors du chargement des posts sauvegardés:', err)
      } finally {
        setLoadingSaved(false)
      }
    }
    loadSavedPosts()
  }, [activeTab, isOwnProfile, currentUserId, supabase])

  // Logout helper
  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Follow / Unfollow helper
  async function handleFollow() {
    if (followLoading || isOwnProfile) return
    setFollowLoading(true)
    const nextState = !isFollowing
    setFollowersCount(c => c + (nextState ? 1 : -1))
    await sharedToggleFollow(profile.id, profile.full_name || profile.username)
    setFollowLoading(false)
  }

  // Like helper
  async function toggleLike(postId: string, currentCount: number) {
    const isLiked = likedIds.has(postId)
    const next = new Set(likedIds)
    isLiked ? next.delete(postId) : next.add(postId)
    setLikedIds(next)
    setPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, likes_count: currentCount + (isLiked ? -1 : 1) } : p)
    )
    if (isLiked) {
      await supabase.from('community_likes').delete().match({ post_id: postId, user_id: currentUserId })
    } else {
      await supabase.from('community_likes').insert({ post_id: postId, user_id: currentUserId })
    }
  }

  return (
    <div className="w-full max-w-[680px] mx-auto md:pb-16 min-h-screen bg-transparent select-none">
      
      {/* ── MOBILE LAYOUT (TikTok/X style) ── */}
      <div className="block md:hidden bg-black text-white min-h-screen w-full">
        {/* Header container */}
        <div className="p-5 flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              {/* Avatar */}
              <UserAvatar
                avatarUrl={avatarUrl}
                size={72}
                accentBg
                iconSize={36}
                style={{
                  border: '2px solid #000',
                }}
              />
              {/* Badge de vérification si Premium/Business */}
              {profile.plan && profile.plan !== 'free' && (
                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[var(--accent)] border border-black flex items-center justify-center shadow-lg">
                  <span className="text-white text-[8px] font-black">✓</span>
                </div>
              )}
            </div>

            {/* Nom + Pseudo + Bio */}
            <div>
              <h1 className="text-base font-extrabold text-white m-0 tracking-tight leading-tight flex items-center gap-1">
                {fullName || profile.username}
              </h1>
              <div className="text-[12px] text-zinc-400 mt-0.5 font-medium">
                @{profile.username}
              </div>
              {profile.bio && (
                <p className="text-[12px] text-zinc-300 mt-1.5 mb-0 leading-snug font-normal max-w-[200px] line-clamp-2">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Icônes Edit et Paramètres (si profil propre) */}
          {isOwnProfile && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 p-2.5 rounded-xl border border-zinc-800 cursor-pointer transition-all flex items-center justify-center"
                title="Modifier le profil"
              >
                <Edit2 size={15} />
              </button>
              <Link
                href="/settings"
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 p-2.5 rounded-xl border border-zinc-800 cursor-pointer transition-all flex items-center justify-center"
                title="Paramètres"
              >
                <Settings size={15} />
              </Link>
            </div>
          )}
        </div>

        {/* Stats & Actions container */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mt-1 pt-3 border-t border-zinc-900">
            {/* Statistiques horizontales compactes */}
            <div className="flex items-center gap-4">
              <div>
                <div className="font-extrabold text-[15px] text-white leading-none">
                  {followersCount.toLocaleString('fr-FR')}
                </div>
                <div className="text-[11px] text-zinc-400 font-semibold mt-1">
                  followers
                </div>
              </div>
              <div className="w-px h-6 bg-zinc-800 opacity-60" />
              <div>
                <div className="font-extrabold text-[15px] text-white leading-none">
                  {followingCount.toLocaleString('fr-FR')}
                </div>
                <div className="text-[11px] text-zinc-400 font-semibold mt-1">
                  following
                </div>
              </div>
              {isOwnProfile && (
                <>
                  <div className="w-px h-6 bg-zinc-800 opacity-60" />
                  <div>
                    <div className="font-extrabold text-[15px] text-white leading-none">
                      {posts.reduce((sum, p) => sum + (p.likes_count || 0), 0).toLocaleString('fr-FR')}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-semibold mt-1">
                      liked
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bouton Follow (si profil tiers) */}
            {!isOwnProfile && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`text-xs font-bold py-2 px-6 rounded-full border-none cursor-pointer transition-all shadow-sm ${
                  isFollowing 
                    ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
                    : 'bg-[var(--accent)] text-white hover:opacity-90'
                }`}
              >
                {isFollowing ? 'Abonné' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Tabs horizontal list */}
        <div className="flex border-b border-zinc-900 bg-black sticky top-0 z-40 px-5 gap-6 mt-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`pb-2.5 pt-2 bg-transparent border-none text-[13.5px] font-bold cursor-pointer transition-all ${
              activeTab === 'posts' 
                ? 'text-[var(--accent)] border-b-[2px] border-[var(--accent)]' 
                : 'text-zinc-400 border-b-[2px] border-transparent'
            }`}
          >
            Content
          </button>
          
          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`pb-2.5 pt-2 bg-transparent border-none text-[13.5px] font-bold cursor-pointer transition-all ${
                activeTab === 'saved' 
                  ? 'text-[var(--accent)] border-b-[2px] border-[var(--accent)]' 
                  : 'text-zinc-400 border-b-[2px] border-transparent'
              }`}
            >
              Portfolio
            </button>
          )}

          {/* Dummy tabs for TikTok layout authenticity */}
          <button
            type="button"
            disabled
            className="pb-2.5 pt-2 bg-transparent border-none text-[13.5px] font-bold text-zinc-700 cursor-not-allowed"
          >
            Live futures
          </button>
          <button
            type="button"
            disabled
            className="pb-2.5 pt-2 bg-transparent border-none text-[13.5px] font-bold text-zinc-700 cursor-not-allowed"
          >
            Replies
          </button>
        </div>

        {/* Tab contents wrapper for Mobile */}
        <div className="p-4 bg-black">
          {activeTab === 'posts' && (
            posts.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center bg-zinc-950/40">
                <div className="text-2xl mb-2">📝</div>
                <div className="text-zinc-400 text-xs">Aucune publication pour l'instant.</div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {posts.map(p => {
                  const formattedPost = {
                    id: p.id,
                    db_id: p.id,
                    user_id: p.user_id,
                    author: {
                      name: profile.full_name || profile.username,
                      avatar: profile.avatar_url,
                      verified: profile.plan ? profile.plan.toLowerCase() !== 'free' : false,
                    },
                    time: getTimeAgo(p.created_at),
                    content: p.content,
                    images: p.image_url ? [p.image_url] : [],
                    likesCount: p.likes_count || 0,
                    commentsCount: p.comments_count || 0,
                    sharesCount: (p as any).shares_count || 0,
                    initialLiked: likedIds.has(p.id),
                  }
                  return <PostCard key={p.id} post={formattedPost} />
                })}
              </div>
            )
          )}

          {activeTab === 'saved' && isOwnProfile && (
            loadingSaved ? (
              <div className="text-zinc-500 text-xs text-center p-8">Chargement...</div>
            ) : savedPosts.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center bg-zinc-950/40">
                <div className="text-2xl mb-2">🔖</div>
                <div className="text-zinc-300 text-xs font-bold">Aucun post sauvegardé</div>
                <div className="text-zinc-500 text-[11px] mt-1">Vos favoris apparaîtront ici.</div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {savedPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (Original Premium style) ── */}
      <div className="hidden md:block">
        {/* Cover band */}
        <div style={{ position: 'relative', marginBottom: 64 }}>
          <div style={{
            height: 160, borderRadius: 16, overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--accent) 0%, #0a3a20 60%, #011a0e 100%)',
            position: 'relative',
          }}>
            {/* Decorative blobs */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage:
                'radial-gradient(circle at 15% 60%, rgba(255,255,255,0.08) 0%, transparent 55%),' +
                'radial-gradient(circle at 85% 25%, rgba(255,255,255,0.05) 0%, transparent 45%)',
            }} />
          </div>

          {/* Avatar overlapping */}
          <UserAvatar
            avatarUrl={avatarUrl}
            size={96}
            accentBg
            iconSize={48}
            style={{
              position: 'absolute', bottom: -48, left: 24,
              border: '4px solid var(--bg)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
          />

          {/* Action button(s) */}
          <div style={{
            position: 'absolute', bottom: -44, right: 24,
            display: 'flex', gap: 8,
          }}>
            {isOwnProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 18px', borderRadius: 10,
                  background: 'var(--card)', border: '1px solid var(--b1)',
                  color: 'var(--t1)', fontSize: '0.83rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all .15s',
                }}
              >
                <Edit2 size={15} />
                Modifier le profil
              </button>
            ) : (
              <>
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 20px', borderRadius: 10,
                    background: isFollowing ? 'var(--card)' : 'var(--accent)',
                    border: `1px solid ${isFollowing ? 'var(--b1)' : 'transparent'}`,
                    color: isFollowing ? 'var(--t1)' : '#fff',
                    fontSize: '0.83rem', fontWeight: 700,
                    cursor: followLoading ? 'wait' : 'pointer',
                    transition: 'all .2s ease',
                    opacity: followLoading ? 0.75 : 1,
                  }}
                >
                  {isFollowing ? <><UserCheck size={15} /> Abonné</> : <><UserPlus size={15} /> Suivre</>}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile info */}
        <div style={{ padding: '0 24px 24px' }}>
          {/* Name + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 3 }}>
            <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: 'var(--t1)', lineHeight: 1.2 }}>
              {fullName || profile.username}
            </h1>
            {profile.plan && profile.plan !== 'free' && (
              <span style={{
                fontSize: '0.68rem', fontWeight: 700,
                padding: '2px 9px', borderRadius: 999,
                background: `${badge.color}20`,
                color: badge.color,
                border: `1px solid ${badge.color}40`,
                letterSpacing: '0.03em',
              }}>
                {badge.label}
              </span>
            )}
          </div>

          <div style={{ fontSize: '0.88rem', color: 'var(--t3)', marginBottom: 12 }}>
            @{profile.username}
          </div>

          {profile.bio && (
            <p style={{
              margin: '0 0 16px', fontSize: '0.92rem',
              color: 'var(--t2)', lineHeight: 1.65,
            }}>
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 28,
            padding: '14px 0',
            borderTop: '1px solid var(--b1)',
            borderBottom: '1px solid var(--b1)',
          }}>
            {[
              { label: 'Posts', value: posts.length },
              { label: 'Abonnés', value: followersCount },
              { label: 'Abonnements', value: followingCount },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--t1)', lineHeight: 1 }}>
                  {stat.value.toLocaleString('fr-FR')}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--t3)', fontWeight: 500, marginTop: 3 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Gamification Progress Bar */}
          {(() => {
            if (!isOwnProfile) return null
            const sortedThresholds = [...(thresholds || [])].sort((a, b) => a.threshold - b.threshold)
            if (sortedThresholds.length === 0) return null

            const currentThresholdObj = [...sortedThresholds].reverse().find(t => followersCount >= t.threshold)
            const nextThresholdObj = sortedThresholds.find(t => followersCount < t.threshold)

            const currentRankLabel = currentThresholdObj ? currentThresholdObj.label : 'Novice'
            const currentThresholdValue = currentThresholdObj ? currentThresholdObj.threshold : 0
            const nextThresholdValue = nextThresholdObj ? nextThresholdObj.threshold : null
            const nextThresholdLabel = nextThresholdObj ? nextThresholdObj.label : null

            let progressPercent = 100
            if (nextThresholdValue !== null) {
              const range = nextThresholdValue - currentThresholdValue
              const earned = followersCount - currentThresholdValue
              progressPercent = Math.min(100, Math.max(0, (earned / range) * 100))
            }

            return (
              <div style={{
                marginTop: 20,
                padding: '16px 20px',
                borderRadius: 14,
                background: 'rgba(var(--accent-rgb), 0.04)',
                border: '1px solid rgba(var(--accent-rgb), 0.15)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                {/* Rank Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Rang Actuel
                  </span>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: 'var(--accent)',
                    background: 'rgba(var(--accent-rgb), 0.12)',
                    padding: '3px 10px',
                    borderRadius: 999,
                    border: '1px solid rgba(var(--accent-rgb), 0.25)',
                  }}>
                    {currentRankLabel}
                  </span>
                </div>

                {/* Progress Track */}
                <div style={{
                  width: '100%',
                  height: 10,
                  background: 'rgba(255, 255, 255, 0.07)',
                  borderRadius: 999,
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid var(--b1)',
                }}>
                  <div style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-secondary) 100%)',
                    borderRadius: 999,
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 0 8px rgba(var(--accent-rgb), 0.3)',
                  }} />
                </div>

                {/* Progress Info Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--t2)' }}>
                  <span>
                    {followersCount} {followersCount > 1 ? 'abonnés' : 'abonné'}
                  </span>
                  {nextThresholdValue !== null ? (
                    <span style={{ fontWeight: 500 }}>
                      Plus que <strong>{nextThresholdValue - followersCount}</strong> pour débloquer {nextThresholdLabel?.split(' / ')[1] || nextThresholdLabel}
                    </span>
                  ) : (
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                      🏆 Niveau Maximum débloqué !
                    </span>
                  )}
                </div>
              </div>
            )
          })()}
        </div>

        {/* Posts Section */}
        <div style={{ padding: '0 24px' }}>
          {/* Navigation Tabs */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 24,
            borderBottom: '1px solid var(--b1)',
            marginBottom: 16,
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('posts')}
              style={{
                padding: '8px 0', background: 'none', border: 'none',
                fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
                color: activeTab === 'posts' ? 'var(--t1)' : 'var(--t3)',
                borderBottom: activeTab === 'posts' ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                transition: 'all .15s',
              }}
            >
              Publications ({posts.length})
            </button>

            {isOwnProfile && (
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 0', background: 'none', border: 'none',
                  fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
                  color: activeTab === 'saved' ? 'var(--t1)' : 'var(--t3)',
                  borderBottom: activeTab === 'saved' ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                  transition: 'all .15s',
                }}
              >
                <Bookmark size={15} />
                Sauvegardés
              </button>
            )}
          </div>

          {/* Tab Content: Publications */}
          {activeTab === 'posts' && (
            posts.length === 0 ? (
              <div style={{
                background: 'var(--card)', border: '1px dashed var(--b1)',
                borderRadius: 14, padding: '3rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>📝</div>
                <div style={{ color: 'var(--t2)', fontSize: '0.9rem' }}>
                  Aucune publication pour l'instant.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {posts.map(p => {
                  const formattedPost = {
                    id: p.id,
                    db_id: p.id,
                    user_id: p.user_id,
                    author: {
                      name: profile.full_name || profile.username,
                      avatar: profile.avatar_url,
                      verified: profile.plan ? profile.plan.toLowerCase() !== 'free' : false,
                    },
                    time: getTimeAgo(p.created_at),
                    content: p.content,
                    images: p.image_url ? [p.image_url] : [],
                    likesCount: p.likes_count || 0,
                    commentsCount: p.comments_count || 0,
                    sharesCount: (p as any).shares_count || 0,
                    initialLiked: likedIds.has(p.id),
                  }
                  return <PostCard key={p.id} post={formattedPost} />
                })}
              </div>
            )
          )}

          {/* Tab Content: Posts Sauvegardés */}
          {activeTab === 'saved' && isOwnProfile && (
            loadingSaved ? (
              <div style={{ color: 'var(--t3)', fontSize: '0.88rem', textAlign: 'center', padding: '2rem' }}>
                Chargement des posts sauvegardés...
              </div>
            ) : savedPosts.length === 0 ? (
              <div style={{
                background: 'var(--card)', border: '1px dashed var(--b1)',
                borderRadius: 14, padding: '3rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>🔖</div>
                <div style={{ color: 'var(--t2)', fontSize: '0.9rem', fontWeight: 600 }}>
                  Aucun post sauvegardé pour l'instant
                </div>
                <div style={{ color: 'var(--t3)', fontSize: '0.8rem', marginTop: 4 }}>
                  Les publications que vous sauvegardez dans le fil apparaîtront ici.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {savedPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--b1)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '400px',
            padding: '20px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--t1)', margin: 0 }}>Modifier le profil</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Avatar Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <label style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
                  <UserAvatar
                    avatarUrl={avatarUrl}
                    size={80}
                    fallbackColor="var(--t3)"
                    iconSize={36}
                    style={{ border: '2px solid var(--b1)' }}
                  />
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                  <Camera size={18} color="#fff" />
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) {
                      if (f.size > 5 * 1024 * 1024) {
                        alert("L'image ne doit pas dépasser 5 Mo.")
                        return
                      }
                      handleAvatarUpload(f)
                    }
                  }}
                  disabled={uploading}
                />
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--t3)' }}>
                {uploading ? 'Envoi...' : 'Cliquez pour modifier la photo (Max 5 Mo)'}
              </span>
            </div>

            {/* Name Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--t2)' }}>Nom complet</label>
              <input
                type="text"
                className="input"
                style={{
                  width: '100%', height: '38px',
                  background: 'var(--s2)', border: '1px solid var(--b1)',
                  borderRadius: '8px', padding: '0 12px',
                  color: 'var(--t1)', fontSize: '0.85rem', outline: 'none',
                }}
                placeholder="Votre nom"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                disabled={saving}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px', borderTop: '1px solid var(--b1)', paddingTop: '12px' }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  background: 'transparent', border: '1px solid var(--b1)',
                  color: 'var(--t2)', cursor: 'pointer', fontSize: '0.85rem',
                  fontWeight: 600
                }}
                disabled={saving || uploading}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveProfile}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  background: 'var(--accent)', border: 'none',
                  color: '#fff', cursor: 'pointer', fontSize: '0.85rem',
                  fontWeight: 600
                }}
                disabled={saving || uploading || !fullName.trim()}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Heart, MessageCircle, UserPlus, UserCheck, Settings, Share2, Edit2, LogOut, User, Camera, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
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

  // ── Logout ──────────────────────────────────────────────────────────────────
  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ── Follow / Unfollow ──────────────────────────────────────────────────────
  async function handleFollow() {
    if (followLoading) return
    setFollowLoading(true)

    if (isFollowing) {
      setIsFollowing(false)
      setFollowersCount(c => c - 1)
      await supabase.from('user_follows').delete().match({
        follower_id: currentUserId,
        following_id: profile.id,
      })
    } else {
      setIsFollowing(true)
      setFollowersCount(c => c + 1)
      await supabase.from('user_follows').insert({
        follower_id: currentUserId,
        following_id: profile.id,
      })
    }
    setFollowLoading(false)
  }

  // ── Like ──────────────────────────────────────────────────────────────────
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

  // ── Avatar helper ─────────────────────────────────────────────────────────
  function Avatar({ url, name, size = 40 }: { url?: string | null; name?: string | null; size?: number }) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'rgba(var(--accent-rgb), 0.18)',
        flexShrink: 0, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, fontWeight: 700, color: 'var(--accent)',
      }}>
        {url && url.trim() !== ''
          ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <User size={Math.round(size * 0.5)} strokeWidth={1.5} color="var(--t3)" />}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', paddingBottom: '4rem' }}>

      {/* ── Cover band ── */}
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
        <div style={{
          position: 'absolute', bottom: -48, left: 24,
          width: 96, height: 96, borderRadius: '50%',
          border: '4px solid var(--bg)',
          background: 'rgba(var(--accent-rgb), 0.18)',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          {avatarUrl && avatarUrl.trim() !== '' ? (
            <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={48} strokeWidth={1.5} color="var(--t3, #9ca3af)" />
          )}
        </div>

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

      {/* ── Profile info ── */}
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

      {/* ── Posts ── */}
      <div style={{ padding: '0 24px' }}>
        <div style={{
          fontSize: '0.82rem', fontWeight: 700, color: 'var(--t3)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 16,
        }}>
          Publications
        </div>

        {posts.length === 0 ? (
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
            {posts.map(post => {
              const isLiked = likedIds.has(post.id)
              return (
                <article key={post.id} style={{
                  background: 'var(--card)', borderRadius: 14,
                  border: '1px solid var(--b1)', overflow: 'hidden',
                  transition: 'box-shadow .2s',
                }}>
                  {/* Post header */}
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar url={profile.avatar_url} name={profile.full_name} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.87rem', color: 'var(--t1)' }}>
                        {profile.full_name || profile.username}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--t3)' }}>
                        {getTimeAgo(post.created_at)}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/groups#post-${post.id}`
                        if (navigator.share) {
                          navigator.share({ title: 'Post', text: post.content.slice(0, 60), url }).catch(() => {})
                        } else {
                          navigator.clipboard.writeText(url)
                        }
                      }}
                      style={{
                        background: 'none', border: 'none',
                        color: 'var(--t3)', cursor: 'pointer', padding: 6,
                      }}
                      title="Partager"
                    >
                      <Share2 size={15} />
                    </button>
                  </div>

                  {/* Content */}
                  <div style={{
                    padding: '0 16px 14px',
                    fontSize: '0.93rem', color: 'var(--t1)', lineHeight: 1.62,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {post.content}
                    {post.image_url && (
                      <div style={{ marginTop: 10 }}>
                        <img
                          src={post.image_url}
                          alt=""
                          style={{
                            maxWidth: '100%', borderRadius: 10,
                            border: '1px solid var(--b1)', display: 'block',
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{
                    padding: '8px 16px', borderTop: '1px solid var(--b1)',
                    display: 'flex', alignItems: 'center', gap: 16,
                  }}>
                    <button
                      onClick={() => toggleLike(post.id, post.likes_count)}
                      style={{
                        background: 'none', border: 'none',
                        color: isLiked ? 'var(--accent)' : 'var(--t2)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: '0.85rem', fontWeight: 600, padding: '6px 0',
                        transition: 'color .15s',
                      }}
                    >
                      <Heart size={16} fill={isLiked ? 'var(--accent)' : 'none'} />
                      {post.likes_count}
                    </button>

                    <Link
                      href={`/groups#post-${post.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: '0.85rem', fontWeight: 600,
                        color: 'var(--t2)', textDecoration: 'none',
                        padding: '6px 0',
                      }}
                    >
                      <MessageCircle size={16} />
                      {post.comments_count}
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
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
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'rgba(var(--accent-rgb), 0.15)',
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--b1)'
                }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={36} strokeWidth={1.5} color="var(--t3)" />
                  )}
                </div>
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

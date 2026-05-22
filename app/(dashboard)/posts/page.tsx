'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Grid3X3, List, Send, Trash2, Eye, EyeOff, X, Save, Pencil, RotateCcw, RefreshCw, Upload, CheckSquare, Square, Sparkles, PenLine, ChevronDown, Calendar, BarChart3, Filter, Image as ImageIcon, FileText, Database, Settings, Zap, ArrowRight, FileImage } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { IconInstagram, IconFacebook, IconTikTok, IconTwitterX, IconLinkedIn, IconYouTube, IconPinterest } from '@/components/icons/BrandIcons'

function PlatformIcon({ platform, size = 18 }: { platform: string; size?: number }) {
  switch (platform) {
    case 'instagram': return <IconInstagram size={size} />
    case 'facebook': return <IconFacebook size={size} />
    case 'tiktok': return <IconTikTok size={size} />
    case 'twitter': return <IconTwitterX size={size} />
    case 'linkedin': return <IconLinkedIn size={size} />
    case 'youtube': return <IconYouTube size={size} />
    case 'pinterest': return <IconPinterest size={size} />
    default: return <span style={{ width: size, height: size, borderRadius: '4px', background: PLATFORM_COLORS[platform] || '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.5rem', fontWeight: 700, color: '#fff' }}>{platform.slice(0, 2).toUpperCase()}</span>
  }
}

const DELETE_COOLDOWN_MS = 5 * 60 * 1000

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C', facebook: '#1877F2', tiktok: '#000',
  twitter: '#1DA1F2', linkedin: '#0077B5', youtube: '#FF0000', pinterest: '#E60023',
}
const PLATFORM_SHORT: Record<string, string> = {
  instagram: 'IG', facebook: 'FB', tiktok: 'TK', twitter: 'X', linkedin: 'LI', youtube: 'YT', pinterest: 'PT',
}
const ALL_PLATFORMS = ['instagram', 'facebook', 'tiktok', 'twitter', 'linkedin', 'youtube', 'pinterest']
const FREE_PLATFORMS = ['instagram', 'facebook']

function stClass(s: string) {
  if (s === 'draft' || s === 'failed') return 'st st-p'
  if (s === 'scheduled') return 'st st-pub'
  if (s === 'published') return 'st st-a'
  if (s === 'partial')   return 'st st-pub'
  if (s === 'deleted')   return 'st'
  return 'st st-p'
}
function stLabel(s: string) {
  if (s === 'draft' || s === 'failed') return 'Brouillon'
  if (s === 'scheduled') return 'Programmé'
  if (s === 'published') return 'Publié'
  if (s === 'partial')   return 'Partiel'
  if (s === 'deleted')   return 'Supprimé'
  return 'Brouillon'
}

function groupPostsByDate(posts: Post[]): { label: string; posts: Post[] }[] {
  const now = new Date()
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86_400_000)
  const weekAgo   = new Date(today.getTime() - 6 * 86_400_000)
  const monthAgo  = new Date(today.getTime() - 30 * 86_400_000)

  const groups: { label: string; posts: Post[] }[] = [
    { label: "Aujourd'hui", posts: [] },
    { label: 'Hier', posts: [] },
    { label: 'Cette semaine', posts: [] },
    { label: 'Ce mois', posts: [] },
    { label: 'Plus ancien', posts: [] },
  ]

  for (const post of posts) {
    const d   = new Date(post.created_at)
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if      (day >= today)     groups[0].posts.push(post)
    else if (day >= yesterday) groups[1].posts.push(post)
    else if (day >= weekAgo)   groups[2].posts.push(post)
    else if (day >= monthAgo)  groups[3].posts.push(post)
    else                       groups[4].posts.push(post)
  }

  return groups.filter(g => g.posts.length > 0)
}

interface PostAnalytics {
  likes: number
  comments: number
  shares: number
  impressions: number
  reach: number
}

interface Post {
  id: string
  content: string
  platforms: string[]
  status: string
  media_urls: string[]
  created_at: string
  scheduled_at: string | null
  analytics: PostAnalytics | null
  meta_post_ids?: Record<string, string> | null
  platform_errors?: Record<string, string> | null
}

function InsightsBadge({ a }: { a: PostAnalytics | null }) {
  const fmt = (n: number) => n > 1000 ? (n / 1000).toFixed(1) + 'K' : String(n)
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,.82)', backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: '.5rem', padding: '.75rem',
      opacity: 0, transition: 'opacity .18s ease',
      zIndex: 5,
    }} className="insights-overlay">
      {a ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.4rem .8rem', width: '100%' }}>
          {[
            { icon: '❤️', label: 'Likes',       val: fmt(a.likes) },
            { icon: '💬', label: 'Commentaires', val: fmt(a.comments) },
            { icon: '↗️', label: 'Partages',     val: fmt(a.shares) },
            { icon: '👁️', label: 'Impressions',  val: fmt(a.impressions) },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '.95rem' }}>{item.icon}</div>
              <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--t1)', lineHeight: 1 }}>{item.val}</div>
              <div style={{ fontSize: '.58rem', color: 'var(--t3)' }}>{item.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '.75rem', color: 'var(--t3)', marginBottom: '.2rem' }}>📊</div>
          <div style={{ fontSize: '.68rem', color: 'var(--t3)' }}>Pas encore de données</div>
        </div>
      )}
    </div>
  )
}

export default function PostsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [publishing, setPublishing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [userPlan, setUserPlan] = useState<'free' | 'premium' | 'business'>('free')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const lastDeletedAt = useRef<number | null>(null)

  // Modal visualisation/édition
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editPlatforms, setEditPlatforms] = useState<string[]>([])
  const [editMediaUrl, setEditMediaUrl] = useState<string | null>(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [saving, setSaving] = useState(false)

  // Édition post publié (Facebook)
  const [fbEditMode, setFbEditMode] = useState(false)
  const [fbSaving, setFbSaving] = useState(false)

  // Commentaires
  const [showComments, setShowComments] = useState(false)
  const [commentsData, setCommentsData] = useState<Array<{ platform: string; comments: any[] }>>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState<string | null>(null)
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})
  const [replying, setReplying] = useState<string | null>(null)

  // Multi-sélection (permanent checkboxes — no selectMode toggle needed)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // Dropdown menu "+"
  const [plusMenuOpen, setPlusMenuOpen] = useState(false)
  const plusMenuRef = useRef<HTMLDivElement>(null)

  // Filtre par plateforme
  const [platformFilter, setPlatformFilter] = useState<string | null>(null)
  const [pfMenuOpen, setPfMenuOpen] = useState(false)
  const pfMenuRef = useRef<HTMLDivElement>(null)

  // Pending results banner
  const [hasPendingResults, setHasPendingResults] = useState(false)

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setPlusMenuOpen(false)
      }
    }
    if (plusMenuOpen) document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [plusMenuOpen])

  useEffect(() => {
    function handleOutsidePf(e: MouseEvent) {
      if (pfMenuRef.current && !pfMenuRef.current.contains(e.target as Node)) setPfMenuOpen(false)
    }
    if (pfMenuOpen) document.addEventListener('mousedown', handleOutsidePf)
    return () => document.removeEventListener('mousedown', handleOutsidePf)
  }, [pfMenuOpen])

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)))
    }
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  async function bulkDelete() {
    if (selectedIds.size === 0) return
    const needsPassword = !lastDeletedAt.current || Date.now() - lastDeletedAt.current >= DELETE_COOLDOWN_MS
    if (needsPassword) {
      setBulkConfirm(true)
      setPassword('')
      return
    }
    await doBulkDelete()
  }

  const [bulkConfirm, setBulkConfirm] = useState(false)

  async function confirmBulkDelete() {
    setPwLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('Non connecté')
      const { error } = await supabase.auth.signInWithPassword({ email: user.email, password })
      if (error) throw new Error('Mot de passe incorrect')
      setBulkConfirm(false)
      setPassword('')
      await doBulkDelete()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur', 'error')
    } finally {
      setPwLoading(false)
    }
  }

  async function doBulkDelete() {
    setBulkDeleting(true)
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map(id => fetch(`/api/posts/${id}`, { method: 'DELETE' })))
      toast(`${ids.length} post${ids.length > 1 ? 's' : ''} supprimé${ids.length > 1 ? 's' : ''}`, 'success')
      lastDeletedAt.current = Date.now()
      setPosts(prev => prev.filter(p => !ids.includes(p.id)))
      setTotal(prev => prev - ids.length)
      clearSelection()
    } catch {
      toast('Erreur lors de la suppression', 'error')
    } finally {
      setBulkDeleting(false)
    }
  }

  function loadPosts(): Promise<void> {
    setLoading(true)
    return fetch('/api/posts?limit=100')
      .then(r => r.json())
      .then(d => { setPosts(d.posts || []); setTotal(d.total || 0); setLoading(false) })
      .catch(() => setLoading(false))
  }

  async function restorePost(id: string) {
    setRestoring(id)
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Erreur restauration')
      toast('Post restauré en brouillon', 'success')
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'draft' } : p))
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur', 'error')
    } finally {
      setRestoring(null)
    }
  }

  async function hardDelete(id: string) {
    try {
      await fetch(`/api/posts/${id}/destroy`, { method: 'DELETE' })
      setPosts(prev => prev.filter(p => p.id !== id))
      setTotal(prev => prev - 1)
      if (selectedPost?.id === id) closePost()
      toast('Post supprimé définitivement', 'success')
    } catch { /* ignore */ }
  }

  async function syncPlatforms() {
    setSyncing(true)
    try {
      const res = await fetch('/api/posts/sync', { method: 'POST' })
      const d = await res.json()
      if (d.updated > 0) toast(`${d.updated} post(s) mis à jour depuis les plateformes`, 'success')
      else toast('Tout est à jour', 'success')
      loadPosts()
    } catch {
      toast('Erreur de synchronisation', 'error')
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    loadPosts().then(() => {
      // Auto-sync analytics silently on first load
      fetch('/api/posts/sync', { method: 'POST' })
        .then(r => r.json())
        .then(d => { if (d.updated > 0) loadPosts() })
        .catch(() => {})
    })
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d) setUserPlan('business') }).catch(() => {})
    // Check for pending generated results in sessionStorage
    try {
      if (sessionStorage.getItem('social_ia_results')) setHasPendingResults(true)
    } catch {}
  }, [])

  function openPost(post: Post) {
    if (post.status === 'draft' || post.status === 'failed' || post.status === 'scheduled') {
      const variants: Partial<Record<string, string>> = {}
      const initialImages: Partial<Record<string, string>> = {}
      for (const p of post.platforms) {
        variants[p] = post.content
        if (post.media_urls?.[0]) initialImages[p] = post.media_urls[0]
      }
      try {
        sessionStorage.setItem('social_ia_results', JSON.stringify({
          variants,
          platforms: post.platforms,
          objective: null,
          quotaUsed: 0,
          quotaLimit: 'unlimited',
          isPro: true,
          editPostId: post.id,
          initialImages: Object.keys(initialImages).length > 0 ? initialImages : undefined,
          initialScheduledAt: post.scheduled_at || undefined,
          pageTitle: 'Modifier le post',
        }))
      } catch {}
      router.push('/posts/results')
      return
    }
    setSelectedPost(post)
    setEditContent(post.content)
    setEditPlatforms([...post.platforms])
    setEditMediaUrl(post.media_urls?.[0] || null)
  }

  function closePost() {
    setSelectedPost(null)
    setEditContent('')
    setEditPlatforms([])
    setEditMediaUrl(null)
    setFbEditMode(false)
    setShowComments(false)
    setCommentsData([])
    setCommentsError(null)
    setReplyTexts({})
  }

  async function handleMediaUpload(file: File) {
    setUploadingMedia(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setEditMediaUrl(d.url)
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur upload', 'error')
    } finally {
      setUploadingMedia(false)
    }
  }

  async function saveEdit() {
    if (!selectedPost) return
    setSaving(true)
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent, platforms: editPlatforms, media_urls: editMediaUrl ? [editMediaUrl] : [] }),
      })
      if (!res.ok) throw new Error('Erreur de sauvegarde')
      toast('Brouillon mis à jour', 'success')
      const updatedMediaUrls = editMediaUrl ? [editMediaUrl] : []
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, content: editContent, platforms: editPlatforms, media_urls: updatedMediaUrls } : p))
      setSelectedPost(prev => prev ? { ...prev, content: editContent, platforms: editPlatforms, media_urls: updatedMediaUrls } : null)
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function loadComments(postId: string) {
    setCommentsLoading(true)
    setCommentsError(null)
    try {
      const res = await fetch(`/api/posts/${postId}/comments`)
      const d = await res.json()
      setCommentsData(d.results || [])
      // Surface first error from any platform
      const firstError = (d.results || []).find((r: any) => r.error)?.error
      if (firstError) setCommentsError(firstError)
    } catch {
      setCommentsError('Impossible de charger les commentaires')
    } finally {
      setCommentsLoading(false)
    }
  }

  async function sendReply(platform: string, commentId: string) {
    const msg = replyTexts[commentId]?.trim()
    if (!msg || !selectedPost) return
    setReplying(commentId)
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, commentId, message: msg }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      toast('Réponse envoyée', 'success')
      setReplyTexts(prev => { const n = { ...prev }; delete n[commentId]; return n })
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur', 'error')
    } finally {
      setReplying(null)
    }
  }

  async function editFbPost() {
    if (!selectedPost) return
    setFbSaving(true)
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}/edit-published`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      toast('Post modifié sur Facebook', 'success')
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, content: editContent } : p))
      setSelectedPost(prev => prev ? { ...prev, content: editContent } : null)
      setFbEditMode(false)
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur', 'error')
    } finally {
      setFbSaving(false)
    }
  }

  async function publishPost(post: Post, closeModal = false) {
    const effectiveMediaUrls = editMediaUrl ? [editMediaUrl] : post.media_urls
    if (post.platforms.includes('instagram') && (!effectiveMediaUrls || effectiveMediaUrls.length === 0)) {
      toast('Veuillez ajouter une image pour Instagram.', 'warning')
      return
    }
    setPublishing(post.id)
    try {
      const res = await fetch(`/api/posts/${post.id}/publish`, { method: 'POST' })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      toast('Post publié !', 'success')
      if (closeModal) closePost()
      loadPosts()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur de publication', 'error')
    } finally {
      setPublishing(null)
    }
  }

  function askDelete(id: string) {
    if (lastDeletedAt.current && Date.now() - lastDeletedAt.current < DELETE_COOLDOWN_MS) {
      doDelete(id)
    } else {
      setConfirmId(id)
      setPassword('')
    }
  }

  async function confirmDelete() {
    if (!confirmId) return
    setPwLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('Non connecté')
      const { error } = await supabase.auth.signInWithPassword({ email: user.email, password })
      if (error) throw new Error('Mot de passe incorrect')
      await doDelete(confirmId)
      setConfirmId(null)
      setPassword('')
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur', 'error')
    } finally {
      setPwLoading(false)
    }
  }

  async function doDelete(id: string) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur suppression')
      toast('Post supprimé', 'success')
      lastDeletedAt.current = Date.now()
      setPosts(prev => prev.filter(p => p.id !== id))
      setTotal(prev => prev - 1)
      if (selectedPost?.id === id) closePost()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur', 'error')
    } finally {
      setDeleting(null)
    }
  }

  // Unique platforms across all loaded posts (for the platform filter dropdown)
  const availablePlatforms = [...new Set(posts.flatMap(p => p.platforms))].sort()

  // Failed posts appear under "Brouillons" filter; partial appears under "Publiés"
  const baseFiltered =
    filter === 'all'       ? posts.filter(p => p.status !== 'deleted') :
    filter === 'draft'     ? posts.filter(p => p.status === 'draft' || p.status === 'failed') :
    filter === 'published' ? posts.filter(p => p.status === 'published' || p.status === 'partial') :
    posts.filter(p => p.status === filter)

  const filtered = platformFilter
    ? baseFiltered.filter(p => p.platforms.includes(platformFilter))
    : baseFiltered

  const isDraft = selectedPost?.status === 'draft' || selectedPost?.status === 'failed'
  const isDeleted = selectedPost?.status === 'deleted'
  const draftCount = posts.filter(p => p.status === 'draft' || p.status === 'failed').length
  const nonDeletedCount = posts.filter(p => p.status !== 'deleted').length

  return (
    <div style={{ padding: '1.5rem 2rem 3rem' }}>

      {/* ── Modal visualisation / édition ── */}
      {selectedPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) closePost() }}
        >
          <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1C1C21' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <span className={stClass(selectedPost.status)} style={{ fontSize: '.72rem' }}>{stLabel(selectedPost.status)}</span>
                {isDraft && (
                  <span style={{ fontSize: '.72rem', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                    <Pencil size={11} /> Modifiable
                  </span>
                )}
              </div>
              <button onClick={closePost} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Image */}
            {editMediaUrl ? (
              <div style={{ background: 'var(--bg)', position: 'relative' }}>
                <img src={editMediaUrl} alt="" style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', display: 'block' }} />
                {isDraft && (
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', gap: '.4rem' }}>
                    <label style={{ cursor: 'pointer', background: 'rgba(0,0,0,.7)', border: '1px solid rgba(255,255,255,.15)', borderRadius: '6px', padding: '.35rem .6rem', display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.72rem', color: 'var(--t1)' }}>
                      <Upload size={12} /> {uploadingMedia ? 'Upload...' : 'Changer'}
                      <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleMediaUpload(f) }} />
                    </label>
                    <button onClick={() => setEditMediaUrl(null)} style={{ background: 'rgba(239,68,68,.7)', border: 'none', borderRadius: '6px', padding: '.35rem .5rem', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            ) : isDraft ? (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.5rem', padding: '1.5rem', background: 'var(--bg)', border: '1px dashed var(--b1)', cursor: 'pointer', transition: '.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--b1)')}
              >
                {uploadingMedia
                  ? <div style={{ width: '20px', height: '20px', border: '2px solid rgba(59,123,246,.3)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'rot .7s linear infinite' }} />
                  : <Upload size={20} color="#3f3f46" />
                }
                <span style={{ fontSize: '.78rem', color: 'var(--t3)' }}>{uploadingMedia ? 'Upload en cours...' : 'Ajouter une image ou vidéo'}</span>
                <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleMediaUpload(f) }} />
              </label>
            ) : null}

            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Contenu */}
              <div>
                <label className="label" style={{ marginBottom: '.4rem', display: 'block' }}>Contenu</label>
                {isDraft || fbEditMode ? (
                  <textarea
                    className="input resize-none"
                    rows={5}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    style={{ width: '100%', lineHeight: 1.6 }}
                  />
                ) : (
                  <div style={{ fontSize: '.85rem', color: 'var(--t1)', lineHeight: 1.7, background: 'var(--bg)', border: '1px solid #1C1C21', borderRadius: '8px', padding: '.75rem 1rem', whiteSpace: 'pre-wrap' }}>
                    {selectedPost.content}
                  </div>
                )}
              </div>

              {/* Plateformes */}
              <div>
                <label className="label" style={{ marginBottom: '.5rem', display: 'block' }}>Plateformes</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                  {(isDraft ? ALL_PLATFORMS : selectedPost.platforms).map(p => {
                    const isPlanLocked = isDraft && userPlan === 'free' && !FREE_PLATFORMS.includes(p)
                    const active = isDraft ? editPlatforms.includes(p) : true
                    const removed = !isDraft && selectedPost.platform_errors?.[p] === 'removed_externally'
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          if (!isDraft || isPlanLocked) return
                          setEditPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
                        }}
                        title={removed ? `Supprimé directement de ${PLATFORM_SHORT[p]}` : isPlanLocked ? 'Plan Pro requis' : undefined}
                        style={{
                          padding: '.25rem .65rem', borderRadius: '6px', fontSize: '.73rem', fontWeight: 600,
                          border: `1px solid ${isPlanLocked ? '#1E1E24' : removed ? 'rgba(239,68,68,.25)' : active ? PLATFORM_COLORS[p] + '60' : 'var(--b1)'}`,
                          background: isPlanLocked ? 'transparent' : removed ? 'rgba(239,68,68,.06)' : active ? PLATFORM_COLORS[p] + '18' : 'transparent',
                          color: isPlanLocked ? '#2a2a30' : removed ? '#6b6b75' : active ? PLATFORM_COLORS[p] : '#3f3f46',
                          cursor: isPlanLocked ? 'not-allowed' : isDraft ? 'pointer' : 'default',
                          transition: '.12s', position: 'relative',
                          opacity: removed ? 0.55 : 1,
                          filter: removed ? 'grayscale(.8)' : 'none',
                          display: 'flex', alignItems: 'center', gap: '.25rem',
                        }}
                      >
                        <PlatformIcon platform={p} size={14} />
                        <span>{PLATFORM_SHORT[p]}</span>
                        {isPlanLocked && <span style={{ fontSize: '.5rem', opacity: .6 }}>Pro</span>}
                        {removed && <span style={{ fontSize: '.55rem', color: '#EF4444', opacity: .9 }}>✕</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Date */}
              <div style={{ fontSize: '.75rem', color: '#3f3f46' }}>
                Créé le {new Date(selectedPost.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '.6rem', paddingTop: '.25rem' }}>
                {isDeleted ? (
                  <>
                    <button
                      onClick={() => restorePost(selectedPost.id)}
                      disabled={restoring === selectedPost.id}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem', padding: '.6rem', borderRadius: '8px', border: '1px solid rgba(59,123,246,.4)', background: 'rgba(var(--accent-rgb),.1)', color: 'var(--accent)', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 }}
                    >
                      <RotateCcw size={14} /> {restoring === selectedPost.id ? 'Restauration...' : 'Restaurer en brouillon'}
                    </button>
                    <button
                      onClick={() => hardDelete(selectedPost.id)}
                      style={{ padding: '.6rem .8rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.08)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.8rem' }}
                    >
                      <Trash2 size={14} /> Supprimer définitivement
                    </button>
                  </>
                ) : (
                  <>
                    {isDraft && (
                      <button onClick={saveEdit} disabled={saving} className="btn-primary flex items-center gap-2" style={{ flex: 1, justifyContent: 'center', padding: '.6rem' }}>
                        <Save size={14} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                    )}
                    {isDraft && (
                      <button onClick={() => publishPost(selectedPost, true)} disabled={publishing === selectedPost.id}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem', padding: '.6rem', borderRadius: '8px', border: 'none', background: '#22C55E', color: '#fff', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 }}>
                        {publishing === selectedPost.id
                          ? <div style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rot .7s linear infinite' }} />
                          : <Send size={14} />} Publier
                      </button>
                    )}
                    {/* Boutons modification pour posts publiés */}
                    {!isDraft && selectedPost.status === 'published' && (
                      selectedPost.platforms.includes('facebook') ? (
                        fbEditMode ? (
                          <>
                            <button onClick={editFbPost} disabled={fbSaving}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem', padding: '.6rem', borderRadius: '8px', border: 'none', background: '#1877F2', color: '#fff', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600, opacity: fbSaving ? .6 : 1 }}>
                              <Save size={14} /> {fbSaving ? 'Sauvegarde...' : 'Sauvegarder sur Facebook'}
                            </button>
                            <button onClick={() => { setFbEditMode(false); setEditContent(selectedPost.content) }}
                              style={{ padding: '.6rem .8rem', borderRadius: '8px', border: '1px solid var(--b1)', background: 'transparent', color: 'var(--t3)', cursor: 'pointer', fontSize: '.8rem' }}>
                              Annuler
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setFbEditMode(true)}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem', padding: '.6rem', borderRadius: '8px', border: '1px solid rgba(24,119,242,.4)', background: 'rgba(24,119,242,.1)', color: '#1877F2', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 }}>
                            <Pencil size={14} /> Modifier sur Facebook
                          </button>
                        )
                      ) : (
                        <div style={{ flex: 1, fontSize: '.74rem', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.5rem .75rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid #1C1C21', lineHeight: 1.4 }}>
                          <IconInstagram size={13} />
                          <span>Instagram ne permet pas la modification après publication.</span>
                        </div>
                      )
                    )}
                    <button onClick={() => askDelete(selectedPost.id)} disabled={deleting === selectedPost.id}
                      style={{ padding: '.6rem .8rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.08)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>

              {/* ── Commentaires (posts publiés avec Meta IDs) ── */}
              {!isDraft && !isDeleted && selectedPost.status === 'published' && selectedPost.meta_post_ids && Object.keys(selectedPost.meta_post_ids).length > 0 && (
                <div style={{ borderTop: '1px solid #1C1C21', paddingTop: '.85rem' }}>
                  <button
                    onClick={() => {
                      const next = !showComments
                      setShowComments(next)
                      if (next && commentsData.length === 0) loadComments(selectedPost.id)
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: '.78rem', display: 'flex', alignItems: 'center', gap: '.35rem', padding: 0, marginBottom: showComments ? '.75rem' : 0 }}
                  >
                    <span style={{ fontSize: '.9rem' }}>💬</span>
                    {showComments ? 'Masquer les commentaires' : 'Voir les commentaires'}
                  </button>

                  {showComments && (
                    <div>
                      {commentsLoading ? (
                        <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--t3)', fontSize: '.78rem' }}>Chargement...</div>
                      ) : commentsError ? (
                        <div style={{ padding: '.65rem .85rem', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.18)', borderRadius: '8px', fontSize: '.75rem', color: '#ef4444', lineHeight: 1.5 }}>
                          ⚠️ {commentsError}
                        </div>
                      ) : commentsData.length === 0 || commentsData.every(p => p.comments.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '.75rem 0', color: '#3f3f46', fontSize: '.75rem' }}>Aucun commentaire pour le moment.</div>
                      ) : (
                        commentsData.map(({ platform, comments }) => (
                          <div key={platform} style={{ marginBottom: '.75rem' }}>
                            {commentsData.length > 1 && (
                              <div style={{ fontSize: '.65rem', fontWeight: 600, color: 'var(--t3)', marginBottom: '.4rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                {platform === 'facebook' ? '📘 Facebook' : '📸 Instagram'}
                              </div>
                            )}
                            {comments.map((c: any) => (
                              <div key={c.id} style={{ background: 'var(--bg)', border: '1px solid #1C1C21', borderRadius: '8px', padding: '.6rem .75rem', marginBottom: '.4rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.3rem' }}>
                                  <span style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--t3)' }}>
                                    {c.from?.name || 'Utilisateur'}
                                  </span>
                                  <span style={{ fontSize: '.62rem', color: '#3f3f46' }}>
                                    {new Date(c.created_time).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p style={{ fontSize: '.78rem', color: 'var(--t1)', margin: 0, lineHeight: 1.5 }}>{c.message}</p>
                                {/* Zone de réponse */}
                                <div style={{ marginTop: '.5rem', display: 'flex', gap: '.35rem' }}>
                                  <input
                                    type="text"
                                    placeholder="Répondre..."
                                    value={replyTexts[c.id] || ''}
                                    onChange={e => setReplyTexts(prev => ({ ...prev, [c.id]: e.target.value }))}
                                    onKeyDown={e => { if (e.key === 'Enter') sendReply(platform, c.id) }}
                                    className="input"
                                    style={{ flex: 1, padding: '.3rem .6rem', fontSize: '.73rem' }}
                                  />
                                  <button
                                    onClick={() => sendReply(platform, c.id)}
                                    disabled={!replyTexts[c.id]?.trim() || replying === c.id}
                                    style={{ padding: '.3rem .6rem', borderRadius: '6px', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: '.72rem', fontWeight: 600, opacity: !replyTexts[c.id]?.trim() ? .4 : 1, flexShrink: 0 }}
                                  >
                                    {replying === c.id ? '...' : 'Envoyer'}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmation suppression ── */}
      {confirmId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) { setConfirmId(null); setPassword('') } }}
        >
          <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '1.75rem', width: '100%', maxWidth: '360px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: '.4rem' }}>Confirmer la suppression</div>
            <div style={{ fontSize: '.82rem', color: 'var(--t3)', marginBottom: '1.25rem', lineHeight: 1.5 }}>Cette action est irréversible. Entrez votre mot de passe pour confirmer.</div>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input type={showPw ? 'text' : 'password'} placeholder="Mot de passe" value={password}
                onChange={e => setPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') confirmDelete() }}
                autoFocus className="input" style={{ width: '100%', paddingRight: '2.5rem' }} />
              <button onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '.6rem' }}>
              <button onClick={() => { setConfirmId(null); setPassword('') }} style={{ flex: 1, padding: '.6rem', borderRadius: '8px', border: '1px solid var(--b1)', background: 'transparent', color: 'var(--t3)', cursor: 'pointer', fontSize: '.83rem' }}>Annuler</button>
              <button onClick={confirmDelete} disabled={!password || pwLoading} style={{ flex: 1, padding: '.6rem', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#fff', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600, opacity: !password || pwLoading ? .5 : 1 }}>
                {pwLoading ? 'Vérification...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmation suppression bulk ── */}
      {bulkConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) { setBulkConfirm(false); setPassword('') } }}
        >
          <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '1.75rem', width: '100%', maxWidth: '360px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: '.4rem' }}>Supprimer {selectedIds.size} post{selectedIds.size > 1 ? 's' : ''}</div>
            <div style={{ fontSize: '.82rem', color: 'var(--t3)', marginBottom: '1.25rem', lineHeight: 1.5 }}>Entrez votre mot de passe pour confirmer la suppression.</div>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input type={showPw ? 'text' : 'password'} placeholder="Mot de passe" value={password}
                onChange={e => setPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') confirmBulkDelete() }}
                autoFocus className="input" style={{ width: '100%', paddingRight: '2.5rem' }} />
              <button onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '.6rem' }}>
              <button onClick={() => { setBulkConfirm(false); setPassword('') }} style={{ flex: 1, padding: '.6rem', borderRadius: '8px', border: '1px solid var(--b1)', background: 'transparent', color: 'var(--t3)', cursor: 'pointer', fontSize: '.83rem' }}>Annuler</button>
              <button onClick={confirmBulkDelete} disabled={!password || pwLoading} style={{ flex: 1, padding: '.6rem', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#fff', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600, opacity: !password || pwLoading ? .5 : 1 }}>
                {pwLoading ? 'Vérification...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Barre de sélection flottante ── */}
      {selectedIds.size > 0 && (
        <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,.6)', backdropFilter: 'blur(8px)' }}>
          <span style={{ fontSize: '.82rem', color: 'var(--t3)' }}>{selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}</span>
          <button onClick={toggleSelectAll}
            style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.45rem .9rem', borderRadius: '8px', border: '1px solid var(--b1)', background: 'transparent', color: 'var(--t2)', cursor: 'pointer', fontSize: '.8rem', fontWeight: 600 }}>
            {selectedIds.size === filtered.length ? 'Désélectionner tout' : 'Tout sélectionner'}
          </button>
          <button onClick={bulkDelete} disabled={bulkDeleting}
            style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.45rem .9rem', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#fff', cursor: 'pointer', fontSize: '.8rem', fontWeight: 600, opacity: bulkDeleting ? .6 : 1 }}>
            <Trash2 size={13} /> {bulkDeleting ? 'Suppression...' : 'Supprimer'}
          </button>
          <button onClick={clearSelection} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex', padding: '4px' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Pending results banner */}
      {hasPendingResults && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '.75rem', padding: '.6rem .9rem', marginBottom: '1rem',
          background: 'rgba(123,92,245,.1)', border: '1px solid rgba(123,92,245,.25)',
          borderRadius: '10px',
          maxWidth: 480, marginLeft: 'auto', marginRight: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <span style={{ fontSize: '.9rem' }}>✨</span>
            <span style={{ fontSize: '.82rem', color: 'var(--t2)', fontWeight: 500 }}>
              Vous avez des posts générés en attente
            </span>
          </div>
          <div style={{ display: 'flex', gap: '.4rem', flexShrink: 0 }}>
            <button
              onClick={() => router.push('/posts/results')}
              style={{ padding: '.35rem .8rem', borderRadius: '7px', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: '.78rem', fontWeight: 600 }}
            >
              Reprendre
            </button>
            <button
              onClick={() => { try { sessionStorage.removeItem('social_ia_results') } catch {} setHasPendingResults(false) }}
              style={{ padding: '.35rem .5rem', borderRadius: '7px', border: '1px solid var(--b1)', background: 'transparent', color: 'var(--t3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── NOUVEAU HEADER WORKSPACE ── */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '1.8rem', fontWeight: 700, color: '#fff', letterSpacing: '-.02em' }}>Workspace</h1>
            <p style={{ color: 'var(--t3)', fontSize: '.9rem', marginTop: '.3rem' }}>Votre centre de création, de planification et d'analyse.</p>
          </div>
          <button onClick={() => toast('Personnalisation disponible bientôt !', 'info')} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem .8rem', borderRadius: '8px', border: '1px solid var(--b1)', background: 'transparent', color: 'var(--t2)', cursor: 'pointer', fontSize: '.85rem', fontWeight: 500 }}>
            <Sparkles size={14} /> Personnalisé <ChevronDown size={14} />
          </button>
        </div>

        {/* 4 Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '.75rem' }}>
          {/* Nouveau post */}
          <div style={{ background: 'rgba(28,40,65,0.4)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '12px', padding: '.85rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PenLine size={14} />
              </div>
              <h3 style={{ fontSize: '.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>Nouveau post</h3>
            </div>
            <p style={{ fontSize: '.75rem', color: 'var(--t3)', lineHeight: 1.3, flex: 1, margin: 0 }}>Créez ou générez du contenu avec/sans IA.</p>
            <button onClick={() => router.push('/posts/create')} style={{ marginTop: '.75rem', width: '100%', padding: '.45rem', borderRadius: '6px', border: 'none', background: 'rgba(59,130,246,0.15)', color: '#3B82F6', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.25)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.15)'}>
              Créer <ArrowRight size={12} />
            </button>
          </div>
          {/* Calendrier */}
          <div style={{ background: 'rgba(50,30,65,0.4)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '12px', padding: '.85rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(168,85,247,0.15)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={14} />
              </div>
              <h3 style={{ fontSize: '.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>Calendrier</h3>
            </div>
            <p style={{ fontSize: '.75rem', color: 'var(--t3)', lineHeight: 1.3, flex: 1, margin: 0 }}>Planifiez vos publications.</p>
            <button onClick={() => router.push('/calendar')} style={{ marginTop: '.75rem', width: '100%', padding: '.45rem', borderRadius: '6px', border: 'none', background: 'rgba(168,85,247,0.15)', color: '#A855F7', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.25)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(168,85,247,0.15)'}>
              Ouvrir <ArrowRight size={12} />
            </button>
          </div>
          {/* Analytique */}
          <div style={{ background: 'rgba(20,50,40,0.4)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '12px', padding: '.85rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(34,197,94,0.15)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={14} />
              </div>
              <h3 style={{ fontSize: '.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>Analytique</h3>
            </div>
            <p style={{ fontSize: '.75rem', color: 'var(--t3)', lineHeight: 1.3, flex: 1, margin: 0 }}>Suivez vos performances.</p>
            <button onClick={() => toast('Analytique disponible bientôt !', 'info')} style={{ marginTop: '.75rem', width: '100%', padding: '.45rem', borderRadius: '6px', border: 'none', background: 'rgba(34,197,94,0.15)', color: '#22C55E', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.25)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.15)'}>
              Analyses <ArrowRight size={12} />
            </button>
          </div>
          {/* Idées */}
          <div style={{ background: 'rgba(65,40,20,0.4)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: '12px', padding: '.85rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(249,115,22,0.15)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={14} />
              </div>
              <h3 style={{ fontSize: '.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>Inspiration</h3>
            </div>
            <p style={{ fontSize: '.75rem', color: 'var(--t3)', lineHeight: 1.3, flex: 1, margin: 0 }}>Idées de contenu tendance.</p>
            <button onClick={() => toast('Inspiration disponible bientôt !', 'info')} style={{ marginTop: '.75rem', width: '100%', padding: '.45rem', borderRadius: '6px', border: 'none', background: 'rgba(249,115,22,0.15)', color: '#F97316', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.25)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(249,115,22,0.15)'}>
              Explorer <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION VOS POSTS EXISTANTS ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', margin: 0 }}>Vos posts existants</h2>
          <span style={{ background: 'var(--s2)', padding: '.1rem .4rem', borderRadius: '10px', fontSize: '.7rem', color: 'var(--t3)', fontWeight: 600 }}>{nonDeletedCount}</span>
        </div>

        {/* Filters + view toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem', gap: '.5rem', flexWrap: 'wrap' }}>
          <div className="mob-scroll" style={{ display: 'flex', gap: '.4rem', overflowX: 'auto' }}>
            {(['all', 'published', 'draft', 'scheduled', 'deleted'] as const).map(f => {
              const label = f === 'all' ? 'Tous' : f === 'published' ? 'Publiés' : f === 'draft' ? 'Brouillons' : f === 'scheduled' ? 'Programmés' : 'Archivés';
              return (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '.3rem .6rem', borderRadius: '6px', fontSize: '.75rem', fontWeight: 500, cursor: 'pointer',
                  border: filter === f ? 'none' : '1px solid transparent',
                  background: filter === f ? '#2A43E8' : 'var(--s2)',
                  color: filter === f ? '#fff' : 'var(--t2)', transition: '.15s',
                  display: 'flex', alignItems: 'center', gap: '.3rem', whiteSpace: 'nowrap',
                }}>
                  {label}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexShrink: 0 }}>
            {(['grid', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '.4rem .6rem', borderRadius: '8px',
                border: view === v ? '1px solid #4646FF' : '1px solid var(--b1)',
                background: view === v ? 'rgba(var(--accent-rgb),.12)' : 'var(--card)',
                color: view === v ? 'var(--accent)' : 'var(--t3)', cursor: 'pointer', display: 'flex', alignItems: 'center',
              }}>
                {v === 'grid' ? <Grid3X3 size={15} /> : <List size={15} />}
              </button>
            ))}
            
            {/* Filtre plateforme */}
            {availablePlatforms.length > 0 && (
              <div ref={pfMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => setPfMenuOpen(o => !o)}
                  style={{
                    padding: '.3rem .6rem', borderRadius: '6px', fontSize: '.75rem', fontWeight: 500, cursor: 'pointer',
                    border: platformFilter ? '1px solid #4646FF' : '1px solid var(--b1)',
                    background: platformFilter ? 'rgba(var(--accent-rgb),.12)' : 'var(--card)',
                    color: platformFilter ? 'var(--accent)' : 'var(--t2)', transition: '.15s',
                    display: 'flex', alignItems: 'center', gap: '.4rem', whiteSpace: 'nowrap',
                  }}
                >
                  <Filter size={13} /> Filtres
                  {platformFilter && <span onClick={e => { e.stopPropagation(); setPlatformFilter(null); setPfMenuOpen(false) }} style={{ marginLeft: '.25rem', opacity: .7, cursor: 'pointer' }}>×</span>}
                </button>

                {pfMenuOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 5px)', right: 0, zIndex: 200, background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '10px', padding: '.3rem', minWidth: '150px', boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}>
                    {availablePlatforms.map(p => (
                      <button key={p} onClick={() => { setPlatformFilter(p); setPfMenuOpen(false) }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.45rem .65rem', borderRadius: '7px', border: 'none', background: platformFilter === p ? 'rgba(var(--accent-rgb),.1)' : 'transparent', color: platformFilter === p ? 'var(--accent)' : 'var(--t1)', cursor: 'pointer', fontSize: '.78rem' }}
                        onMouseEnter={e => { if (platformFilter !== p) e.currentTarget.style.background = 'var(--s2)' }} onMouseLeave={e => { if (platformFilter !== p) e.currentTarget.style.background = 'transparent' }}
                      >
                        <PlatformIcon platform={p} size={14} /> {PLATFORM_SHORT[p] || p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content (Scrollable part) */}
        <div className="sb-scroll" style={{ flex: 1, overflowY: 'auto', paddingRight: '.25rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--t3)', fontSize: '.85rem' }}>Chargement...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--s2)', borderRadius: '12px', border: '1px dashed var(--b1)' }}>
              <div style={{ color: 'var(--t3)', fontSize: '.85rem' }}>
                {filter === 'all'       && 'Aucun post pour le moment'}
                {filter === 'published' && 'Aucun post publié'}
                {filter === 'draft'     && 'Aucun post dans les brouillons'}
                {filter === 'scheduled' && 'Aucun post programmé'}
                {filter === 'deleted'   && 'Aucun post archivé'}
              </div>
            </div>
          ) : view === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.75rem' }}>
            {filtered.slice(0, 8).map(post => {
              const isSelected = selectedIds.has(post.id)
              return (
              <div key={post.id}
                onClick={() => openPost(post)}
                style={{ background: 'var(--s2)', border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--b1)'}`, borderRadius: '12px', overflow: 'hidden', transition: '.15s', cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column' }}
              >
                <div onClick={e => { e.stopPropagation(); toggleSelect(post.id) }} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, cursor: 'pointer' }}>
                  {isSelected ? <CheckSquare size={20} color="var(--accent)" style={{ background: '#fff', borderRadius: '4px' }} /> : <Square size={20} color="rgba(255,255,255,.7)" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.8))' }} />}
                </div>
                {post.platforms[0] && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, width: '24px', height: '24px', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.4)' }}>
                    <PlatformIcon platform={post.platforms[0]} size={24} />
                  </div>
                )}
                <div style={{ height: '90px', background: 'var(--bg)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {post.media_urls?.[0]
                    ? <img src={post.media_urls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <ImageIcon size={24} color="var(--t3)" opacity={0.3} />
                  }
                </div>
                <div style={{ padding: '.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '.75rem', color: 'var(--t1)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '.5rem', flex: 1 }}>
                    {post.content}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                    <span className={stClass(post.status)} style={{ fontSize: '.6rem', padding: '.15rem .4rem', borderRadius: '4px' }}>{stLabel(post.status)}</span>
                  </div>
                  <div style={{ fontSize: '.65rem', color: 'var(--t3)', marginBottom: post.analytics ? '.5rem' : '0' }}>
                    {new Date(post.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  {post.analytics && post.status === 'published' && (
                    <div style={{ display: 'flex', gap: '.6rem', fontSize: '.7rem', color: 'var(--t2)', borderTop: '1px solid var(--b1)', paddingTop: '.5rem' }}>
                      <span title="Likes" style={{ display: 'flex', alignItems: 'center', gap: '.2rem' }}>❤️ {post.analytics.likes}</span>
                      <span title="Commentaires" style={{ display: 'flex', alignItems: 'center', gap: '.2rem' }}>💬 {post.analytics.comments}</span>
                      <span title="Partages" style={{ display: 'flex', alignItems: 'center', gap: '.2rem' }}>↗️ {post.analytics.shares}</span>
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {filtered.map(post => {
              const isSelected = selectedIds.has(post.id)
              return (
              <div key={post.id} onClick={() => openPost(post)} style={{ background: 'var(--s2)', border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--b1)'}`, borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: '.15s', cursor: 'pointer' }}>
                <div onClick={e => { e.stopPropagation(); toggleSelect(post.id) }} style={{ flexShrink: 0, cursor: 'pointer' }}>
                  {isSelected ? <CheckSquare size={18} color="var(--accent)" /> : <Square size={18} color="var(--t3)" />}
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: 'var(--bg)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {post.media_urls?.[0] ? <img src={post.media_urls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={20} color="var(--t3)" opacity={0.4} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.85rem', color: 'var(--t1)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.content}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.4rem' }}>
                    {post.platforms.map(p => (
                      <div key={p} style={{ width: '16px', height: '16px', borderRadius: '3px', overflow: 'hidden', flexShrink: 0 }}><PlatformIcon platform={p} size={16} /></div>
                    ))}
                    <span style={{ fontSize: '.7rem', color: 'var(--t3)' }}>{new Date(post.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  {post.analytics && post.status === 'published' && (
                    <div style={{ display: 'flex', gap: '.8rem', fontSize: '.75rem', color: 'var(--t3)' }}>
                      <span>❤️ {post.analytics.likes}</span>
                      <span>💬 {post.analytics.comments}</span>
                    </div>
                  )}
                  <span className={stClass(post.status)} style={{ fontSize: '.7rem' }}>{stLabel(post.status)}</span>
                </div>
              </div>
            )})}
          </div>
        )}
        </div>
      </div>


    </div>
  )
}

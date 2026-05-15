'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Grid3X3, List, Send, Trash2, Eye, EyeOff, X, Save, Pencil, 
  RotateCcw, RefreshCw, Upload, CheckSquare, Square, Sparkles, 
  PenLine, ChevronDown, PenBox, Calendar, BarChart3, Lightbulb,
  Search, Filter, Image as ImageIcon, Zap, FileText, Download, Settings,
  MoreHorizontal, MessageCircle, Share2, Heart, TrendingUp, AlertCircle
} from 'lucide-react'
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
    default: return <span style={{ width: size, height: size, borderRadius: '4px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.5rem', fontWeight: 700, color: '#fff' }}>{platform.slice(0, 2).toUpperCase()}</span>
  }
}

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
}

function QuickActionCard({ 
  title, description, icon: Icon, color, btnLabel, onClick 
}: { 
  title: string; description: string; icon: any; color: string; btnLabel: string; onClick: () => void 
}) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--b1)',
      borderRadius: '20px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'default',
    }} className="hover-lift">
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        <Icon size={24} />
      </div>
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '4px', fontFamily: "'Syne', sans-serif" }}>{title}</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--t3)', lineHeight: 1.5 }}>{description}</p>
      </div>
      <button 
        onClick={onClick}
        style={{
          marginTop: 'auto',
          background: `${color}10`,
          border: `1px solid ${color}25`,
          color: color,
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s',
          fontFamily: "'DM Sans', sans-serif"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = color;
          e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `${color}10`;
          e.currentTarget.style.color = color;
        }}
      >
        {btnLabel} <span style={{ fontSize: '1rem' }}>→</span>
      </button>
    </div>
  )
}

function PostCard({ post, onClick, onSelect, isSelected }: { post: Post; onClick: () => void; onSelect: () => void; isSelected: boolean }) {
  const stats = post.analytics || { likes: 0, comments: 0, shares: 0 }
  const hasImage = post.media_urls?.[0]
  
  return (
    <div 
      onClick={onClick}
      style={{
        background: 'var(--card)',
        border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--b1)'}`,
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: isSelected ? '0 0 0 1px var(--accent), 0 8px 24px var(--shadow)' : 'none'
      }}
      className="post-card-hover"
    >
      <div style={{ position: 'relative', height: '180px', background: 'var(--s2)' }}>
        {hasImage ? (
          <img src={post.media_urls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', opacity: 0.3 }}>
            <ImageIcon size={40} />
          </div>
        )}
        
        {/* Checkbox Overlay */}
        <div style={{ position: 'absolute', top: '14px', left: '14px' }} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
          <div style={{ 
            width: '22px', height: '22px', borderRadius: '7px', 
            background: isSelected ? 'var(--accent)' : 'rgba(0,0,0,0.35)', 
            border: `1.5px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.45)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)', transition: 'all 0.2s'
          }}>
            {isSelected && <CheckSquare size={14} color="#fff" strokeWidth={3} />}
          </div>
        </div>

        {/* Platform Icons Overlay */}
        <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
          <div style={{ 
            padding: '7px', borderRadius: '10px', 
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)',
            display: 'flex', gap: '5px', border: '1px solid rgba(255,255,255,0.15)'
          }}>
            {post.platforms.map(p => <PlatformIcon key={p} platform={p} size={15} />)}
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ position: 'absolute', bottom: '14px', left: '14px' }}>
          <span className={stClass(post.status)} style={{ 
            fontSize: '0.65rem', padding: '4px 10px', borderRadius: '7px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' 
          }}>
            {stLabel(post.status)}
          </span>
        </div>
      </div>

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{ 
          fontSize: '0.88rem', color: 'var(--t1)', fontWeight: 600, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {post.content || "Sans titre"}
        </p>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--t3)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={12} opacity={0.6} />
            {new Date(post.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            {post.scheduled_at && ` • ${new Date(post.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--b1)', paddingTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--t2)', fontWeight: 500 }}>
              <Heart size={14} /> {stats.likes}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--t2)', fontWeight: 500 }}>
              <MessageCircle size={14} /> {stats.comments}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--t2)', fontWeight: 500 }}>
              <Share2 size={14} /> {stats.shares}
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: '4px' }}>
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToolItem({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 20px', borderRadius: '14px',
        background: 'transparent', border: '1px solid transparent',
        color: 'var(--t2)', fontSize: '0.88rem', cursor: 'pointer',
        transition: 'all 0.2s', flex: 1, minWidth: '200px',
        textAlign: 'left', fontWeight: 500
      }}
      className="tool-item-hover"
    >
      <Icon size={20} opacity={0.7} />
      <span>{label}</span>
    </button>
  )
}

export default function PostsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'scheduled' | 'archived'>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  
  // Logic for existing features
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  function loadPosts(): Promise<void> {
    setLoading(true)
    return fetch('/api/posts?limit=100')
      .then(r => r.json())
      .then(d => { setPosts(d.posts || []); setTotal(d.total || 0); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadPosts().then(() => {
      fetch('/api/posts/sync', { method: 'POST' }).catch(() => {})
    })
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
  }

  async function saveEdit() {
    if (!selectedPost) return
    setSaving(true)
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })
      if (!res.ok) throw new Error('Erreur de sauvegarde')
      toast('Brouillon mis à jour', 'success')
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, content: editContent } : p))
      setSelectedPost(null)
    } catch (err: any) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function doDelete(id: string) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur suppression')
      toast('Post supprimé', 'success')
      setPosts(prev => prev.filter(p => p.id !== id))
      setSelectedPost(null)
    } catch (err: any) {
      toast(err.message, 'error')
    } finally {
      setDeleting(null)
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function bulkDelete() {
    setBulkDeleting(true)
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map(id => fetch(`/api/posts/${id}`, { method: 'DELETE' })))
      toast(`${ids.length} posts supprimés`, 'success')
      setPosts(prev => prev.filter(p => !ids.includes(p.id)))
      setSelectedIds(new Set())
    } catch {
      toast('Erreur suppression', 'error')
    } finally {
      setBulkDeleting(false)
    }
  }

  const filtered = posts.filter(p => {
    if (filter === 'all') return p.status !== 'deleted'
    if (filter === 'published') return p.status === 'published' || p.status === 'partial'
    if (filter === 'draft') return p.status === 'draft' || p.status === 'failed'
    if (filter === 'scheduled') return p.status === 'scheduled'
    if (filter === 'archived') return p.status === 'deleted'
    return true
  })

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="anim-fade-down">
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2.4rem', fontWeight: 800, color: 'var(--t1)', marginBottom: '6px', letterSpacing: '-0.03em' }}>Workspace</h1>
          <p style={{ color: 'var(--t3)', fontSize: '1rem', fontWeight: 500 }}>Votre centre de création, de planification et d'analyse.</p>
        </div>
        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <button style={{ 
              background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '14px', 
              padding: '12px 20px', color: 'var(--t1)', fontSize: '0.9rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
              boxShadow: '0 4px 12px var(--shadow)'
            }}>
              <TrendingUp size={18} color="var(--accent)" /> Personnalisé <ChevronDown size={14} opacity={0.5} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <QuickActionCard 
          title="Nouveau post" 
          description="Créez ou générez du contenu avec ou sans IA." 
          icon={PenBox} 
          color="#3B82F6" 
          btnLabel="Créer maintenant" 
          onClick={() => router.push('/posts/create')} 
        />
        <QuickActionCard 
          title="Calendrier" 
          description="Planifiez et programmez vos publications." 
          icon={Calendar} 
          color="#8B5CF6" 
          btnLabel="Ouvrir le calendrier" 
          onClick={() => router.push('/calendar')} 
        />
        <QuickActionCard 
          title="Analytique" 
          description="Suivez vos performances et votre croissance." 
          icon={BarChart3} 
          color="#10B981" 
          btnLabel="Voir les analyses" 
          onClick={() => router.push('/posts/analytics')} 
        />
        <QuickActionCard 
          title="Idées & Inspiration" 
          description="Découvrez des idées de contenu tendance." 
          icon={Lightbulb} 
          color="#F59E0B" 
          btnLabel="Explorer les idées" 
          onClick={() => toast('Prochainement', 'info')} 
        />
      </div>

      {/* ── Posts Section ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--t1)' }}>Vos posts existants</h2>
            <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700 }}>{total}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'var(--s2)', borderRadius: '12px', padding: '5px', display: 'flex', gap: '2px', border: '1px solid var(--b1)' }}>
              <button 
                onClick={() => setView('grid')}
                style={{ padding: '8px 12px', borderRadius: '10px', background: view === 'grid' ? 'var(--card)' : 'transparent', border: 'none', color: view === 'grid' ? 'var(--accent)' : 'var(--t3)', cursor: 'pointer', transition: '0.2s' }}
              >
                <Grid3X3 size={18} />
              </button>
              <button 
                onClick={() => setView('list')}
                style={{ padding: '8px 12px', borderRadius: '10px', background: view === 'list' ? 'var(--card)' : 'transparent', border: 'none', color: view === 'list' ? 'var(--accent)' : 'var(--t3)', cursor: 'pointer', transition: '0.2s' }}
              >
                <List size={18} />
              </button>
            </div>
            <button style={{ 
              padding: '12px 20px', borderRadius: '14px', background: 'var(--card)', border: '1px solid var(--b1)', 
              color: 'var(--t1)', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'
            }}>
              <Filter size={18} /> Filtres
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '2.5rem', borderBottom: '1px solid var(--b1)', marginBottom: '2.5rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { id: 'all', label: 'Tous' },
            { id: 'published', label: 'Publiés' },
            { id: 'draft', label: 'Brouillons' },
            { id: 'scheduled', label: 'Programmés' },
            { id: 'archived', label: 'Archivés' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              style={{
                padding: '14px 4px',
                background: 'none',
                border: 'none',
                borderBottom: `3px solid ${filter === tab.id ? 'var(--accent)' : 'transparent'}`,
                color: filter === tab.id ? 'var(--t1)' : 'var(--t3)',
                fontSize: '0.95rem',
                fontWeight: filter === tab.id ? 700 : 600,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <RefreshCw size={32} className="spin" style={{ color: 'var(--accent)', opacity: 0.5 }} />
            <p style={{ marginTop: '1rem', color: 'var(--t3)', fontWeight: 500 }}>Chargement de l'espace...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ 
            textAlign: 'center', padding: '8rem 2rem', background: 'var(--card)', 
            border: '2px dashed var(--b1)', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'var(--s2)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--t3)' 
            }}>
              <Search size={32} opacity={0.4} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.5rem' }}>Aucun post ici</h3>
            <p style={{ color: 'var(--t3)', fontSize: '0.9rem', maxWidth: '300px', lineHeight: 1.5 }}>
              Il semble que vous n'ayez pas encore de contenu dans cette catégorie.
            </p>
            <button 
              onClick={() => router.push('/posts/create')}
              style={{ 
                marginTop: '1.5rem', background: 'var(--accent)', color: '#fff', border: 'none', 
                padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' 
              }}
            >
              Créer mon premier post
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr', 
            gap: '1.5rem' 
          }} className="anim-fade-up">
            {filtered.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onClick={() => openPost(post)} 
                isSelected={selectedIds.has(post.id)}
                onSelect={() => toggleSelect(post.id)}
              />
            ))}
          </div>
        )}

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div style={{ 
            position: 'fixed', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--t1)', color: 'var(--bg)', padding: '14px 28px', borderRadius: '20px',
            display: 'flex', alignItems: 'center', gap: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            zIndex: 1000, animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1)'
          }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedIds.size} post(s) sélectionné(s)</span>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={bulkDelete}
                disabled={bulkDeleting}
                style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                {bulkDeleting ? '...' : 'Supprimer'}
              </button>
              <button 
                onClick={() => setSelectedIds(new Set())}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Tools Footer ── */}
      <div className="anim-fade-up" style={{ animationDelay: '0.2s' }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '1.25rem' }}>Outils et plus</h3>
        <div style={{ 
          display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--card)', 
          border: '1px solid var(--b1)', borderRadius: '24px', padding: '16px',
          boxShadow: '0 4px 20px var(--shadow)'
        }}>
          <ToolItem icon={ImageIcon} label="Bibliothèque médias" onClick={() => toast('Prochainement', 'info')} />
          <ToolItem icon={Sparkles} label="Générateur d'images" onClick={() => toast('Prochainement', 'info')} />
          <ToolItem icon={Zap} label="Automatisation" onClick={() => toast('Prochainement', 'info')} />
          <ToolItem icon={FileText} label="Rapports" onClick={() => toast('Prochainement', 'info')} />
          <ToolItem icon={Download} label="Export de données" onClick={() => toast('Prochainement', 'info')} />
          <ToolItem icon={Settings} label="Paramètres" onClick={() => router.push('/settings')} />
        </div>
      </div>

      {/* ── Modal (Post details) ── */}
      {selectedPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedPost(null) }}
        >
          <div className="anim-fade-scale" style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '24px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', borderBottom: '1px solid var(--b1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={stClass(selectedPost.status)} style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>{stLabel(selectedPost.status)}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--t3)', fontWeight: 500 }}>ID: {selectedPost.id.slice(0, 8)}</span>
              </div>
              <button onClick={() => setSelectedPost(null)} style={{ background: 'var(--s2)', border: 'none', cursor: 'pointer', color: 'var(--t1)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '2rem' }}>
              {selectedPost.media_urls?.[0] && (
                <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem', border: '1px solid var(--b1)' }}>
                  <img src={selectedPost.media_urls[0]} alt="" style={{ width: '100%', maxHeight: '350px', objectFit: 'contain', background: 'black' }} />
                </div>
              )}
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Contenu du post</label>
                <div style={{ fontSize: '1rem', color: 'var(--t1)', lineHeight: 1.6, background: 'var(--s2)', padding: '1.5rem', borderRadius: '16px', whiteSpace: 'pre-wrap', border: '1px solid var(--b1)' }}>
                  {selectedPost.content}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => doDelete(selectedPost.id)} disabled={deleting === selectedPost.id} style={{ 
                  flex: 1, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', 
                  padding: '14px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}>
                  <Trash2 size={18} /> {deleting === selectedPost.id ? '...' : 'Supprimer'}
                </button>
                <button onClick={() => setSelectedPost(null)} style={{ 
                  flex: 2, background: 'var(--t1)', color: 'var(--bg)', border: 'none', 
                  padding: '14px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer'
                }}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-lift:hover { transform: translateY(-6px); border-color: var(--accent) !important; box-shadow: 0 16px 32px var(--shadow); }
        .post-card-hover:hover { transform: translateY(-4px); border-color: var(--accent) !important; box-shadow: 0 12px 32px var(--shadow); }
        .tool-item-hover:hover { background: var(--accent-light) !important; color: var(--accent) !important; border-color: var(--accent) !important; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

    </div>
  )
}

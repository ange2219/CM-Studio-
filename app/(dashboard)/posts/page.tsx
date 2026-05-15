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

function PlatformIcon({ platform, size = 14 }: { platform: string; size?: number }) {
  switch (platform) {
    case 'instagram': return <IconInstagram size={size} />
    case 'facebook': return <IconFacebook size={size} />
    case 'tiktok': return <IconTikTok size={size} />
    case 'twitter': return <IconTwitterX size={size} />
    case 'linkedin': return <IconLinkedIn size={size} />
    case 'youtube': return <IconYouTube size={size} />
    case 'pinterest': return <IconPinterest size={size} />
    default: return <span style={{ width: size, height: size, borderRadius: '3px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.45rem', fontWeight: 700, color: '#fff' }}>{platform.slice(0, 2).toUpperCase()}</span>
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
      borderRadius: '14px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      flex: 1,
    }} className="hover-lift">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color
        }}>
          <Icon size={18} />
        </div>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--t1)', fontFamily: "'Syne', sans-serif" }}>{title}</h3>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--t3)', lineHeight: 1.4, height: '32px', overflow: 'hidden' }}>{description}</p>
      <button 
        onClick={onClick}
        style={{
          marginTop: 'auto',
          background: `${color}10`, border: `1px solid ${color}20`,
          color: color, padding: '8px 12px', borderRadius: '8px',
          fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = color; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.color = color; }}
      >
        {btnLabel} <span>→</span>
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
        background: 'var(--card)', border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--b1)'}`,
        borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
        display: 'flex', flexDirection: 'column', position: 'relative', height: '100%'
      }}
      className="post-card-hover"
    >
      <div style={{ position: 'relative', height: '110px', background: 'var(--s2)' }}>
        {hasImage ? (
          <img src={post.media_urls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', opacity: 0.2 }}>
            <ImageIcon size={24} />
          </div>
        )}
        <div style={{ position: 'absolute', top: '8px', left: '8px' }} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
          <div style={{ 
            width: '18px', height: '18px', borderRadius: '5px', 
            background: isSelected ? 'var(--accent)' : 'rgba(0,0,0,0.3)', 
            border: `1px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
          }}>
            {isSelected && <CheckSquare size={12} color="#fff" strokeWidth={3} />}
          </div>
        </div>
        <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
          <div style={{ padding: '4px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', gap: '3px' }}>
            {post.platforms.map(p => <PlatformIcon key={p} platform={p} size={12} />)}
          </div>
        </div>
      </div>

      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ 
          fontSize: '0.78rem', color: 'var(--t1)', fontWeight: 600, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {post.content || "Sans titre"}
        </p>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--b1)', paddingTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', color: 'var(--t2)' }}><Heart size={10} /> {stats.likes}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', color: 'var(--t2)' }}><MessageCircle size={10} /> {stats.comments}</div>
            <div style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--t3)' }}>
              {new Date(post.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToolItem({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '10px',
      background: 'transparent', border: 'none', color: 'var(--t2)', fontSize: '0.78rem', cursor: 'pointer',
      transition: 'all 0.2s', whiteSpace: 'nowrap', fontWeight: 500
    }} className="tool-item-hover">
      <Icon size={16} opacity={0.6} />
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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  function loadPosts(): Promise<void> {
    setLoading(true)
    return fetch('/api/posts?limit=50')
      .then(r => r.json())
      .then(d => { setPosts(d.posts || []); setTotal(d.total || 0); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadPosts() }, [])

  function openPost(post: Post) {
    if (post.status === 'draft' || post.status === 'failed' || post.status === 'scheduled') {
      const variants: Partial<Record<string, string>> = {}
      for (const p of post.platforms) variants[p] = post.content
      sessionStorage.setItem('social_ia_results', JSON.stringify({ variants, platforms: post.platforms, editPostId: post.id, pageTitle: 'Modifier le post' }))
      router.push('/posts/results'); return
    }
    setSelectedPost(post); setEditContent(post.content)
  }

  async function doDelete(id: string) {
    setDeleting(id)
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      toast('Post supprimé', 'success'); setPosts(prev => prev.filter(p => p.id !== id)); setSelectedPost(null)
    } catch { toast('Erreur', 'error') } finally { setDeleting(null) }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
    })
  }

  async function bulkDelete() {
    setBulkDeleting(true); const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map(id => fetch(`/api/posts/${id}`, { method: 'DELETE' })))
      toast(`${ids.length} posts supprimés`, 'success'); setPosts(prev => prev.filter(p => !ids.includes(p.id))); setSelectedIds(new Set())
    } catch { toast('Erreur', 'error') } finally { setBulkDeleting(false) }
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
    <div style={{ 
      height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', 
      padding: '1rem 1.5rem', gap: '1rem', overflow: 'hidden' 
    }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.02em' }}>Workspace</h1>
          <p style={{ color: 'var(--t3)', fontSize: '0.75rem', fontWeight: 500 }}>Centre de création et d'analyse.</p>
        </div>
        <button style={{ 
          background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '10px', 
          padding: '6px 12px', color: 'var(--t1)', fontSize: '0.78rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
        }}>
          <TrendingUp size={14} color="var(--accent)" /> Personnalisé <ChevronDown size={12} opacity={0.5} />
        </button>
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <QuickActionCard title="Nouveau post" description="Créez avec ou sans IA." icon={PenBox} color="#3B82F6" btnLabel="Créer" onClick={() => router.push('/posts/create')} />
        <QuickActionCard title="Calendrier" description="Planifiez vos publications." icon={Calendar} color="#8B5CF6" btnLabel="Ouvrir" onClick={() => router.push('/calendar')} />
        <QuickActionCard title="Analytique" description="Suivez vos performances." icon={BarChart3} color="#10B981" btnLabel="Voir" onClick={() => router.push('/posts/analytics')} />
        <QuickActionCard title="Idées" description="Contenu tendance." icon={Lightbulb} color="#F59E0B" btnLabel="Explorer" onClick={() => toast('Prochainement', 'info')} />
      </div>

      {/* ── Posts Section ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: 'var(--t1)' }}>Posts existants</h2>
            <span style={{ padding: '1px 8px', borderRadius: '10px', background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 700 }}>{total}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'var(--s2)', borderRadius: '8px', padding: '3px', display: 'flex', gap: '2px', border: '1px solid var(--b1)' }}>
              <button onClick={() => setView('grid')} style={{ padding: '4px 8px', borderRadius: '6px', background: view === 'grid' ? 'var(--card)' : 'transparent', border: 'none', color: view === 'grid' ? 'var(--accent)' : 'var(--t3)', cursor: 'pointer' }}><Grid3X3 size={14} /></button>
              <button onClick={() => setView('list')} style={{ padding: '4px 8px', borderRadius: '6px', background: view === 'list' ? 'var(--card)' : 'transparent', border: 'none', color: view === 'list' ? 'var(--accent)' : 'var(--t3)', cursor: 'pointer' }}><List size={14} /></button>
            </div>
            <button style={{ padding: '6px 12px', borderRadius: '10px', background: 'var(--card)', border: '1px solid var(--b1)', color: 'var(--t1)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}><Filter size={14} /> Filtres</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--b1)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {['Tous', 'Publiés', 'Brouillons', 'Programmés', 'Archivés'].map((label, idx) => {
            const id = ['all', 'published', 'draft', 'scheduled', 'archived'][idx]
            return (
              <button key={id} onClick={() => setFilter(id as any)} style={{
                padding: '8px 2px', background: 'none', border: 'none', 
                borderBottom: `2px solid ${filter === id ? 'var(--accent)' : 'transparent'}`,
                color: filter === id ? 'var(--t1)' : 'var(--t3)', fontSize: '0.8rem', fontWeight: filter === id ? 700 : 600,
                cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
              }}>{label}</button>
            )
          })}
        </div>

        {/* Scrollable Grid */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }} className="sb-scroll">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}><RefreshCw size={24} className="spin" opacity={0.3} /></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--b1)', borderRadius: '20px', color: 'var(--t3)', fontSize: '0.8rem' }}>Aucun post trouvé.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {filtered.map(post => (
                <div key={post.id} style={{ height: '210px' }}>
                  <PostCard post={post} onClick={() => openPost(post)} isSelected={selectedIds.has(post.id)} onSelect={() => toggleSelect(post.id)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer Tools ── */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--card)', 
        border: '1px solid var(--b1)', borderRadius: '16px', padding: '6px 10px'
      }}>
        <ToolItem icon={ImageIcon} label="Bibliothèque" onClick={() => toast('Prochainement', 'info')} />
        <ToolItem icon={Sparkles} label="Générateur" onClick={() => toast('Prochainement', 'info')} />
        <ToolItem icon={Zap} label="Auto" onClick={() => toast('Prochainement', 'info')} />
        <ToolItem icon={FileText} label="Rapports" onClick={() => toast('Prochainement', 'info')} />
        <ToolItem icon={Download} label="Export" onClick={() => toast('Prochainement', 'info')} />
        <ToolItem icon={Settings} label="Paramètres" onClick={() => router.push('/settings')} />
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div style={{ 
          position: 'fixed', bottom: '5rem', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--t1)', color: 'var(--bg)', padding: '10px 20px', borderRadius: '14px',
          display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.4)', zIndex: 1000
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{selectedIds.size} sélectionnés</span>
          <button onClick={bulkDelete} disabled={bulkDeleting} style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}>{bulkDeleting ? '...' : 'Supprimer'}</button>
          <button onClick={() => setSelectedIds(new Set())} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}>Annuler</button>
        </div>
      )}

      {/* Details Modal */}
      {selectedPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedPost(null) }}
        >
          <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '20px', width: '100%', maxWidth: '420px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--b1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={stClass(selectedPost.status)} style={{ fontSize: '0.65rem' }}>{stLabel(selectedPost.status)}</span>
              <button onClick={() => setSelectedPost(null)} style={{ background: 'none', border: 'none', color: 'var(--t1)' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {selectedPost.media_urls?.[0] && <img src={selectedPost.media_urls[0]} alt="" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />}
              <div style={{ fontSize: '0.85rem', color: 'var(--t1)', lineHeight: 1.5, background: 'var(--s2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>{selectedPost.content}</div>
              <button onClick={() => doDelete(selectedPost.id)} disabled={deleting === selectedPost.id} style={{ width: '100%', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 700 }}>{deleting === selectedPost.id ? '...' : 'Supprimer'}</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-lift:hover { transform: translateY(-2px); border-color: var(--accent) !important; }
        .post-card-hover:hover { border-color: var(--accent) !important; }
        .tool-item-hover:hover { background: var(--accent-light) !important; color: var(--accent) !important; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .sb-scroll::-webkit-scrollbar { width: 3px; }
        .sb-scroll::-webkit-scrollbar-thumb { background: var(--b1); border-radius: 10px; }
      `}</style>

    </div>
  )
}

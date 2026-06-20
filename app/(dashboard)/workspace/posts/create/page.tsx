'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import {
  Save, Send, Upload, X, ArrowLeft, Clock,
  ChevronDown, Settings2, Layers, Zap, Check, Target, Star,
  Sparkles, Lock, Bookmark, Bold, Italic, Underline, Strikethrough, List, Link, Smile
} from 'lucide-react'
import { IconInstagram, IconFacebook, IconTikTok, IconTwitterX, IconLinkedIn, IconYouTube, IconPinterest } from '@/components/icons/BrandIcons'
import {
  PLATFORM_NAMES, FREE_PLATFORMS, OBJECTIVE_LABELS, OBJECTIVE_DEFAULTS, OBJECTIVE_DESCRIPTIONS,
  LENGTH_LABELS, FORMAT_LABELS, POSTTONE_LABELS, CTA_LABELS, PLATFORM_CONSTRAINTS_INFO,
  type Platform, type PostObjective, type DistributionMode, type GenerationParams,
  type PostLength, type PostFormat, type PostTone, type PostCTA,
} from '@/types'

// ─── Constantes ───────────────────────────────────────────────────────────────

const ALL_PLATFORMS: Platform[] = ['instagram', 'facebook', 'tiktok', 'twitter', 'linkedin', 'youtube', 'pinterest']

const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: '#E1306C', facebook: '#1877F2', tiktok: '#000',
  twitter: '#1DA1F2', linkedin: '#0077B5', youtube: '#FF0000', pinterest: '#E60023',
}

const STEPS_SINGLE = [
  'Analyse du profil de marque',
  'Recherche d\'idées créatives',
  'Rédaction du post',
  'Optimisation par plateforme',
  'Prêt pour validation',
]

function PlatformIcon({ platform, size = 16 }: { platform: Platform; size?: number }) {
  switch (platform) {
    case 'instagram': return <IconInstagram size={size} />
    case 'facebook':  return <IconFacebook  size={size} />
    case 'tiktok':    return <IconTikTok    size={size} />
    case 'twitter':   return <IconTwitterX  size={size} />
    case 'linkedin':  return <IconLinkedIn  size={size} />
    case 'youtube':   return <IconYouTube   size={size} />
    case 'pinterest': return <IconPinterest size={size} />
  }
}

// ─── Chip selector helper ──────────────────────────────────────────────────────

function ChipGroup<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: '.3rem .75rem', borderRadius: '6px', fontSize: '.78rem', fontWeight: 500,
            border: `1px solid ${value === o.value ? 'var(--accent)' : 'var(--b1)'}`,
            background: value === o.value ? 'rgba(123,92,245,.12)' : 'transparent',
            color: value === o.value ? 'var(--accent)' : 'var(--t2)',
            cursor: 'pointer', transition: '.12s',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}



// ─── Panneau aperçu live ───────────────────────────────────────────────────────


// ─── Modal action post (mode manuel) ─────────────────────────────────────────

interface ActionModalProps {
  content: string
  platforms: Platform[]
  mediaUrls?: string[]
  aiGenerated: boolean
  onClose: () => void
}

function PostActionModal({ content, platforms, mediaUrls, aiGenerated, onClose }: ActionModalProps) {
  const { toast } = useToast()
  const [view, setView] = useState<'main' | 'schedule'>('main')
  const [schedDate, setSchedDate] = useState('')
  const [schedTime, setSchedTime] = useState('')
  const [loading, setLoading] = useState(false)

  async function savePost(): Promise<string> {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, platforms, media_urls: mediaUrls || [], ai_generated: aiGenerated }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erreur de sauvegarde')
    return data.id
  }

  async function handleDraft() {
    setLoading(true)
    try { await savePost(); toast('Post sauvegardé en brouillon', 'success'); onClose() }
    catch (err: unknown) { toast(err instanceof Error ? err.message : 'Erreur', 'error') }
    finally { setLoading(false) }
  }

  function checkInstagramImage(): boolean {
    if (platforms.includes('instagram') && (!mediaUrls || mediaUrls.length === 0)) {
      toast('Veuillez ajouter une image pour Instagram.', 'warning')
      return false
    }
    return true
  }

  async function handlePublish() {
    if (!checkInstagramImage()) return
    setLoading(true)
    try {
      const id = await savePost()
      const res = await fetch(`/api/posts/${id}/publish`, { method: 'POST' })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      toast('Post publié avec succès !', 'success'); onClose()
    } catch (err: unknown) { toast(err instanceof Error ? err.message : 'Erreur de publication', 'error') }
    finally { setLoading(false) }
  }

  async function handleSchedule() {
    if (!checkInstagramImage()) return
    if (!schedDate || !schedTime) { toast('Choisissez une date et une heure', 'error'); return }
    const scheduledAt = new Date(`${schedDate}T${schedTime}`).toISOString()
    if (new Date(scheduledAt) <= new Date()) { toast('La date doit être dans le futur', 'error'); return }
    setLoading(true)
    try {
      const id = await savePost()
      const res = await fetch(`/api/posts/${id}/schedule`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      toast('Post programmé avec succès !', 'success'); onClose()
    } catch (err: unknown) { toast(err instanceof Error ? err.message : 'Erreur de programmation', 'error') }
    finally { setLoading(false) }
  }

  const minDate    = new Date(Date.now() + 5 * 60 * 1000)
  const minDateStr = minDate.toISOString().split('T')[0]
  const minTimeStr = minDate.toTimeString().slice(0, 5)

  return (
    <div className="modal-ov" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        {view === 'main' ? (
          <>
            <div className="modal-title">Que faire avec ce post ?</div>
            <div className="modal-sub">Choisissez comment publier ou conserver ce contenu.</div>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-blue" onClick={handlePublish} disabled={loading}><Send size={15} />Publier maintenant</button>
              <button className="modal-btn modal-btn-border" onClick={() => setView('schedule')} disabled={loading}><Clock size={15} />Programmer pour plus tard</button>
              <hr className="modal-sep" />
              <button className="modal-btn modal-btn-border" onClick={handleDraft} disabled={loading}><Save size={15} />Sauvegarder en brouillon</button>
              <button className="modal-btn modal-btn-ghost" onClick={onClose} disabled={loading}>Annuler</button>
            </div>
          </>
        ) : (
          <>
            <button className="modal-back" onClick={() => setView('main')}><ArrowLeft size={13} /> Retour</button>
            <div className="modal-title">Programmer le post</div>
            <div className="modal-sub">Choisissez la date et l'heure de publication.</div>
            <div className="modal-sched">
              <div className="modal-sched-row">
                <input type="date" value={schedDate} min={minDateStr} onChange={e => setSchedDate(e.target.value)} />
                <input type="time" value={schedTime} min={schedDate === minDateStr ? minTimeStr : undefined} onChange={e => setSchedTime(e.target.value)} />
              </div>
              <button className="modal-btn modal-btn-blue" onClick={handleSchedule} disabled={loading}>
                <Clock size={15} />{loading ? 'Programmation...' : 'Confirmer la programmation'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Icônes d'objectif (petites, colorées) ────────────────────────────────────

const OBJ_COLORS: Record<string, string> = {
  vendre: '#EF4444', engager: '#7B5CF5', eduquer: '#06B6D4',
  inspirer: '#F59E0B', annoncer: '#10B981', fideliser: '#EC4899',
}

function ObjIcon({ objective, active, size = 13 }: { objective: string; active: boolean; size?: number }) {
  const color = OBJ_COLORS[objective] || (active ? 'var(--accent)' : 'var(--t3)')
  const s = size
  switch (objective) {
    case 'vendre':    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    case 'engager':   return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    case 'eduquer':   return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    case 'inspirer':  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    case 'annoncer':  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    case 'fideliser': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    default:          return <div style={{ width: s, height: s, borderRadius: '50%', background: color }} />
  }
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function CreatePage() {
  const { toast }  = useToast()
  const router     = useRouter()
  const fileRef    = useRef<HTMLInputElement>(null)
  const objMenuRef = useRef<HTMLDivElement>(null)

  // Mode : AI (défaut) ou manuel (?mode=manual)
  const [mode, setMode] = useState<'ai' | 'manual'>('ai')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('mode') === 'manual') setMode('manual')
    }
  }, [])

  // ── Paramètres IA ──
  const [objective, setObjective]           = useState<string | null>(null)
  const [brief, setBrief]                   = useState('')
  const [params, setParams]                 = useState<GenerationParams>({
    length: 'moyen', format: 'direct', tone: 'professionnel', cta: 'aucun',
  })
  const [distributionMode, setDistributionMode] = useState<DistributionMode>('unified')
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([])




  // ── Résultats IA ──
  const [variants,           setVariants]          = useState<Partial<Record<Platform, string>>>({})
  const [aiUploadedUrl,      setAiUploadedUrl]     = useState<string | null>(null)
  const [generatedImageUrl,  setGeneratedImageUrl] = useState<string | null>(null)
  const [quotaUsed,          setQuotaUsed]         = useState(0)
  const [quotaLimit,         setQuotaLimit]        = useState<number | 'unlimited'>('unlimited')

  // ── Overlay ──
  const [overlayOpen,  setOverlayOpen]  = useState(false)
  const [overlaySteps, setOverlaySteps] = useState<string[]>([])
  const [stepStates,   setStepStates]   = useState<string[]>([])

  // ── Mode manuel ──
  const [manualContent,    setManualContent]    = useState('')
  const [manualFile,       setManualFile]       = useState<File | null>(null)
  const [manualPreviewUrl, setManualPreviewUrl] = useState<string | null>(null)
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null)
  const [uploadingFile,    setUploadingFile]    = useState(false)
  const [actionModal, setActionModal] = useState<{
    content: string; platforms: Platform[]; mediaUrls?: string[]; aiGenerated: boolean
  } | null>(null)

  // ── Plan ──
  const [isPro, setIsPro] = useState(false)
  const [connectedPlatforms, setConnectedPlatforms] = useState<Platform[]>([])
  const [connectPopupPlatform, setConnectPopupPlatform] = useState<Platform | null>(null)

  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const supabase = createClient()
    supabase.from('users').select('plan').single().then(({ data }) => {
      if (data && data.plan && data.plan !== 'free') setIsPro(true)
    })
    supabase.from('social_accounts').select('platform').eq('is_active', true).then(({ data }) => {
      if (data && data.length > 0) {
        setConnectedPlatforms(Array.from(new Set(data.map((r: any) => r.platform as Platform))))
      }
    })
    fetch('/api/brand').then((r: Response) => r.ok ? r.json() : null).then((b: any) => {
      if (b?.tone) {
        // Mapper l'ancien GenerateTone vers PostTone si possible
        const toneMap: Record<string, PostTone> = {
          professionnel: 'professionnel', decontracte: 'decontracte',
          inspirant: 'emotionnel', humoristique: 'decontracte',
          emotionnel: 'emotionnel', expert: 'expert',
        }
        const mapped = toneMap[b.tone as string]
        if (mapped) setParams(p => ({ ...p, tone: mapped }))
      }
    }).catch(() => {})
  }, [])

  // Restaurer brouillon sessionStorage (brief + objective toujours vides au démarrage)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('social_ia_create_draft')
      if (saved) {
        const d = JSON.parse(saved)
        // brief et objective ne sont PAS restaurés — toujours commencer vide
        if (d.params)                    setParams(d.params)
        if (d.selectedPlatforms)         setSelectedPlatforms(d.selectedPlatforms)
        if (d.distributionMode)          setDistributionMode(d.distributionMode)
        if (d.manualContent !== undefined) setManualContent(d.manualContent)
      }
    } catch { /* ignore */ }
  }, [])

  // Persister brouillon
  useEffect(() => {
    try {
      sessionStorage.setItem('social_ia_create_draft', JSON.stringify({
        brief, params, objective, selectedPlatforms, distributionMode,
        variants, manualContent, aiUploadedUrl, generatedImageUrl,
      }))
    } catch { /* ignore */ }
  }, [brief, params, objective, selectedPlatforms, distributionMode, variants, manualContent, aiUploadedUrl, generatedImageUrl])


  // Auto-détecter l'objectif + paramètres optimaux à partir du brief (debounce 600ms)
  const [aiDetecting, setAiDetecting] = useState(false)
  useEffect(() => {
    if (brief.trim().length < 8) {
      setObjective(null)
      return
    }
    const timer = setTimeout(async () => {
      setAiDetecting(true)
      try {
        const res = await fetch('/api/ai/detect-objective', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brief: brief.trim(), platforms: selectedPlatforms }),
        })
        const data = await res.json()
        if (res.ok && data.objective) {
          setObjective(data.objective as string)
        }
        if (res.ok && data.params) {
          setParams(data.params)
        }
      } catch { /* silencieux */ }
      finally { setAiDetecting(false) }
    }, 600)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief, selectedPlatforms])

  // ──────────────────────────────────────────────────────────────────────────

  async function runOverlay(steps: string[], apiFn: () => Promise<void>) {
    setOverlaySteps(steps)
    setStepStates(steps.map(() => ''))
    setOverlayOpen(true)
    const apiPromise = apiFn()
    for (let i = 0; i < steps.length; i++) {
      setStepStates(prev => prev.map((_, idx) => idx === i ? 'on' : idx < i ? 'done' : ''))
      await new Promise(r => setTimeout(r, 680))
    }
    setStepStates(steps.map(() => 'done'))
    await apiPromise
    await new Promise(r => setTimeout(r, 400))
    setOverlayOpen(false)
  }

  async function handleGenerate() {
    if (!selectedPlatforms.length) { toast('Veuillez choisir au moins une plateforme avant de générer.', 'warning'); return }
    await runOverlay(STEPS_SINGLE, async () => {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief:            brief.trim() || undefined,
          tone:             params.tone,
          platforms:        selectedPlatforms,
          objective:        objective || undefined,
          length:           params.length,
          format:           params.format,
          cta:              params.cta,
          distributionMode: distributionMode,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast(
          data.code === 'DAILY_LIMIT_REACHED'
            ? 'Limite journalière atteinte — passez à Premium'
            : data.error || 'Erreur de génération',
          'error'
        )
        return
      }
      // Enregistrer les résultats et naviguer vers la page dédiée
      sessionStorage.setItem('social_ia_results', JSON.stringify({
        variants:         data.variants,
        platforms:        selectedPlatforms,
        objective,
        quotaUsed:        data.used  ?? 0,
        quotaLimit:       data.limit ?? 'unlimited',
        isPro,
        distributionMode: distributionMode,
      }))
      setBrief('')
      setObjective(null)

      sessionStorage.removeItem('social_ia_create_draft')
      router.push('/workspace/posts/results')
    })
  }

  async function savePost(
    platform: Platform, content: string, mediaUrl: string | null,
    status: 'draft' | 'scheduled', scheduledAt?: string,
  ): Promise<string> {
    const res = await fetch('/api/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content, platforms: [platform],
        media_urls: mediaUrl ? [mediaUrl] : [],
        ai_generated: true, status, scheduled_at: scheduledAt,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erreur')
    return data.id
  }

  async function handlePublishVariant(platform: Platform, content: string, imageUrl: string | null) {
    if (platform === 'instagram' && !imageUrl) {
      toast('Veuillez ajouter une image pour Instagram.', 'warning'); return
    }
    const id = await savePost(platform, content, imageUrl, 'draft')
    const res = await fetch(`/api/posts/${id}/publish`, { method: 'POST' })
    if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
  }

  async function handleSaveDraft(platform: Platform, content: string, imageUrl: string | null) {
    await savePost(platform, content, imageUrl, 'draft')
  }

  async function handleScheduleVariant(platform: Platform, content: string, imageUrl: string | null, scheduledAt: string) {
    if (new Date(scheduledAt) <= new Date()) throw new Error('La date doit être dans le futur')
    const id = await savePost(platform, content, imageUrl, 'draft')
    const res = await fetch(`/api/posts/${id}/schedule`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledAt }),
    })
    if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
  }

  // ── Mode manuel ──

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setManualFile(file); setManualPreviewUrl(URL.createObjectURL(file)); setUploadedMediaUrl(null)
  }

  async function handleManualSubmit() {
    if (!manualContent.trim()) { toast('Écrivez votre post avant de continuer', 'error'); return }
    if (!selectedPlatforms.length) { toast('Sélectionnez au moins une plateforme', 'error'); return }
    let mediaUrl: string | undefined
    if (manualFile && !uploadedMediaUrl) {
      setUploadingFile(true)
      try {
        const fd = new FormData(); fd.append('file', manualFile)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        mediaUrl = data.url; setUploadedMediaUrl(data.url)
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : 'Erreur upload', 'error')
        setUploadingFile(false); return
      }
      setUploadingFile(false)
    } else if (uploadedMediaUrl) {
      mediaUrl = uploadedMediaUrl
    }
    const variants: Partial<Record<string, string>> = {}
    const initialImages: Partial<Record<string, string>> = {}
    for (const p of selectedPlatforms) {
      variants[p] = manualContent
      if (mediaUrl) initialImages[p] = mediaUrl
    }
    try {
      sessionStorage.setItem('social_ia_results', JSON.stringify({
        variants,
        platforms: selectedPlatforms,
        objective: null,
        quotaUsed: 0,
        quotaLimit: 'unlimited',
        isPro: true,
        initialImages: Object.keys(initialImages).length > 0 ? initialImages : undefined,
        pageTitle: 'Créer un post',
        allowPlatformToggle: true,
      }))
    } catch {}
    router.push('/workspace/posts/results')
  }

  // ──────────────────────────────────────────────────────────────────────────

  const hasVariants = Object.keys(variants).length > 0

  // ── Label bouton objectif ──
  const objectiveBtnLabel = objective || 'Objectif'

  return (
    <div className="pc" style={{ maxWidth: '1200px', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Overlay génération */}
      {overlayOpen && (
        <div className="gen-ov on">
          <div className="spin" />
          <div className="gen-label">Génération en cours…</div>
          <div className="gen-steps">
            {overlaySteps.map((label, i) => (
              <div key={i} className={`gs${stepStates[i] ? ' ' + stepStates[i] : ''}`}>
                <div className="gs-d" />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Modal action (mode manuel) */}
      {actionModal && (
        <PostActionModal
          {...actionModal}
          onClose={() => setActionModal(null)}
        />
      )}

      {/* ── Mode manuel ────────────────────────────────────────────────── */}
      {mode === 'manual' && (
        <div style={{ maxWidth: '480px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setMode('ai')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px', transition: '.12s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--t1)'; e.currentTarget.style.background = 'var(--s2)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.background = 'none' }}
            >
              <ArrowLeft size={18} />
            </button>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-.02em' }}>
              Créer manuellement
            </h1>
          </div>

          {/* Plateformes */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--t2)', marginBottom: '.75rem' }}>
              Plateformes
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.45rem', marginBottom: '1.25rem' }}>
              {((isPro ? ['linkedin', 'instagram', 'twitter', 'facebook', 'tiktok'] : ['facebook', 'instagram']) as Platform[]).map(p => {
                const isSelected = selectedPlatforms.includes(p)
                return (
                  <button
                    key={p}
                    onClick={() => setSelectedPlatforms(prev =>
                      prev.includes(p)
                        ? prev.length > 1 ? prev.filter(x => x !== p) : prev
                        : [...prev, p]
                    )}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '.4rem',
                      padding: '.35rem .75rem', borderRadius: '8px', fontSize: '.8rem', fontWeight: 500,
                      border: `1px solid ${isSelected ? PLATFORM_COLORS[p] + '60' : 'var(--b1)'}`,
                      background: isSelected ? PLATFORM_COLORS[p] + '12' : 'transparent',
                      color: isSelected ? PLATFORM_COLORS[p] : 'var(--t2)',
                      cursor: 'pointer', transition: '.12s',
                    }}
                  >
                    <PlatformIcon platform={p} size={14} />
                    {PLATFORM_NAMES[p]}
                  </button>
                )
              })}
            </div>
            <p style={{ fontSize: '.73rem', color: 'var(--t3)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Vous rédigerez votre contenu directement dans l&apos;éditeur — une carte par plateforme.
            </p>
            <button
              onClick={() => {
                if (!selectedPlatforms.length) { toast('Sélectionnez au moins une plateforme', 'error'); return }
                const variants: Partial<Record<string, string>> = {}
                for (const p of selectedPlatforms) variants[p] = ''
                try {
                  sessionStorage.setItem('social_ia_results', JSON.stringify({
                    variants, platforms: selectedPlatforms,
                    objective: null, quotaUsed: 0, quotaLimit: 'unlimited', isPro: true,
                    pageTitle: 'Créer un post',
                    allowPlatformToggle: true,
                  }))
                } catch {}
                router.push('/workspace/posts/results')
              }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.7rem' }}
            >
              <Send size={14} /> Ouvrir l&apos;éditeur
            </button>
          </div>
        </div>
      )}

      {/* ── Mode IA ────────────────────────────────────────────────────── */}
      {mode === 'ai' && (
        <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: 0, overflow: 'hidden' }}>

          {/* ── Modal connexion requise ── */}
          {connectPopupPlatform && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={e => { if (e.target === e.currentTarget) setConnectPopupPlatform(null) }}
            >
              <div style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.75rem', width: '100%', maxWidth: '360px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PLATFORM_COLORS[connectPopupPlatform] }}>
                    <PlatformIcon platform={connectPopupPlatform} size={18} />
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--t1)' }}>Connexion requise</div>
                </div>
                <div style={{ fontSize: '.85rem', color: 'var(--t3)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Vous n'avez pas connecté votre compte {PLATFORM_NAMES[connectPopupPlatform]}. Voulez-vous vous connecter maintenant ?
                </div>
                <div style={{ display: 'flex', gap: '.6rem' }}>
                  <button onClick={() => setConnectPopupPlatform(null)} style={{ flex: 1, padding: '.6rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'var(--t3)', cursor: 'pointer', fontSize: '.85rem' }}>
                    Annuler
                  </button>
                  <button onClick={() => router.push('/settings')} style={{ flex: 1, padding: '.6rem', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600 }}>
                    Connecter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Colonne gauche : Éditeur ── */}
          <div style={{ flex: '1 1 500px', minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <button
                  onClick={() => router.push('/workspace')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '8px', transition: '.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--t1)'; e.currentTarget.style.background = 'var(--s2)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.background = 'none' }}
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-.02em', margin: 0 }}>
                    Générer un post
                  </h1>
                  <p style={{ color: 'var(--t3)', fontSize: '.85rem', margin: '0' }}>Générez du contenu engageant avec l'IA</p>
                </div>
              </div>

              <button
                onClick={() => toast("Suggestions d'idées disponibles bientôt", "info")}
                style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem 1rem', borderRadius: '8px', border: '1px solid var(--b1)', background: 'transparent', color: 'var(--t2)', fontSize: '.85rem', cursor: 'pointer', transition: '.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--s2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <Bookmark size={16} /> Trouver une idée <ChevronDown size={14} />
              </button>
            </div>

            <div style={{ marginBottom: '.5rem', fontSize: '.9rem', color: 'var(--t1)' }}>1. Sujet</div>

            <div style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              {/* Toolbar */}
              <div style={{ padding: '.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {[
                  { icon: Bold, label: 'Gras' }, { icon: Italic, label: 'Italique' }, { icon: Underline, label: 'Souligné' }, { icon: Strikethrough, label: 'Barré' },
                  { icon: List, label: 'Liste' }, { icon: Link, label: 'Lien' }, { icon: Smile, label: 'Emoji' }
                ].map((item, i) => (
                  <button key={i} onClick={() => toast("Formatage disponible bientôt", "info")} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--t3)', transition: '.2s', borderRadius: '4px' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--s2)'; e.currentTarget.style.color = 'var(--t1)' }} onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--t3)' }}>
                    <item.icon size={16} />
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                value={brief}
                onChange={e => setBrief(e.target.value)}
                placeholder="Décrivez votre idée, votre produit ou votre objectif..."
                style={{ width: '100%', minHeight: '300px', background: 'transparent', border: 'none', padding: '1rem', color: 'var(--t1)', fontSize: '.95rem', resize: 'vertical', outline: 'none' }}
              />

              {/* Footer */}
              <div style={{ padding: '.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '.75rem', color: 'var(--t3)' }}>{brief.length} / 2000 caractères</span>
                <button onClick={() => toast("Suggestions IA disponibles bientôt", "info")} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '.4rem .75rem', fontSize: '.75rem', color: 'var(--t2)', cursor: 'pointer', transition: '.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--t3)' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
                  <Sparkles size={14} style={{ color: 'var(--t3)' }} /> Suggestions IA
                </button>
              </div>
            </div>

            {/* Bouton générer principal */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden' }}>
                <button onClick={handleGenerate} className="btn-primary" style={{ padding: '.8rem 2rem', fontSize: '.95rem', borderRadius: 0, display: 'flex', alignItems: 'center', gap: '.5rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                  <Sparkles size={18} /> Générer le post
                </button>
                <button onClick={() => toast("Options supplémentaires bientôt", "info")} className="btn-primary" style={{ padding: '.8rem .8rem', borderRadius: 0 }}>
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Colonne droite : Paramètres ── */}
          <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '4px' }}>

            {/* Block Plateforme */}
            <div style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--t1)', margin: '0 0 .25rem 0' }}>Plateforme</h3>
              <p style={{ fontSize: '.75rem', color: 'var(--t3)', margin: '0 0 1.25rem 0' }}>Choisissez où publier votre contenu</p>

              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.25rem' }}>
                <button
                  onClick={() => setDistributionMode('unified')}
                  style={{ flex: 1, padding: '.5rem', background: 'none', border: 'none', borderBottom: distributionMode === 'unified' ? '2px solid var(--accent)' : '2px solid transparent', color: distributionMode === 'unified' ? 'var(--accent)' : 'var(--t3)', fontSize: '.85rem', fontWeight: 500, cursor: 'pointer', transition: '.2s' }}
                >
                  Unifier
                </button>
                <button
                  onClick={() => setDistributionMode('custom')}
                  style={{ flex: 1, padding: '.5rem', background: 'none', border: 'none', borderBottom: distributionMode === 'custom' ? '2px solid var(--accent)' : '2px solid transparent', color: distributionMode === 'custom' ? 'var(--accent)' : 'var(--t3)', fontSize: '.85rem', fontWeight: 500, cursor: 'pointer', transition: '.2s' }}
                >
                  Séparer
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                {((isPro ? ['linkedin', 'instagram', 'twitter', 'facebook', 'tiktok'] : ['facebook', 'instagram']) as Platform[]).map(p => {
                  const isSel = selectedPlatforms.includes(p)
                  const isPriority = distributionMode === 'unified' && selectedPlatforms[0] === p

                  return (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '.5rem', borderRadius: '8px', background: 'transparent', transition: '.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                        {isPriority && <Star size={14} color="var(--accent)" fill="var(--accent)" style={{ marginRight: '-4px' }} />}
                        <PlatformIcon platform={p} size={18} />
                        <span style={{ fontSize: '.85rem', color: isSel ? 'var(--t1)' : 'var(--t2)', fontWeight: isSel ? 500 : 400 }}>{PLATFORM_NAMES[p]}</span>
                      </div>
                      <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `1px solid ${isSel ? 'var(--accent)' : 'var(--t3)'}`, background: isSel ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isSel && <Check size={12} color="#fff" />}
                      </div>
                      <input type="checkbox" checked={isSel} onChange={() => {
                        if (isSel) {
                          setSelectedPlatforms(prev => prev.filter(x => x !== p))
                        } else {
                          setSelectedPlatforms(prev => [...prev, p])
                        }
                      }} style={{ display: 'none' }} />
                    </label>
                  )
                })}

                {!isPro && (
                  <div style={{ marginTop: '.5rem', paddingTop: '.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '.75rem', color: 'var(--t3)', marginBottom: '.5rem' }}>Autres réseaux (PRO)</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {(['linkedin', 'twitter', 'tiktok'] as Platform[]).map((p, i) => (
                          <div key={p} style={{ width: '22px', height: '22px', borderRadius: '50%', background: PLATFORM_COLORS[p], display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--card)', marginLeft: i === 0 ? 0 : '-8px', zIndex: 10 - i }}>
                            <PlatformIcon platform={p} size={11} />
                          </div>
                        ))}
                      </div>
                      <button onClick={() => router.push('/settings')} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.75rem', color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}>
                        <Lock size={12} /> Débloquer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Block Paramètres */}
            <div style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.25rem' }}>
                <Settings2 size={16} color="var(--t2)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--t1)', margin: 0 }}>Paramètres</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--t3)', marginBottom: '.5rem' }}>Ton du contenu</label>
                  <select
                    value={params.tone}
                    onChange={e => setParams({ ...params, tone: e.target.value as PostTone })}
                    style={{ width: '100%', padding: '.6rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'var(--t1)', fontSize: '.85rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="professionnel">Professionnel</option>
                    <option value="decontracte">Décontracté</option>
                    <option value="emotionnel">Émotionnel</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--t3)', marginBottom: '.5rem' }}>Longueur</label>
                  <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                    {(['court', 'moyen', 'long'] as const).map(l => (
                      <button
                        key={l}
                        onClick={() => setParams({ ...params, length: l })}
                        style={{
                          flex: 1, padding: '.5rem', border: 'none',
                          background: params.length === l ? 'var(--accent)' : 'transparent',
                          color: params.length === l ? '#fff' : 'var(--t3)',
                          fontSize: '.8rem', fontWeight: 500, cursor: 'pointer', transition: '.2s'
                        }}
                      >
                        {l === 'court' ? 'Court' : l === 'moyen' ? 'Moyen' : 'Long'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--t3)', marginBottom: '.5rem' }}>Format</label>
                  <select
                    value={params.format}
                    onChange={e => setParams({ ...params, format: e.target.value as PostFormat })}
                    style={{ width: '100%', padding: '.6rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'var(--t1)', fontSize: '.85rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="direct">Humoristique</option>
                    <option value="liste">Liste</option>
                    <option value="narratif">Narratif</option>
                    <option value="question">Question</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}

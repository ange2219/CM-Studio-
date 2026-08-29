'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'
import {
  Platform, PostObjective,
  PLATFORM_NAMES,
} from '@/types'
import {
  IconInstagram, IconFacebook, IconTikTok,
  IconTwitterX, IconLinkedIn, IconYouTube, IconPinterest,
} from '@/components/icons/BrandIcons'
import { UserAvatar } from '@/components/ui/UserAvatar'
import {
  X, Sparkles, RotateCcw, Clock, Send, Upload, Trash2, Save,
  Image as ImageIcon, Globe, Heart, MessageCircle, Repeat2,
  Bookmark, BarChart2, Share2, ThumbsUp, ChevronLeft, ChevronRight
} from 'lucide-react'

export interface SocialAccount {
  platform: Platform
  platform_username: string | null
  platform_avatar_url: string | null
}

export interface CardState {
  content: string
  imageUrl: string | null
  imageLoading: boolean
  scheduledAt: string | null
}

export interface GeneratedPostsViewProps {
  platforms:             Platform[]
  variants:              Partial<Record<Platform, string>>
  objective:             PostObjective | null
  quotaUsed:             number
  quotaLimit:            number | 'unlimited'
  isPro:                 boolean
  userName?:             string | null
  userAvatar?:           string | null
  brandProfile?: {
    brand_name?: string | null
    industry?: string | null
    description?: string | null
    logo_url?: string | null
  } | null
  socialAccounts?:       SocialAccount[]
  initialImages?:        Partial<Record<Platform, string>>
  initialScheduledAt?:   string
  allowPlatformToggle?:  boolean
  unifiedMode?:          boolean
  onSaveDraft:           (platform: Platform, content: string, imageUrl: string | null) => Promise<void>
  onPublish:             (platform: Platform, content: string, imageUrl: string | null) => Promise<void>
  onSchedule:            (platform: Platform, content: string, imageUrl: string | null, scheduledAt: string) => Promise<void>
  onClose?:              () => void
}

function PlatformIcon({ platform, size = 20 }: { platform: Platform; size?: number }) {
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

function lowercaseHashtags(text: string): string {
  return text.replace(/#(\w+)/g, (_, tag) => '#' + tag.toLowerCase())
}

const CHAR_LIMITS: Partial<Record<Platform, number>> = {
  twitter:   280,
  instagram: 2200,
  facebook:  2000,
  linkedin:  3000,
  tiktok:    300,
  youtube:   5000,
  pinterest: 500,
}

// ─── WheelColumn ─────────────────────────────────────────────────────────────

function WheelColumn({
  items, selectedIndex, onChange,
}: {
  items: string[]
  selectedIndex: number
  onChange: (index: number) => void
}) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const ITEM_H        = 42
  const lastFiredIdx  = useRef(selectedIndex)
  const didMount      = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (!didMount.current) {
      didMount.current = true
      el.scrollTop = selectedIndex * ITEM_H
    } else {
      el.scrollTo({ top: selectedIndex * ITEM_H, behavior: 'smooth' })
    }
  }, [selectedIndex])

  function handleScroll() {
    const el = containerRef.current
    if (!el) return
    const idx = Math.max(0, Math.min(Math.round(el.scrollTop / ITEM_H), items.length - 1))
    if (idx !== lastFiredIdx.current) {
      lastFiredIdx.current = idx
      if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(8)
      onChange(idx)
    }
  }

  return (
    <div style={{ position: 'relative', height: ITEM_H * 5, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: ITEM_H * 2,
        background: 'linear-gradient(to bottom, #1e293b 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM_H * 2,
        background: 'linear-gradient(to top, #1e293b 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', top: ITEM_H * 2, left: 6, right: 6, height: ITEM_H,
        background: 'rgba(56,189,248,.18)', borderRadius: '8px',
        border: '1px solid rgba(56,189,248,.3)',
        pointerEvents: 'none', zIndex: 1,
      }} />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          paddingTop: ITEM_H * 2,
          paddingBottom: ITEM_H * 2,
          scrollbarWidth: 'none',
        } as React.CSSProperties}
      >
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => {
              containerRef.current?.scrollTo({ top: i * ITEM_H, behavior: 'smooth' })
              onChange(i)
            }}
            style={{
              height: ITEM_H,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              scrollSnapAlign: 'center',
              fontSize: i === selectedIndex ? '.95rem' : '.85rem',
              fontWeight: i === selectedIndex ? 600 : 400,
              color: i === selectedIndex ? '#FFFFFF' : '#94A3B8',
              cursor: 'pointer', userSelect: 'none',
              transition: 'color .12s, font-size .12s',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SchedulerSheet Modal ─────────────────────────────────────────────────────

function SchedulerSheet({
  onConfirm, onClose, alreadyScheduled, onDeactivate,
}: {
  onConfirm: (scheduledAt: string) => void
  onClose: () => void
  alreadyScheduled?: boolean
  onDeactivate?: () => void
}) {
  const dayItems: string[] = []
  const dayDates: Date[]   = []
  for (let i = 0; i < 90; i++) {
    const d = new Date(); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0)
    const label =
      i === 0 ? "Aujourd'hui" :
      i === 1 ? 'Demain' :
      d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
    dayItems.push(label)
    dayDates.push(d)
  }
  const hourItems   = Array.from({ length: 24 }, (_, i) => `${i}h`)
  const minuteItems = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

  const initDate = new Date(Date.now() + 45 * 60 * 1000)
  const [dayIdx,    setDayIdx]    = useState(0)
  const [hourIdx,   setHourIdx]   = useState(initDate.getHours())
  const [minuteIdx, setMinuteIdx] = useState(Math.min(Math.ceil(initDate.getMinutes() / 5), 11))

  function getMinToday() {
    const m = new Date(Date.now() + 45 * 60 * 1000)
    return { hour: m.getHours(), minIdx: Math.min(Math.ceil(m.getMinutes() / 5), 11) }
  }

  function handleDayChange(idx: number) {
    setDayIdx(idx)
    if (idx === 0) {
      const min = getMinToday()
      if (hourIdx < min.hour || (hourIdx === min.hour && minuteIdx < min.minIdx)) {
        setHourIdx(min.hour)
        setMinuteIdx(min.minIdx)
      }
    }
  }

  function handleHourChange(idx: number) {
    if (dayIdx === 0) {
      const min = getMinToday()
      if (idx < min.hour) { setHourIdx(min.hour); return }
      if (idx === min.hour && minuteIdx < min.minIdx) setMinuteIdx(min.minIdx)
    }
    setHourIdx(idx)
  }

  function handleMinuteChange(idx: number) {
    if (dayIdx === 0) {
      const min = getMinToday()
      if (hourIdx <= min.hour && idx < min.minIdx) { setMinuteIdx(min.minIdx); return }
    }
    setMinuteIdx(idx)
  }

  const scheduled = new Date(dayDates[dayIdx])
  scheduled.setHours(hourIdx, parseInt(minuteItems[minuteIdx]), 0, 0)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)',
        zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="anim-fade-scale" style={{
        background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '16px', width: '100%', maxWidth: '380px',
        padding: '0 1.5rem 1.5rem',
        boxShadow: '0 24px 64px rgba(0,0,0,.6)',
        color: '#FFFFFF',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 0 .5rem' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
            Date et heure de publication
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: '4px', borderRadius: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '6px',
          marginBottom: '1.1rem',
          background: '#0f172a', borderRadius: '14px', padding: '.25rem',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <WheelColumn items={dayItems}    selectedIndex={dayIdx}    onChange={handleDayChange}    />
          <WheelColumn items={hourItems}   selectedIndex={hourIdx}   onChange={handleHourChange}   />
          <WheelColumn items={minuteItems} selectedIndex={minuteIdx} onChange={handleMinuteChange} />
        </div>

        <p style={{ fontSize: '.72rem', color: '#94A3B8', textAlign: 'center', lineHeight: 1.55, margin: '0 0 1.1rem' }}>
          Votre publication sera programmée et envoyée automatiquement à l&apos;heure sélectionnée.
        </p>

        <div style={{ display: 'flex', gap: '.6rem' }}>
          {alreadyScheduled && onDeactivate && (
            <button
              onClick={onDeactivate}
              style={{
                flex: 1, padding: '.7rem', borderRadius: '10px',
                border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)',
                color: '#EF4444', cursor: 'pointer', fontSize: '.88rem', fontWeight: 600,
              }}
            >
              Désactiver
            </button>
          )}
          <button
            onClick={() => onConfirm(scheduled.toISOString())}
            className="btn-primary"
            style={{ flex: 2, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.7rem', borderRadius: '10px', fontSize: '.88rem' }}
          >
            Terminé
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main GeneratedPostsView Component ────────────────────────────────────────

export function GeneratedPostsView({
  platforms, variants, objective,
  quotaUsed, quotaLimit, isPro: _isPro, userName, userAvatar, brandProfile, socialAccounts, initialImages, initialScheduledAt,
  allowPlatformToggle, unifiedMode,
  onSaveDraft, onPublish, onSchedule, onClose,
}: GeneratedPostsViewProps) {
  const isPro = true
  const { toast } = useToast()

  const activePlatforms = platforms
  const isUnifiedPost = (!!unifiedMode && activePlatforms.length > 1) || (
    activePlatforms.length > 1 &&
    Object.values(variants).length > 0 &&
    Object.values(variants).every(v => v === Object.values(variants)[0])
  )

  // Per-card state
  const [cards, setCards] = useState<Record<string, CardState>>(() => {
    const init: Record<string, CardState> = {}
    for (const p of platforms) {
      init[p] = {
        content: lowercaseHashtags(variants[p] || ''),
        imageUrl: initialImages?.[p] || null,
        imageLoading: false,
        scheduledAt: initialScheduledAt || null,
      }
    }
    return init
  })

  // Sync content when variants change
  useEffect(() => {
    setCards(prev => {
      const next = { ...prev }
      for (const p of platforms) {
        if (!next[p]) next[p] = { content: lowercaseHashtags(variants[p] || ''), imageUrl: null, imageLoading: false, scheduledAt: null }
        else next[p] = { ...next[p], content: lowercaseHashtags(variants[p] || next[p].content) }
      }
      return next
    })
  }, [variants, platforms])

  // ── Mode Édition Plein Écran (Section d'Édition Lightbox avec Zone Média) ──
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null)

  const [schedulerPlatform, setSchedulerPlatform] = useState<Platform | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [activeUploadPlatform, setActiveUploadPlatform] = useState<Platform | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (editingPlatform) {
          setEditingPlatform(null)
        } else {
          handleCloseAndSaveDraft()
        }
      }
      if (editingPlatform && activePlatforms.length > 1) {
        const curIdx = activePlatforms.indexOf(editingPlatform)
        if (e.key === 'ArrowLeft' && curIdx > 0) {
          setEditingPlatform(activePlatforms[curIdx - 1])
        }
        if (e.key === 'ArrowRight' && curIdx < activePlatforms.length - 1) {
          setEditingPlatform(activePlatforms[curIdx + 1])
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activePlatforms, cards, editingPlatform])

  function updateCard(platform: Platform, partial: Partial<CardState>) {
    setCards(prev => {
      if (isUnifiedPost) {
        const updated = { ...prev }
        for (const p of activePlatforms) {
          updated[p] = { ...updated[p], ...partial }
        }
        return updated
      }
      return { ...prev, [platform]: { ...prev[platform], ...partial } }
    })
  }

  const isSavingDraftRef = useRef(false)

  // Quitter via la croix ✕ ou Escape : enregistre directement tous les posts en brouillon une seule fois
  async function handleCloseAndSaveDraft() {
    if (isSavingDraftRef.current) return
    isSavingDraftRef.current = true
    try {
      if (isUnifiedPost) {
        const p = activePlatforms[0]
        const c = cards[p]
        if (c?.content) {
          await onSaveDraft(p, c.content, c.imageUrl)
        }
      } else {
        for (const p of activePlatforms) {
          const c = cards[p]
          if (c?.content) {
            await onSaveDraft(p, c.content, c.imageUrl)
          }
        }
      }
      onClose?.()
    } catch {
      onClose?.()
    } finally {
      isSavingDraftRef.current = false
    }
  }

  // Sauvegarde explicite en brouillon pour la plateforme courante
  async function handleSingleDraft(platform: Platform) {
    if (loadingAction || isSavingDraftRef.current) return
    isSavingDraftRef.current = true
    setLoadingAction(`draft-${platform}`)
    try {
      if (isUnifiedPost) {
        const p = activePlatforms[0]
        const c = cards[p]
        await onSaveDraft(p, c?.content || '', c?.imageUrl || null)
      } else {
        const c = cards[platform]
        await onSaveDraft(platform, c?.content || '', c?.imageUrl || null)
      }
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur sauvegarde brouillon', 'error')
    } finally {
      setLoadingAction(null)
      isSavingDraftRef.current = false
    }
  }

  async function handlePublish(platform: Platform) {
    if (loadingAction) return
    setLoadingAction(`publish-${platform}`)
    try {
      await onPublish(platform, cards[platform]?.content || '', cards[platform]?.imageUrl || null)
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur de publication', 'error')
    } finally { setLoadingAction(null) }
  }

  function handleScheduleConfirm(scheduledAt: string) {
    const platform = schedulerPlatform
    setSchedulerPlatform(null)
    if (!platform) return
    updateCard(platform, { scheduledAt })
  }

  function handleScheduleDeactivate() {
    const platform = schedulerPlatform
    setSchedulerPlatform(null)
    if (!platform) return
    updateCard(platform, { scheduledAt: null })
  }

  async function handlePublishScheduled(platform: Platform) {
    const scheduled = cards[platform]?.scheduledAt
    if (!scheduled || loadingAction) return
    setLoadingAction(`schedule-${platform}`)
    try {
      await onSchedule(platform, cards[platform]?.content || '', cards[platform]?.imageUrl || null, scheduled)
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur de programmation', 'error')
    } finally { setLoadingAction(null) }
  }

  async function handleRewrite(platform: Platform) {
    if (loadingAction) return
    setLoadingAction(`rewrite-${platform}`)
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: cards[platform]?.content, platform, instruction: 'Améliore ce post' }),
      })
      const data = await res.json()
      if (res.ok && data.content) updateCard(platform, { content: lowercaseHashtags(data.content) })
      else toast(data.error || 'Erreur réécriture', 'error')
    } catch { toast('Erreur réécriture', 'error') }
    finally { setLoadingAction(null) }
  }

  async function handleGenerateImage(platform: Platform) {
    updateCard(platform, { imageLoading: true })
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postContent: cards[platform]?.content?.slice(0, 300) || '', platform }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        updateCard(platform, { imageUrl: data.url, imageLoading: false })
      } else {
        toast(data.error || 'Erreur génération image', 'error')
        updateCard(platform, { imageLoading: false })
      }
    } catch {
      toast('Erreur génération image', 'error')
      updateCard(platform, { imageLoading: false })
    }
  }

  function triggerImportImage(platform: Platform) {
    setActiveUploadPlatform(platform)
    fileInputRef.current?.click()
  }

  async function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const platform = activeUploadPlatform
    if (!file || !platform) return
    updateCard(platform, { imageLoading: true })
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.url) {
        updateCard(platform, { imageUrl: data.url, imageLoading: false })
      } else {
        toast(data.error || 'Erreur upload', 'error')
        updateCard(platform, { imageLoading: false })
      }
    } catch {
      toast('Erreur upload', 'error')
      updateCard(platform, { imageLoading: false })
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
      setActiveUploadPlatform(null)
    }
  }

  // ── Rendu de l'en-tête spécifique à une plateforme ─────────────────────────
  function renderPlatformHeader(platform: Platform) {
    const platformAccount = socialAccounts?.find(a => a.platform === platform)
    // 1. Photo : compte connecté spécifique en priorité.
    //    Si non connecté : logo de la marque (brandProfile.logo_url)
    //    Dernier recours : avatar utilisateur ou null
    const avatarUrl = platformAccount?.platform_avatar_url 
      || brandProfile?.logo_url 
      || userAvatar 
      || null

    // 2. Nom : compte connecté en priorité.
    //    Si non connecté : nom officiel de la marque (brandProfile.brand_name)
    //    Dernier recours : nom utilisateur ou 'Ma Marque'
    const realName = platformAccount?.platform_username 
      || brandProfile?.brand_name 
      || userName 
      || 'Ma Marque'

    // 3. Bio / Sous-titre : secteur/description de la marque ou fallback
    const realHeadline = brandProfile?.industry || brandProfile?.description || 'Marque & Créateur'

    switch (platform) {
      case 'linkedin':
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <UserAvatar avatarUrl={avatarUrl} size={40} fallbackColor="#475569" iconSize={20} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                  {realName}
                </span>
                <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>• Vous</span>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#94A3B8', lineHeight: 1.25, margin: '1px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {realHeadline}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.66rem', color: '#64748B' }}>
                <span>À l&apos;instant</span>
                <span>•</span>
                <Globe size={10} />
              </div>
            </div>
          </div>
        )
      case 'facebook':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserAvatar avatarUrl={avatarUrl} size={40} fallbackColor="#475569" iconSize={20} />
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                {realName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#94A3B8', marginTop: '1px' }}>
                <span>À l&apos;instant</span>
                <span>·</span>
                <Globe size={10} />
              </div>
            </div>
          </div>
        )
      case 'instagram': {
        const handle = platformAccount?.platform_username
          ? platformAccount.platform_username.toLowerCase().replace(/[^a-z0-9._]/g, '_')
          : realName.toLowerCase().replace(/[^a-z0-9._]/g, '_')
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '2px', borderRadius: '50%', background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)' }}>
              <div style={{ padding: '1px', background: '#182234', borderRadius: '50%' }}>
                <UserAvatar avatarUrl={avatarUrl} size={34} fallbackColor="#475569" iconSize={17} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                {handle}
              </div>
            </div>
          </div>
        )
      }
      case 'twitter': {
        const handle = platformAccount?.platform_username
          ? `@${platformAccount.platform_username.toLowerCase().replace(/[^a-z0-9_]/g, '')}`
          : `@${realName.toLowerCase().replace(/[^a-z0-9_]/g, '')}`
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserAvatar avatarUrl={avatarUrl} size={38} fallbackColor="#475569" iconSize={19} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{realName}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#1D9BF0">
                  <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91c-1.31.67-2.19 1.91-2.19 3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.33 2.33 4.96-4.96 1.41 1.42-6.37 6.37z" />
                </svg>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                {handle} · À l&apos;instant
              </div>
            </div>
          </div>
        )
      }
      default:
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserAvatar avatarUrl={avatarUrl} size={38} fallbackColor="#475569" iconSize={19} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{realName}</div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{PLATFORM_NAMES[platform]}</div>
            </div>
          </div>
        )
    }
  }

  // ── Rendu de la barre de réactions spécifique à une plateforme ─────────────
  function renderPlatformSocialActions(platform: Platform) {
    switch (platform) {
      case 'linkedin':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94A3B8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#0A66C2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                    <svg width="7" height="7" viewBox="0 0 16 16" fill="white"><path d="M14.5 7.5a1.5 1.5 0 0 0-1.5-1.5h-3V3.5A2.5 2.5 0 0 0 7.5 1h-.293a.5.5 0 0 0-.414.22L4.316 4.938A2.5 2.5 0 0 0 3.5 6.708V13.5A1.5 1.5 0 0 0 5 15h6.72a2.5 2.5 0 0 0 2.404-1.815l1.2-4.5A1.5 1.5 0 0 0 14.5 7.5zM1 6a1 1 0 0 1 1-1h1v9H2a1 1 0 0 1-1-1V6z"/></svg>
                  </span>
                  <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#DF704D', marginLeft: '-3px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                    <svg width="7" height="7" viewBox="0 0 16 16" fill="white"><path d="M8 14s-6-4.35-6-8.5A4.5 4.5 0 0 1 6.5 1C7.5 1 8 2 8 2s.5-1 1.5-1A4.5 4.5 0 0 1 14 5.5C14 9.65 8 14 8 14z"/></svg>
                  </span>
                  <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#44A368', marginLeft: '-3px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                    <svg width="7" height="7" viewBox="0 0 16 16" fill="white"><path d="M4 8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/></svg>
                  </span>
                </span>
                <span style={{ fontWeight: 600, color: '#CBD5E1' }}>12</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span>6 comm.</span>
                <span>•</span>
                <span>1 rep.</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px', paddingTop: '3px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button type="button" style={{ background: 'none', border: 'none', color: '#CBD5E1', fontSize: '0.72rem', fontWeight: 600, padding: '4px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                <ThumbsUp size={12} />
                <span>J&apos;aime</span>
              </button>
              <button type="button" style={{ background: 'none', border: 'none', color: '#CBD5E1', fontSize: '0.72rem', fontWeight: 600, padding: '4px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                <MessageCircle size={12} />
                <span>Comm.</span>
              </button>
              <button type="button" style={{ background: 'none', border: 'none', color: '#CBD5E1', fontSize: '0.72rem', fontWeight: 600, padding: '4px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                <Repeat2 size={12} />
                <span>Rep.</span>
              </button>
              <button type="button" style={{ background: 'none', border: 'none', color: '#CBD5E1', fontSize: '0.72rem', fontWeight: 600, padding: '4px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                <Send size={12} />
                <span>Env.</span>
              </button>
            </div>
          </div>
        )
      case 'facebook':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.76rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <ThumbsUp size={14} />
                <span>5</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <MessageCircle size={14} />
                <span>1</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <Share2 size={14} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', zIndex: 3 }}>😆</span>
              <span style={{ fontSize: '13px', marginLeft: '-3px', zIndex: 2 }}>👍</span>
              <span style={{ fontSize: '13px', marginLeft: '-3px', zIndex: 1 }}>❤️</span>
            </div>
          </div>
        )
      case 'instagram':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                <Heart size={18} />
                <span>41</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                <MessageCircle size={18} />
                <span>1</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                <Repeat2 size={18} />
                <span>1</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                <Send size={16} />
                <span>1</span>
              </div>
            </div>
            <Bookmark size={18} style={{ cursor: 'pointer' }} />
          </div>
        )
      case 'twitter':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.74rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <MessageCircle size={13} />
              <span>12</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <Repeat2 size={13} />
              <span>4</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <Heart size={13} />
              <span>38</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <BarChart2 size={13} />
              <span>1.2k</span>
            </div>
            <Share2 size={13} style={{ cursor: 'pointer' }} />
          </div>
        )
      default:
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Heart size={15} />
              <MessageCircle size={15} />
              <Share2 size={15} />
            </div>
            <Bookmark size={15} />
          </div>
        )
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VUE 1 : SECTION D'ÉDITION PLEIN ÉCRAN (Quand on clique sur Image ou Éditer)
  // ──────────────────────────────────────────────────────────────────────────
  if (editingPlatform) {
    const curPlatform = editingPlatform
    const curIdx = activePlatforms.indexOf(curPlatform)
    const cardData = cards[curPlatform] || { content: '', imageUrl: null, imageLoading: false, scheduledAt: null }
    const limit = CHAR_LIMITS[curPlatform]
    const isOver = limit ? cardData.content.length > limit : false
    const isRewriting = loadingAction === `rewrite-${curPlatform}`
    const isPublishing = loadingAction === `publish-${curPlatform}` || loadingAction === `schedule-${curPlatform}`

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#0B0F19',
          zIndex: 500,
          display: 'flex',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInputChange} />

        {/* Bouton pour fermer la section d'édition */}
        <button
          type="button"
          onClick={() => setEditingPlatform(null)}
          title="Fermer l'édition"
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'rgba(15,23,42,0.85)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 80,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = 'rgba(239,68,68,0.85)'; e.currentTarget.style.borderColor = 'transparent' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'rgba(15,23,42,0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
        >
          <X size={18} />
        </button>

        {/* Flèche Gauche (←) pour naviguer entre plateformes */}
        {!isUnifiedPost && activePlatforms.length > 1 && curIdx > 0 && (
          <button
            type="button"
            onClick={() => setEditingPlatform(activePlatforms[curIdx - 1])}
            title="Plateforme précédente"
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(15,23,42,0.85)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 40,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Flèche Droite (→) pour naviguer entre plateformes */}
        {!isUnifiedPost && activePlatforms.length > 1 && curIdx < activePlatforms.length - 1 && (
          <button
            type="button"
            onClick={() => setEditingPlatform(activePlatforms[curIdx + 1])}
            title="Plateforme suivante"
            style={{
              position: 'absolute',
              right: '460px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(15,23,42,0.85)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 40,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* ── VOLET GAUCHE : SECTION MÉDIA DU POST ── */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            background: '#000000',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: '2rem',
          }}
        >
          {cardData.imageLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
              <span style={{ fontSize: '0.84rem', color: '#94A3B8', fontWeight: 500 }}>Génération du visuel IA en cours...</span>
            </div>
          ) : cardData.imageUrl ? (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={cardData.imageUrl}
                alt="Visuel du post"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
                }}
              />

              <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => triggerImportImage(curPlatform)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'rgba(15,23,42,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#E2E8F0',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Upload size={12} />
                  <span>Remplacer</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateCard(curPlatform, { imageUrl: null })}
                  title="Supprimer l'image"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'rgba(239,68,68,0.85)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Trash2 size={12} />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center', maxWidth: '340px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={26} color="#64748B" />
              </div>
              <div>
                <div style={{ fontSize: '0.94rem', color: '#F1F5F9', fontWeight: 600 }}>
                  Générer ou importer un visuel
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>
                  Créez une image IA personnalisée ou importez votre visuel.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleGenerateImage(curPlatform)}
                  className="btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  <Sparkles size={14} />
                  <span>Générer avec l&apos;IA</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerImportImage(curPlatform)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#F1F5F9',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={14} />
                  <span>Importer</span>
                </button>
              </div>
            </div>
          )}

          {!isUnifiedPost && activePlatforms.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(0,0,0,0.65)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#E2E8F0',
                fontSize: '0.76rem',
                fontWeight: 600,
                backdropFilter: 'blur(6px)',
              }}
            >
              {curIdx + 1} / {activePlatforms.length}
            </div>
          )}
        </div>

        {/* ── VOLET DROIT : PANNEAU DE DÉTAILS DU POST ── */}
        <div
          style={{
            width: '440px',
            maxWidth: '440px',
            minWidth: '340px',
            background: '#182234',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            color: '#FFFFFF',
          }}
        >
          {/* En-tête */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {isUnifiedPost ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UserAvatar avatarUrl={socialAccounts?.[0]?.platform_avatar_url || brandProfile?.logo_url || userAvatar || null} size={40} fallbackColor="#475569" iconSize={20} />
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>{socialAccounts?.[0]?.platform_username || brandProfile?.brand_name || userName || 'Ma Marque'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{brandProfile?.industry || brandProfile?.description || 'À l\'instant • 🌐'}</div>
                  </div>
                </div>
              ) : (
                renderPlatformHeader(curPlatform)
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '8px' }}>
              {isUnifiedPost ? (
                activePlatforms.map(p => (
                  <PlatformIcon key={p} platform={p} size={20} />
                ))
              ) : (
                <PlatformIcon platform={curPlatform} size={22} />
              )}
            </div>
          </div>

          {/* Corps défilant du texte */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {curPlatform === 'facebook' && (
              <div style={{ color: '#38BDF8', fontWeight: 600, fontSize: '0.86rem', marginBottom: '2px' }}>
                @à la une
              </div>
            )}

            <textarea
              ref={el => { textareaRefs.current[curPlatform] = el }}
              value={cardData.content}
              onChange={e => updateCard(curPlatform, { content: e.target.value })}
              placeholder="Rédigez votre post..."
              style={{
                width: '100%',
                flex: 1,
                minHeight: '180px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '0.94rem',
                lineHeight: 1.6,
                color: '#F1F5F9',
                fontFamily: 'inherit',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                padding: 0,
                margin: 0,
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px',
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isOver ? '#EF4444' : '#64748B' }}>
                {cardData.content.length}{limit ? ` / ${limit}` : ''}
              </span>

              <button
                type="button"
                onClick={() => handleRewrite(curPlatform)}
                disabled={isRewriting}
                title="Améliorer le post avec l'IA"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 9px',
                  borderRadius: '6px',
                  background: 'rgba(56,189,248,0.12)',
                  border: '1px solid rgba(56,189,248,0.25)',
                  color: isRewriting ? '#94A3B8' : '#38BDF8',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: isRewriting ? 'not-allowed' : 'pointer',
                  transition: '0.12s',
                }}
              >
                {isRewriting ? (
                  <div style={{ width: '10px', height: '10px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
                ) : (
                  <RotateCcw size={11} />
                )}
                <span>Réécrire</span>
              </button>
            </div>
          </div>

          {/* Bas fixe avec réactions + actions */}
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              background: '#131B2A',
              padding: '12px 16px 16px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {renderPlatformSocialActions(curPlatform)}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleGenerateImage(curPlatform)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    padding: '9px 8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#E2E8F0',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Sparkles size={14} color="#38BDF8" />
                  <span>Image IA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSchedulerPlatform(curPlatform)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    padding: '9px 8px',
                    borderRadius: '8px',
                    border: `1px solid ${cardData.scheduledAt ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.15)'}`,
                    background: cardData.scheduledAt ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.06)',
                    color: cardData.scheduledAt ? '#38BDF8' : '#E2E8F0',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Clock size={14} />
                  <span>{cardData.scheduledAt ? 'Planifié' : 'Programmer'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSingleDraft(curPlatform)}
                  disabled={loadingAction !== null}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    padding: '9px 8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#E2E8F0',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: loadingAction !== null ? 'not-allowed' : 'pointer',
                    opacity: loadingAction !== null ? 0.6 : 1,
                  }}
                >
                  <Save size={14} />
                  <span>Brouillon</span>
                </button>
              </div>

              {cardData.scheduledAt ? (
                <button
                  type="button"
                  onClick={() => handlePublishScheduled(curPlatform)}
                  disabled={isPublishing}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '11px 16px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                  }}
                >
                  {isPublishing ? (
                    <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
                  ) : (
                    <Clock size={16} />
                  )}
                  <span>Valider la programmation</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePublish(curPlatform)}
                  disabled={isPublishing}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '11px 16px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                  }}
                >
                  {isPublishing ? (
                    <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
                  ) : (
                    <Send size={16} />
                  )}
                  <span>Publier sur {isUnifiedPost ? activePlatforms.map(p => PLATFORM_NAMES[p]).join(', ') : PLATFORM_NAMES[curPlatform]}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scheduler modal */}
        {schedulerPlatform && (
          <SchedulerSheet
            onConfirm={handleScheduleConfirm}
            onClose={() => setSchedulerPlatform(null)}
            alreadyScheduled={!!cards[schedulerPlatform]?.scheduledAt}
            onDeactivate={handleScheduleDeactivate}
          />
        )}
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VUE 2 : GRILLE D'ENSEMBLE DIRECTE SANS EFFET DE CARTES FLOTTANTES
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0B0F19',
        zIndex: 500,
        display: 'flex',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInputChange} />

      {/* ── Bouton Fermer (Croix ✕) dans le coin supérieur droit ── */}
      <button
        type="button"
        onClick={handleCloseAndSaveDraft}
        title="Fermer et enregistrer en brouillon"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(15,23,42,0.85)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#94A3B8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 80,
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = 'rgba(239,68,68,0.85)'; e.currentTarget.style.borderColor = 'transparent' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'rgba(15,23,42,0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
      >
        <X size={18} />
      </button>

      {/* ── CONTENEUR PRINCIPAL PLEINE HAUTEUR SANS CADRE NI BOÎTE ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: isUnifiedPost ? 'center' : (activePlatforms.length <= 3 ? 'center' : 'flex-start'),
          alignItems: 'stretch',
          width: '100%',
          height: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        {/* CAS UNIFIÉ : 1 SEULE COLONNE CENTRÉE */}
        {isUnifiedPost ? (
          (() => {
            const mainPlatform = activePlatforms[0] || 'instagram'
            const cardData = cards[mainPlatform] || { content: '', imageUrl: null, imageLoading: false, scheduledAt: null }
            const minLimit = activePlatforms.reduce((min, p) => {
              const l = CHAR_LIMITS[p]
              return l ? Math.min(min, l) : min
            }, 5000)
            const isOver = cardData.content.length > minLimit
            const isRewriting = loadingAction === `rewrite-${mainPlatform}`
            const isPublishing = loadingAction === `publish-${mainPlatform}` || loadingAction === `schedule-${mainPlatform}`

            return (
              <div
                style={{
                  width: '100%',
                  maxWidth: '540px',
                  minWidth: '320px',
                  height: '100%',
                  background: '#182234',
                  borderLeft: '1px solid rgba(255,255,255,0.08)',
                  borderRight: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* 1. En-tête avec tous les logos des réseaux */}
                <div
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <UserAvatar avatarUrl={socialAccounts?.[0]?.platform_avatar_url || brandProfile?.logo_url || userAvatar || null} size={40} fallbackColor="#475569" iconSize={20} />
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                        {socialAccounts?.[0]?.platform_username || brandProfile?.brand_name || userName || 'Ma Marque'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '1px' }}>
                        {brandProfile?.industry || brandProfile?.description || 'À l\'instant • 🌐'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '8px' }}>
                    {activePlatforms.map(p => (
                      <PlatformIcon key={p} platform={p} size={20} />
                    ))}
                  </div>
                </div>

                {/* 2. Corps défilant du texte */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <textarea
                    ref={el => { textareaRefs.current[mainPlatform] = el }}
                    value={cardData.content}
                    onChange={e => updateCard(mainPlatform, { content: e.target.value })}
                    placeholder="Rédigez votre post..."
                    style={{
                      width: '100%',
                      flex: 1,
                      minHeight: '160px',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      fontSize: '0.94rem',
                      lineHeight: 1.6,
                      color: '#F1F5F9',
                      fontFamily: 'inherit',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      padding: 0,
                      margin: 0,
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '6px',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isOver ? '#EF4444' : '#64748B' }}>
                      {cardData.content.length} {minLimit < 5000 ? `/ ${minLimit}` : 'caractères'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRewrite(mainPlatform)}
                      disabled={isRewriting}
                      title="Améliorer le post avec l'IA"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        background: 'rgba(56,189,248,0.12)',
                        border: '1px solid rgba(56,189,248,0.25)',
                        color: isRewriting ? '#94A3B8' : '#38BDF8',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: isRewriting ? 'not-allowed' : 'pointer',
                        transition: '0.12s',
                      }}
                    >
                      {isRewriting ? (
                        <div style={{ width: '10px', height: '10px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
                      ) : (
                        <RotateCcw size={11} />
                      )}
                      <span>Réécrire</span>
                    </button>
                  </div>
                </div>

                {/* 3. Bas fixe avec réactions + actions */}
                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    background: '#131B2A',
                    padding: '12px 16px 16px',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <ThumbsUp size={14} />
                        <span>J&apos;aime</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <MessageCircle size={14} />
                        <span>Commenter</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <Share2 size={14} />
                        <span>Partager</span>
                      </div>
                    </div>
                    <Bookmark size={15} style={{ cursor: 'pointer' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {/* Bouton Éditer -> Ouvre la section d'édition */}
                      <button
                        type="button"
                        onClick={() => setEditingPlatform(mainPlatform)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '8px 4px',
                          borderRadius: '7px',
                          border: '1px solid rgba(255,255,255,0.15)',
                          background: 'rgba(255,255,255,0.06)',
                          color: '#E2E8F0',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Sparkles size={13} color="#A78BFA" />
                        <span>Éditer</span>
                      </button>

                      {/* Bouton Image -> Ouvre la section d'édition */}
                      <button
                        type="button"
                        onClick={() => setEditingPlatform(mainPlatform)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '8px 4px',
                          borderRadius: '7px',
                          border: '1px solid rgba(255,255,255,0.15)',
                          background: 'rgba(255,255,255,0.06)',
                          color: '#E2E8F0',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <ImageIcon size={13} color="#38BDF8" />
                        <span>Image</span>
                      </button>

                      {/* Bouton Programmer */}
                      <button
                        type="button"
                        onClick={() => setSchedulerPlatform(mainPlatform)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '8px 4px',
                          borderRadius: '7px',
                          border: `1px solid ${cardData.scheduledAt ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.15)'}`,
                          background: cardData.scheduledAt ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.06)',
                          color: cardData.scheduledAt ? '#38BDF8' : '#E2E8F0',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Clock size={13} />
                        <span>{cardData.scheduledAt ? 'Planifié' : 'Prog.'}</span>
                      </button>

                      {/* Bouton Brouillon */}
                      <button
                        type="button"
                        onClick={() => handleSingleDraft(mainPlatform)}
                        disabled={loadingAction !== null}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '8px 4px',
                          borderRadius: '7px',
                          border: '1px solid rgba(255,255,255,0.15)',
                          background: 'rgba(255,255,255,0.06)',
                          color: '#E2E8F0',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: loadingAction !== null ? 'not-allowed' : 'pointer',
                          opacity: loadingAction !== null ? 0.6 : 1,
                        }}
                      >
                        <Save size={13} />
                        <span>Brouillon</span>
                      </button>
                    </div>

                    {cardData.scheduledAt ? (
                      <button
                        type="button"
                        onClick={() => handlePublishScheduled(mainPlatform)}
                        disabled={isPublishing}
                        className="btn-primary"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                        }}
                      >
                        {isPublishing ? (
                          <div style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
                        ) : (
                          <Clock size={15} />
                        )}
                        <span>Valider la programmation ({activePlatforms.length} réseaux)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePublish(mainPlatform)}
                        disabled={isPublishing}
                        className="btn-primary"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                        }}
                      >
                        {isPublishing ? (
                          <div style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
                        ) : (
                          <Send size={15} />
                        )}
                        <span>Publier sur {activePlatforms.map(p => PLATFORM_NAMES[p]).join(', ')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })()
        ) : (
          /* CAS MULTI-VARIANTES : COLONNES PLEINE HAUTEUR SÉPARÉES PAR DES DIVIDERS */
          activePlatforms.map((platform, idx) => {
            const cardData = cards[platform] || { content: '', imageUrl: null, imageLoading: false, scheduledAt: null }
            const limit = CHAR_LIMITS[platform]
            const isOver = limit ? cardData.content.length > limit : false
            const isRewriting = loadingAction === `rewrite-${platform}`
            const isPublishing = loadingAction === `publish-${platform}` || loadingAction === `schedule-${platform}`

            return (
              <div
                key={platform}
                style={{
                  flex: activePlatforms.length === 1 ? '0 0 min(540px, 100%)' : activePlatforms.length === 2 ? '0 0 min(480px, 50%)' : '0 0 min(400px, 33.333%)',
                  maxWidth: activePlatforms.length === 1 ? '560px' : '480px',
                  minWidth: '320px',
                  height: '100%',
                  background: '#182234',
                  borderRight: idx < activePlatforms.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  borderLeft: (idx === 0 && activePlatforms.length > 1) ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* 1. EN-TÊTE FIXE DU RÉSEAU */}
                <div
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {renderPlatformHeader(platform)}
                  </div>

                  <div
                    title={`Post formaté pour ${PLATFORM_NAMES[platform]}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginLeft: '8px',
                    }}
                  >
                    <PlatformIcon platform={platform} size={22} />
                  </div>
                </div>

                {/* 2. CORPS DÉFILANT DU TEXTE */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {platform === 'facebook' && (
                    <div style={{ color: '#38BDF8', fontWeight: 600, fontSize: '0.84rem', marginBottom: '2px' }}>
                      @à la une
                    </div>
                  )}

                  <textarea
                    ref={el => { textareaRefs.current[platform] = el }}
                    value={cardData.content}
                    onChange={e => updateCard(platform, { content: e.target.value })}
                    placeholder={`Rédigez votre post pour ${PLATFORM_NAMES[platform]}...`}
                    style={{
                      width: '100%',
                      flex: 1,
                      minHeight: '160px',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      fontSize: '0.92rem',
                      lineHeight: 1.55,
                      color: '#F1F5F9',
                      fontFamily: 'inherit',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      padding: 0,
                      margin: 0,
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '6px',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isOver ? '#EF4444' : '#64748B' }}>
                      {cardData.content.length}{limit ? ` / ${limit}` : ''}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRewrite(platform)}
                      disabled={isRewriting}
                      title="Améliorer le post avec l'IA"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        background: 'rgba(56,189,248,0.12)',
                        border: '1px solid rgba(56,189,248,0.25)',
                        color: isRewriting ? '#94A3B8' : '#38BDF8',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: isRewriting ? 'not-allowed' : 'pointer',
                        transition: '0.12s',
                      }}
                    >
                      {isRewriting ? (
                        <div style={{ width: '10px', height: '10px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
                      ) : (
                        <RotateCcw size={11} />
                      )}
                      <span>Réécrire</span>
                    </button>
                  </div>
                </div>

                {/* 3. BAS FIXE DU RÉSEAU (Réactions + Actions) */}
                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    background: '#131B2A',
                    padding: '12px 16px 16px',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {renderPlatformSocialActions(platform)}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>

                      {/* Bouton Éditer -> Ouvre la section d'édition */}
                      <button
                        type="button"
                        onClick={() => setEditingPlatform(platform)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '8px 4px',
                          borderRadius: '7px',
                          border: '1px solid rgba(255,255,255,0.15)',
                          background: 'rgba(255,255,255,0.06)',
                          color: '#E2E8F0',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Sparkles size={13} color="#A78BFA" />
                        <span>Éditer</span>
                      </button>

                      {/* Bouton Image -> Ouvre la section d'édition */}
                      <button
                        type="button"
                        onClick={() => setEditingPlatform(platform)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '8px 4px',
                          borderRadius: '7px',
                          border: '1px solid rgba(255,255,255,0.15)',
                          background: 'rgba(255,255,255,0.06)',
                          color: '#E2E8F0',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <ImageIcon size={13} color="#38BDF8" />
                        <span>Image</span>
                      </button>

                      {/* Bouton Programmer */}
                      <button
                        type="button"
                        onClick={() => setSchedulerPlatform(platform)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '8px 4px',
                          borderRadius: '7px',
                          border: `1px solid ${cardData.scheduledAt ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.15)'}`,
                          background: cardData.scheduledAt ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.06)',
                          color: cardData.scheduledAt ? '#38BDF8' : '#E2E8F0',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Clock size={13} />
                        <span>{cardData.scheduledAt ? 'Planifié' : 'Prog.'}</span>
                      </button>

                      {/* Bouton Brouillon */}
                      <button
                        type="button"
                        onClick={() => handleSingleDraft(platform)}
                        disabled={loadingAction !== null}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '8px 4px',
                          borderRadius: '7px',
                          border: '1px solid rgba(255,255,255,0.15)',
                          background: 'rgba(255,255,255,0.06)',
                          color: '#E2E8F0',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: loadingAction !== null ? 'not-allowed' : 'pointer',
                          opacity: loadingAction !== null ? 0.6 : 1,
                        }}
                      >
                        <Save size={13} />
                        <span>Brouillon</span>
                      </button>
                    </div>

                    {cardData.scheduledAt ? (
                      <button
                        type="button"
                        onClick={() => handlePublishScheduled(platform)}
                        disabled={isPublishing}
                        className="btn-primary"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                        }}
                      >
                        {isPublishing ? (
                          <div style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
                        ) : (
                          <Clock size={15} />
                        )}
                        <span>Valider la programmation</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePublish(platform)}
                        disabled={isPublishing}
                        className="btn-primary"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                        }}
                      >
                        {isPublishing ? (
                          <div style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
                        ) : (
                          <Send size={15} />
                        )}
                        <span>Publier sur {PLATFORM_NAMES[platform]}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Scheduler Modal ── */}
      {schedulerPlatform && (
        <SchedulerSheet
          onConfirm={handleScheduleConfirm}
          onClose={() => setSchedulerPlatform(null)}
          alreadyScheduled={!!cards[schedulerPlatform]?.scheduledAt}
          onDeactivate={handleScheduleDeactivate}
        />
      )}
    </div>
  )
}

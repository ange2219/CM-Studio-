'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'
import {
  Platform, PostObjective,
  PLATFORM_NAMES, PLATFORM_COLORS,
} from '@/types'
import {
  IconInstagram, IconFacebook, IconTikTok,
  IconTwitterX, IconLinkedIn, IconYouTube, IconPinterest,
} from '@/components/icons/BrandIcons'
import { UserAvatar } from '@/components/ui/UserAvatar'
import {
  X, Sparkles, RotateCcw, Clock, Send, Upload, Trash2,
  Image as ImageIcon, Globe, Heart, MessageCircle, Repeat2,
  Bookmark, BarChart2, Share2, ThumbsUp
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

// ─── Main GeneratedPostsView ──────────────────────────────────────────────────

export function GeneratedPostsView({
  platforms, variants, objective,
  quotaUsed, quotaLimit, isPro: _isPro, userName, socialAccounts, initialImages, initialScheduledAt,
  allowPlatformToggle, unifiedMode,
  onSaveDraft, onPublish, onSchedule, onClose,
}: GeneratedPostsViewProps) {
  const isPro = true
  const { toast } = useToast()

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

  const [schedulerPlatform, setSchedulerPlatform] = useState<Platform | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [activeImageMenuPlatform, setActiveImageMenuPlatform] = useState<Platform | null>(null)
  const [activeUploadPlatform, setActiveUploadPlatform] = useState<Platform | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  const activePlatforms = platforms

  // Escape key closes & saves drafts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleCloseAndSaveDraft()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activePlatforms, cards])

  // Close image popup on outside click
  useEffect(() => {
    function handleOutside() {
      if (activeImageMenuPlatform) setActiveImageMenuPlatform(null)
    }
    if (activeImageMenuPlatform) {
      document.addEventListener('click', handleOutside)
      return () => document.removeEventListener('click', handleOutside)
    }
  }, [activeImageMenuPlatform])

  function updateCard(platform: Platform, partial: Partial<CardState>) {
    setCards(prev => ({ ...prev, [platform]: { ...prev[platform], ...partial } }))
  }

  // Quitter via la croix ✕ : enregistre directement tous les posts en brouillon et quitte
  async function handleCloseAndSaveDraft() {
    try {
      for (const p of activePlatforms) {
        const c = cards[p]
        if (c?.content) {
          await onSaveDraft(p, c.content, c.imageUrl)
        }
      }
      toast('Posts sauvegardés en brouillon', 'success')
      onClose?.()
    } catch {
      onClose?.()
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
    setActiveImageMenuPlatform(null)
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
    setActiveImageMenuPlatform(null)
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
    const displayName = platformAccount?.platform_username || userName || 'Ange-Marie DAHOU'
    const avatarUrl = platformAccount?.platform_avatar_url || null

    switch (platform) {
      case 'linkedin':
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <UserAvatar avatarUrl={avatarUrl} size={40} fallbackColor="#475569" iconSize={20} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                  {displayName}
                </span>
                <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>• Vous</span>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#94A3B8', lineHeight: 1.25, margin: '1px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Futur Data Scientist | Machine Learning & IA
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.66rem', color: '#64748B' }}>
                <span>1 an(s)</span>
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
                {displayName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#94A3B8', marginTop: '1px' }}>
                <span>13 juin</span>
                <span>·</span>
                <Globe size={10} />
              </div>
            </div>
          </div>
        )
      case 'instagram':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '2px', borderRadius: '50%', background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)' }}>
              <div style={{ padding: '1px', background: '#182234', borderRadius: '50%' }}>
                <UserAvatar avatarUrl={avatarUrl} size={34} fallbackColor="#475569" iconSize={17} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                {displayName.toLowerCase().replace(/[^a-z0-9._]/g, '_')}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#94A3B8' }}>
                🎵 Son original · Tendances
              </div>
            </div>
          </div>
        )
      case 'twitter':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserAvatar avatarUrl={avatarUrl} size={38} fallbackColor="#475569" iconSize={19} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{displayName}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#1D9BF0">
                  <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91c-1.31.67-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.33 2.33 4.96-4.96 1.41 1.42-6.37 6.37z" />
                </svg>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                @{displayName.toLowerCase().replace(/[^a-z0-9]/g, '')} · 2h
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserAvatar avatarUrl={avatarUrl} size={38} fallbackColor="#475569" iconSize={19} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{displayName}</div>
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0B0F19',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInputChange} />

      {/* ── Bouton Fermer (Croix ✕) dans le coin supérieur droit de la grande vue ── */}
      <button
        type="button"
        onClick={handleCloseAndSaveDraft}
        title="Fermer et enregistrer tous les posts en brouillon"
        style={{
          position: 'fixed',
          top: '14px',
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

      {/* ── GRILLE CÔTE À CÔTE DES POSTS GÉNÉRÉS (Tous affichés simultanément !) ── */}
      <div
        style={{
          display: 'flex',
          gap: '14px',
          justifyContent: activePlatforms.length <= 3 ? 'center' : 'flex-start',
          alignItems: 'stretch',
          width: '100%',
          height: '100%',
          padding: '16px 20px',
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        {activePlatforms.map(platform => {
          const cardData = cards[platform] || { content: '', imageUrl: null, imageLoading: false, scheduledAt: null }
          const limit = CHAR_LIMITS[platform]
          const isOver = limit ? cardData.content.length > limit : false
          const isRewriting = loadingAction === `rewrite-${platform}`
          const isPublishing = loadingAction === `publish-${platform}` || loadingAction === `schedule-${platform}`
          const isImageMenuOpen = activeImageMenuPlatform === platform

          return (
            <div
              key={platform}
              style={{
                flex: activePlatforms.length === 1 ? '0 0 min(540px, 100%)' : activePlatforms.length === 2 ? '0 0 min(480px, 48%)' : '0 0 min(400px, 32%)',
                maxWidth: activePlatforms.length === 1 ? '560px' : '480px',
                minWidth: '320px',
                height: '100%',
                background: '#182234',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              {/* 1. EN-TÊTE FIXE DU RÉSEAU */}
              <div
                style={{
                  padding: '14px 16px',
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

              {/* 2. CORPS DÉFILANT (Image si présente + Texte défilant) */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {/* Image du post si présente */}
                {cardData.imageLoading ? (
                  <div style={{ height: '160px', background: '#0F172A', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
                    <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>Génération de l&apos;image IA...</span>
                  </div>
                ) : cardData.imageUrl ? (
                  <div style={{ position: 'relative', width: '100%', maxHeight: '220px', borderRadius: '8px', overflow: 'hidden', background: '#000000', marginBottom: '4px' }}>
                    <img src={cardData.imageUrl} alt="" style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', display: 'block' }} />
                    <button
                      type="button"
                      onClick={() => updateCard(platform, { imageUrl: null })}
                      title="Supprimer l'image"
                      style={{
                        position: 'absolute', top: '8px', right: '8px',
                        padding: '4px 8px', borderRadius: '6px',
                        background: 'rgba(239,68,68,0.85)', border: 'none',
                        color: '#fff', cursor: 'pointer', fontSize: '0.7rem',
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      <Trash2 size={11} />
                      <span>Supprimer</span>
                    </button>
                  </div>
                ) : null}

                {/* Badge spécial @à la une si Facebook */}
                {platform === 'facebook' && (
                  <div style={{ color: '#38BDF8', fontWeight: 600, fontSize: '0.84rem', marginBottom: '2px' }}>
                    @à la une
                  </div>
                )}

                {/* Textarea naturel et transparent */}
                <textarea
                  ref={el => { textareaRefs.current[platform] = el }}
                  value={cardData.content}
                  onChange={e => updateCard(platform, { content: e.target.value })}
                  placeholder={`Rédigez votre post pour ${PLATFORM_NAMES[platform]}...`}
                  style={{
                    width: '100%',
                    flex: 1,
                    minHeight: '140px',
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

                {/* Pied du texte : Compteur à gauche + Bouton Réécrire en bas à droite */}
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

              {/* 3. BAS FIXE DU RÉSEAU (Réactions + Actions SaaS) */}
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  background: '#131B2A',
                  padding: '10px 14px 14px',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {/* Ligne des réactions du réseau */}
                {renderPlatformSocialActions(platform)}

                {/* ── BARRE D'ACTIONS : Ligne 1 (Éditer, Image, Programmer) + Ligne 2 (Publier pleine largeur) ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

                  {/* LIGNE 1 : Trois boutons (Éditer, Image, Programmer) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', position: 'relative' }}>

                    {/* Bouton Éditer */}
                    <button
                      type="button"
                      onClick={() => textareaRefs.current[platform]?.focus()}
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
                        transition: '0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                    >
                      <Sparkles size={13} color="#A78BFA" />
                      <span>Éditer</span>
                    </button>

                    {/* Bouton Image avec menu dropdown */}
                    <div style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveImageMenuPlatform(isImageMenuOpen ? null : platform)
                        }}
                        style={{
                          width: '100%',
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
                          transition: '0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                      >
                        <ImageIcon size={13} color="#38BDF8" />
                        <span>Image</span>
                      </button>

                      {/* Menu popup Image */}
                      {isImageMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 6px)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '190px',
                            background: '#1E293B',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                            zIndex: 100,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleGenerateImage(platform)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '9px 12px',
                              background: 'none',
                              border: 'none',
                              color: '#F1F5F9',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
                          >
                            <Sparkles size={13} color="#38BDF8" />
                            <span>Générer avec l&apos;IA</span>
                          </button>

                          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

                          <button
                            type="button"
                            onClick={() => triggerImportImage(platform)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '9px 12px',
                              background: 'none',
                              border: 'none',
                              color: '#F1F5F9',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
                          >
                            <Upload size={13} color="#10B981" />
                            <span>Importer une photo</span>
                          </button>
                        </div>
                      )}
                    </div>

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
                        transition: '0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = cardData.scheduledAt ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = cardData.scheduledAt ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.06)' }}
                    >
                      <Clock size={13} />
                      <span>{cardData.scheduledAt ? 'Planifié' : 'Programmer'}</span>
                    </button>
                  </div>

                  {/* LIGNE 2 : Bouton PUBLIER (100% pleine largeur) */}
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
                        cursor: isPublishing ? 'not-allowed' : 'pointer',
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
                        cursor: isPublishing ? 'not-allowed' : 'pointer',
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
        })}
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

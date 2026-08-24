'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'
import {
  Platform, PostObjective,
  PLATFORM_NAMES, PLATFORM_COLORS, OBJECTIVE_LABELS,
} from '@/types'
import {
  IconInstagram, IconFacebook, IconTikTok,
  IconTwitterX, IconLinkedIn, IconYouTube, IconPinterest,
} from '@/components/icons/BrandIcons'
import {
  Send, Save, Clock, X, Image as ImageIcon, RotateCcw, Hash,
  ChevronDown, ChevronRight, Check, User, Edit3, Monitor, Sparkles
} from 'lucide-react'
import { LinkedInFeedCard } from './mockups/LinkedInFeedCard'
import { FacebookFeedCard } from './mockups/FacebookFeedCard'
import { InstagramFeedCard } from './mockups/InstagramFeedCard'
import { TwitterFeedCard } from './mockups/TwitterFeedCard'
import { StudioLightboxEditor, type CardState, type SocialAccount } from './studio/StudioLightboxEditor'

export { type SocialAccount }

// ─── Platform icon ────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lowercaseHashtags(text: string): string {
  return text.replace(/#(\w+)/g, (_, tag) => '#' + tag.toLowerCase())
}

function formatScheduled(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) +
    ', ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// ─── Char limits per platform ─────────────────────────────────────────────────

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
        background: 'linear-gradient(to bottom, var(--card) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM_H * 2,
        background: 'linear-gradient(to top, var(--card) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', top: ITEM_H * 2, left: 6, right: 6, height: ITEM_H,
        background: 'rgba(22,119,255,.12)', borderRadius: '8px',
        border: '1px solid rgba(22,119,255,.2)',
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
              color: i === selectedIndex ? 'var(--t1)' : 'var(--t3)',
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

// ─── SchedulerSheet ───────────────────────────────────────────────────────────

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
        background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)',
        zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="anim-fade-scale" style={{
        background: 'var(--card)', border: '1px solid var(--b1)',
        borderRadius: '16px', width: '100%', maxWidth: '380px',
        padding: '0 1.5rem 1.5rem',
        boxShadow: '0 24px 64px rgba(0,0,0,.45)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 0 .5rem' }}>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: 'var(--t1)' }}>
            Date et heure de publication
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex', padding: '4px', borderRadius: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '6px',
          marginBottom: '1.1rem',
          background: 'var(--s2)', borderRadius: '14px', padding: '.25rem',
          border: '1px solid var(--b1)',
        }}>
          <WheelColumn items={dayItems}    selectedIndex={dayIdx}    onChange={handleDayChange}    />
          <WheelColumn items={hourItems}   selectedIndex={hourIdx}   onChange={handleHourChange}   />
          <WheelColumn items={minuteItems} selectedIndex={minuteIdx} onChange={handleMinuteChange} />
        </div>

        <p style={{ fontSize: '.72rem', color: 'var(--t3)', textAlign: 'center', lineHeight: 1.55, margin: '0 0 1.1rem' }}>
          En continuant, tu donnes ton accord pour que ta publication soit programmée jusqu&apos;à la date planifiée.
        </p>

        <div style={{ display: 'flex', gap: '.6rem' }}>
          {alreadyScheduled && onDeactivate && (
            <button
              onClick={onDeactivate}
              style={{
                flex: 1, padding: '.7rem', borderRadius: '10px',
                border: '1px solid var(--b1)', background: 'var(--s2)',
                color: 'var(--t2)', cursor: 'pointer', fontSize: '.88rem', fontWeight: 600,
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

  const [activePlatforms, setActivePlatforms] = useState<Platform[]>(platforms)
  const [schedulerPlatform, setSchedulerPlatform] = useState<Platform | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [isStudioOpen, setIsStudioOpen] = useState(false)
  const [studioInitialPlatform, setStudioInitialPlatform] = useState<Platform | undefined>(undefined)

  useEffect(() => {
    setActivePlatforms(prev => prev.filter(p => platforms.includes(p)))
  }, [platforms])

  function togglePlatform(p: Platform) {
    setActivePlatforms(prev => {
      if (prev.includes(p)) {
        if (prev.length === 1) return prev
        return prev.filter(x => x !== p)
      }
      setCards(c => c[p] ? c : {
        ...c,
        [p]: {
          content: variants[p] ? lowercaseHashtags(variants[p]!) : '',
          imageUrl: initialImages?.[p] ?? null,
          imageLoading: false,
          scheduledAt: initialScheduledAt ?? null,
        },
      })
      return [...prev, p]
    })
  }

  function updateCard(platform: Platform, partial: Partial<CardState>) {
    setCards(prev => ({ ...prev, [platform]: { ...prev[platform], ...partial } }))
  }

  async function handleDraft(platform: Platform) {
    const key = `draft-${platform}`
    if (loadingAction) return
    setLoadingAction(key)
    try {
      await onSaveDraft(platform, cards[platform]?.content || '', cards[platform]?.imageUrl || null)
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur', 'error')
    } finally { setLoadingAction(null) }
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

  async function handleHashtags(platform: Platform) {
    if (loadingAction) return
    setLoadingAction(`hashtags-${platform}`)
    try {
      const res = await fetch('/api/ai/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: cards[platform]?.content, platform }),
      })
      const data = await res.json()
      if (res.ok && data.hashtags) {
        const c = cards[platform]?.content || ''
        const tags = (data.hashtags as string[]).map((h: string) => h.toLowerCase()).join(' ')
        updateCard(platform, { content: c.trimEnd() + '\n\n' + tags })
      } else toast(data.error || 'Erreur hashtags', 'error')
    } catch { toast('Erreur hashtags', 'error') }
    finally { setLoadingAction(null) }
  }

  function openStudioForPlatform(platform: Platform) {
    setStudioInitialPlatform(platform)
    setIsStudioOpen(true)
  }

  // Rendu de la carte réseau social fidèle
  function renderFeedCardForPlatform(p: Platform) {
    const cardData = cards[p] || { content: '', imageUrl: null, imageLoading: false, scheduledAt: null }
    const platformAccount = socialAccounts?.find(a => a.platform === p)
    const displayName = platformAccount?.platform_username || userName || 'Ange-Marie DAHOU'
    const avatarUrl = platformAccount?.platform_avatar_url || null

    switch (p) {
      case 'linkedin':
        return (
          <LinkedInFeedCard
            content={cardData.content}
            imageUrl={cardData.imageUrl}
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={(v) => updateCard('linkedin', { content: v })}
          />
        )
      case 'facebook':
        return (
          <FacebookFeedCard
            content={cardData.content}
            imageUrl={cardData.imageUrl}
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={(v) => updateCard('facebook', { content: v })}
          />
        )
      case 'instagram':
        return (
          <InstagramFeedCard
            content={cardData.content}
            imageUrl={cardData.imageUrl}
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={(v) => updateCard('instagram', { content: v })}
          />
        )
      case 'twitter':
        return (
          <TwitterFeedCard
            content={cardData.content}
            imageUrl={cardData.imageUrl}
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={(v) => updateCard('twitter', { content: v })}
          />
        )
      default:
        return (
          <LinkedInFeedCard
            content={cardData.content}
            imageUrl={cardData.imageUrl}
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={(v) => updateCard(p, { content: v })}
          />
        )
    }
  }

  const ALL_PLATFORMS_LIST: Platform[] = ['instagram', 'facebook', 'tiktok', 'twitter', 'linkedin', 'youtube', 'pinterest']
  const connectedPlatforms: Platform[] = isPro
    ? ALL_PLATFORMS_LIST
    : ['instagram', 'facebook']

  const activeList = activePlatforms.length > 0 ? activePlatforms : platforms

  return (
    <div>
      {/* ── 1. Barre d'outils supérieure avec accès Mode Éditeur Studio ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          background: 'var(--card, #ffffff)',
          border: '1px solid var(--b1, #e2e8f0)',
          borderRadius: '12px',
          marginBottom: '1.25rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--t1)' }}>
            {activeList.length} {activeList.length > 1 ? 'posts générés' : 'post généré'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--t3)' }}>
            • Cliquez directement sur un post pour l&apos;éditer en temps réel
          </span>
        </div>

        <button
          type="button"
          onClick={() => openStudioForPlatform(activeList[0])}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #1677FF, #7B5CF5)',
            color: '#fff',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(22,119,255,0.25)',
            transition: 'transform 0.1s',
          }}
        >
          <Sparkles size={14} />
          <span>Mode Éditeur Studio (Plein Écran)</span>
        </button>
      </div>

      {/* ── 2. Sélecteur de plateformes (création manuelle) ── */}
      {allowPlatformToggle && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginBottom: '1.25rem' }}>
          {connectedPlatforms.map((p) => {
            const isActive = activePlatforms.includes(p)
            const color = PLATFORM_COLORS[p]
            return (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '.35rem',
                  padding: '.32rem .7rem', borderRadius: '8px', fontSize: '.76rem', fontWeight: 500,
                  border: `1px solid ${isActive ? color + '55' : 'var(--b1)'}`,
                  background: isActive ? color + '14' : 'var(--card)',
                  color: isActive ? color : 'var(--t3)',
                  cursor: 'pointer', transition: '.12s',
                }}
              >
                <PlatformIcon platform={p} size={13} />
                {PLATFORM_NAMES[p]}
              </button>
            )
          })}
        </div>
      )}

      {/* ── 3. VUE CÔTE À CÔTE (Mockups Réseaux Sociaux Réalistes sans image vide) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: activeList.length === 1 ? 'minmax(320px, 540px)' : 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1rem',
          maxWidth: activeList.length === 1 ? '560px' : '1120px',
          margin: '0 auto',
          alignItems: 'start',
        }}
      >
        {activeList.map((p) => {
          const cardData = cards[p] || { content: '', imageUrl: null, imageLoading: false, scheduledAt: null }
          const limit = CHAR_LIMITS[p]
          const isOver = limit ? cardData.content.length > limit : false
          const isRewriting = loadingAction === `rewrite-${p}`
          const isDrafting = loadingAction === `draft-${p}`
          const isPublishing = loadingAction === `publish-${p}` || loadingAction === `schedule-${p}`

          return (
            <div
              key={p}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                background: 'var(--card, #ffffff)',
                border: '1px solid var(--b1, #e2e8f0)',
                borderRadius: '14px',
                padding: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              }}
            >
              {/* Header de la carte : Badge réseau + Outils IA */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PlatformIcon platform={p} size={16} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--t1)' }}>
                    {PLATFORM_NAMES[p]}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleRewrite(p)}
                    disabled={isRewriting}
                    title="Réécrire avec l'IA"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '3px',
                      padding: '3px 7px', borderRadius: '6px',
                      border: '1px solid var(--b1)', background: 'var(--s2, #f8fafc)',
                      color: isRewriting ? 'var(--accent)' : 'var(--t2)',
                      fontSize: '0.72rem', fontWeight: 600, cursor: isRewriting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isRewriting ? (
                      <div style={{ width: '10px', height: '10px', border: '2px solid rgba(22,119,255,0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
                    ) : (
                      <RotateCcw size={10} />
                    )}
                    <span>Réécrire</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHashtags(p)}
                    title="Générer hashtags"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '3px',
                      padding: '3px 7px', borderRadius: '6px',
                      border: '1px solid var(--b1)', background: 'var(--s2, #f8fafc)',
                      color: '#06B6D4',
                      fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <Hash size={10} />
                    <span>Tags</span>
                  </button>

                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: isOver ? '#EF4444' : 'var(--t3)', marginLeft: '2px' }}>
                    {cardData.content.length}{limit ? `/${limit}` : ''}
                  </span>
                </div>
              </div>

              {/* Mockup fidèle du réseau social (LinkedIn / Facebook / Instagram / Twitter) */}
              <div>
                {renderFeedCardForPlatform(p)}
              </div>

              {/* Barre d'action inférieure de la carte */}
              <div
                style={{
                  borderTop: '1px solid var(--b1, #e2e8f0)',
                  paddingTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {/* Bouton pour ouvrir en studio */}
                <button
                  type="button"
                  onClick={() => openStudioForPlatform(p)}
                  title="Ouvrir dans le mode studio complet"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(22,119,255,0.25)',
                    background: 'rgba(22,119,255,0.06)',
                    color: 'var(--accent, #1677FF)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Edit3 size={13} />
                  <span>Éditer Studio</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDraft(p)}
                  disabled={isDrafting}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '7px',
                    borderRadius: '8px',
                    border: '1px solid var(--b1)',
                    background: 'var(--s2, #f8fafc)',
                    color: 'var(--t2)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: isDrafting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Save size={13} />
                  <span>Brouillon</span>
                </button>

                {cardData.scheduledAt ? (
                  <button
                    type="button"
                    onClick={() => handlePublishScheduled(p)}
                    disabled={isPublishing}
                    className="btn-primary"
                    style={{
                      flex: 1.4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '7px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: isPublishing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Clock size={13} />
                    <span>Programmer</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePublish(p)}
                    disabled={isPublishing}
                    className="btn-primary"
                    style={{
                      flex: 1.4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '7px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: isPublishing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Send size={13} />
                    <span>Publier</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 4. MODE ÉDITEUR STUDIO (Lightbox Plein Écran) ── */}
      {isStudioOpen && (
        <StudioLightboxEditor
          platforms={activeList}
          initialPlatform={studioInitialPlatform}
          cards={cards}
          objective={objective}
          userName={userName}
          socialAccounts={socialAccounts}
          isPro={isPro}
          onClose={() => setIsStudioOpen(false)}
          onUpdateCard={updateCard}
          onSaveDraft={handleDraft}
          onPublish={handlePublish}
          onScheduleOpen={(p) => setSchedulerPlatform(p)}
          onPublishScheduled={handlePublishScheduled}
          onRewrite={handleRewrite}
          onHashtags={handleHashtags}
          loadingAction={loadingAction}
        />
      )}

      {/* ── 5. Scheduler Sheet Modal ── */}
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

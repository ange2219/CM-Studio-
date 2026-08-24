'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Platform, PostObjective, PLATFORM_NAMES, PLATFORM_COLORS } from '@/types'
import {
  IconInstagram, IconFacebook, IconTikTok,
  IconTwitterX, IconLinkedIn, IconYouTube, IconPinterest,
} from '@/components/icons/BrandIcons'
import { LinkedInPostMockup } from './LinkedInPostMockup'
import { TwitterPostMockup } from './TwitterPostMockup'
import { InstagramPostMockup } from './InstagramPostMockup'
import { FacebookPostMockup } from './FacebookPostMockup'
import { TikTokPostMockup } from './TikTokPostMockup'
import { useToast } from '@/components/ui/Toast'
import { Sparkles, Hash, RotateCcw, Clock, Save, Send, X, Image as ImageIcon, Check, ChevronRight } from 'lucide-react'

// Limites réelles de caractères par plateforme
const CHAR_LIMITS: Partial<Record<Platform, number>> = {
  twitter: 280,
  instagram: 2200,
  facebook: 2000,
  linkedin: 3000,
  tiktok: 300,
  youtube: 5000,
  pinterest: 500,
}

function PlatformIcon({ platform, size = 16 }: { platform: Platform; size?: number }) {
  switch (platform) {
    case 'instagram': return <IconInstagram size={size} />
    case 'facebook': return <IconFacebook size={size} />
    case 'tiktok': return <IconTikTok size={size} />
    case 'twitter': return <IconTwitterX size={size} />
    case 'linkedin': return <IconLinkedIn size={size} />
    case 'youtube': return <IconYouTube size={size} />
    case 'pinterest': return <IconPinterest size={size} />
  }
}

function formatScheduled(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) +
    ', ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )
}

export interface CardState {
  content: string
  imageUrl: string | null
  imageLoading: boolean
  scheduledAt: string | null
}

export interface SocialAccount {
  platform: Platform
  platform_username: string | null
  platform_avatar_url: string | null
}

export interface SocialPostMockupCardProps {
  platform: Platform
  allPlatforms?: Platform[]
  objective: PostObjective | null
  cardState: CardState
  onContentChange: (v: string) => void
  onImageSet: (url: string | null) => void
  onImageLoad: (loading: boolean) => void
  onRewrite: () => void
  onHashtags: () => void
  onScheduleOpen: () => void
  onPublishScheduled: () => void
  onDraft: () => void
  onPublish: () => void
  isPro: boolean
  isRewriting: boolean
  isDrafting: boolean
  isPublishing: boolean
  onClose?: () => void
  userName?: string | null
  socialAccounts?: SocialAccount[]
}

export function SocialPostMockupCard({
  platform,
  allPlatforms,
  objective,
  cardState,
  onContentChange,
  onImageSet,
  onImageLoad,
  onRewrite,
  onHashtags,
  onScheduleOpen,
  onPublishScheduled,
  onDraft,
  onPublish,
  isPro,
  isRewriting,
  isDrafting,
  isPublishing,
  onClose,
  userName,
  socialAccounts,
}: SocialPostMockupCardProps) {
  const { toast } = useToast()
  const { content, imageUrl, imageLoading, scheduledAt } = cardState
  const isUnifiedCard = allPlatforms && allPlatforms.length > 1

  const limit = isUnifiedCard
    ? (() => {
        const limits = allPlatforms.map((p) => CHAR_LIMITS[p]).filter((l): l is number => l !== undefined)
        return limits.length > 0 ? Math.min(...limits) : undefined
      })()
    : CHAR_LIMITS[platform]

  const isOverLimit = limit ? content.length > limit : false
  const color = PLATFORM_COLORS[platform]

  // Image menu
  const [showImageMenu, setShowImageMenu] = useState(false)
  const imageMenuRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (imageMenuRef.current && !imageMenuRef.current.contains(e.target as Node)) {
        setShowImageMenu(false)
      }
    }
    if (showImageMenu) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showImageMenu])

  async function handleGenerateImage() {
    setShowImageMenu(false)
    onImageLoad(true)
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postContent: content.slice(0, 300), platform }),
      })
      const data = await res.json()
      if (res.ok && data.url) onImageSet(data.url)
      else toast(data.error || 'Erreur génération image', 'error')
    } catch {
      toast('Erreur génération image', 'error')
    } finally {
      onImageLoad(false)
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setShowImageMenu(false)
    onImageLoad(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.url) onImageSet(data.url)
      else toast(data.error || 'Erreur upload', 'error')
    } catch {
      toast('Erreur upload', 'error')
    } finally {
      onImageLoad(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const platformAccount = !isUnifiedCard ? socialAccounts?.find((a) => a.platform === platform) : null
  const displayName = platformAccount?.platform_username || userName || 'Ange-Marie DAHOU'
  const avatarUrl = platformAccount?.platform_avatar_url || null

  const isActing = isDrafting || isPublishing

  // Rendu du Mockup spécifique
  function renderPlatformMockup() {
    switch (platform) {
      case 'linkedin':
        return (
          <LinkedInPostMockup
            content={content}
            imageUrl={imageUrl}
            imageLoading={imageLoading}
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={onContentChange}
            onImageSet={onImageSet}
            onGenerateImage={handleGenerateImage}
            onUploadImage={() => fileRef.current?.click()}
            isPro={isPro}
          />
        )
      case 'twitter':
        return (
          <TwitterPostMockup
            content={content}
            imageUrl={imageUrl}
            imageLoading={imageLoading}
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={onContentChange}
            onImageSet={onImageSet}
            onGenerateImage={handleGenerateImage}
            onUploadImage={() => fileRef.current?.click()}
            isPro={isPro}
          />
        )
      case 'instagram':
        return (
          <InstagramPostMockup
            content={content}
            imageUrl={imageUrl}
            imageLoading={imageLoading}
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={onContentChange}
            onImageSet={onImageSet}
            onGenerateImage={handleGenerateImage}
            onUploadImage={() => fileRef.current?.click()}
            isPro={isPro}
          />
        )
      case 'facebook':
        return (
          <FacebookPostMockup
            content={content}
            imageUrl={imageUrl}
            imageLoading={imageLoading}
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={onContentChange}
            onImageSet={onImageSet}
            onGenerateImage={handleGenerateImage}
            onUploadImage={() => fileRef.current?.click()}
            isPro={isPro}
          />
        )
      case 'tiktok':
        return (
          <TikTokPostMockup
            content={content}
            imageUrl={imageUrl}
            imageLoading={imageLoading}
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={onContentChange}
            onImageSet={onImageSet}
            onGenerateImage={handleGenerateImage}
            onUploadImage={() => fileRef.current?.click()}
            isPro={isPro}
          />
        )
      default:
        return (
          <LinkedInPostMockup
            content={content}
            imageUrl={imageUrl}
            imageLoading={imageLoading}
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={onContentChange}
            onImageSet={onImageSet}
            onGenerateImage={handleGenerateImage}
            onUploadImage={() => fileRef.current?.click()}
            isPro={isPro}
          />
        )
    }
  }

  return (
    <div
      style={{
        background: 'var(--card, #ffffff)',
        border: '1px solid var(--b1, #e2e8f0)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        position: 'relative',
      }}
    >
      {/* ── Hidden file input ── */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImportFile} />

      {/* ── 1. Top SaaS Toolbar (Réseau + Outils IA rapides + Compteur) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          background: 'var(--s2, #f8fafc)',
          borderBottom: '1px solid var(--b1)',
          borderRadius: '12px 12px 0 0',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {/* Badge réseau */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isUnifiedCard ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {allPlatforms!.slice(0, 5).map((p) => (
                <div key={p} style={{ width: 20, height: 20, borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                  <PlatformIcon platform={p} size={20} />
                </div>
              ))}
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--t1)', marginLeft: '4px' }}>
                Multi-plateformes
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PlatformIcon platform={platform} size={18} />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--t1)' }}>
                {PLATFORM_NAMES[platform]}
              </span>
            </div>
          )}
        </div>

        {/* Outils IA contextuels & Compteur */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Bouton Réécrire */}
          <button
            type="button"
            onClick={isRewriting ? undefined : onRewrite}
            disabled={isRewriting}
            title="Améliorer le post avec l'IA"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--b1)',
              background: 'var(--card)',
              color: isRewriting ? 'var(--accent)' : 'var(--t2)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: isRewriting ? 'not-allowed' : 'pointer',
              transition: '0.12s',
            }}
          >
            {isRewriting ? (
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  border: '2px solid rgba(22,119,255,0.2)',
                  borderTopColor: 'var(--accent)',
                  borderRadius: '50%',
                  animation: 'rot 0.7s linear infinite',
                }}
              />
            ) : (
              <RotateCcw size={11} />
            )}
            <span>Réécrire</span>
          </button>

          {/* Bouton Hashtags */}
          <button
            type="button"
            onClick={onHashtags}
            title="Générer des hashtags pertinents"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--b1)',
              background: 'var(--card)',
              color: 'var(--t2)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: '0.12s',
            }}
          >
            <Hash size={11} color="#06B6D4" />
            <span>Hashtags</span>
          </button>

          {/* Compteur de caractères */}
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: isOverLimit ? '#EF4444' : 'var(--t3)',
              marginLeft: '4px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: isOverLimit ? 'rgba(239,68,68,0.1)' : 'transparent',
            }}
          >
            {content.length}
            {limit ? `/${limit}` : ''}
          </div>

          {/* Bouton fermer si activé */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--t3)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                borderRadius: '4px',
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Mockup Réaliste (Édition Inline No-Code) ── */}
      <div style={{ padding: '12px' }}>
        {renderPlatformMockup()}
      </div>

      {/* ── 3. Bottom Actions SaaS (Programmation + Brouillon + Publication) ── */}
      <div
        style={{
          borderTop: '1px solid var(--b1)',
          background: 'var(--s2, #f8fafc)',
          borderRadius: '0 0 12px 12px',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Ligne Programmation rapide */}
        <div
          onClick={onScheduleOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 10px',
            background: 'var(--card)',
            border: `1px solid ${scheduledAt ? 'rgba(22,119,255,0.4)' : 'var(--b1)'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} color={scheduledAt ? 'var(--accent)' : 'var(--t3)'} />
            <span style={{ fontSize: '0.78rem', color: scheduledAt ? 'var(--accent)' : 'var(--t2)', fontWeight: scheduledAt ? 600 : 500 }}>
              {scheduledAt ? `Planifié : ${formatScheduled(scheduledAt)}` : 'Programmer une date...'}
            </span>
          </div>
          <ChevronRight size={14} color="var(--t3)" />
        </div>

        {/* Boutons Finaux : Brouillon & Publier/Programmer */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={isActing ? undefined : onDraft}
            disabled={isActing}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--b1)',
              background: 'var(--card)',
              color: 'var(--t2)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: isActing ? 'not-allowed' : 'pointer',
              transition: '0.12s',
              opacity: isActing ? 0.6 : 1,
            }}
          >
            {isDrafting ? (
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid rgba(22,119,255,0.2)',
                  borderTopColor: 'var(--accent)',
                  borderRadius: '50%',
                  animation: 'rot 0.7s linear infinite',
                }}
              />
            ) : (
              <Save size={14} />
            )}
            <span>Brouillon</span>
          </button>

          {scheduledAt ? (
            <button
              type="button"
              onClick={isActing ? undefined : onPublishScheduled}
              disabled={isActing}
              className="btn-primary"
              style={{
                flex: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: isActing ? 'not-allowed' : 'pointer',
                opacity: isActing ? 0.6 : 1,
              }}
            >
              {isPublishing ? (
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'rot 0.7s linear infinite',
                  }}
                />
              ) : (
                <Clock size={14} />
              )}
              <span>Valider la programmation</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={isActing ? undefined : onPublish}
              disabled={isActing}
              className="btn-primary"
              style={{
                flex: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: isActing ? 'not-allowed' : 'pointer',
                opacity: isActing ? 0.6 : 1,
              }}
            >
              {isPublishing ? (
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'rot 0.7s linear infinite',
                  }}
                />
              ) : (
                <Send size={14} />
              )}
              <span>Publier maintenant</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

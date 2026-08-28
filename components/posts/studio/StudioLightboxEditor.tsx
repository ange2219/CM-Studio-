'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Platform, PostObjective, PLATFORM_NAMES, PLATFORM_COLORS } from '@/types'
import {
  IconInstagram, IconFacebook, IconTikTok,
  IconTwitterX, IconLinkedIn, IconYouTube, IconPinterest,
} from '@/components/icons/BrandIcons'
import { LinkedInFeedCard } from '../mockups/LinkedInFeedCard'
import { FacebookFeedCard } from '../mockups/FacebookFeedCard'
import { InstagramFeedCard } from '../mockups/InstagramFeedCard'
import { TwitterFeedCard } from '../mockups/TwitterFeedCard'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useToast } from '@/components/ui/Toast'
import {
  X, ChevronLeft, ChevronRight, Sparkles, Hash, RotateCcw,
  Clock, Save, Send, Upload, Trash2, Image as ImageIcon,
  Heart, MessageCircle, Share2, Bookmark, Check
} from 'lucide-react'

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

export interface StudioLightboxEditorProps {
  platforms: Platform[]
  initialPlatform?: Platform
  cards: Record<string, CardState>
  objective: PostObjective | null
  userName?: string | null
  userAvatar?: string | null
  brandProfile?: {
    brand_name?: string | null
    industry?: string | null
    description?: string | null
    logo_url?: string | null
  } | null
  socialAccounts?: SocialAccount[]
  isPro?: boolean
  onClose: () => void
  onUpdateCard: (platform: Platform, partial: Partial<CardState>) => void
  onSaveDraft: (platform: Platform) => Promise<void>
  onPublish: (platform: Platform) => Promise<void>
  onScheduleOpen: (platform: Platform) => void
  onPublishScheduled: (platform: Platform) => Promise<void>
  onRewrite: (platform: Platform) => Promise<void>
  onHashtags: (platform: Platform) => Promise<void>
  loadingAction: string | null
}

function PlatformIcon({ platform, size = 18 }: { platform: Platform; size?: number }) {
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

export function StudioLightboxEditor({
  platforms,
  initialPlatform,
  cards,
  objective,
  userName,
  userAvatar,
  brandProfile,
  socialAccounts,
  isPro = true,
  onClose,
  onUpdateCard,
  onSaveDraft,
  onPublish,
  onScheduleOpen,
  onPublishScheduled,
  onRewrite,
  onHashtags,
  loadingAction,
}: StudioLightboxEditorProps) {
  const { toast } = useToast()
  const [currentIdx, setCurrentIdx] = useState(() => {
    const idx = platforms.indexOf(initialPlatform || platforms[0])
    return idx >= 0 ? idx : 0
  })

  const currentPlatform = platforms[currentIdx] || platforms[0]
  const card = cards[currentPlatform] || { content: '', imageUrl: null, imageLoading: false, scheduledAt: null }
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Navigation clavier (Flèches ← → et Échap)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && currentIdx > 0) {
        setCurrentIdx((i) => i - 1)
      }
      if (e.key === 'ArrowRight' && currentIdx < platforms.length - 1) {
        setCurrentIdx((i) => i + 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIdx, platforms.length, onClose])

  const platformAccount = socialAccounts?.find((a) => a.platform === currentPlatform)
  const displayName = platformAccount?.platform_username || brandProfile?.brand_name || userName || 'Ma Marque'
  const avatarUrl = platformAccount?.platform_avatar_url || brandProfile?.logo_url || userAvatar || null

  const isRewriting = loadingAction === `rewrite-${currentPlatform}`
  const isDrafting = loadingAction === `draft-${currentPlatform}`
  const isPublishing = loadingAction === `publish-${currentPlatform}` || loadingAction === `schedule-${currentPlatform}`

  async function handleGenerateImage() {
    onUpdateCard(currentPlatform, { imageLoading: true })
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postContent: card.content.slice(0, 300), platform: currentPlatform }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        onUpdateCard(currentPlatform, { imageUrl: data.url, imageLoading: false })
      } else {
        toast(data.error || 'Erreur génération image', 'error')
        onUpdateCard(currentPlatform, { imageLoading: false })
      }
    } catch {
      toast('Erreur génération image', 'error')
      onUpdateCard(currentPlatform, { imageLoading: false })
    }
  }

  async function handleImportImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onUpdateCard(currentPlatform, { imageLoading: true })
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.url) {
        onUpdateCard(currentPlatform, { imageUrl: data.url, imageLoading: false })
      } else {
        toast(data.error || 'Erreur upload', 'error')
        onUpdateCard(currentPlatform, { imageLoading: false })
      }
    } catch {
      toast('Erreur upload', 'error')
      onUpdateCard(currentPlatform, { imageLoading: false })
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const hasImage = !!card.imageUrl
  const platformColor = PLATFORM_COLORS[currentPlatform]

  // Rendu du feed card dans le studio
  function renderFeedMockup() {
    switch (currentPlatform) {
      case 'linkedin':
        return (
          <LinkedInFeedCard
            content={card.content}
            imageUrl={null} // en mode split l'image est sur le volet gauche !
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={(v) => onUpdateCard('linkedin', { content: v })}
          />
        )
      case 'facebook':
        return (
          <FacebookFeedCard
            content={card.content}
            imageUrl={null}
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={(v) => onUpdateCard('facebook', { content: v })}
          />
        )
      case 'instagram':
        return (
          <InstagramFeedCard
            content={card.content}
            imageUrl={null}
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={(v) => onUpdateCard('instagram', { content: v })}
          />
        )
      case 'twitter':
        return (
          <TwitterFeedCard
            content={card.content}
            imageUrl={null}
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={(v) => onUpdateCard('twitter', { content: v })}
          />
        )
      default:
        return (
          <LinkedInFeedCard
            content={card.content}
            imageUrl={null}
            userName={displayName}
            avatarUrl={avatarUrl}
            onContentChange={(v) => onUpdateCard(currentPlatform, { content: v })}
          />
        )
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 10, 20, 0.94)',
        backdropFilter: 'blur(16px)',
        zIndex: 800,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImportImage} />

      {/* ── 1. Top Navbar du Studio ── */}
      <div
        style={{
          height: '56px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(15,23,42,0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Gauche : Bouton fermer / retour */}
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            fontSize: '0.86rem',
            fontWeight: 600,
            padding: '6px 10px',
            borderRadius: '8px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'none' }}
        >
          <X size={18} />
          <span>Fermer le studio</span>
        </button>

        {/* Centre : Onglets des plateformes générées */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {platforms.map((p, idx) => {
            const isActive = idx === currentIdx
            const color = PLATFORM_COLORS[p]
            return (
              <button
                key={p}
                onClick={() => setCurrentIdx(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: '0.12s',
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                <PlatformIcon platform={p} size={15} />
                <span>{PLATFORM_NAMES[p]}</span>
              </button>
            )
          })}
        </div>

        {/* Droite : Outils IA rapides */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onRewrite(currentPlatform)}
            disabled={isRewriting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: isRewriting ? 'var(--accent)' : '#E2E8F0',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: isRewriting ? 'not-allowed' : 'pointer',
            }}
          >
            {isRewriting ? (
              <div style={{ width: '11px', height: '11px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
            ) : (
              <RotateCcw size={13} />
            )}
            <span>Réécrire IA</span>
          </button>

          <button
            onClick={() => onHashtags(currentPlatform)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(6,182,212,0.12)',
              border: '1px solid rgba(6,182,212,0.25)',
              color: '#38BDF8',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Hash size={13} />
            <span>Hashtags</span>
          </button>
        </div>
      </div>

      {/* ── 2. Corps Principal du Studio ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Flèche de navigation Gauche (←) */}
        {currentIdx > 0 && (
          <button
            onClick={() => setCurrentIdx((i) => i - 1)}
            title="Post précédent"
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(15,23,42,0.85)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 30,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              transition: '0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15,23,42,0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Flèche de navigation Droite (→) */}
        {currentIdx < platforms.length - 1 && (
          <button
            onClick={() => setCurrentIdx((i) => i + 1)}
            title="Post suivant"
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(15,23,42,0.85)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 30,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              transition: '0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15,23,42,0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* ── CAS A : AVEC IMAGE (Split-View comme le screenshot Lightbox) ── */}
        {hasImage ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(380px, 460px)',
              overflow: 'hidden',
            }}
          >
            {/* Volet Gauche : Grand Carrousel / Image en focus */}
            <div
              style={{
                position: 'relative',
                background: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '2rem',
              }}
            >
              <img
                src={card.imageUrl!}
                alt="Post média"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                  borderRadius: '8px',
                }}
              />

              {/* Indicateur de pagination 1/1 */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  backdropFilter: 'blur(4px)',
                }}
              >
                1 / 1
              </div>

              {/* Boutons d'actions sur le média */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  display: 'flex',
                  gap: '8px',
                }}
              >
                <button
                  onClick={handleGenerateImage}
                  disabled={card.imageLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(15,23,42,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <Sparkles size={12} color="#38BDF8" />
                  <span>Régénérer IA</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(15,23,42,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <Upload size={12} />
                  <span>Remplacer</span>
                </button>

                <button
                  onClick={() => onUpdateCard(currentPlatform, { imageUrl: null })}
                  title="Supprimer l'image"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'rgba(239,68,68,0.85)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Volet Droit : Détails du post, Éditeur inline et Actions */}
            <div
              style={{
                background: 'var(--card, #ffffff)',
                borderLeft: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflowY: 'auto',
              }}
            >
              <div style={{ padding: '1.25rem' }}>
                {/* Mockup interactif */}
                {renderFeedMockup()}
              </div>

              {/* Barre d'action inférieure de publication */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderTop: '1px solid var(--b1, #e2e8f0)',
                  background: 'var(--s2, #f8fafc)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {/* Programmation */}
                <div
                  onClick={() => onScheduleOpen(currentPlatform)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--card)',
                    border: `1px solid ${card.scheduledAt ? 'rgba(22,119,255,0.4)' : 'var(--b1)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color={card.scheduledAt ? 'var(--accent)' : 'var(--t3)'} />
                    <span style={{ fontSize: '0.8rem', color: card.scheduledAt ? 'var(--accent)' : 'var(--t2)', fontWeight: card.scheduledAt ? 600 : 500 }}>
                      {card.scheduledAt ? `Planifié : ${formatScheduled(card.scheduledAt)}` : 'Programmer une date...'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--t3)' }}>Modifier</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onSaveDraft(currentPlatform)}
                    disabled={isDrafting}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '9px',
                      borderRadius: '8px',
                      border: '1px solid var(--b1)',
                      background: 'var(--card)',
                      color: 'var(--t2)',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: isDrafting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Save size={14} />
                    <span>Brouillon</span>
                  </button>

                  {card.scheduledAt ? (
                    <button
                      onClick={() => onPublishScheduled(currentPlatform)}
                      disabled={isPublishing}
                      className="btn-primary"
                      style={{
                        flex: 1.6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        padding: '9px',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: isPublishing ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Clock size={14} />
                      <span>Valider la programmation</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onPublish(currentPlatform)}
                      disabled={isPublishing}
                      className="btn-primary"
                      style={{
                        flex: 1.6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        padding: '9px',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: isPublishing ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Send size={14} />
                      <span>Publier sur {PLATFORM_NAMES[currentPlatform]}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── CAS B : SANS IMAGE (Post centré avec côtés vides) ── */
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Carte du post centré */}
            <div style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.6)', borderRadius: '12px' }}>
              {renderFeedMockup()}
            </div>

            {/* Boîte d'action pour ajouter/générer une image */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(15,23,42,0.85)',
                border: '1px dashed rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '0.82rem' }}>
                <ImageIcon size={16} />
                <span>Aucun visuel associé</span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleGenerateImage}
                  disabled={card.imageLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #38BDF8, #7B5CF5)',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: card.imageLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {card.imageLoading ? (
                    <div style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  <span>Générer IA</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={12} />
                  <span>Importer</span>
                </button>
              </div>
            </div>

            {/* Actions de publication / programmation */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* Programmation */}
              <div
                onClick={() => onScheduleOpen(currentPlatform)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${card.scheduledAt ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color={card.scheduledAt ? '#38BDF8' : '#94A3B8'} />
                  <span style={{ fontSize: '0.8rem', color: card.scheduledAt ? '#38BDF8' : '#CBD5E1', fontWeight: card.scheduledAt ? 600 : 500 }}>
                    {card.scheduledAt ? `Planifié : ${formatScheduled(card.scheduledAt)}` : 'Programmer une date et heure...'}
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Modifier</span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onSaveDraft(currentPlatform)}
                  disabled={isDrafting}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    padding: '9px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#E2E8F0',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: isDrafting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Save size={14} />
                  <span>Brouillon</span>
                </button>

                {card.scheduledAt ? (
                  <button
                    onClick={() => onPublishScheduled(currentPlatform)}
                    disabled={isPublishing}
                    className="btn-primary"
                    style={{
                      flex: 1.6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '9px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: isPublishing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Clock size={14} />
                    <span>Valider la programmation</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onPublish(currentPlatform)}
                    disabled={isPublishing}
                    className="btn-primary"
                    style={{
                      flex: 1.6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '9px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: isPublishing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Send size={14} />
                    <span>Publier sur {PLATFORM_NAMES[currentPlatform]}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

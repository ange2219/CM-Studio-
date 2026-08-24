'use client'

import React, { useRef, useEffect, useState } from 'react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Sparkles, Upload, Trash2, Globe, MoreHorizontal, BarChart2 } from 'lucide-react'

export interface LinkedInPostMockupProps {
  content: string
  imageUrl: string | null
  imageLoading?: boolean
  userName?: string | null
  userHeadline?: string | null
  avatarUrl?: string | null
  onContentChange: (newContent: string) => void
  onImageSet: (url: string | null) => void
  onGenerateImage?: () => void
  onUploadImage?: () => void
  isPro?: boolean
}

// ─── SVG Reactions LinkedIn Réalistes ─────────────────────────────────────────

function LinkedInLikeIcon() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: '#0A66C2',
        boxShadow: '0 0 0 1.5px var(--card)',
        zIndex: 3,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 16 16" fill="white">
        <path d="M14.5 7.5a1.5 1.5 0 0 0-1.5-1.5h-3V3.5A2.5 2.5 0 0 0 7.5 1h-.293a.5.5 0 0 0-.414.22L4.316 4.938A2.5 2.5 0 0 0 3.5 6.708V13.5A1.5 1.5 0 0 0 5 15h6.72a2.5 2.5 0 0 0 2.404-1.815l1.2-4.5A1.5 1.5 0 0 0 14.5 7.5zM1 6a1 1 0 0 1 1-1h1v9H2a1 1 0 0 1-1-1V6z" />
      </svg>
    </span>
  )
}

function LinkedInHeartIcon() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: '#DF704D',
        boxShadow: '0 0 0 1.5px var(--card)',
        marginLeft: '-4px',
        zIndex: 2,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 16 16" fill="white">
        <path d="M8 14s-6-4.35-6-8.5A4.5 4.5 0 0 1 6.5 1C7.5 1 8 2 8 2s.5-1 1.5-1A4.5 4.5 0 0 1 14 5.5C14 9.65 8 14 8 14z" />
      </svg>
    </span>
  )
}

function LinkedInInsightIcon() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: '#EDB958',
        boxShadow: '0 0 0 1.5px var(--card)',
        marginLeft: '-4px',
        zIndex: 1,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 16 16" fill="white">
        <path d="M8 1a5 5 0 0 0-5 5c0 1.95 1.13 3.64 2.8 4.45V12a1 1 0 0 0 1 1h2.4a1 1 0 0 0 1-1v-1.55C11.87 9.64 13 7.95 13 6a5 5 0 0 0-5-5zm-1 13h2v1H7v-1z" />
      </svg>
    </span>
  )
}

export function LinkedInPostMockup({
  content,
  imageUrl,
  imageLoading,
  userName = 'Ange-Marie DAHOU',
  userHeadline = 'Futur Data Scientist | En formation continue en Machine Learning et IA',
  avatarUrl,
  onContentChange,
  onImageSet,
  onGenerateImage,
  onUploadImage,
  isPro = true,
}: LinkedInPostMockupProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showFullPreview, setShowFullPreview] = useState(false)
  const [isHoveredMedia, setIsHoveredMedia] = useState(false)

  // Auto-resize du textarea pour donner un rendu 100% fluide et natif
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(110, textareaRef.current.scrollHeight)}px`
    }
  }, [content])

  // Détection de coupure LinkedIn ("... plus" / "...voir plus")
  // Sur LinkedIn desktop, la coupure se fait typiquement à 3-5 lignes ou ~210 caractères
  const lines = content.split('\n')
  const shouldShowCutoff = !showFullPreview && (lines.length > 4 || content.length > 220)

  return (
    <div
      style={{
        background: 'var(--card, #ffffff)',
        border: '1px solid var(--b1, #e2e8f0)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        color: 'var(--t1, #1e293b)',
        position: 'relative',
      }}
    >
      {/* ── 1. En-tête du post LinkedIn ── */}
      <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
          <UserAvatar
            avatarUrl={avatarUrl}
            size={48}
            fallbackColor="var(--t3)"
            iconSize={26}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Nom + Badge • Vous / • 1er */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--t1)', lineHeight: 1.25 }}>
                {userName || 'Ange-Marie DAHOU'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--t3)', fontWeight: 400 }}>
                • Vous
              </span>
            </div>

            {/* Titre / Headline */}
            <p
              style={{
                fontSize: '0.74rem',
                color: 'var(--t2)',
                lineHeight: 1.35,
                margin: '2px 0 3px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={userHeadline || ''}
            >
              {userHeadline || 'Expert en Stratégie Digitale & Community Management'}
            </p>

            {/* Horodatage + Confidentialité */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--t3)' }}>
              <span>1 h</span>
              <span>•</span>
              <Globe size={11} strokeWidth={2.2} />
            </div>
          </div>
        </div>

        {/* Menu 3 points */}
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--t3)', cursor: 'pointer', padding: '4px' }}>
          <MoreHorizontal size={18} />
        </div>
      </div>

      {/* ── 2. Corps du post — Édition Inline No-Code ── */}
      <div style={{ padding: '4px 16px 10px', position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Rédigez votre post LinkedIn..."
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '0.88rem',
            lineHeight: 1.55,
            color: 'var(--t1)',
            fontFamily: 'inherit',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: 0,
            margin: 0,
            minHeight: '90px',
            display: 'block',
          }}
        />

        {/* Petit indicateur interactif de coupure LinkedIn ("... plus") */}
        {shouldShowCutoff && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '4px',
              paddingTop: '4px',
              borderTop: '1px dashed var(--b1)',
              fontSize: '0.75rem',
            }}
          >
            <span style={{ color: 'var(--t3)', fontStyle: 'italic' }}>
              Aperçu de coupure mobile/desktop
            </span>
            <button
              type="button"
              onClick={() => setShowFullPreview((v) => !v)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0A66C2',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.78rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              ... plus
            </button>
          </div>
        )}
      </div>

      {/* ── 3. Image / Média attaché ── */}
      {imageLoading ? (
        <div
          style={{
            width: '100%',
            aspectRatio: '16/9',
            background: 'var(--s2, #f1f5f9)',
            borderTop: '1px solid var(--b1)',
            borderBottom: '1px solid var(--b1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              border: '3px solid rgba(10,102,194,0.2)',
              borderTopColor: '#0A66C2',
              borderRadius: '50%',
              animation: 'rot 0.7s linear infinite',
            }}
          />
          <span style={{ fontSize: '0.76rem', color: 'var(--t3)', fontWeight: 500 }}>
            Génération de l&apos;image IA en cours...
          </span>
        </div>
      ) : imageUrl ? (
        <div
          onMouseEnter={() => setIsHoveredMedia(true)}
          onMouseLeave={() => setIsHoveredMedia(false)}
          style={{
            position: 'relative',
            width: '100%',
            background: '#0F172A',
            borderTop: '1px solid var(--b1)',
            borderBottom: '1px solid var(--b1)',
            overflow: 'hidden',
          }}
        >
          <img
            src={imageUrl}
            alt="Visuel LinkedIn"
            style={{
              width: '100%',
              maxHeight: '380px',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
            }}
          />

          {/* Overlay d'actions sur le média */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              display: 'flex',
              gap: '6px',
              opacity: isHoveredMedia ? 1 : 0.85,
              transition: 'opacity 0.15s ease',
            }}
          >
            {onGenerateImage && (
              <button
                type="button"
                onClick={onGenerateImage}
                title="Régénérer avec l'IA"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 9px',
                  borderRadius: '6px',
                  background: 'rgba(15,23,42,0.75)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(6px)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}
              >
                <Sparkles size={12} color="#38BDF8" />
                <span>IA</span>
              </button>
            )}
            {onUploadImage && (
              <button
                type="button"
                onClick={onUploadImage}
                title="Remplacer par un fichier"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 9px',
                  borderRadius: '6px',
                  background: 'rgba(15,23,42,0.75)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(6px)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}
              >
                <Upload size={12} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onImageSet(null)}
              title="Supprimer l'image"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '5px 7px',
                borderRadius: '6px',
                background: 'rgba(239,68,68,0.85)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.72rem',
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ) : (
        /* Emplacement média optionnel discret */
        <div
          style={{
            margin: '0 16px 10px',
            padding: '10px',
            borderRadius: '8px',
            border: '1px dashed var(--b1)',
            background: 'var(--s2, #f8fafc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '0.76rem', color: 'var(--t3)', fontWeight: 500 }}>
            Aucun visuel associé
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {onGenerateImage && (
              <button
                type="button"
                onClick={onGenerateImage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(10,102,194,0.3)',
                  background: 'rgba(10,102,194,0.06)',
                  color: '#0A66C2',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}
              >
                <Sparkles size={11} />
                <span>Générer IA</span>
              </button>
            )}
            {onUploadImage && (
              <button
                type="button"
                onClick={onUploadImage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--b1)',
                  background: 'var(--card)',
                  color: 'var(--t2)',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                }}
              >
                <Upload size={11} />
                <span>Importer</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 4. Barre de Réactions LinkedIn ── */}
      <div
        style={{
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.74rem',
          color: 'var(--t3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
            <LinkedInLikeIcon />
            <LinkedInHeartIcon />
            <LinkedInInsightIcon />
          </div>
          <span style={{ fontWeight: 500, color: 'var(--t2)' }}>23</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span>7 commentaires</span>
          <span>•</span>
          <span>1 republication</span>
        </div>
      </div>

      {/* ── 5. Barre d'Actions LinkedIn (J'aime, Commenter, Republier, Envoyer) ── */}
      <div
        style={{
          borderTop: '1px solid var(--b1)',
          borderBottom: '1px solid var(--b1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '2px 6px',
        }}
      >
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 4px',
            background: 'none',
            border: 'none',
            color: 'var(--t2)',
            fontSize: '0.78rem',
            fontWeight: 600,
            borderRadius: '6px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--s2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <path d="M14.5 7.5a1.5 1.5 0 0 0-1.5-1.5h-3V3.5A2.5 2.5 0 0 0 7.5 1h-.293a.5.5 0 0 0-.414.22L4.316 4.938A2.5 2.5 0 0 0 3.5 6.708V13.5A1.5 1.5 0 0 0 5 15h6.72a2.5 2.5 0 0 0 2.404-1.815l1.2-4.5A1.5 1.5 0 0 0 14.5 7.5zM1 6a1 1 0 0 1 1-1h1v9H2a1 1 0 0 1-1-1V6z" />
          </svg>
          <span>J&apos;aime</span>
        </button>

        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 4px',
            background: 'none',
            border: 'none',
            color: 'var(--t2)',
            fontSize: '0.78rem',
            fontWeight: 600,
            borderRadius: '6px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--s2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <path d="M14 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3v3l3.5-3H14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
          </svg>
          <span>Commenter</span>
        </button>

        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 4px',
            background: 'none',
            border: 'none',
            color: 'var(--t2)',
            fontSize: '0.78rem',
            fontWeight: 600,
            borderRadius: '6px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--s2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13 5H5a2 2 0 0 0-2 2v2H1.5l2.75 3.5L7 9H5V7h8V5zm-2 6h-2v2H3v-2H1.5l2.75 3.5L7 11H5v2h6a2 2 0 0 0 2-2v-2h-2v2z" />
          </svg>
          <span>Republier</span>
        </button>

        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 4px',
            background: 'none',
            border: 'none',
            color: 'var(--t2)',
            fontSize: '0.78rem',
            fontWeight: 600,
            borderRadius: '6px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--s2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <path d="M15.5 1.5l-14 6a.5.5 0 0 0 0 .92l4.8 2.08 2.08 4.8a.5.5 0 0 0 .92 0l6-14a.5.5 0 0 0-.8-.8zM6.9 9.1l5.5-5.5-4.4 7.2-1.1-1.7z" />
          </svg>
          <span>Envoyer</span>
        </button>
      </div>

      {/* ── 6. Pied de page Statistiques d'Impressions LinkedIn ── */}
      <div
        style={{
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.76rem',
          background: 'var(--card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--t2)', fontWeight: 600 }}>
          <BarChart2 size={15} color="#0A66C2" />
          <span>5 641 impressions</span>
        </div>
        <span style={{ color: '#0A66C2', fontWeight: 600, cursor: 'pointer' }}>
          Voir les statistiques
        </span>
      </div>
    </div>
  )
}

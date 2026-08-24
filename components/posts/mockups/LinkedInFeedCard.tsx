'use client'

import React, { useRef, useEffect, useState } from 'react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Globe, MoreHorizontal } from 'lucide-react'

export interface LinkedInFeedCardProps {
  content: string
  imageUrl?: string | null
  userName?: string | null
  userHeadline?: string | null
  avatarUrl?: string | null
  onContentChange?: (v: string) => void
  readOnly?: boolean
  onClick?: () => void
}

function LinkedInLikeIcon() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: '#0A66C2',
        boxShadow: '0 0 0 1.5px var(--card, #fff)',
        zIndex: 3,
      }}
    >
      <svg width="9" height="9" viewBox="0 0 16 16" fill="white">
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
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: '#DF704D',
        boxShadow: '0 0 0 1.5px var(--card, #fff)',
        marginLeft: '-3px',
        zIndex: 2,
      }}
    >
      <svg width="9" height="9" viewBox="0 0 16 16" fill="white">
        <path d="M8 14s-6-4.35-6-8.5A4.5 4.5 0 0 1 6.5 1C7.5 1 8 2 8 2s.5-1 1.5-1A4.5 4.5 0 0 1 14 5.5C14 9.65 8 14 8 14z" />
      </svg>
    </span>
  )
}

function LinkedInClapIcon() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: '#44A368',
        boxShadow: '0 0 0 1.5px var(--card, #fff)',
        marginLeft: '-3px',
        zIndex: 1,
      }}
    >
      <svg width="9" height="9" viewBox="0 0 16 16" fill="white">
        <path d="M4 8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
      </svg>
    </span>
  )
}

export function LinkedInFeedCard({
  content,
  imageUrl,
  userName = 'Ange-Marie DAHOU',
  userHeadline = 'Futur Data Scientist | En formation continue en Machine Learning et ...',
  avatarUrl,
  onContentChange,
  readOnly = false,
  onClick,
}: LinkedInFeedCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showFull, setShowFull] = useState(false)

  const displayName = userName || 'Ange-Marie DAHOU'

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(80, textareaRef.current.scrollHeight)}px`
    }
  }, [content])

  const isLong = !showFull && content.length > 180

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card, #ffffff)',
        border: '1px solid var(--b1, #e2e8f0)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        color: 'var(--t1, #0f172a)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── 1. En-tête LinkedIn ── */}
      <div style={{ padding: '12px 14px 6px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
          <UserAvatar avatarUrl={avatarUrl} size={44} fallbackColor="var(--t3)" iconSize={24} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--t1)', lineHeight: 1.25 }}>
                {displayName}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--t3)', fontWeight: 400 }}>
                • Vous
              </span>
            </div>

            <p
              style={{
                fontSize: '0.72rem',
                color: 'var(--t2, #64748b)',
                lineHeight: 1.3,
                margin: '1px 0 2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {userHeadline || 'Expert en Stratégie & Communication Digitale'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--t3)' }}>
              <span>1 an(s)</span>
              <span>•</span>
              <Globe size={11} strokeWidth={2.2} />
            </div>
          </div>
        </div>

        <div style={{ color: 'var(--t3)', padding: '2px', cursor: 'pointer' }}>
          <MoreHorizontal size={18} />
        </div>
      </div>

      {/* ── 2. Corps du post ── */}
      <div style={{ padding: '6px 14px 8px' }}>
        {readOnly ? (
          <div style={{ fontSize: '0.86rem', lineHeight: 1.5, color: 'var(--t1)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {content}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange?.(e.target.value)}
            placeholder="Rédigez votre post LinkedIn..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: '0.86rem',
              lineHeight: 1.5,
              color: 'var(--t1)',
              fontFamily: 'inherit',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              padding: 0,
              margin: 0,
              minHeight: '80px',
              display: 'block',
            }}
          />
        )}

        {isLong && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowFull(true) }}
            style={{
              background: 'none',
              border: 'none',
              color: '#0A66C2',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.78rem',
              padding: '2px 0 0',
            }}
          >
            ... plus
          </button>
        )}
      </div>

      {/* ── 3. Image (affichée uniquement si elle existe !) ── */}
      {imageUrl && (
        <div style={{ width: '100%', maxHeight: '340px', background: '#0F172A', overflow: 'hidden' }}>
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* ── 4. Barre de Réactions ── */}
      <div
        style={{
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--t3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
            <LinkedInLikeIcon />
            <LinkedInHeartIcon />
            <LinkedInClapIcon />
          </div>
          <span style={{ fontWeight: 500, color: 'var(--t2)' }}>12</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span>6 commentaires</span>
          <span>•</span>
          <span>1 republication</span>
        </div>
      </div>

      {/* ── 5. Boutons d'actions LinkedIn ── */}
      <div
        style={{
          borderTop: '1px solid var(--b1, #e2e8f0)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '2px 4px',
        }}
      >
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '7px 2px',
            background: 'none',
            border: 'none',
            color: 'var(--t2)',
            fontSize: '0.76rem',
            fontWeight: 600,
            borderRadius: '6px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--s2, #f1f5f9)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
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
            gap: '4px',
            padding: '7px 2px',
            background: 'none',
            border: 'none',
            color: 'var(--t2)',
            fontSize: '0.76rem',
            fontWeight: 600,
            borderRadius: '6px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--s2, #f1f5f9)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
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
            gap: '4px',
            padding: '7px 2px',
            background: 'none',
            border: 'none',
            color: 'var(--t2)',
            fontSize: '0.76rem',
            fontWeight: 600,
            borderRadius: '6px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--s2, #f1f5f9)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
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
            gap: '4px',
            padding: '7px 2px',
            background: 'none',
            border: 'none',
            color: 'var(--t2)',
            fontSize: '0.76rem',
            fontWeight: 600,
            borderRadius: '6px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--s2, #f1f5f9)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <path d="M15.5 1.5l-14 6a.5.5 0 0 0 0 .92l4.8 2.08 2.08 4.8a.5.5 0 0 0 .92 0l6-14a.5.5 0 0 0-.8-.8zM6.9 9.1l5.5-5.5-4.4 7.2-1.1-1.7z" />
          </svg>
          <span>Envoyer</span>
        </button>
      </div>
    </div>
  )
}

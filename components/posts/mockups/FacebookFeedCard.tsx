'use client'

import React, { useRef, useEffect, useState } from 'react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Globe, MoreHorizontal, ThumbsUp, MessageSquare, Share2 } from 'lucide-react'

export interface FacebookFeedCardProps {
  content: string
  imageUrl?: string | null
  userName?: string | null
  avatarUrl?: string | null
  onContentChange?: (v: string) => void
  readOnly?: boolean
  onClick?: () => void
}

export function FacebookFeedCard({
  content,
  imageUrl,
  userName = 'Codjo Thimotée',
  avatarUrl,
  onContentChange,
  readOnly = false,
  onClick,
}: FacebookFeedCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showFull, setShowFull] = useState(false)

  const displayName = userName || 'Codjo Thimotée'

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(75, textareaRef.current.scrollHeight)}px`
    }
  }, [content])

  const isLong = !showFull && content.length > 130

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
      {/* ── 1. En-tête Facebook ── */}
      <div style={{ padding: '12px 14px 6px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserAvatar avatarUrl={avatarUrl} size={42} fallbackColor="var(--t3)" iconSize={22} />
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--t1)' }}>{displayName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--t3)' }}>
              <span>13 juin</span>
              <span>·</span>
              <Globe size={11} />
            </div>
          </div>
        </div>
        <div style={{ color: 'var(--t3)', padding: '2px', cursor: 'pointer' }}>
          <MoreHorizontal size={18} />
        </div>
      </div>

      {/* ── 2. Corps du post Facebook ── */}
      <div style={{ padding: '4px 14px 10px' }}>
        {/* Badge @à la une bleu authentique */}
        <div style={{ display: 'inline-block', color: '#1877F2', fontWeight: 600, fontSize: '0.86rem', marginBottom: '4px' }}>
          @à la une
        </div>

        {readOnly ? (
          <div style={{ fontSize: '0.88rem', lineHeight: 1.45, color: 'var(--t1)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {content}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange?.(e.target.value)}
            placeholder="Exprimez-vous..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: '0.88rem',
              lineHeight: 1.45,
              color: 'var(--t1)',
              fontFamily: 'inherit',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              padding: 0,
              margin: 0,
              minHeight: '75px',
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
              color: '#64748B',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.82rem',
              padding: '2px 0 0',
            }}
          >
            ... Afficher la suite
          </button>
        )}
      </div>

      {/* ── 3. Image (affichée uniquement si présente !) ── */}
      {imageUrl && (
        <div style={{ width: '100%', maxHeight: '340px', background: '#0F172A', overflow: 'hidden' }}>
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* ── 4. Barre de Réactions & Compteurs ── */}
      <div
        style={{
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: 'var(--t2)',
          borderTop: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        {/* Gauche : Bouton like rapide & compteurs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <ThumbsUp size={15} />
            <span>5</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <MessageSquare size={15} />
            <span>1</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <Share2 size={15} />
          </div>
        </div>

        {/* Droite : Pastilles d'émojis superposées (😆 👍 ❤️) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', zIndex: 3 }}>😆</span>
          <span style={{ fontSize: '14px', marginLeft: '-3px', zIndex: 2 }}>👍</span>
          <span style={{ fontSize: '14px', marginLeft: '-3px', zIndex: 1 }}>❤️</span>
        </div>
      </div>
    </div>
  )
}

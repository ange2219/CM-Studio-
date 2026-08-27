'use client'

import React, { useRef, useEffect, useState } from 'react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Repeat2 } from 'lucide-react'

export interface InstagramFeedCardProps {
  content: string
  imageUrl?: string | null
  userName?: string | null
  avatarUrl?: string | null
  onContentChange?: (v: string) => void
  readOnly?: boolean
  onClick?: () => void
}

export function InstagramFeedCard({
  content,
  imageUrl,
  userName = 'mon_profil',
  avatarUrl,
  onContentChange,
  readOnly = false,
  onClick,
}: InstagramFeedCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  const safeName = userName || 'mon_profil'
  const igHandle = safeName.toLowerCase().replace(/[^a-z0-9._]/g, '_')

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(70, textareaRef.current.scrollHeight)}px`
    }
  }, [content])

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
      {/* ── 1. En-tête Instagram avec anneau Story dégradé ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Story gradient ring */}
          <div
            style={{
              padding: '2px',
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ padding: '1px', background: 'var(--card, #fff)', borderRadius: '50%' }}>
              <UserAvatar avatarUrl={avatarUrl} size={36} fallbackColor="var(--t3)" iconSize={20} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--t1)', lineHeight: 1.2 }}>
              {igHandle}
            </div>
          </div>
        </div>

        <div style={{ color: 'var(--t3)', padding: '2px', cursor: 'pointer' }}>
          <MoreHorizontal size={18} />
        </div>
      </div>

      {/* ── 2. Image (affichée uniquement si présente !) ── */}
      {imageUrl && (
        <div style={{ width: '100%', aspectRatio: '1/1', background: '#0F172A', overflow: 'hidden' }}>
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* ── 3. Barre d'Actions Instagram (♡ 41, 💬 1, 🔁 1, ✈️ 1, 🔖) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            onClick={(e) => { e.stopPropagation(); setLiked(v => !v) }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
          >
            <Heart size={20} fill={liked ? '#EF4444' : 'none'} color={liked ? '#EF4444' : 'var(--t1)'} />
            <span>41</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
            <MessageCircle size={20} color="var(--t1)" />
            <span>1</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
            <Repeat2 size={20} color="var(--t1)" />
            <span>1</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
            <Send size={18} color="var(--t1)" />
            <span>1</span>
          </div>
        </div>

        <div
          onClick={(e) => { e.stopPropagation(); setSaved(v => !v) }}
          style={{ cursor: 'pointer' }}
        >
          <Bookmark size={20} fill={saved ? 'var(--t1)' : 'none'} color="var(--t1)" />
        </div>
      </div>

      {/* ── 4. Légende / Texte Instagram ── */}
      <div style={{ padding: '4px 14px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--t1)', flexShrink: 0, marginTop: '1px' }}>
            {igHandle}
          </span>
          {readOnly ? (
            <div style={{ fontSize: '0.84rem', lineHeight: 1.45, color: 'var(--t1)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {content}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onContentChange?.(e.target.value)}
              placeholder="Écrire une légende..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '0.84rem',
                lineHeight: 1.45,
                color: 'var(--t1)',
                fontFamily: 'inherit',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                padding: 0,
                margin: 0,
                minHeight: '60px',
                display: 'block',
              }}
            />
          )}
        </div>

        <div style={{ fontSize: '0.68rem', color: 'var(--t3)', textTransform: 'uppercase', marginTop: '6px', letterSpacing: '0.04em' }}>
          Il y a 2 heures
        </div>
      </div>
    </div>
  )
}

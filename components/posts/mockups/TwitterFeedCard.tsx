'use client'

import React, { useRef, useEffect } from 'react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { MessageCircle, Repeat2, Heart, BarChart2, Share, MoreHorizontal } from 'lucide-react'

export interface TwitterFeedCardProps {
  content: string
  imageUrl?: string | null
  userName?: string | null
  userHandle?: string | null
  avatarUrl?: string | null
  onContentChange?: (v: string) => void
  readOnly?: boolean
  onClick?: () => void
}

export function TwitterFeedCard({
  content,
  imageUrl,
  userName = 'Mon Profil',
  userHandle,
  avatarUrl,
  onContentChange,
  readOnly = false,
  onClick,
}: TwitterFeedCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const safeName = userName || 'Mon Profil'
  const handle = userHandle || `@${safeName.toLowerCase().replace(/[^a-z0-9]/g, '')}`

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(70, textareaRef.current.scrollHeight)}px`
    }
  }, [content])

  // Compteur 280 car
  const maxLen = 280
  const charCount = content.length
  const pct = Math.min(100, (charCount / maxLen) * 100)
  const isOver = charCount > maxLen
  const radius = 8
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pct / 100) * circumference

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
        padding: '12px 14px',
        display: 'flex',
        gap: '12px',
        position: 'relative',
      }}
    >
      <UserAvatar avatarUrl={avatarUrl} size={40} fallbackColor="var(--t3)" iconSize={20} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--t1)' }}>{safeName}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#1D9BF0">
              <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91c-1.31.67-2.19 1.91-2.19 3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.33 2.33 4.96-4.96 1.41 1.42-6.37 6.37z" />
            </svg>
            <span style={{ fontSize: '0.8rem', color: 'var(--t3)' }}>{handle}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--t3)' }}>· À l&apos;instant</span>
          </div>
          <MoreHorizontal size={16} color="var(--t3)" style={{ cursor: 'pointer' }} />
        </div>

        {/* Corps */}
        <div style={{ marginTop: '4px' }}>
          {readOnly ? (
            <div style={{ fontSize: '0.88rem', lineHeight: 1.45, color: 'var(--t1)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {content}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onContentChange?.(e.target.value)}
              placeholder="Quoi de neuf ?"
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
                minHeight: '65px',
                display: 'block',
              }}
            />
          )}
        </div>

        {/* Image (si présente) */}
        {imageUrl && (
          <div style={{ marginTop: '8px', width: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--b1)' }}>
            <img src={imageUrl} alt="" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }} />
          </div>
        )}

        {/* Actions Twitter */}
        <div
          style={{
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--t3)',
            fontSize: '0.74rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <MessageCircle size={14} />
            <span>12</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <Repeat2 size={14} />
            <span>4</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <Heart size={14} />
            <span>38</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <BarChart2 size={14} />
            <span>1.2k</span>
          </div>
          <Share size={14} style={{ cursor: 'pointer' }} />

          {/* Jauge 280 car. */}
          <div style={{ position: 'relative', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r={radius} stroke="var(--b1)" strokeWidth="1.8" fill="none" />
              <circle
                cx="10"
                cy="10"
                r={radius}
                stroke={isOver ? '#EF4444' : pct > 80 ? '#F59E0B' : '#1D9BF0'}
                strokeWidth="2"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 10 10)"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

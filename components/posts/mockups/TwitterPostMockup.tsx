'use client'

import React, { useRef, useEffect, useState } from 'react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Sparkles, Upload, Trash2, Heart, MessageCircle, Repeat2, Bookmark, Share, BarChart2, MoreHorizontal } from 'lucide-react'

export interface TwitterPostMockupProps {
  content: string
  imageUrl: string | null
  imageLoading?: boolean
  userName?: string | null
  userHandle?: string | null
  avatarUrl?: string | null
  onContentChange: (newContent: string) => void
  onImageSet: (url: string | null) => void
  onGenerateImage?: () => void
  onUploadImage?: () => void
  isPro?: boolean
}

export function TwitterPostMockup({
  content,
  imageUrl,
  imageLoading,
  userName = 'Ange-Marie DAHOU',
  userHandle,
  avatarUrl,
  onContentChange,
  onImageSet,
  onGenerateImage,
  onUploadImage,
}: TwitterPostMockupProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isHoveredMedia, setIsHoveredMedia] = useState(false)

  const safeName = userName || 'Ange-Marie DAHOU'
  const handle = userHandle || `@${safeName.toLowerCase().replace(/[^a-z0-9]/g, '')}`

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(90, textareaRef.current.scrollHeight)}px`
    }
  }, [content])

  // Compteur circulaire Twitter
  const maxLen = 280
  const charCount = content.length
  const pct = Math.min(100, (charCount / maxLen) * 100)
  const isOver = charCount > maxLen
  const radius = 9
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pct / 100) * circumference

  return (
    <div
      style={{
        background: 'var(--card, #ffffff)',
        border: '1px solid var(--b1, #e2e8f0)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        color: 'var(--t1)',
        padding: '14px 16px 12px',
      }}
    >
      {/* ── En-tête X / Twitter ── */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <UserAvatar avatarUrl={avatarUrl} size={42} fallbackColor="var(--t3)" iconSize={22} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--t1)' }}>{userName}</span>
              {/* Badge certifié bleu */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#1D9BF0">
                <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91c-1.31.67-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.33 2.33 4.96-4.96 1.41 1.42-6.37 6.37z" />
              </svg>
              <span style={{ fontSize: '0.82rem', color: 'var(--t3)' }}>{handle}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--t3)' }}>· 2h</span>
            </div>
            <MoreHorizontal size={16} color="var(--t3)" style={{ cursor: 'pointer' }} />
          </div>

          {/* Corps du post (Tweet) */}
          <div style={{ marginTop: '6px' }}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Quoi de neuf ?"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '0.94rem',
                lineHeight: 1.45,
                color: 'var(--t1)',
                fontFamily: 'inherit',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                padding: 0,
                margin: 0,
                minHeight: '70px',
                display: 'block',
              }}
            />
          </div>

          {/* Média attaché dans le Tweet */}
          {imageLoading ? (
            <div
              style={{
                marginTop: '10px',
                width: '100%',
                aspectRatio: '16/9',
                background: 'var(--s2)',
                borderRadius: '12px',
                border: '1px solid var(--b1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: '24px', height: '24px', border: '3px solid rgba(29,155,240,0.2)', borderTopColor: '#1D9BF0', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
            </div>
          ) : imageUrl ? (
            <div
              onMouseEnter={() => setIsHoveredMedia(true)}
              onMouseLeave={() => setIsHoveredMedia(false)}
              style={{
                marginTop: '10px',
                position: 'relative',
                width: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--b1)',
                background: '#000',
              }}
            >
              <img src={imageUrl} alt="" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }} />
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  display: 'flex',
                  gap: '6px',
                  opacity: isHoveredMedia ? 1 : 0.85,
                }}
              >
                {onGenerateImage && (
                  <button
                    type="button"
                    onClick={onGenerateImage}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.72rem' }}
                  >
                    <Sparkles size={11} color="#38BDF8" /> IA
                  </button>
                )}
                {onUploadImage && (
                  <button
                    type="button"
                    onClick={onUploadImage}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.72rem' }}
                  >
                    <Upload size={11} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onImageSet(null)}
                  style={{ padding: '4px 6px', borderRadius: '6px', background: 'rgba(239,68,68,0.85)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.72rem' }}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px dashed var(--b1)',
                background: 'var(--s2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.74rem', color: 'var(--t3)' }}>Ajouter un visuel (optionnel)</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {onGenerateImage && (
                  <button
                    type="button"
                    onClick={onGenerateImage}
                    style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 7px', borderRadius: '5px', background: 'rgba(29,155,240,0.1)', color: '#1D9BF0', border: '1px solid rgba(29,155,240,0.25)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}
                  >
                    <Sparkles size={10} /> IA
                  </button>
                )}
                {onUploadImage && (
                  <button
                    type="button"
                    onClick={onUploadImage}
                    style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 7px', borderRadius: '5px', background: 'var(--card)', color: 'var(--t2)', border: '1px solid var(--b1)', cursor: 'pointer', fontSize: '0.7rem' }}
                  >
                    <Upload size={10} /> Importer
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Barre d'interactions Twitter */}
          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'var(--t3)',
              fontSize: '0.78rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <MessageCircle size={15} />
              <span>12</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <Repeat2 size={15} />
              <span>4</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <Heart size={15} />
              <span>38</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <BarChart2 size={15} />
              <span>1.2k</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bookmark size={15} style={{ cursor: 'pointer' }} />
              <Share size={15} style={{ cursor: 'pointer' }} />
            </div>

            {/* Jauge circulaire de limite 280 car. */}
            <div style={{ position: 'relative', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 22 22">
                <circle cx="11" cy="11" r={radius} stroke="var(--b1)" strokeWidth="2" fill="none" />
                <circle
                  cx="11"
                  cy="11"
                  r={radius}
                  stroke={isOver ? '#EF4444' : pct > 80 ? '#F59E0B' : '#1D9BF0'}
                  strokeWidth="2.2"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 11 11)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

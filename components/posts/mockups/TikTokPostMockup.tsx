'use client'

import React, { useRef, useEffect, useState } from 'react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Sparkles, Upload, Trash2, Heart, MessageCircle, Bookmark, Share2, Music } from 'lucide-react'

export interface TikTokPostMockupProps {
  content: string
  imageUrl: string | null
  imageLoading?: boolean
  userName?: string | null
  avatarUrl?: string | null
  onContentChange: (newContent: string) => void
  onImageSet: (url: string | null) => void
  onGenerateImage?: () => void
  onUploadImage?: () => void
  isPro?: boolean
}

export function TikTokPostMockup({
  content,
  imageUrl,
  imageLoading,
  userName = 'ange_dahou',
  avatarUrl,
  onContentChange,
  onImageSet,
  onGenerateImage,
  onUploadImage,
}: TikTokPostMockupProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isHoveredMedia, setIsHoveredMedia] = useState(false)

  const safeName = userName || 'ange_dahou'
  const tkHandle = `@${safeName.toLowerCase().replace(/[^a-z0-9._]/g, '_')}`

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(80, textareaRef.current.scrollHeight)}px`
    }
  }, [content])

  return (
    <div
      style={{
        background: '#0F172A',
        color: '#FFFFFF',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ── Visual preview 9:16 vertical style ── */}
      <div
        onMouseEnter={() => setIsHoveredMedia(true)}
        onMouseLeave={() => setIsHoveredMedia(false)}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '260px',
          maxHeight: '340px',
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '12px',
          overflow: 'hidden',
        }}
      >
        {/* Background image if present */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.45,
              filter: 'blur(2px)',
            }}
          />
        )}

        {/* Top bar with audio badge */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '20px', fontSize: '0.72rem' }}>
            <Music size={11} color="#00F2FE" />
            <span style={{ color: '#E2E8F0' }}>Son original - Tendances 2026</span>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {onGenerateImage && (
              <button
                type="button"
                onClick={onGenerateImage}
                style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 7px', borderRadius: '6px', background: 'rgba(0,0,0,0.7)', color: '#00F2FE', border: '1px solid rgba(0,242,254,0.3)', cursor: 'pointer', fontSize: '0.7rem' }}
              >
                <Sparkles size={10} /> IA Visuel
              </button>
            )}
            {imageUrl && (
              <button
                type="button"
                onClick={() => onImageSet(null)}
                style={{ padding: '3px 5px', borderRadius: '6px', background: 'rgba(239,68,68,0.8)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}
              >
                <Trash2 size={10} />
              </button>
            )}
          </div>
        </div>

        {/* Middle/Bottom overlay with right action column */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '10px' }}>
          {/* Bottom Left Script info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <UserAvatar avatarUrl={avatarUrl} size={28} fallbackColor="#334155" iconSize={14} />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF' }}>{tkHandle}</span>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '2px' }}>
              Format Script / Voix-Off :
            </div>
          </div>

          {/* Right vertical action column TikTok */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={16} color="#FF004F" fill="#FF004F" />
              </div>
              <span style={{ fontSize: '0.68rem', color: '#E2E8F0', fontWeight: 600 }}>12.4K</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle size={16} color="#fff" />
              </div>
              <span style={{ fontSize: '0.68rem', color: '#E2E8F0', fontWeight: 600 }}>342</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bookmark size={16} color="#FFD700" fill="#FFD700" />
              </div>
              <span style={{ fontSize: '0.68rem', color: '#E2E8F0', fontWeight: 600 }}>1.8K</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Share2 size={16} color="#fff" />
              </div>
              <span style={{ fontSize: '0.68rem', color: '#E2E8F0', fontWeight: 600 }}>450</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Script / Caption Inline Editor ── */}
      <div style={{ padding: '12px 14px', background: '#090D16', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Script vidéo / description TikTok..."
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '0.84rem',
            lineHeight: 1.5,
            color: '#F8FAFC',
            fontFamily: 'inherit',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: 0,
            margin: 0,
            minHeight: '75px',
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}

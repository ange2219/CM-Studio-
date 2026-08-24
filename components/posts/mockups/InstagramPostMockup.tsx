'use client'

import React, { useRef, useEffect, useState } from 'react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Sparkles, Upload, Trash2, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile } from 'lucide-react'

export interface InstagramPostMockupProps {
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

export function InstagramPostMockup({
  content,
  imageUrl,
  imageLoading,
  userName = 'ange_marie_dahou',
  avatarUrl,
  onContentChange,
  onImageSet,
  onGenerateImage,
  onUploadImage,
}: InstagramPostMockupProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isHoveredMedia, setIsHoveredMedia] = useState(false)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  const safeName = userName || 'ange_marie_dahou'
  const igHandle = safeName.toLowerCase().replace(/[^a-z0-9._]/g, '_')

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(70, textareaRef.current.scrollHeight)}px`
    }
  }, [content])

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
      }}
    >
      {/* ── En-tête Instagram (Story ring + Handle + 3 dots) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
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
            <div style={{ padding: '1px', background: 'var(--card)', borderRadius: '50%' }}>
              <UserAvatar avatarUrl={avatarUrl} size={32} fallbackColor="var(--t3)" iconSize={18} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--t1)', lineHeight: 1.2 }}>{igHandle}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--t3)' }}>Paris, France</div>
          </div>
        </div>

        <MoreHorizontal size={18} color="var(--t3)" style={{ cursor: 'pointer' }} />
      </div>

      {/* ── Visuel Instagram (Carré / Format 1:1) ── */}
      <div
        onMouseEnter={() => setIsHoveredMedia(true)}
        onMouseLeave={() => setIsHoveredMedia(false)}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1/1',
          background: 'var(--s2, #0F172A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {imageLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid rgba(225,48,108,0.2)', borderTopColor: '#E1306C', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--t3)' }}>Génération IA Instagram...</span>
          </div>
        ) : imageUrl ? (
          <>
            <img src={imageUrl} alt="Post Instagram" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                gap: '6px',
                opacity: isHoveredMedia ? 1 : 0.85,
              }}
            >
              {onGenerateImage && (
                <button
                  type="button"
                  onClick={onGenerateImage}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 9px', borderRadius: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                >
                  <Sparkles size={11} color="#E1306C" /> IA
                </button>
              )}
              {onUploadImage && (
                <button
                  type="button"
                  onClick={onUploadImage}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 9px', borderRadius: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.72rem' }}
                >
                  <Upload size={11} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onImageSet(null)}
                style={{ padding: '5px 7px', borderRadius: '6px', background: 'rgba(239,68,68,0.85)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.72rem' }}
              >
                <Trash2 size={11} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--t3)', fontWeight: 500 }}>
              📸 Un visuel est obligatoire sur Instagram
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {onGenerateImage && (
                <button
                  type="button"
                  onClick={onGenerateImage}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                  }}
                >
                  <Sparkles size={12} />
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
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'var(--card)',
                    color: 'var(--t1)',
                    border: '1px solid var(--b1)',
                    cursor: 'pointer',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                  }}
                >
                  <Upload size={12} />
                  <span>Importer</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Barre d'Actions Instagram (Like, Comment, Share, Save) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Heart
            size={22}
            onClick={() => setLiked((v) => !v)}
            fill={liked ? '#EF4444' : 'none'}
            color={liked ? '#EF4444' : 'var(--t1)'}
            style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
          />
          <MessageCircle size={22} color="var(--t1)" style={{ cursor: 'pointer' }} />
          <Send size={20} color="var(--t1)" style={{ cursor: 'pointer' }} />
        </div>
        <Bookmark
          size={22}
          onClick={() => setSaved((v) => !v)}
          fill={saved ? 'var(--t1)' : 'none'}
          color="var(--t1)"
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* ── Likes & Caption (Légende éditable inline) ── */}
      <div style={{ padding: '0 14px 12px' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '6px' }}>
          Aimé par 42 personnes
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--t1)', flexShrink: 0, marginTop: '1px' }}>
            {igHandle}
          </span>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
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
        </div>

        <div style={{ fontSize: '0.68rem', color: 'var(--t3)', textTransform: 'uppercase', marginTop: '6px', letterSpacing: '0.04em' }}>
          Il y a 2 heures
        </div>
      </div>
    </div>
  )
}

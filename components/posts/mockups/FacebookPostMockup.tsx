'use client'

import React, { useRef, useEffect, useState } from 'react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Sparkles, Upload, Trash2, Globe, MoreHorizontal, ThumbsUp, MessageSquare, Share2 } from 'lucide-react'

export interface FacebookPostMockupProps {
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

export function FacebookPostMockup({
  content,
  imageUrl,
  imageLoading,
  userName = 'Ange-Marie DAHOU',
  avatarUrl,
  onContentChange,
  onImageSet,
  onGenerateImage,
  onUploadImage,
}: FacebookPostMockupProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isHoveredMedia, setIsHoveredMedia] = useState(false)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(80, textareaRef.current.scrollHeight)}px`
    }
  }, [content])

  const isLong = content.length > 125

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
      {/* ── En-tête Facebook ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserAvatar avatarUrl={avatarUrl} size={40} fallbackColor="var(--t3)" iconSize={22} />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--t1)' }}>{userName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--t3)' }}>
              <span>1 h</span>
              <span>·</span>
              <Globe size={11} />
            </div>
          </div>
        </div>
        <MoreHorizontal size={18} color="var(--t3)" style={{ cursor: 'pointer' }} />
      </div>

      {/* ── Corps du post Facebook (Édition Inline) ── */}
      <div style={{ padding: '4px 16px 10px' }}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Exprimez-vous..."
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '0.9rem',
            lineHeight: 1.5,
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

        {isLong && (
          <div style={{ fontSize: '0.72rem', color: '#1877F2', fontWeight: 600, marginTop: '2px', textAlign: 'right' }}>
            ... Afficher la suite
          </div>
        )}
      </div>

      {/* ── Visuel Facebook ── */}
      {imageLoading ? (
        <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '26px', height: '26px', border: '3px solid rgba(24,119,242,0.2)', borderTopColor: '#1877F2', borderRadius: '50%', animation: 'rot 0.7s linear infinite' }} />
        </div>
      ) : imageUrl ? (
        <div
          onMouseEnter={() => setIsHoveredMedia(true)}
          onMouseLeave={() => setIsHoveredMedia(false)}
          style={{ position: 'relative', width: '100%', background: '#0F172A', overflow: 'hidden' }}
        >
          <img src={imageUrl} alt="" style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', display: 'block' }} />
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
                <Sparkles size={11} color="#1877F2" /> IA
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
        <div style={{ margin: '0 16px 10px', padding: '8px 12px', borderRadius: '8px', border: '1px dashed var(--b1)', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--t3)' }}>Ajouter un visuel</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {onGenerateImage && (
              <button
                type="button"
                onClick={onGenerateImage}
                style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 7px', borderRadius: '5px', background: 'rgba(24,119,242,0.1)', color: '#1877F2', border: '1px solid rgba(24,119,242,0.25)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}
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

      {/* ── Compteurs de réactions Facebook ── */}
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--t3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: '#1877F2', color: '#fff', fontSize: '10px' }}>👍</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: '#FA383E', color: '#fff', fontSize: '10px', marginLeft: '-4px' }}>❤️</span>
          <span style={{ fontWeight: 500, color: 'var(--t2)', marginLeft: '2px' }}>34</span>
        </div>
        <div>
          <span>12 commentaires</span>
          <span style={{ margin: '0 4px' }}>·</span>
          <span>5 partages</span>
        </div>
      </div>

      {/* ── Boutons d'actions Facebook ── */}
      <div style={{ borderTop: '1px solid var(--b1)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '3px 6px' }}>
        <button
          type="button"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 4px', background: 'none', border: 'none', color: 'var(--t2)', fontSize: '0.8rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--s2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
        >
          <ThumbsUp size={16} /> J&apos;aime
        </button>
        <button
          type="button"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 4px', background: 'none', border: 'none', color: 'var(--t2)', fontSize: '0.8rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--s2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
        >
          <MessageSquare size={16} /> Commenter
        </button>
        <button
          type="button"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 4px', background: 'none', border: 'none', color: 'var(--t2)', fontSize: '0.8rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--s2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
        >
          <Share2 size={16} /> Partager
        </button>
      </div>
    </div>
  )
}

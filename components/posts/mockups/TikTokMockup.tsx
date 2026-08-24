'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music2,
  Sparkles,
  ImageIcon,
  Plus,
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'

interface TikTokMockupProps {
  content: string
  imageUrl: string | null
  imageLoading?: boolean
  userName?: string | null
  userHandle?: string | null
  userAvatar?: string | null
  onContentChange: (newContent: string) => void
  onImageChange?: (url: string | null) => void
  onOpenImagePicker?: () => void
  onGenerateAIImage?: () => void
  readOnly?: boolean
}

export function TikTokMockup({
  content,
  imageUrl,
  imageLoading,
  userName = 'Ange-Marie DAHOU',
  userHandle = 'ange_dahou',
  userAvatar,
  onContentChange,
  onImageChange,
  onOpenImagePicker,
  onGenerateAIImage,
  readOnly = false,
}: TikTokMockupProps) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  const handle = userHandle?.replace('@', '') || 'ange_dahou'

  return (
    <div
      className="tiktok-mockup-card relative w-full max-w-[340px] mx-auto aspect-[9/16] bg-[#121212] text-white rounded-[16px] shadow-lg overflow-hidden border border-slate-800 flex flex-col justify-between p-3.5 select-none"
      style={{
        fontFamily:
          'Proxima Nova, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Background Image / Video Visual */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="TikTok Media"
          className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#020617] opacity-90" />
      )}

      {/* Top Header: Onglets 'Pour toi' */}
      <div className="relative z-10 flex items-center justify-center gap-4 text-xs font-bold pt-1">
        <span className="text-white/60">Suivis</span>
        <span className="text-white border-b-2 border-white pb-0.5">Pour toi</span>
      </div>

      {/* Right Action Icons Overlay (TikTok Floating Bar) */}
      <div className="absolute right-2.5 bottom-16 z-20 flex flex-col items-center gap-4">
        {/* Profile Avatar + Follow Badge */}
        <div className="relative">
          <div className="ring-1 ring-white rounded-full">
            <UserAvatar avatarUrl={userAvatar} size={40} fallbackColor="#333" />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#FE2C55] flex items-center justify-center text-white">
            <Plus size={10} strokeWidth={3} />
          </div>
        </div>

        {/* Heart */}
        <button
          type="button"
          onClick={() => setLiked(!liked)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-2 rounded-full bg-black/30 backdrop-blur-xs">
            <Heart
              size={24}
              className={`transition-transform group-active:scale-125 ${
                liked ? 'fill-[#FE2C55] text-[#FE2C55]' : 'text-white'
              }`}
            />
          </div>
          <span className="text-[11px] font-semibold text-white/90">
            {liked ? '48.3K' : '48.2K'}
          </span>
        </button>

        {/* Comment */}
        <div className="flex flex-col items-center gap-1">
          <div className="p-2 rounded-full bg-black/30 backdrop-blur-xs">
            <MessageCircle size={24} className="text-white fill-white" />
          </div>
          <span className="text-[11px] font-semibold text-white/90">1 420</span>
        </div>

        {/* Bookmark */}
        <button
          type="button"
          onClick={() => setSaved(!saved)}
          className="flex flex-col items-center gap-1"
        >
          <div className="p-2 rounded-full bg-black/30 backdrop-blur-xs">
            <Bookmark
              size={24}
              className={saved ? 'fill-[#FACE15] text-[#FACE15]' : 'text-white fill-white'}
            />
          </div>
          <span className="text-[11px] font-semibold text-white/90">920</span>
        </button>

        {/* Share */}
        <div className="flex flex-col items-center gap-1">
          <div className="p-2 rounded-full bg-black/30 backdrop-blur-xs">
            <Share2 size={24} className="text-white fill-white" />
          </div>
          <span className="text-[11px] font-semibold text-white/90">412</span>
        </div>
      </div>

      {/* Bottom Description & Music Info */}
      <div className="relative z-10 pr-14 flex flex-col gap-1.5">
        <div className="font-bold text-[14px] text-white">@{handle}</div>

        {/* Script caption editable */}
        {readOnly ? (
          <p className="text-[12px] text-white/90 leading-tight line-clamp-3 whitespace-pre-wrap">
            {content}
          </p>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Script / Description TikTok..."
            rows={2}
            className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-[12px] text-white leading-tight resize-none overflow-hidden placeholder-white/50"
          />
        )}

        {/* Sound / Music track */}
        <div className="flex items-center gap-1.5 text-[11px] text-white/80 mt-1">
          <Music2 size={12} className="animate-pulse" />
          <span className="truncate">Son original - {userName}</span>
        </div>
      </div>

      {/* Floating controls for media on top right */}
      {!readOnly && (
        <div className="absolute top-2 right-2 z-30 flex items-center gap-1">
          {onGenerateAIImage && (
            <button
              type="button"
              onClick={onGenerateAIImage}
              className="p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-pink-400 hover:text-white"
              title="Générer visuel IA"
            >
              <Sparkles size={14} />
            </button>
          )}
          {onOpenImagePicker && (
            <button
              type="button"
              onClick={onOpenImagePicker}
              className="p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white/80 hover:text-white"
              title="Changer le visuel"
            >
              <ImageIcon size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

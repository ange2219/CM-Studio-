'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Globe,
  Sparkles,
  ImageIcon,
  Trash2,
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'

interface FacebookMockupProps {
  content: string
  imageUrl: string | null
  imageLoading?: boolean
  userName?: string | null
  userAvatar?: string | null
  onContentChange: (newContent: string) => void
  onImageChange?: (url: string | null) => void
  onOpenImagePicker?: () => void
  onGenerateAIImage?: () => void
  readOnly?: boolean
}

export function FacebookMockup({
  content,
  imageUrl,
  imageLoading,
  userName = 'Ange-Marie DAHOU',
  userAvatar,
  onContentChange,
  onImageChange,
  onOpenImagePicker,
  onGenerateAIImage,
  readOnly = false,
}: FacebookMockupProps) {
  const [liked, setLiked] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  return (
    <div
      className="facebook-mockup-card w-full max-w-[560px] mx-auto bg-white dark:bg-[#242526] border border-[#CED0D4] dark:border-[#3E4042] rounded-[12px] shadow-sm overflow-hidden transition-all duration-200"
      style={{
        fontFamily:
          'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
      }}
    >
      {/* ── En-tête Facebook ── */}
      <div className="p-3.5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <UserAvatar avatarUrl={userAvatar} size={40} fallbackColor="#65676B" />
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-[#050505] dark:text-[#E4E6EB] leading-tight hover:underline cursor-pointer">
              {userName || 'Ange-Marie DAHOU'}
            </span>
            <div className="flex items-center gap-1 text-[13px] text-[#65676B] dark:text-[#B0B3B8] mt-0.5">
              <span>1 h</span>
              <span>·</span>
              <Globe size={13} className="text-[#65676B] dark:text-[#B0B3B8]" />
            </div>
          </div>
        </div>

        <button
          type="button"
          className="text-[#65676B] dark:text-[#B0B3B8] p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* ── Corps du Post Facebook (WYSIWYG) ── */}
      <div className="px-3.5 py-2">
        {readOnly ? (
          <p className="text-[15px] text-[#050505] dark:text-[#E4E6EB] leading-normal whitespace-pre-wrap break-words">
            {content}
          </p>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Qu'avez-vous en tête ?"
            rows={2}
            className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-[15px] text-[#050505] dark:text-[#E4E6EB] leading-normal placeholder-[#65676B] resize-none overflow-hidden"
          />
        )}
      </div>

      {/* ── Média Image Facebook ── */}
      {imageLoading ? (
        <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-y border-[#CED0D4] dark:border-[#3E4042]">
          <div className="w-6 h-6 border-2 border-[#1877F2]/20 border-t-[#1877F2] rounded-full animate-spin" />
        </div>
      ) : imageUrl ? (
        <div className="relative group/media w-full bg-black/5 dark:bg-black/30 border-y border-[#CED0D4] dark:border-[#3E4042]">
          <img
            src={imageUrl}
            alt="Facebook media"
            className="w-full max-h-[420px] object-cover block"
          />

          {!readOnly && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/media:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm p-1 rounded-lg">
              {onOpenImagePicker && (
                <button
                  type="button"
                  onClick={onOpenImagePicker}
                  className="px-2 py-1 text-xs text-white hover:bg-white/20 rounded flex items-center gap-1"
                >
                  <ImageIcon size={13} />
                  <span>Changer</span>
                </button>
              )}
              {onGenerateAIImage && (
                <button
                  type="button"
                  onClick={onGenerateAIImage}
                  className="px-2 py-1 text-xs text-white hover:bg-white/20 rounded flex items-center gap-1"
                >
                  <Sparkles size={13} className="text-blue-300" />
                  <span>IA</span>
                </button>
              )}
              {onImageChange && (
                <button
                  type="button"
                  onClick={() => onImageChange(null)}
                  className="p-1 text-red-300 hover:text-red-100 hover:bg-red-500/30 rounded"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* ── Compteurs de réactions Meta (Pouce + Coeur) ── */}
      <div className="px-3.5 py-2 flex items-center justify-between text-[13px] text-[#65676B] dark:text-[#B0B3B8] border-b border-[#CED0D4] dark:border-[#3E4042]">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center -space-x-1">
            <span className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center text-white ring-1 ring-white">
              <ThumbsUp size={9} className="fill-white" />
            </span>
            <span className="w-4 h-4 rounded-full bg-[#FA383E] flex items-center justify-center text-white ring-1 ring-white">
              ❤️
            </span>
          </div>
          <span>{liked ? '43' : '42'}</span>
        </div>

        <div className="flex items-center gap-3">
          <span>8 commentaires</span>
          <span>3 partages</span>
        </div>
      </div>

      {/* ── Barre d'actions Facebook ── */}
      <div className="p-1 grid grid-cols-3 gap-1 text-[14px] font-semibold">
        <button
          type="button"
          onClick={() => setLiked(!liked)}
          className={`flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${
            liked
              ? 'text-[#1877F2]'
              : 'text-[#65676B] dark:text-[#B0B3B8] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <ThumbsUp size={18} className={liked ? 'fill-[#1877F2]' : ''} />
          <span>J’aime</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 py-2 rounded-md text-[#65676B] dark:text-[#B0B3B8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <MessageCircle size={18} />
          <span>Commenter</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 py-2 rounded-md text-[#65676B] dark:text-[#B0B3B8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <Share2 size={18} />
          <span>Partager</span>
        </button>
      </div>
    </div>
  )
}

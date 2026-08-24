'use client'

import { useState, useRef, useEffect } from 'react'
import {
  MessageCircle,
  Repeat2,
  Heart,
  Bookmark,
  Share,
  MoreHorizontal,
  Sparkles,
  ImageIcon,
  Trash2,
  BadgeCheck,
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'

interface TwitterMockupProps {
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

export function TwitterMockup({
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
}: TwitterMockupProps) {
  const [liked, setLiked] = useState(false)
  const [retweeted, setRetweeted] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  const maxChars = 280
  const charCount = content.length
  const isOverLimit = charCount > maxChars
  const progressPct = Math.min(100, (charCount / maxChars) * 100)

  return (
    <div
      className="twitter-mockup-card w-full max-w-[560px] mx-auto bg-white dark:bg-black border border-[#E1E8ED] dark:border-[#2F3336] rounded-[12px] shadow-sm overflow-hidden p-4 transition-all duration-200"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div className="flex items-start gap-3">
        <UserAvatar avatarUrl={userAvatar} size={42} fallbackColor="#71767B" />

        <div className="flex-1 min-w-0">
          {/* Header utilisateur */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span className="font-bold text-[15px] text-[#0F1419] dark:text-[#E7E9EA] truncate">
                {userName || 'Ange-Marie DAHOU'}
              </span>
              <BadgeCheck size={16} className="text-[#1D9BF0] fill-[#1D9BF0]" />
              <span className="text-[14px] text-[#536471] dark:text-[#71767B] truncate">
                @{userHandle?.replace('@', '') || 'ange_dahou'}
              </span>
              <span className="text-[14px] text-[#536471] dark:text-[#71767B]">· 1h</span>
            </div>

            <button
              type="button"
              className="text-[#536471] dark:text-[#71767B] hover:text-[#1D9BF0] p-1 rounded-full hover:bg-[#1D9BF0]/10 transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Corps du Tweet (WYSIWYG) */}
          <div className="mt-1 mb-2.5">
            {readOnly ? (
              <p className="text-[15px] text-[#0F1419] dark:text-[#E7E9EA] leading-[1.35] whitespace-pre-wrap break-words">
                {content}
              </p>
            ) : (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                placeholder="Quoi de neuf ?!"
                rows={2}
                className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-[15px] text-[#0F1419] dark:text-[#E7E9EA] leading-[1.35] placeholder-[#71767B] resize-none overflow-hidden"
              />
            )}
          </div>

          {/* Média / Image */}
          {imageLoading ? (
            <div className="w-full aspect-video bg-slate-100 dark:bg-slate-900 rounded-[12px] flex items-center justify-center border border-slate-200 dark:border-slate-800 my-2">
              <div className="w-6 h-6 border-2 border-[#1D9BF0]/20 border-t-[#1D9BF0] rounded-full animate-spin" />
            </div>
          ) : imageUrl ? (
            <div className="relative group/media w-full rounded-[12px] overflow-hidden border border-[#CFD9DE] dark:border-[#2F3336] my-2 bg-black/5">
              <img
                src={imageUrl}
                alt="Tweet media"
                className="w-full max-h-[360px] object-cover block"
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
                      <span>Remplacer</span>
                    </button>
                  )}
                  {onGenerateAIImage && (
                    <button
                      type="button"
                      onClick={onGenerateAIImage}
                      className="px-2 py-1 text-xs text-white hover:bg-white/20 rounded flex items-center gap-1"
                    >
                      <Sparkles size={13} className="text-amber-300" />
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

          {/* Barre d'interactions X/Twitter */}
          <div className="flex items-center justify-between text-[#536471] dark:text-[#71767B] text-[13px] pt-2 border-t border-[#EFF3F4] dark:border-[#2F3336] mt-1 max-w-[420px]">
            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition-colors group"
            >
              <span className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10">
                <MessageCircle size={17} />
              </span>
              <span>18</span>
            </button>

            <button
              type="button"
              onClick={() => setRetweeted(!retweeted)}
              className={`flex items-center gap-1.5 transition-colors group ${
                retweeted ? 'text-[#00BA7C]' : 'hover:text-[#00BA7C]'
              }`}
            >
              <span className="p-1.5 rounded-full group-hover:bg-[#00BA7C]/10">
                <Repeat2 size={17} />
              </span>
              <span>{retweeted ? '6' : '5'}</span>
            </button>

            <button
              type="button"
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1.5 transition-colors group ${
                liked ? 'text-[#F91880]' : 'hover:text-[#F91880]'
              }`}
            >
              <span className="p-1.5 rounded-full group-hover:bg-[#F91880]/10">
                <Heart size={17} className={liked ? 'fill-[#F91880]' : ''} />
              </span>
              <span>{liked ? '89' : '88'}</span>
            </button>

            <button
              type="button"
              onClick={() => setBookmarked(!bookmarked)}
              className={`flex items-center gap-1.5 transition-colors group ${
                bookmarked ? 'text-[#1D9BF0]' : 'hover:text-[#1D9BF0]'
              }`}
            >
              <span className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10">
                <Bookmark size={17} className={bookmarked ? 'fill-[#1D9BF0]' : ''} />
              </span>
            </button>

            {/* Jauge circulaire 280 caractères X */}
            <div className="flex items-center gap-1.5 pl-2">
              <svg className="w-5 h-5 -rotate-90">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-200 dark:text-slate-700"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke={isOverLimit ? '#EF4444' : '#1D9BF0'}
                  strokeWidth="2"
                  strokeDasharray={50.2}
                  strokeDashoffset={50.2 - (50.2 * progressPct) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-150"
                />
              </svg>
              {isOverLimit && (
                <span className="text-[11px] font-bold text-red-500 font-mono">
                  {charCount - maxChars}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Sparkles,
  ImageIcon,
  Trash2,
  Smile,
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'

interface InstagramMockupProps {
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

export function InstagramMockup({
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
}: InstagramMockupProps) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  const handle = userHandle?.replace('@', '') || 'ange_dahou'
  const isLong = content.length > 125
  const shouldTruncate = isLong && !isExpanded && readOnly

  return (
    <div
      className="instagram-mockup-card w-full max-w-[480px] mx-auto bg-white dark:bg-black border border-[#DBDBDB] dark:border-[#262626] rounded-[12px] shadow-sm overflow-hidden transition-all duration-200"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* ── En-tête Instagram (Story Ring + Username) ── */}
      <div className="p-3 flex items-center justify-between border-b border-[#EFEFEF] dark:border-[#262626]">
        <div className="flex items-center gap-2.5">
          {/* Story Ring Instagram Gradient */}
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#FCAF45] via-[#FF543E] to-[#C13584] shadow-xs">
            <div className="p-[1.5px] bg-white dark:bg-black rounded-full">
              <UserAvatar avatarUrl={userAvatar} size={32} fallbackColor="#8E8E8E" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-semibold text-[#262626] dark:text-[#F5F5F5] hover:opacity-75 cursor-pointer">
                {handle}
              </span>
              <span className="text-[12px] text-[#8E8E8E]">· 2 h</span>
            </div>
            <span className="text-[11px] text-[#8E8E8E]">Audio d&apos;origine</span>
          </div>
        </div>

        <button
          type="button"
          className="text-[#262626] dark:text-[#F5F5F5] p-1 rounded-full hover:opacity-70 transition-opacity"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* ── Média Carré / Portrait (Instagram Photo) ── */}
      <div className="relative aspect-square w-full bg-[#FAFAFA] dark:bg-[#121212] flex items-center justify-center overflow-hidden border-b border-[#EFEFEF] dark:border-[#262626] group/media">
        {imageLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Génération Instagram IA...</span>
          </div>
        ) : imageUrl ? (
          <>
            <img src={imageUrl} alt="Instagram Post" className="w-full h-full object-cover block" />

            {!readOnly && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover/media:opacity-100 transition-opacity bg-black/75 backdrop-blur-sm p-1.5 rounded-lg">
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
                    <Sparkles size={13} className="text-pink-300" />
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
              <ImageIcon size={28} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
              Instagram nécessite une image ou vidéo
            </p>
            <div className="flex items-center gap-2">
              {onGenerateAIImage && (
                <button
                  type="button"
                  onClick={onGenerateAIImage}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FCAF45] via-[#FF543E] to-[#C13584] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>Générer avec l&apos;IA</span>
                </button>
              )}
              {onOpenImagePicker && (
                <button
                  type="button"
                  onClick={onOpenImagePicker}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Importer
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Barre d'icônes Instagram (Coeur, Commentaire, Avion, Signet) ── */}
      <div className="p-3 pb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[#262626] dark:text-[#F5F5F5]">
          <button
            type="button"
            onClick={() => setLiked(!liked)}
            className="hover:opacity-60 transition-transform active:scale-125"
          >
            <Heart size={24} className={liked ? 'fill-[#FF3040] text-[#FF3040]' : ''} />
          </button>
          <button type="button" className="hover:opacity-60 transition-opacity">
            <MessageCircle size={24} />
          </button>
          <button type="button" className="hover:opacity-60 transition-opacity">
            <Send size={24} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setSaved(!saved)}
          className="text-[#262626] dark:text-[#F5F5F5] hover:opacity-60 transition-opacity"
        >
          <Bookmark size={24} className={saved ? 'fill-current' : ''} />
        </button>
      </div>

      {/* ── Nombre de J'aime ── */}
      <div className="px-3 text-[13px] font-semibold text-[#262626] dark:text-[#F5F5F5] mb-1.5">
        {liked ? '149 J’aime' : '148 J’aime'}
      </div>

      {/* ── Légende Instagram WYSIWYG ── */}
      <div className="px-3 pb-2 text-[13px] text-[#262626] dark:text-[#F5F5F5] leading-relaxed">
        {readOnly ? (
          <div>
            <span className="font-semibold mr-1.5">{handle}</span>
            <span className="whitespace-pre-wrap break-words">
              {shouldTruncate ? (
                <>
                  {content.slice(0, 110)}...
                  <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="text-[#8E8E8E] ml-1 font-normal hover:underline"
                  >
                    plus
                  </button>
                </>
              ) : (
                content
              )}
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-1.5">
            <span className="font-semibold text-[13px] text-[#262626] dark:text-[#F5F5F5] select-none pt-[1px]">
              {handle}
            </span>
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                placeholder="Écrivez une légende..."
                rows={2}
                className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-[13px] text-[#262626] dark:text-[#F5F5F5] leading-relaxed resize-none overflow-hidden placeholder-[#8E8E8E]"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Commentaires & Date ── */}
      <div className="px-3 pb-3 text-[11px] text-[#8E8E8E] flex flex-col gap-1">
        <span className="cursor-pointer hover:text-slate-600">Afficher les 12 commentaires</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
          Il y a 2 heures
        </span>
      </div>
    </div>
  )
}

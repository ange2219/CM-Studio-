'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  MoreHorizontal,
  Globe,
  Sparkles,
  ImageIcon,
  Trash2,
  BarChart2,
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'

interface LinkedInMockupProps {
  content: string
  imageUrl: string | null
  imageLoading?: boolean
  userName?: string | null
  userAvatar?: string | null
  userHeadline?: string | null
  onContentChange: (newContent: string) => void
  onImageChange?: (url: string | null) => void
  onOpenImagePicker?: () => void
  onGenerateAIImage?: () => void
  isPro?: boolean
  readOnly?: boolean
}

// Couleurs et styles fidèles à LinkedIn
export function LinkedInMockup({
  content,
  imageUrl,
  imageLoading,
  userName = 'Ange-Marie DAHOU',
  userAvatar,
  userHeadline = 'Futur Data Scientist | En formation continue en Machine Learning',
  onContentChange,
  onImageChange,
  onOpenImagePicker,
  onGenerateAIImage,
  isPro = true,
  readOnly = false,
}: LinkedInMockupProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditingHeadline, setIsEditingHeadline] = useState(false)
  const [headline, setHeadline] = useState(userHeadline || 'Créateur de contenu & Entrepreneur')
  const [liked, setLiked] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Ajustement automatique de la hauteur du textarea pour l'effet WYSIWYG
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  const displayName = userName || 'Ange-Marie DAHOU'

  // Calcul du "Hook" (les 3 premières lignes ou ~140 caractères avant "... plus")
  const lines = content.split('\n')
  const isLong = content.length > 180 || lines.length > 3
  const shouldTruncate = isLong && !isExpanded && readOnly

  return (
    <div
      className="linkedin-mockup-card w-full max-w-[560px] mx-auto bg-white dark:bg-[#1B1F23] border border-[#E0E0E0] dark:border-[#2D3239] rounded-[12px] shadow-sm overflow-hidden transition-all duration-200"
      style={{
        fontFamily:
          "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Fira Sans', Ubuntu, Oxygen, 'Oxygen Sans', Cantarell, 'Droid Sans', 'Lucida Grande', Helvetica, Arial, sans-serif",
      }}
    >
      {/* ── En-tête LinkedIn ── */}
      <div className="p-3.5 pb-2 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="relative">
            <UserAvatar
              avatarUrl={userAvatar}
              size={48}
              className="ring-1 ring-black/5 dark:ring-white/10"
              fallbackColor="#666"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[14px] font-semibold text-[#191919] dark:text-[#F3F3F3] hover:text-[#0A66C2] dark:hover:text-[#70B5F9] cursor-pointer transition-colors leading-tight">
                {displayName}
              </span>
              <span className="text-[12px] text-[#666666] dark:text-[#999999] font-normal">
                • Vous
              </span>
            </div>

            {/* Headline / Sous-titre pro */}
            {isEditingHeadline ? (
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                onBlur={() => setIsEditingHeadline(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingHeadline(false)}
                autoFocus
                className="text-[12px] text-[#666666] dark:text-[#999999] bg-transparent border-b border-[#0A66C2] outline-none w-full py-0.5"
              />
            ) : (
              <p
                onClick={() => !readOnly && setIsEditingHeadline(true)}
                title={!readOnly ? 'Cliquer pour modifier votre titre' : undefined}
                className={`text-[12px] text-[#666666] dark:text-[#999999] truncate leading-tight mt-0.5 ${
                  !readOnly ? 'cursor-pointer hover:text-[#0A66C2]' : ''
                }`}
              >
                {headline}
              </p>
            )}

            {/* Date & Icône Monde */}
            <div className="flex items-center gap-1 text-[12px] text-[#666666] dark:text-[#999999] mt-0.5">
              <span>1 h</span>
              <span>•</span>
              <span title="Visible par tous (Public)">
                <Globe size={13} className="text-[#666666] dark:text-[#999999]" />
              </span>
            </div>
          </div>
        </div>

        {/* Actions d'en-tête (3 points) */}
        <div className="flex items-center gap-1 text-[#666666] dark:text-[#999999]">
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Options du post"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* ── Corps du Post (Texte WYSIWYG éditable en direct) ── */}
      <div className="px-3.5 py-2">
        {readOnly ? (
          <div className="text-[14px] text-[#191919] dark:text-[#E8E8E8] leading-[1.45] whitespace-pre-wrap break-words">
            {shouldTruncate ? (
              <>
                {content.slice(0, 160)}...
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="text-[#666666] dark:text-[#999999] hover:text-[#0A66C2] font-medium ml-1 cursor-pointer transition-colors"
                >
                  ... plus
                </button>
              </>
            ) : (
              content
            )}
          </div>
        ) : (
          <div className="relative group">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="De quoi souhaitez-vous discuter ?"
              rows={3}
              className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-[14px] text-[#191919] dark:text-[#E8E8E8] leading-[1.45] placeholder-[#888888] resize-none overflow-hidden font-normal"
              style={{ minHeight: '80px' }}
            />

            {/* Indicateur d'optimisation Hook LinkedIn */}
            {content.length > 210 && (
              <div className="mt-1 pt-1.5 border-t border-dashed border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] text-[#0A66C2] dark:text-[#70B5F9]">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>Coupure « ... plus » visible sur le feed</span>
                </span>
                <span className="text-[#888] font-mono">{content.length} car.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Image ou Média ── */}
      {imageLoading ? (
        <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-2 border-y border-[#E0E0E0] dark:border-[#2D3239]">
          <div className="w-7 h-7 border-2 border-[#0A66C2]/20 border-t-[#0A66C2] rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Génération de l&apos;image IA...</span>
        </div>
      ) : imageUrl ? (
        <div className="relative group/media w-full bg-black/5 dark:bg-black/40 border-y border-[#E0E0E0] dark:border-[#2D3239] overflow-hidden">
          <img
            src={imageUrl}
            alt="Visuel du post"
            className="w-full h-auto max-h-[460px] object-contain mx-auto block"
          />

          {/* Outils d'image en survol */}
          {!readOnly && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/media:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm p-1 rounded-lg">
              {onOpenImagePicker && (
                <button
                  type="button"
                  onClick={onOpenImagePicker}
                  className="px-2 py-1 text-xs text-white hover:bg-white/20 rounded flex items-center gap-1 transition-colors"
                  title="Changer l'image"
                >
                  <ImageIcon size={13} />
                  <span>Remplacer</span>
                </button>
              )}
              {onGenerateAIImage && (
                <button
                  type="button"
                  onClick={onGenerateAIImage}
                  className="px-2 py-1 text-xs text-white hover:bg-white/20 rounded flex items-center gap-1 transition-colors"
                  title="Régénérer avec l'IA"
                >
                  <Sparkles size={13} className="text-amber-300" />
                  <span>IA</span>
                </button>
              )}
              {onImageChange && (
                <button
                  type="button"
                  onClick={() => onImageChange(null)}
                  className="p-1 text-red-300 hover:text-red-100 hover:bg-red-500/30 rounded transition-colors"
                  title="Supprimer l'image"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* ── Compteurs de réactions (Likes & Commentaires) ── */}
      <div className="px-3.5 py-2 flex items-center justify-between text-[12px] text-[#666666] dark:text-[#999999] border-b border-[#E0E0E0] dark:border-[#2D3239]">
        <div className="flex items-center gap-1.5">
          {/* Badges réactions superposés (Pouce bleu, Ampoule jaune, Coeur rouge) */}
          <div className="flex items-center -space-x-1">
            <span
              className="w-[18px] h-[18px] rounded-full bg-[#0A66C2] flex items-center justify-center text-white ring-1 ring-white dark:ring-[#1B1F23] shadow-xs"
              title="J'aime"
            >
              <ThumbsUp size={10} className="fill-white" />
            </span>
            <span
              className="w-[18px] h-[18px] rounded-full bg-[#E7A33E] flex items-center justify-center text-white ring-1 ring-white dark:ring-[#1B1F23] shadow-xs"
              title="Bravo"
            >
              <Sparkles size={10} className="fill-white" />
            </span>
            <span
              className="w-[18px] h-[18px] rounded-full bg-[#DF704D] flex items-center justify-center text-white ring-1 ring-white dark:ring-[#1B1F23] shadow-xs"
              title="Soutien"
            >
              ❤️
            </span>
          </div>
          <span className="hover:text-[#0A66C2] hover:underline cursor-pointer ml-0.5">
            {liked ? '24' : '23'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hover:text-[#0A66C2] hover:underline cursor-pointer">
            7 commentaires
          </span>
          <span>•</span>
          <span className="hover:text-[#0A66C2] hover:underline cursor-pointer">
            2 republications
          </span>
        </div>
      </div>

      {/* ── Barre d'actions LinkedIn (J'aime, Commenter, Republier, Envoyer) ── */}
      <div className="px-1 py-0.5 grid grid-cols-4 gap-1">
        <button
          type="button"
          onClick={() => setLiked(!liked)}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-[8px] text-[13px] font-semibold transition-colors ${
            liked
              ? 'text-[#0A66C2] bg-[#0A66C2]/10'
              : 'text-[#666666] dark:text-[#B0B0B0] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <ThumbsUp size={16} className={liked ? 'fill-[#0A66C2]' : ''} />
          <span className="hidden sm:inline">J&apos;aime</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-[8px] text-[13px] font-semibold text-[#666666] dark:text-[#B0B0B0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <MessageSquare size={16} />
          <span className="hidden sm:inline">Commenter</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-[8px] text-[13px] font-semibold text-[#666666] dark:text-[#B0B0B0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <Repeat2 size={16} />
          <span className="hidden sm:inline">Republier</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-[8px] text-[13px] font-semibold text-[#666666] dark:text-[#B0B0B0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <Send size={16} />
          <span className="hidden sm:inline">Envoyer</span>
        </button>
      </div>

      {/* ── Barre Analytique basse (Simulateur LinkedIn) ── */}
      <div className="px-3.5 py-2 bg-slate-50/80 dark:bg-black/20 border-t border-[#E0E0E0] dark:border-[#2D3239] flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-1.5 text-[#666666] dark:text-[#999999]">
          <BarChart2 size={15} className="text-slate-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">5 641</span>
          <span>impressions</span>
        </div>
        <span className="text-[#0A66C2] dark:text-[#70B5F9] font-semibold hover:underline cursor-pointer">
          Voir les statistiques
        </span>
      </div>
    </div>
  )
}

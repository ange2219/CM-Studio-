'use client'

import React, { useState, useRef } from 'react'
import {
  Platform,
  PostObjective,
  PLATFORM_NAMES,
  PLATFORM_COLORS,
} from '@/types'
import {
  IconInstagram,
  IconFacebook,
  IconTikTok,
  IconTwitterX,
  IconLinkedIn,
  IconYouTube,
  IconPinterest,
} from '@/components/icons/BrandIcons'
import {
  Sparkles,
  Hash,
  ImageIcon,
  Clock,
  Send,
  Save,
  RotateCcw,
  Smartphone,
  Monitor,
  Eye,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Upload,
} from 'lucide-react'
import { SocialMockupRenderer } from './mockups/SocialMockupRenderer'
import { SchedulerSheet } from './SchedulerSheet'
import { useToast } from '@/components/ui/Toast'

export interface CardState {
  content: string
  imageUrl: string | null
  imageLoading: boolean
  scheduledAt: string | null
}

export interface SocialAccount {
  platform: Platform
  platform_username: string | null
  platform_avatar_url: string | null
}

export interface StudioPostEditorProps {
  platforms: Platform[]
  variants: Partial<Record<Platform, string>>
  objective: PostObjective | null
  isPro?: boolean
  userName?: string | null
  socialAccounts?: SocialAccount[]
  initialImages?: Partial<Record<Platform, string>>
  initialScheduledAt?: string
  unifiedMode?: boolean
  onSaveDraft: (platform: Platform, content: string, imageUrl: string | null) => Promise<void>
  onPublish: (platform: Platform, content: string, imageUrl: string | null) => Promise<void>
  onSchedule: (
    platform: Platform,
    content: string,
    imageUrl: string | null,
    scheduledAt: string
  ) => Promise<void>
  onClose?: () => void
}

function PlatformIcon({ platform, size = 16 }: { platform: Platform; size?: number }) {
  switch (platform) {
    case 'instagram':
      return <IconInstagram size={size} />
    case 'facebook':
      return <IconFacebook size={size} />
    case 'tiktok':
      return <IconTikTok size={size} />
    case 'twitter':
      return <IconTwitterX size={size} />
    case 'linkedin':
      return <IconLinkedIn size={size} />
    case 'youtube':
      return <IconYouTube size={size} />
    case 'pinterest':
      return <IconPinterest size={size} />
    default:
      return null
  }
}

function formatScheduled(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) +
    ' à ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )
}

const CHAR_LIMITS: Partial<Record<Platform, number>> = {
  twitter: 280,
  instagram: 2200,
  facebook: 2000,
  linkedin: 3000,
  tiktok: 300,
}

export function StudioPostEditor({
  platforms,
  variants,
  objective: _objective,
  isPro = true,
  userName = 'Ange-Marie DAHOU',
  socialAccounts = [],
  initialImages,
  initialScheduledAt,
  unifiedMode = false,
  onSaveDraft,
  onPublish,
  onSchedule,
  onClose: _onClose,
}: StudioPostEditorProps) {
  const { toast } = useToast()
  const [activePlatform, setActivePlatform] = useState<Platform>(platforms[0] || 'linkedin')
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop')
  const [previewOnly, setPreviewOnly] = useState(false)
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // État local de chaque carte par plateforme
  const [cards, setCards] = useState<Record<string, CardState>>(() => {
    const init: Record<string, CardState> = {}
    for (const p of platforms) {
      init[p] = {
        content: variants[p] || '',
        imageUrl: initialImages?.[p] || null,
        imageLoading: false,
        scheduledAt: initialScheduledAt || null,
      }
    }
    return init
  })

  const currentCard = cards[activePlatform] || {
    content: variants[activePlatform] || '',
    imageUrl: initialImages?.[activePlatform] || null,
    imageLoading: false,
    scheduledAt: null,
  }

  function updateActiveCard(partial: Partial<CardState>) {
    setCards((prev) => ({
      ...prev,
      [activePlatform]: {
        ...prev[activePlatform],
        ...partial,
      },
    }))
  }

  // Informations de compte pour la plateforme active
  const currentAccount = socialAccounts.find((a) => a.platform === activePlatform)
  const displayName = currentAccount?.platform_username || userName || 'Ange-Marie DAHOU'
  const displayAvatar = currentAccount?.platform_avatar_url || null

  // Limite de caractères
  const charLimit = CHAR_LIMITS[activePlatform]
  const isOverLimit = charLimit ? currentCard.content.length > charLimit : false

  // ── Outils IA ──
  async function handleAIGenerateImage() {
    if (currentCard.imageLoading) return
    updateActiveCard({ imageLoading: true })
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postContent: currentCard.content.slice(0, 300),
          platform: activePlatform,
        }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        updateActiveCard({ imageUrl: data.url })
        toast('Image IA générée avec succès !', 'success')
      } else {
        toast(data.error || 'Erreur lors de la génération d’image', 'error')
      }
    } catch {
      toast('Erreur lors de la génération d’image', 'error')
    } finally {
      updateActiveCard({ imageLoading: false })
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    updateActiveCard({ imageLoading: true })
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.url) {
        updateActiveCard({ imageUrl: data.url })
        toast('Image importée !', 'success')
      } else {
        toast(data.error || 'Erreur upload', 'error')
      }
    } catch {
      toast('Erreur upload image', 'error')
    } finally {
      updateActiveCard({ imageLoading: false })
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRewrite() {
    if (loadingAction) return
    setLoadingAction('rewrite')
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentCard.content,
          platform: activePlatform,
          instruction: 'Rends le hook plus percutant et améliore l’engagement',
        }),
      })
      const data = await res.json()
      if (res.ok && data.content) {
        updateActiveCard({ content: data.content })
        toast('Post optimisé par l’IA !', 'success')
      } else {
        toast(data.error || 'Erreur réécriture', 'error')
      }
    } catch {
      toast('Erreur réécriture IA', 'error')
    } finally {
      setLoadingAction(null)
    }
  }

  async function handleHashtags() {
    if (loadingAction) return
    setLoadingAction('hashtags')
    try {
      const res = await fetch('/api/ai/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentCard.content,
          platform: activePlatform,
        }),
      })
      const data = await res.json()
      if (res.ok && data.hashtags) {
        const tags = (data.hashtags as string[])
          .map((h) => (h.startsWith('#') ? h.toLowerCase() : '#' + h.toLowerCase()))
          .join(' ')
        updateActiveCard({
          content: currentCard.content.trimEnd() + '\n\n' + tags,
        })
        toast('Hashtags IA ajoutés !', 'success')
      } else {
        toast(data.error || 'Erreur hashtags', 'error')
      }
    } catch {
      toast('Erreur hashtags IA', 'error')
    } finally {
      setLoadingAction(null)
    }
  }

  // ── Actions de publication ──
  async function handleSaveDraftClick() {
    setLoadingAction('draft')
    try {
      await onSaveDraft(activePlatform, currentCard.content, currentCard.imageUrl)
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur brouillon', 'error')
    } finally {
      setLoadingAction(null)
    }
  }

  async function handlePublishClick() {
    setLoadingAction('publish')
    try {
      await onPublish(activePlatform, currentCard.content, currentCard.imageUrl)
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur publication', 'error')
    } finally {
      setLoadingAction(null)
    }
  }

  async function handleScheduleSubmit(scheduledAt: string) {
    setIsSchedulerOpen(false)
    updateActiveCard({ scheduledAt })
    setLoadingAction('schedule')
    try {
      await onSchedule(activePlatform, currentCard.content, currentCard.imageUrl, scheduledAt)
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Erreur programmation', 'error')
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* ── BARRE SUPÉRIEURE DU STUDIO (Sélecteur de réseaux + Outils) ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[14px] p-2.5 sm:p-3 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Sélecteur de plateformes (Onglets interactifs) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {platforms.map((p) => {
            const isActive = activePlatform === p
            const color = PLATFORM_COLORS[p] || '#1677FF'
            return (
              <button
                key={p}
                type="button"
                onClick={() => setActivePlatform(p)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs ring-1 ring-black/10'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ color: isActive ? (deviceView === 'desktop' ? '#fff' : color) : color }}
                >
                  <PlatformIcon platform={p} size={14} />
                </div>
                <span>{PLATFORM_NAMES[p]}</span>
              </button>
            )
          })}
        </div>

        {/* Outils & Commandes Studio */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
          {/* Bascule Vue Bureau vs Mobile */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-[8px] border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setDeviceView('desktop')}
              className={`p-1.5 rounded-[6px] transition-colors ${
                deviceView === 'desktop'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Aperçu Bureau"
            >
              <Monitor size={15} />
            </button>
            <button
              type="button"
              onClick={() => setDeviceView('mobile')}
              className={`p-1.5 rounded-[6px] transition-colors ${
                deviceView === 'mobile'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Aperçu Mobile"
            >
              <Smartphone size={15} />
            </button>
          </div>

          {/* Bascule Mode Édition / Aperçu */}
          <button
            type="button"
            onClick={() => setPreviewOnly(!previewOnly)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-semibold border transition-colors ${
              previewOnly
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {previewOnly ? <Eye size={13} /> : <Edit3 size={13} />}
            <span className="hidden sm:inline">
              {previewOnly ? 'Mode Aperçu' : 'Édition No-Code'}
            </span>
          </button>
        </div>
      </div>

      {/* ── BARRE D'OUTILS IA FLOTTANTE / CONTEXTUELLE ── */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-[12px] p-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleRewrite}
            disabled={loadingAction === 'rewrite'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50"
          >
            {loadingAction === 'rewrite' ? (
              <div className="w-3.5 h-3.5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            ) : (
              <Sparkles size={13} className="text-blue-500" />
            )}
            <span>Améliorer le Hook</span>
          </button>

          <button
            type="button"
            onClick={handleHashtags}
            disabled={loadingAction === 'hashtags'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500 hover:text-cyan-600 transition-colors disabled:opacity-50"
          >
            {loadingAction === 'hashtags' ? (
              <div className="w-3.5 h-3.5 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            ) : (
              <Hash size={13} className="text-cyan-500" />
            )}
            <span>Hashtags IA</span>
          </button>

          <button
            type="button"
            onClick={handleAIGenerateImage}
            disabled={currentCard.imageLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-purple-500 hover:text-purple-600 transition-colors disabled:opacity-50"
          >
            {currentCard.imageLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            ) : (
              <ImageIcon size={13} className="text-purple-500" />
            )}
            <span>Image IA</span>
          </button>

          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-400 cursor-pointer transition-colors">
            <Upload size={13} className="text-slate-500" />
            <span>Importer</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Compteur de caractères précis */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>
            {currentCard.content.length}
            {charLimit ? ` / ${charLimit}` : ' caractères'}
          </span>
          {isOverLimit && (
            <span className="flex items-center gap-1 text-red-500 font-semibold text-xs">
              <AlertTriangle size={12} />
              <span>Trop long</span>
            </span>
          )}
        </div>
      </div>

      {/* ── ZONE CENTRALE DU STUDIO : RENDU DU MOCKUP RÉALISTE ── */}
      <div
        className={`w-full py-6 px-3 sm:px-6 rounded-[14px] bg-slate-100/90 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center min-h-[480px] transition-all relative overflow-hidden`}
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(100, 116, 139, 0.12) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Conteneur adapté selon Desktop ou Mobile Frame */}
        <div
          className={`transition-all duration-300 w-full ${
            deviceView === 'mobile'
              ? 'max-w-[380px] border-[6px] border-slate-800 rounded-[28px] p-2 bg-slate-900 shadow-2xl'
              : 'max-w-[580px]'
          }`}
        >
          {deviceView === 'mobile' && (
            <div className="w-16 h-3 bg-slate-700 rounded-full mx-auto mb-2" />
          )}

          <SocialMockupRenderer
            platform={activePlatform}
            content={currentCard.content}
            imageUrl={currentCard.imageUrl}
            imageLoading={currentCard.imageLoading}
            userName={displayName}
            userAvatar={displayAvatar}
            onContentChange={(newContent) => updateActiveCard({ content: newContent })}
            onImageChange={(url) => updateActiveCard({ imageUrl: url })}
            onOpenImagePicker={() => fileInputRef.current?.click()}
            onGenerateAIImage={handleAIGenerateImage}
            isPro={isPro}
            readOnly={previewOnly}
          />
        </div>
      </div>

      {/* ── BARRE BASSE D'ACTIONS DE PUBLICATION ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[14px] p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Statut de programmation */}
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <CheckCircle2 size={15} className="text-emerald-500" />
          <span>
            {currentCard.scheduledAt ? (
              <>
                Programmé pour le{' '}
                <strong className="text-blue-600 dark:text-blue-400">
                  {formatScheduled(currentCard.scheduledAt)}
                </strong>
              </>
            ) : (
              'Prêt pour publication immédiate ou programmée'
            )}
          </span>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Enregistrer brouillon */}
          <button
            type="button"
            onClick={handleSaveDraftClick}
            disabled={loadingAction === 'draft'}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {loadingAction === 'draft' ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-400/30 border-t-slate-600 rounded-full animate-spin" />
            ) : (
              <Save size={14} />
            )}
            <span>Brouillon</span>
          </button>

          {/* Bouton Programmer */}
          <button
            type="button"
            onClick={() => setIsSchedulerOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-[10px] border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            <Clock size={14} />
            <span>{currentCard.scheduledAt ? 'Modifier date' : 'Programmer'}</span>
          </button>

          {/* Bouton Publier */}
          <button
            type="button"
            onClick={handlePublishClick}
            disabled={loadingAction === 'publish'}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-[10px] bg-[#1677FF] hover:bg-[#1266DF] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {loadingAction === 'publish' ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={14} />
            )}
            <span>Publier sur {PLATFORM_NAMES[activePlatform]}</span>
          </button>
        </div>
      </div>

      {/* Sheet de programmation date & heure */}
      {isSchedulerOpen && (
        <SchedulerSheet
          onConfirm={handleScheduleSubmit}
          onClose={() => setIsSchedulerOpen(false)}
          alreadyScheduled={!!currentCard.scheduledAt}
          onDeactivate={() => updateActiveCard({ scheduledAt: null })}
        />
      )}
    </div>
  )
}

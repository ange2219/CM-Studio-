'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  Target,
  Users,
  Compass,
  BarChart3,
  History,
  Save,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Copy,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText,
  Eye,
  RefreshCw,
  LayoutTemplate,
  LayoutGrid,
  List,
  Filter,
  Heart,
  MessageCircle,
  Repeat2,
  MoreHorizontal
} from 'lucide-react'
import { useTheme } from '@/components/context/ThemeContext'
import { useOrg } from '@/components/context/OrgContext'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import { LinkedInFeedCard } from '@/components/posts/mockups/LinkedInFeedCard'
import { InstagramFeedCard } from '@/components/posts/mockups/InstagramFeedCard'
import { FacebookFeedCard } from '@/components/posts/mockups/FacebookFeedCard'
import { TwitterFeedCard } from '@/components/posts/mockups/TwitterFeedCard'
import { formatPeriodLabel, getAdjacentPeriod } from '@/hooks/useStrategy'
import type { Strategy, StrategyStatus, StrategyKPI, EditorialLine, Platform } from '@/types'

const AVAILABLE_PLATFORMS: Platform[] = [
  'linkedin',
  'instagram',
  'twitter',
  'tiktok',
  'facebook',
  'youtube',
  'pinterest'
]

interface StrategyDetailModalProps {
  isOpen: boolean
  onClose: () => void
  strategy: Strategy | null
  selectedPeriod: string
  onSelectPeriod: (period: string) => void
  strategiesHistory: Strategy[]
  onSave: (payload: {
    period: string
    monthly_objective: string
    target_audience?: string | null
    editorial_line: EditorialLine
    kpis: StrategyKPI[]
    status: StrategyStatus
  }) => Promise<any>
  onDelete?: (id: string) => Promise<any>
  onDuplicate?: (targetPeriod: string, sourcePeriod?: string) => Promise<any>
  isOwnerOrCM: boolean
  saving: boolean
  initialTab?: TabType
}

type TabType = 'objectives' | 'editorial' | 'mockups' | 'kpis' | 'history'

export function StrategyDetailModal({
  isOpen,
  onClose,
  strategy,
  selectedPeriod,
  onSelectPeriod,
  strategiesHistory,
  onSave,
  onDelete,
  onDuplicate,
  isOwnerOrCM,
  saving,
  initialTab
}: StrategyDetailModalProps) {
  const { darkMode } = useTheme()
  const { activeOrganization } = useOrg()
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'objectives')

  // Brand data & Social accounts for real mockups
  const [brandData, setBrandData] = useState<{ brand_name: string; logo_url: string | null; industry: string | null } | null>(null)
  const [socialAccounts, setSocialAccounts] = useState<Array<{ platform: string; platform_username: string | null; platform_avatar_url: string | null }>>([])
  const [mockupFilter, setMockupFilter] = useState<'all' | 'linkedin' | 'instagram' | 'twitter' | 'facebook'>('all')
  const [mockupContents, setMockupContents] = useState<Record<string, string>>({})
  const [includeSampleImage, setIncludeSampleImage] = useState<Record<string, boolean>>({
    linkedin: true,
    instagram: true,
    twitter: false,
    facebook: true,
  })

  const router = useRouter()

  // Existing posts state for bottom section
  const [existingPosts, setExistingPosts] = useState<any[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [postStatusFilter, setPostStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled' | 'archived'>('all')
  const [postViewMode, setPostViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([])

  // Sync initialTab when modal opens or tab prop changes
  useEffect(() => {
    if (initialTab && isOpen) {
      setActiveTab(initialTab)
    }
  }, [initialTab, isOpen])

  // Fetch real brand and social accounts and existing posts when modal opens
  useEffect(() => {
    if (isOpen) {
      fetch('/api/brand')
        .then(r => r.json())
        .then(b => {
          if (b) {
            setBrandData({
              brand_name: b.brand_name || activeOrganization?.name || 'Ma Marque',
              logo_url: b.logo_url || activeOrganization?.avatar_url || null,
              industry: b.industry || null,
            })
          }
        })
        .catch(() => {})

      fetch('/api/social/accounts')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setSocialAccounts(data)
        })
        .catch(() => {})

      setPostsLoading(true)
      fetch('/api/posts?limit=50')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data?.posts)) setExistingPosts(data.posts)
        })
        .catch(() => {})
        .finally(() => setPostsLoading(false))
    }
  }, [isOpen, activeOrganization])

  // Form State
  const [period, setPeriod] = useState<string>(selectedPeriod)
  const [monthlyObjective, setMonthlyObjective] = useState<string>('')
  const [targetAudience, setTargetAudience] = useState<string>('')
  const [status, setStatus] = useState<StrategyStatus>('up_to_date')
  const [tone, setTone] = useState<string>('')
  const [pillars, setPillars] = useState<string[]>([])
  const [newPillarInput, setNewPillarInput] = useState<string>('')
  const [platformPriorities, setPlatformPriorities] = useState<EditorialLine['platform_priorities']>([])
  const [kpis, setKpis] = useState<StrategyKPI[]>([])

  // Dynamically sync sample copy for mockups based on strategy inputs
  useEffect(() => {
    const brandName = brandData?.brand_name || activeOrganization?.name || 'Notre Marque'
    const objText = monthlyObjective || 'Renforcer notre visibilité et créer du lien avec notre communauté'
    const firstPillar = pillars[0] || 'Conseils & Expertise'
    const secondPillar = pillars[1] || 'Coulisses & Nouveautés'

    setMockupContents(prev => ({
      linkedin: prev.linkedin || `🚀 [Focus du mois] ${objText}\n\nEn tant qu'acteurs engagés, nous croyons qu'une marque forte repose sur 3 piliers essentiels :\n1. ${firstPillar} : Apporter une valeur concrète et mesurable à chaque publication.\n2. ${secondPillar} : Partager nos apprentissages et coulisses en toute transparence.\n3. L'écoute continue des besoins de notre communauté.\n\nQuelle est votre plus grande priorité stratégique ce mois-ci ? Discutons-en en commentaire ! 👇\n\n#stratégie #croissance #b2b #${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,

      instagram: prev.instagram || `✨ Nouvelle étape pour ${brandName} !\n\nCe mois-ci, notre focus stratégique est clair : ${objText.toLowerCase()}.\n\nOn vous embarque dans les coulisses de notre méthode pour vous offrir le meilleur au quotidien 💡\n\n👉 Dites-nous en commentaire ce que vous aimeriez voir en priorité !\n\n📌 Enregistrez ce post pour vous en inspirer plus tard.\n\n#inspiration #strategiedemarque #coulisses #création #${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,

      twitter: prev.twitter || `Une stratégie de contenu réussie n'a pas besoin d'être compliquée.\n\nElle doit juste être alignée sur un objectif clair :\n🎯 ${objText.length > 85 ? objText.slice(0, 82) + '...' : objText}\n\nMoins de bruit, plus de valeur.\n\nPrêts pour cette nouvelle étape avec ${brandName} ? 🔥`,

      facebook: prev.facebook || `👋 Chère communauté ${brandName} !\n\nCe mois-ci, notre focus principal est : ${objText}.\n\nNotre mission reste la même : vous accompagner avec des contenus utiles, concrets et adaptés à vos besoins réels.\n\nPartagez vos retours et vos questions en commentaire, nous répondons à chacun d'entre vous ! 👇\n\n#communauté #actualités #${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    }))
  }, [monthlyObjective, tone, pillars, brandData, activeOrganization])

  const handleRegenerateSamples = () => {
    const brandName = brandData?.brand_name || activeOrganization?.name || 'Notre Marque'
    const objText = monthlyObjective || 'Renforcer notre visibilité et créer du lien avec notre communauté'
    const firstPillar = pillars[0] || 'Conseils & Expertise'
    const secondPillar = pillars[1] || 'Coulisses & Nouveautés'

    setMockupContents({
      linkedin: `🚀 [Focus du mois] ${objText}\n\nEn tant qu'acteurs engagés, nous croyons qu'une marque forte repose sur 3 piliers essentiels :\n1. ${firstPillar} : Apporter une valeur concrète et mesurable à chaque publication.\n2. ${secondPillar} : Partager nos apprentissages et coulisses en toute transparence.\n3. L'écoute continue des besoins de notre communauté.\n\nQuelle est votre plus grande priorité stratégique ce mois-ci ? Discutons-en en commentaire ! 👇\n\n#stratégie #croissance #b2b #${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,

      instagram: `✨ Nouvelle étape pour ${brandName} !\n\nCe mois-ci, notre focus stratégique est clair : ${objText.toLowerCase()}.\n\nOn vous embarque dans les coulisses de notre méthode pour vous offrir le meilleur au quotidien 💡\n\n👉 Dites-nous en commentaire ce que vous aimeriez voir en priorité !\n\n📌 Enregistrez ce post pour vous en inspirer plus tard.\n\n#inspiration #strategiedemarque #coulisses #création #${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,

      twitter: `Une stratégie de contenu réussie n'a pas besoin d'être compliquée.\n\nElle doit juste être alignée sur un objectif clair :\n🎯 ${objText.length > 85 ? objText.slice(0, 82) + '...' : objText}\n\nMoins de bruit, plus de valeur.\n\nPrêts pour cette nouvelle étape avec ${brandName} ? 🔥`,

      facebook: `👋 Chère communauté ${brandName} !\n\nCe mois-ci, notre focus principal est : ${objText}.\n\nNotre mission reste la même : vous accompagner avec des contenus utiles, concrets et adaptés à vos besoins réels.\n\nPartagez vos retours et vos questions en commentaire, nous répondons à chacun d'entre vous ! 👇\n\n#communauté #actualités #${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    })
  }

  // Synchronize state when strategy or selectedPeriod changes
  useEffect(() => {
    setPeriod(selectedPeriod)
    if (strategy) {
      setMonthlyObjective(strategy.monthly_objective || '')
      setTargetAudience(strategy.target_audience || '')
      setStatus(strategy.status || 'up_to_date')
      setTone(strategy.editorial_line?.tone || 'Professionnel & Inspirant')
      setPillars(strategy.editorial_line?.pillars || ['Conseils & Expertise', 'Coulisses', 'Nouveautés'])
      setPlatformPriorities(
        strategy.editorial_line?.platform_priorities || [
          { platform: 'linkedin', content_type: 'Analyses de tendances & Retours d’expérience', frequency: '3x / sem' },
          { platform: 'instagram', content_type: 'Carrousels éducatifs & Réels coulisses', frequency: '4x / sem' }
        ]
      )
      setKpis(
        strategy.kpis && strategy.kpis.length > 0
          ? strategy.kpis
          : [
              { id: '1', name: 'Impressions globales', target: 25000, current: 0, unit: 'vues' },
              { id: '2', name: 'Nouveaux abonnés', target: 300, current: 0, unit: 'abonnés' },
              { id: '3', name: 'Taux d’engagement moyen', target: 4.5, current: 0, unit: '%' }
            ]
      )
    } else {
      // Defaults for brand new strategy
      setMonthlyObjective('')
      setTargetAudience('')
      setStatus('to_review')
      setTone('Professionnel & Inspirant')
      setPillars(['Conseils & Expertise', 'Coulisses & Culture', 'Produit & Nouveautés'])
      setPlatformPriorities([
        { platform: 'linkedin', content_type: 'Analyses et retours d’expérience', frequency: '3x / sem' },
        { platform: 'instagram', content_type: 'Carrousels éducatifs et Réels', frequency: '4x / sem' }
      ])
      setKpis([
        { id: '1', name: 'Impressions globales', target: 25000, current: 0, unit: 'vues' },
        { id: '2', name: 'Nouveaux abonnés', target: 300, current: 0, unit: 'abonnés' },
        { id: '3', name: 'Taux d’engagement moyen', target: 4.5, current: 0, unit: '%' }
      ])
    }
  }, [strategy, selectedPeriod, isOpen])

  if (!isOpen) return null

  const DEFAULT_POST_IMAGES = [
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
  ]

  function getPostImage(post: any, idx: number) {
    if (post.media_urls && post.media_urls.length > 0 && post.media_urls[0]) {
      return post.media_urls[0]
    }
    return DEFAULT_POST_IMAGES[idx % DEFAULT_POST_IMAGES.length]
  }

  function formatPostDate(p: any) {
    const rawDate = p.scheduled_at || p.published_at || p.created_at
    if (!rawDate) return ''
    try {
      const d = new Date(rawDate)
      const formatted = d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      const hours = d.getHours().toString().padStart(2, '0')
      const mins = d.getMinutes().toString().padStart(2, '0')
      if (p.status === 'draft') {
        return `Modifié le ${formatted}`
      }
      return `${formatted} à ${hours}:${mins}`
    } catch {
      return ''
    }
  }

  function toggleSelectPost(id: string) {
    setSelectedPostIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Handle Pillar management
  const handleAddPillar = () => {
    if (!newPillarInput.trim()) return
    setPillars(prev => [...prev, newPillarInput.trim()])
    setNewPillarInput('')
  }

  const handleRemovePillar = (index: number) => {
    setPillars(prev => prev.filter((_, i) => i !== index))
  }

  // Handle Platform Priority
  const handleTogglePlatform = (plat: Platform) => {
    const existing = platformPriorities.find(p => p.platform === plat)
    if (existing) {
      setPlatformPriorities(prev => prev.filter(p => p.platform !== plat))
    } else {
      setPlatformPriorities(prev => [
        ...prev,
        { platform: plat, content_type: 'Contenu standard', frequency: '2x / sem' }
      ])
    }
  }

  const handleUpdatePlatformContentType = (plat: Platform, text: string) => {
    setPlatformPriorities(prev =>
      prev.map(p => (p.platform === plat ? { ...p, content_type: text } : p))
    )
  }

  const handleUpdatePlatformFrequency = (plat: Platform, text: string) => {
    setPlatformPriorities(prev =>
      prev.map(p => (p.platform === plat ? { ...p, frequency: text } : p))
    )
  }

  // Handle KPI management
  const handleAddKPI = () => {
    const newKpi: StrategyKPI = {
      id: Math.random().toString(36).slice(2, 9),
      name: 'Nouveau KPI',
      target: 100,
      current: 0,
      unit: 'unités'
    }
    setKpis(prev => [...prev, newKpi])
  }

  const handleUpdateKPI = (id: string, field: keyof StrategyKPI, val: any) => {
    setKpis(prev =>
      prev.map(k => (k.id === id ? { ...k, [field]: val } : k))
    )
  }

  const handleRemoveKPI = (id: string) => {
    setKpis(prev => prev.filter(k => k.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!monthlyObjective.trim()) {
      alert('Veuillez renseigner au moins un objectif principal pour le mois.')
      return
    }

    const payload = {
      period,
      monthly_objective: monthlyObjective.trim(),
      target_audience: targetAudience.trim() || null,
      editorial_line: {
        tone: tone.trim(),
        pillars,
        platform_priorities: platformPriorities
      },
      kpis,
      status
    }

    const res = await onSave(payload)
    if (res) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-xl shadow-2xl border overflow-hidden transition-all duration-200 ${
          darkMode ? 'bg-[#131E31] border-slate-700/90 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${
            darkMode ? 'border-slate-700/80 bg-slate-900/60' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1677FF]/10 text-[#1677FF] dark:text-[#38BDF8] flex items-center justify-center shrink-0 border border-[#1677FF]/20 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-extrabold tracking-tight m-0">
                  Stratégie de Marque
                </h2>
                <span
                  className={`text-[11.5px] font-bold px-2 py-0.5 rounded-md ${
                    darkMode ? 'bg-slate-800 text-[#38BDF8] border border-slate-700' : 'bg-blue-50 text-[#1677FF] border border-blue-100'
                  }`}
                >
                  {formatPeriodLabel(period)}
                </span>
              </div>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 m-0 mt-0.5">
                Planification mensuelle des objectifs, de la ligne éditoriale et des KPIs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status quick select */}
            <select
              value={status}
              onChange={e => setStatus(e.target.value as StrategyStatus)}
              disabled={!isOwnerOrCM}
              className={`text-[12px] font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors ${
                status === 'up_to_date'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : status === 'to_review'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/30'
              }`}
            >
              <option value="up_to_date">🟢 À jour</option>
              <option value="to_review">🟡 À réviser</option>
              <option value="archived">⚪ Archivé</option>
            </select>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex items-center gap-1 px-5 border-b shrink-0 overflow-x-auto no-scrollbar ${
            darkMode ? 'border-slate-700/80 bg-slate-900/30' : 'border-slate-100 bg-white'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('objectives')}
            className={`flex items-center gap-2 px-3.5 py-3 text-[13px] font-bold border-b-2 transition-all cursor-pointer bg-transparent ${
              activeTab === 'objectives'
                ? 'border-[#1677FF] text-[#1677FF] dark:text-[#38BDF8] dark:border-[#38BDF8]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Objectifs & Cible</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('editorial')}
            className={`flex items-center gap-2 px-3.5 py-3 text-[13px] font-bold border-b-2 transition-all cursor-pointer bg-transparent ${
              activeTab === 'editorial'
                ? 'border-[#1677FF] text-[#1677FF] dark:text-[#38BDF8] dark:border-[#38BDF8]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Ligne Éditoriale</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mockups')}
            className={`flex items-center gap-2 px-3.5 py-3 text-[13px] font-bold border-b-2 transition-all cursor-pointer bg-transparent ${
              activeTab === 'mockups'
                ? 'border-[#1677FF] text-[#1677FF] dark:text-[#38BDF8] dark:border-[#38BDF8]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Rendus & Mockups</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/20">
              Live
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kpis')}
            className={`flex items-center gap-2 px-3.5 py-3 text-[13px] font-bold border-b-2 transition-all cursor-pointer bg-transparent ${
              activeTab === 'kpis'
                ? 'border-[#1677FF] text-[#1677FF] dark:text-[#38BDF8] dark:border-[#38BDF8]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>KPIs & Métriques</span>
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {kpis.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-3 text-[13px] font-bold border-b-2 transition-all cursor-pointer bg-transparent ${
              activeTab === 'history'
                ? 'border-[#1677FF] text-[#1677FF] dark:text-[#38BDF8] dark:border-[#38BDF8]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historique ({strategiesHistory.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 md:p-6 no-scrollbar flex flex-col">
          {/* TAB 1 : OBJECTIFS & CIBLE */}
          {activeTab === 'objectives' && (
            <div className="flex flex-col gap-4.5 animate-in fade-in duration-150">
              {/* Period selection banner if creating or switching */}
              <div
                className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                  darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-blue-50/50 border-blue-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4.5 h-4.5 text-[#1677FF] dark:text-[#38BDF8]" />
                  <span className="text-[13px] font-bold">Période concernée :</span>
                  <input
                    type="month"
                    value={period}
                    onChange={e => {
                      setPeriod(e.target.value)
                      onSelectPeriod(e.target.value)
                    }}
                    className={`text-[12.5px] font-bold px-2.5 py-1 rounded-lg border outline-none ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                {onDuplicate && strategiesHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const prevPeriod = getAdjacentPeriod(period, -1)
                      onDuplicate(period, prevPeriod)
                    }}
                    className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#1677FF] dark:text-[#38BDF8] hover:underline cursor-pointer bg-transparent border-none"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Dupliquer du mois précédent ({formatPeriodLabel(getAdjacentPeriod(period, -1))})</span>
                  </button>
                )}
              </div>

              {/* Monthly Objective */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-extrabold flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[#1677FF] dark:text-[#38BDF8]" />
                  <span>Objectif(s) prioritaires du mois <span className="text-red-500">*</span></span>
                </label>
                <textarea
                  rows={4}
                  value={monthlyObjective}
                  onChange={e => setMonthlyObjective(e.target.value)}
                  placeholder="Ex : Lancement de la nouvelle offre SaaS, doubler l'engagement sur LinkedIn et générer 50 demandes de démo qualifiées..."
                  required
                  disabled={!isOwnerOrCM}
                  className={`w-full p-3.5 rounded-xl border text-[13.5px] outline-none transition-all resize-none leading-relaxed ${
                    darkMode
                      ? 'bg-slate-900/80 border-slate-700 focus:border-[#38BDF8] text-white placeholder-slate-500'
                      : 'bg-slate-50/80 border-slate-200 focus:border-[#1677FF] text-slate-800 placeholder-slate-400'
                  }`}
                />
                <p className="text-[11.5px] text-slate-400 m-0">
                  Ce focus principal guide l'ensemble des créations de posts, calendriers et analyses du mois.
                </p>
              </div>

              {/* Target Audience */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-extrabold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>Cible / Audience visée pour cette période</span>
                </label>
                <textarea
                  rows={3}
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  placeholder="Ex : Fondateurs de startups B2B, Community Managers freelances et directeurs marketing en quête d'automatisation intelligente..."
                  disabled={!isOwnerOrCM}
                  className={`w-full p-3.5 rounded-xl border text-[13.5px] outline-none transition-all resize-none leading-relaxed ${
                    darkMode
                      ? 'bg-slate-900/80 border-slate-700 focus:border-emerald-500 text-white placeholder-slate-500'
                      : 'bg-slate-50/80 border-slate-200 focus:border-emerald-600 text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>
          )}

          {/* TAB 2 : LIGNE ÉDITORIALE */}
          {activeTab === 'editorial' && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-150">
              {/* Tonalité */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-extrabold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Tonalité générale adoptée</span>
                </label>
                <input
                  type="text"
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  placeholder="Ex : Professionnel, bienveillant, orienté action et transparent"
                  disabled={!isOwnerOrCM}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-[13.5px] outline-none transition-all ${
                    darkMode
                      ? 'bg-slate-900/80 border-slate-700 focus:border-[#38BDF8] text-white placeholder-slate-500'
                      : 'bg-slate-50/80 border-slate-200 focus:border-[#1677FF] text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Piliers de contenu */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-extrabold flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#1677FF] dark:text-[#38BDF8]" />
                  <span>Piliers de contenu / Thématiques récurrentes</span>
                </label>

                <div className="flex flex-wrap gap-2 items-center">
                  {pillars.map((pillar, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1.5 text-[12.5px] font-bold px-3 py-1.5 rounded-xl border ${
                        darkMode
                          ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                          : 'bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span>{pillar}</span>
                      {isOwnerOrCM && (
                        <button
                          type="button"
                          onClick={() => handleRemovePillar(idx)}
                          className="text-slate-400 hover:text-red-500 border-none bg-transparent cursor-pointer p-0 ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {isOwnerOrCM && (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={newPillarInput}
                      onChange={e => setNewPillarInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddPillar()
                        }
                      }}
                      placeholder="Ajouter un pilier (ex: Études de cas client, Conseils pratiques...)"
                      className={`flex-1 px-3 py-2 rounded-xl border text-[12.5px] outline-none ${
                        darkMode
                          ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500'
                          : 'bg-slate-50/80 border-slate-200 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleAddPillar}
                      className="px-3.5 py-2 rounded-xl bg-[#1677FF] hover:bg-[#1266DF] text-white text-[12.5px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-none shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Types de contenus prioritaires par plateforme */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[13px] font-extrabold flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-purple-500" />
                  <span>Priorités par plateforme & Formats recommandés</span>
                </label>

                {/* Platform toggles */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {AVAILABLE_PLATFORMS.map(plat => {
                    const isSelected = platformPriorities.some(p => p.platform === plat)
                    return (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => isOwnerOrCM && handleTogglePlatform(plat)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? darkMode
                              ? 'bg-[#1E293B] text-white border-[#38BDF8] shadow-xs'
                              : 'bg-blue-50 text-[#1677FF] border-[#1677FF] shadow-xs'
                            : darkMode
                            ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <PlatformIcon platform={plat} size={15} />
                        <span className="capitalize">{plat}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>
                    )
                  })}
                </div>

                {/* Platform Priority Cards */}
                <div className="flex flex-col gap-2.5">
                  {platformPriorities.length === 0 ? (
                    <div className="text-[12.5px] text-slate-400 py-3 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                      Aucune plateforme sélectionnée. Cliquez sur les boutons ci-dessus pour définir les priorités.
                    </div>
                  ) : (
                    platformPriorities.map(p => (
                      <div
                        key={p.platform}
                        className={`p-3.5 rounded-xl border flex flex-col md:flex-row items-start md:items-center gap-3 ${
                          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-2 w-32 shrink-0">
                          <PlatformIcon platform={p.platform} size={18} />
                          <span className="text-[13px] font-bold capitalize">{p.platform}</span>
                        </div>

                        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div className="md:col-span-2">
                            <input
                              type="text"
                              value={p.content_type}
                              onChange={e => handleUpdatePlatformContentType(p.platform, e.target.value)}
                              placeholder="Format prioritaire (ex: Carrousels, Réels...)"
                              disabled={!isOwnerOrCM}
                              className={`w-full px-3 py-1.5 rounded-lg border text-[12px] outline-none ${
                                darkMode
                                  ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500'
                                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                              }`}
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              value={p.frequency || ''}
                              onChange={e => handleUpdatePlatformFrequency(p.platform, e.target.value)}
                              placeholder="Fréquence (ex: 3x / sem)"
                              disabled={!isOwnerOrCM}
                              className={`w-full px-3 py-1.5 rounded-lg border text-[12px] outline-none ${
                                darkMode
                                  ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500'
                                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setMockupFilter(p.platform as any)
                              setActiveTab('mockups')
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[11.5px] font-bold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                              darkMode
                                ? 'bg-blue-500/10 hover:bg-blue-500/20 text-[#38BDF8] border-blue-500/30'
                                : 'bg-blue-50 hover:bg-blue-100 text-[#1677FF] border-blue-200'
                            }`}
                            title="Voir le mockup pour cette plateforme"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Mockup</span>
                          </button>

                          {isOwnerOrCM && (
                            <button
                              type="button"
                              onClick={() => handleTogglePlatform(p.platform)}
                              className="text-slate-400 hover:text-red-500 p-1 border-none bg-transparent cursor-pointer"
                              title="Retirer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3 : RENDUS & MOCKUPS DES RÉSEAUX */}
          {activeTab === 'mockups' && (
            <div className="flex flex-col gap-4.5 animate-in fade-in duration-150 pb-4">
              {/* Header bar of Mockups Tab */}
              <div
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50/90 border-slate-200/90'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-extrabold flex items-center gap-1.5">
                      <LayoutTemplate className="w-4 h-4 text-[#1677FF] dark:text-[#38BDF8]" />
                      <span>Rendus & Simulations en conditions réelles</span>
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#1677FF]/10 text-[#1677FF] dark:text-[#38BDF8]">
                      {brandData?.brand_name || activeOrganization?.name || 'Ma Marque'}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 m-0 mt-1">
                    Visualisez le rendu de vos publications selon votre tonalité (<span className="font-semibold">{tone || 'Professionnel'}</span>) et votre focus stratégique.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRegenerateSamples}
                    className={`px-3 py-1.5 rounded-xl border text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
                    }`}
                    title="Régénérer les exemples selon les objectifs et piliers actuels"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#1677FF] dark:text-[#38BDF8]" />
                    <span>Réinitialiser textes</span>
                  </button>
                </div>
              </div>

              {/* Platform filters bar */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'Tous les réseaux' },
                  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin' as Platform },
                  { id: 'instagram', label: 'Instagram', icon: 'instagram' as Platform },
                  { id: 'twitter', label: 'Twitter / X', icon: 'twitter' as Platform },
                  { id: 'facebook', label: 'Facebook', icon: 'facebook' as Platform },
                ].map(item => {
                  const isSelected = mockupFilter === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMockupFilter(item.id as any)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? darkMode
                            ? 'bg-[#1677FF] text-white border-[#1677FF] shadow-xs'
                            : 'bg-[#1677FF] text-white border-[#1677FF] shadow-xs'
                          : darkMode
                          ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
                      }`}
                    >
                      {item.icon && <PlatformIcon platform={item.icon} size={14} />}
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Mockup Cards Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* 1. LINKEDIN */}
                {(mockupFilter === 'all' || mockupFilter === 'linkedin') && (
                  <div className={`rounded-xl border p-3.5 flex flex-col gap-2.5 ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/60 border-slate-200/80 shadow-xs'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#0A66C2] flex items-center justify-center text-white">
                          <PlatformIcon platform="linkedin" size={14} />
                        </div>
                        <span className="text-[13px] font-bold">LinkedIn</span>
                        {platformPriorities.find(p => p.platform === 'linkedin') && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 text-[#38BDF8] font-bold">
                            {platformPriorities.find(p => p.platform === 'linkedin')?.frequency || '3x / sem'}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIncludeSampleImage(prev => ({ ...prev, linkedin: !prev.linkedin }))}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                          includeSampleImage.linkedin ? 'bg-[#0A66C2]/10 text-[#0A66C2] dark:text-[#38BDF8] border-[#0A66C2]/20' : 'bg-slate-200/50 dark:bg-slate-800 text-slate-500 border-transparent'
                        }`}
                      >
                        {includeSampleImage.linkedin ? '🖼️ Avec visuel' : '📝 Texte seul'}
                      </button>
                    </div>

                    <LinkedInFeedCard
                      content={mockupContents.linkedin || ''}
                      imageUrl={includeSampleImage.linkedin ? (brandData?.logo_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80') : null}
                      userName={socialAccounts.find(a => a.platform === 'linkedin')?.platform_username || brandData?.brand_name || activeOrganization?.name || 'Ma Marque'}
                      userHeadline={brandData?.industry || 'Marque & Entreprise innovante'}
                      avatarUrl={socialAccounts.find(a => a.platform === 'linkedin')?.platform_avatar_url || brandData?.logo_url || activeOrganization?.avatar_url || null}
                      onContentChange={v => setMockupContents(prev => ({ ...prev, linkedin: v }))}
                    />
                  </div>
                )}

                {/* 2. INSTAGRAM */}
                {(mockupFilter === 'all' || mockupFilter === 'instagram') && (
                  <div className={`rounded-xl border p-3.5 flex flex-col gap-2.5 ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/60 border-slate-200/80 shadow-xs'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white">
                          <PlatformIcon platform="instagram" size={14} />
                        </div>
                        <span className="text-[13px] font-bold">Instagram</span>
                        {platformPriorities.find(p => p.platform === 'instagram') && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-500 font-bold">
                            {platformPriorities.find(p => p.platform === 'instagram')?.frequency || '4x / sem'}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIncludeSampleImage(prev => ({ ...prev, instagram: !prev.instagram }))}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                          includeSampleImage.instagram ? 'bg-pink-500/10 text-pink-500 border-pink-500/20' : 'bg-slate-200/50 dark:bg-slate-800 text-slate-500 border-transparent'
                        }`}
                      >
                        {includeSampleImage.instagram ? '🖼️ Avec visuel' : '📝 Texte seul'}
                      </button>
                    </div>

                    <InstagramFeedCard
                      content={mockupContents.instagram || ''}
                      imageUrl={includeSampleImage.instagram ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' : null}
                      userName={socialAccounts.find(a => a.platform === 'instagram')?.platform_username || (brandData?.brand_name || activeOrganization?.name || 'mamarque').toLowerCase().replace(/[^a-z0-9_]/g, '')}
                      avatarUrl={socialAccounts.find(a => a.platform === 'instagram')?.platform_avatar_url || brandData?.logo_url || activeOrganization?.avatar_url || null}
                      onContentChange={v => setMockupContents(prev => ({ ...prev, instagram: v }))}
                    />
                  </div>
                )}

                {/* 3. TWITTER / X */}
                {(mockupFilter === 'all' || mockupFilter === 'twitter') && (
                  <div className={`rounded-xl border p-3.5 flex flex-col gap-2.5 ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/60 border-slate-200/80 shadow-xs'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-black dark:bg-slate-800 flex items-center justify-center text-white">
                          <PlatformIcon platform="twitter" size={14} />
                        </div>
                        <span className="text-[13px] font-bold">Twitter / X</span>
                        {platformPriorities.find(p => p.platform === 'twitter') && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-500 font-bold">
                            {platformPriorities.find(p => p.platform === 'twitter')?.frequency || '5x / sem'}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIncludeSampleImage(prev => ({ ...prev, twitter: !prev.twitter }))}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                          includeSampleImage.twitter ? 'bg-sky-500/10 text-sky-500 border-sky-500/20' : 'bg-slate-200/50 dark:bg-slate-800 text-slate-500 border-transparent'
                        }`}
                      >
                        {includeSampleImage.twitter ? '🖼️ Avec média' : '📝 Tweet seul'}
                      </button>
                    </div>

                    <TwitterFeedCard
                      content={mockupContents.twitter || ''}
                      imageUrl={includeSampleImage.twitter ? 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80' : null}
                      userName={socialAccounts.find(a => a.platform === 'twitter')?.platform_username || brandData?.brand_name || activeOrganization?.name || 'Ma Marque'}
                      userHandle={`@${(socialAccounts.find(a => a.platform === 'twitter')?.platform_username || brandData?.brand_name || activeOrganization?.name || 'mamarque').toLowerCase().replace(/[^a-z0-9_]/g, '')}`}
                      avatarUrl={socialAccounts.find(a => a.platform === 'twitter')?.platform_avatar_url || brandData?.logo_url || activeOrganization?.avatar_url || null}
                      onContentChange={v => setMockupContents(prev => ({ ...prev, twitter: v }))}
                    />
                  </div>
                )}

                {/* 4. FACEBOOK */}
                {(mockupFilter === 'all' || mockupFilter === 'facebook') && (
                  <div className={`rounded-xl border p-3.5 flex flex-col gap-2.5 ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/60 border-slate-200/80 shadow-xs'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#1877F2] flex items-center justify-center text-white">
                          <PlatformIcon platform="facebook" size={14} />
                        </div>
                        <span className="text-[13px] font-bold">Facebook</span>
                        {platformPriorities.find(p => p.platform === 'facebook') && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 text-[#1877F2] font-bold">
                            {platformPriorities.find(p => p.platform === 'facebook')?.frequency || '2x / sem'}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIncludeSampleImage(prev => ({ ...prev, facebook: !prev.facebook }))}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                          includeSampleImage.facebook ? 'bg-blue-500/10 text-[#1877F2] border-blue-500/20' : 'bg-slate-200/50 dark:bg-slate-800 text-slate-500 border-transparent'
                        }`}
                      >
                        {includeSampleImage.facebook ? '🖼️ Avec visuel' : '📝 Texte seul'}
                      </button>
                    </div>

                    <FacebookFeedCard
                      content={mockupContents.facebook || ''}
                      imageUrl={includeSampleImage.facebook ? 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80' : null}
                      userName={socialAccounts.find(a => a.platform === 'facebook')?.platform_username || brandData?.brand_name || activeOrganization?.name || 'Ma Marque'}
                      avatarUrl={socialAccounts.find(a => a.platform === 'facebook')?.platform_avatar_url || brandData?.logo_url || activeOrganization?.avatar_url || null}
                      onContentChange={v => setMockupContents(prev => ({ ...prev, facebook: v }))}
                    />
                  </div>
                )}
              </div>

              {/* ── SECTION EN BAS DES 4 CARTES : VOS POSTS EXISTANTS ── */}
              <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'} flex flex-col gap-4`}>
                {/* Header bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Title + Count */}
                  <div className="flex items-center gap-2.5">
                    <h3 className={`text-[15px] font-extrabold m-0 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      Vos posts existants
                    </h3>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      darkMode ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {existingPosts.filter(p => p.status !== 'deleted').length}
                    </span>
                  </div>

                  {/* Right Controls: Grid/List switch */}
                  <div className="flex items-center gap-1.5">
                    <div className={`flex items-center p-0.5 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                      <button
                        type="button"
                        onClick={() => setPostViewMode('grid')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${
                          postViewMode === 'grid'
                            ? 'bg-[#1677FF] text-white shadow-xs'
                            : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Vue Grille"
                      >
                        <LayoutGrid size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPostViewMode('list')}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${
                          postViewMode === 'list'
                            ? 'bg-[#1677FF] text-white shadow-xs'
                            : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Vue Liste"
                      >
                        <List size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Posts Content */}
                {postsLoading ? (
                  <div className="py-12 flex items-center justify-center text-slate-400 text-[13px] gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#1677FF]" />
                    <span>Chargement de vos posts existants...</span>
                  </div>
                ) : existingPosts.filter(p => {
                    if (postStatusFilter === 'all') return p.status !== 'deleted'
                    if (postStatusFilter === 'published') return p.status === 'published' || p.status === 'partial'
                    if (postStatusFilter === 'draft') return p.status === 'draft' || p.status === 'failed'
                    if (postStatusFilter === 'scheduled') return p.status === 'scheduled'
                    if (postStatusFilter === 'archived') return p.status === 'archived' || p.status === 'deleted'
                    return true
                  }).length === 0 ? (
                  <div className={`p-8 rounded-xl border text-center flex flex-col items-center justify-center gap-2.5 ${
                    darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <LayoutTemplate className="w-8 h-8 text-slate-500" />
                    <div className="text-[13px] font-bold text-slate-300">Aucun post existant dans cette catégorie</div>
                    <p className="text-[11.5px] text-slate-500 max-w-sm m-0">
                      Les posts créés, programmés ou publiés apparaîtront ici avec leurs statistiques en direct.
                    </p>
                  </div>
                ) : postViewMode === 'grid' ? (
                  /* Grille des posts */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                    {existingPosts
                      .filter(p => {
                        if (postStatusFilter === 'all') return p.status !== 'deleted'
                        if (postStatusFilter === 'published') return p.status === 'published' || p.status === 'partial'
                        if (postStatusFilter === 'draft') return p.status === 'draft' || p.status === 'failed'
                        if (postStatusFilter === 'scheduled') return p.status === 'scheduled'
                        if (postStatusFilter === 'archived') return p.status === 'archived' || p.status === 'deleted'
                        return true
                      })
                      .slice(0, 10)
                      .map((post, idx) => {
                        const isSelected = selectedPostIds.includes(post.id)
                        const primaryPlat = (post.platforms?.[0] || 'linkedin') as Platform

                        return (
                          <div
                            key={post.id || idx}
                            className={`rounded-xl border overflow-hidden flex flex-col transition-all group hover:border-slate-600 ${
                              darkMode ? 'bg-[#0E1524] border-slate-800/80 shadow-xs' : 'bg-white border-slate-200/90 shadow-xs'
                            }`}
                          >
                            {/* Media Preview on top */}
                            <div className="relative w-full h-[145px] bg-slate-800/80 overflow-hidden flex items-center justify-center">
                              <img
                                src={getPostImage(post, idx)}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />

                              {/* Checkbox top-left */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleSelectPost(post.id)
                                }}
                                className={`absolute top-2.5 left-2.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs ${
                                  isSelected
                                    ? 'bg-[#1677FF] border-[#1677FF] text-white shadow-xs'
                                    : 'bg-black/40 border-white/30 text-transparent hover:border-white/60 hover:bg-black/60'
                                }`}
                              >
                                <Check size={12} strokeWidth={3} className={isSelected ? 'block text-white' : 'hidden'} />
                              </button>

                              {/* Platform Badge top-right */}
                              <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                                {primaryPlat === 'linkedin' && (
                                  <div className="w-6 h-6 rounded-md bg-[#0A66C2] flex items-center justify-center text-white shadow-md">
                                    <PlatformIcon platform="linkedin" size={14} />
                                  </div>
                                )}
                                {primaryPlat === 'instagram' && (
                                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shadow-md">
                                    <PlatformIcon platform="instagram" size={14} />
                                  </div>
                                )}
                                {primaryPlat === 'facebook' && (
                                  <div className="w-6 h-6 rounded-md bg-[#1877F2] flex items-center justify-center text-white shadow-md">
                                    <PlatformIcon platform="facebook" size={14} />
                                  </div>
                                )}
                                {primaryPlat === 'twitter' && (
                                  <div className="w-6 h-6 rounded-md bg-black flex items-center justify-center text-white shadow-md border border-white/10">
                                    <PlatformIcon platform="twitter" size={14} />
                                  </div>
                                )}
                                {primaryPlat === 'tiktok' && (
                                  <div className="w-6 h-6 rounded-md bg-black flex items-center justify-center text-white shadow-md border border-white/10">
                                    <PlatformIcon platform="tiktok" size={14} />
                                  </div>
                                )}
                                {!['linkedin', 'instagram', 'facebook', 'twitter', 'tiktok'].includes(primaryPlat) && (
                                  <div className="w-6 h-6 rounded-md bg-[#1677FF] flex items-center justify-center text-white shadow-md">
                                    <PlatformIcon platform={primaryPlat} size={14} />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-3 flex flex-col gap-2 flex-1 justify-between">
                              <div className="flex flex-col gap-1.5">
                                <p className={`text-[12.5px] font-semibold line-clamp-2 leading-snug m-0 ${
                                  darkMode ? 'text-slate-100' : 'text-slate-800'
                                }`}>
                                  {post.content || 'Publication sans texte'}
                                </p>

                                {/* Status pill */}
                                <div className="pt-0.5">
                                  {(post.status === 'published' || post.status === 'partial') && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 inline-block">
                                      Publié
                                    </span>
                                  )}
                                  {(post.status === 'draft' || post.status === 'failed') && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25 inline-block">
                                      Brouillon
                                    </span>
                                  )}
                                  {post.status === 'scheduled' && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/25 inline-block">
                                      Programmé
                                    </span>
                                  )}
                                  {(post.status === 'archived' || post.status === 'deleted') && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/25 inline-block">
                                      Archivé
                                    </span>
                                  )}
                                </div>

                                {/* Date */}
                                <span className="text-[11px] text-slate-400 font-medium">
                                  {formatPostDate(post)}
                                </span>
                              </div>

                              {/* Footer metrics / actions */}
                              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-slate-400 text-[11px]">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 hover:text-slate-200">
                                    <Heart size={11} />
                                    <span>{post.analytics?.likes ? post.analytics.likes : '-'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 hover:text-slate-200">
                                    <MessageCircle size={11} />
                                    <span>{post.analytics?.comments ? post.analytics.comments : '-'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 hover:text-slate-200">
                                    <Repeat2 size={11} />
                                    <span>{post.analytics?.shares ? post.analytics.shares : '-'}</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer border-none bg-transparent"
                                >
                                  <MoreHorizontal size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  /* Vue Liste des posts */
                  <div className="flex flex-col gap-2">
                    {existingPosts
                      .filter(p => {
                        if (postStatusFilter === 'all') return p.status !== 'deleted'
                        if (postStatusFilter === 'published') return p.status === 'published' || p.status === 'partial'
                        if (postStatusFilter === 'draft') return p.status === 'draft' || p.status === 'failed'
                        if (postStatusFilter === 'scheduled') return p.status === 'scheduled'
                        if (postStatusFilter === 'archived') return p.status === 'archived' || p.status === 'deleted'
                        return true
                      })
                      .slice(0, 10)
                      .map((post, idx) => {
                        const primaryPlat = (post.platforms?.[0] || 'linkedin') as Platform

                        return (
                          <div
                            key={post.id || idx}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                              darkMode ? 'bg-[#0E1524] border-slate-800/80' : 'bg-white border-slate-200 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                                <img
                                  src={getPostImage(post, idx)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded bg-black/60 flex items-center justify-center">
                                  <PlatformIcon platform={primaryPlat} size={10} />
                                </div>
                              </div>
                              <div className="min-w-0 flex flex-col gap-0.5">
                                <p className={`text-[12.5px] font-semibold truncate m-0 ${
                                  darkMode ? 'text-slate-200' : 'text-slate-800'
                                }`}>
                                  {post.content || 'Sans contenu'}
                                </p>
                                <span className="text-[11px] text-slate-400">{formatPostDate(post)}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 flex-shrink-0">
                              {(post.status === 'published' || post.status === 'partial') && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                  Publié
                                </span>
                              )}
                              {(post.status === 'draft' || post.status === 'failed') && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                                  Brouillon
                                </span>
                              )}
                              {post.status === 'scheduled' && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/25">
                                  Programmé
                                </span>
                              )}
                              {(post.status === 'archived' || post.status === 'deleted') && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/25">
                                  Archivé
                                </span>
                              )}

                              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                                <span className="flex items-center gap-1"><Heart size={11} /> {post.analytics?.likes ?? '-'}</span>
                                <span className="flex items-center gap-1"><MessageCircle size={11} /> {post.analytics?.comments ?? '-'}</span>
                                <span className="flex items-center gap-1"><Repeat2 size={11} /> {post.analytics?.shares ?? '-'}</span>
                              </div>

                              <button
                                type="button"
                                className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer border-none bg-transparent"
                              >
                                <MoreHorizontal size={14} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}

                {/* Bottom Action Button: Voir tous les posts */}
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    router.push('/workspace')
                  }}
                  className={`w-full py-2.5 rounded-xl text-[12.5px] font-bold text-center border transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-slate-900/40 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/60 hover:border-slate-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  Voir tous les posts
                </button>
              </div>
            </div>
          )}

          {/* TAB 4 : KPIS & MÉTRIQUES */}
          {activeTab === 'kpis' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[13.5px] font-extrabold m-0">KPIs et indicateurs clés de succès</h3>
                  <p className="text-[11.5px] text-slate-400 m-0 mt-0.5">
                    Définissez vos objectifs quantifiables pour suivre la performance du mois.
                  </p>
                </div>

                {isOwnerOrCM && (
                  <button
                    type="button"
                    onClick={handleAddKPI}
                    className="px-3 py-1.5 rounded-xl bg-[#1677FF] hover:bg-[#1266DF] text-white text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-none shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un KPI</span>
                  </button>
                )}
              </div>

              {/* KPI List / Grid */}
              <div className="flex flex-col gap-3">
                {kpis.map(kpi => {
                  const targetNum = Number(kpi.target) || 1
                  const currentNum = Number(kpi.current) || 0
                  const pct = Math.min(Math.round((currentNum / targetNum) * 100), 100)
                  const isCompleted = currentNum >= targetNum && targetNum > 0

                  return (
                    <div
                      key={kpi.id}
                      className={`p-4 rounded-xl border flex flex-col gap-2.5 transition-all ${
                        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
                      }`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                        {/* Name */}
                        <div className="sm:col-span-5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Métrique
                          </label>
                          <input
                            type="text"
                            value={kpi.name}
                            onChange={e => handleUpdateKPI(kpi.id, 'name', e.target.value)}
                            placeholder="Ex : Nouveaux abonnés"
                            disabled={!isOwnerOrCM}
                            className={`w-full px-3 py-1.5 rounded-lg border text-[12.5px] font-bold outline-none ${
                              darkMode
                                ? 'bg-slate-800/80 border-slate-700 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        {/* Current Value */}
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Actuel
                          </label>
                          <input
                            type="number"
                            value={kpi.current}
                            onChange={e => handleUpdateKPI(kpi.id, 'current', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            disabled={!isOwnerOrCM}
                            className={`w-full px-3 py-1.5 rounded-lg border text-[12.5px] font-bold outline-none ${
                              darkMode
                                ? 'bg-slate-800/80 border-slate-700 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        {/* Target Value */}
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Cible
                          </label>
                          <input
                            type="number"
                            value={kpi.target}
                            onChange={e => handleUpdateKPI(kpi.id, 'target', parseFloat(e.target.value) || 0)}
                            placeholder="100"
                            disabled={!isOwnerOrCM}
                            className={`w-full px-3 py-1.5 rounded-lg border text-[12.5px] font-bold outline-none ${
                              darkMode
                                ? 'bg-slate-800/80 border-slate-700 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        {/* Unit */}
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Unité
                          </label>
                          <input
                            type="text"
                            value={kpi.unit}
                            onChange={e => handleUpdateKPI(kpi.id, 'unit', e.target.value)}
                            placeholder="vues, %, leads"
                            disabled={!isOwnerOrCM}
                            className={`w-full px-3 py-1.5 rounded-lg border text-[12.5px] outline-none ${
                              darkMode
                                ? 'bg-slate-800/80 border-slate-700 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        {/* Delete button */}
                        {isOwnerOrCM && (
                          <div className="sm:col-span-1 flex justify-end pt-5">
                            <button
                              type="button"
                              onClick={() => handleRemoveKPI(kpi.id)}
                              className="text-slate-400 hover:text-red-500 p-1 border-none bg-transparent cursor-pointer"
                              title="Supprimer ce KPI"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar & Percentage */}
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700/80 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-500'
                                : pct > 50
                                ? 'bg-[#1677FF] dark:bg-[#38BDF8]'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span
                          className={`text-[11.5px] font-extrabold shrink-0 ${
                            isCompleted ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {pct}% {isCompleted && '🎉 Atteint'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 4 : HISTORIQUE & COMPARAISON */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-[13.5px] font-extrabold m-0">Historique des Stratégies Mensuelles</h3>
                <p className="text-[11.5px] text-slate-400 m-0 mt-0.5">
                  Consultez et comparez l'évolution de vos objectifs et KPIs mois par mois.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {strategiesHistory.length === 0 ? (
                  <div className="text-[13px] text-slate-400 py-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    Aucun historique pour le moment. Enregistrez la stratégie active pour créer le premier mois.
                  </div>
                ) : (
                  strategiesHistory.map(hist => {
                    const isSelected = hist.period === period
                    const histKPIs = hist.kpis || []
                    const completedKPIs = histKPIs.filter(k => k.current >= k.target && k.target > 0).length

                    return (
                      <div
                        key={hist.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isSelected
                            ? darkMode
                              ? 'bg-slate-800/90 border-[#38BDF8] shadow-blue-glow'
                              : 'bg-blue-50/70 border-[#1677FF] shadow-xs'
                            : darkMode
                            ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-extrabold">
                              {formatPeriodLabel(hist.period)}
                            </span>
                            <span
                              className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                                hist.status === 'up_to_date'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : hist.status === 'to_review'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-slate-500/10 text-slate-500'
                              }`}
                            >
                              {hist.status === 'up_to_date' ? 'À jour' : hist.status === 'to_review' ? 'À réviser' : 'Archivé'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPeriod(hist.period)
                                onSelectPeriod(hist.period)
                                setActiveTab('objectives')
                              }}
                              className={`px-3 py-1 rounded-lg text-[11.5px] font-bold border transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#1677FF] text-white border-[#1677FF]'
                                  : 'bg-transparent text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              {isSelected ? 'Sélectionné' : 'Consulter & Charger'}
                            </button>

                            {isOwnerOrCM && onDelete && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Supprimer la stratégie de ${formatPeriodLabel(hist.period)} ?`)) {
                                    onDelete(hist.id)
                                  }
                                }}
                                className="text-slate-400 hover:text-red-500 p-1 border-none bg-transparent cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Objectives preview */}
                        <p className="text-[12.5px] text-slate-600 dark:text-slate-300 line-clamp-2 m-0 mb-2.5">
                          {hist.monthly_objective || 'Aucun objectif explicite.'}
                        </p>

                        {/* KPI Summary badges */}
                        <div className="flex flex-wrap gap-2 items-center text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">
                            KPIs : {completedKPIs}/{histKPIs.length} atteints
                          </span>
                          {hist.editorial_line?.tone && (
                            <>
                              <span>•</span>
                              <span>Ton : {hist.editorial_line.tone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div
            className={`mt-6 pt-4 border-t flex items-center justify-between gap-3 shrink-0 ${
              darkMode ? 'border-slate-700/80' : 'border-slate-100'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl border text-[13px] font-bold transition-colors cursor-pointer ${
                darkMode
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Fermer
            </button>

            {isOwnerOrCM && (
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#1266DF] text-white text-[13px] font-extrabold flex items-center gap-2 shadow-blue-glow transition-all cursor-pointer border-none disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Enregistrement...' : 'Enregistrer la Stratégie'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
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
  FileText
} from 'lucide-react'
import { useTheme } from '@/components/context/ThemeContext'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
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
}

type TabType = 'objectives' | 'editorial' | 'kpis' | 'history'

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
  saving
}: StrategyDetailModalProps) {
  const { darkMode } = useTheme()
  const [activeTab, setActiveTab] = useState<TabType>('objectives')

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
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-xl shadow-2xl border overflow-hidden transition-all duration-200 ${
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

                        {isOwnerOrCM && (
                          <button
                            type="button"
                            onClick={() => handleTogglePlatform(p.platform)}
                            className="text-slate-400 hover:text-red-500 p-1 border-none bg-transparent cursor-pointer shrink-0"
                            title="Retirer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3 : KPIS & MÉTRIQUES */}
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

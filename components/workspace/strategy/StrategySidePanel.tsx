'use client'

import React, { useEffect } from 'react'
import {
  X,
  Compass,
  Target,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  Layers,
  Sparkles,
  Maximize2,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { useTheme } from '@/components/context/ThemeContext'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import { formatPeriodLabel, getAdjacentPeriod } from '@/hooks/useStrategy'
import type { Strategy, StrategyStatus, StrategyKPI, Platform } from '@/types'

interface StrategySidePanelProps {
  isOpen: boolean
  onClose: () => void
  onOpenFullModal: () => void
  strategy: Strategy | null
  selectedPeriod: string
  onSelectPeriod: (period: string) => void
  onUpdateStatus: (status: StrategyStatus) => Promise<any>
  isOwnerOrCM: boolean
  loading: boolean
}

export function StrategySidePanel({
  isOpen,
  onClose,
  onOpenFullModal,
  strategy,
  selectedPeriod,
  onSelectPeriod,
  onUpdateStatus,
  isOwnerOrCM,
  loading
}: StrategySidePanelProps) {
  const { darkMode } = useTheme()

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const status = strategy?.status || 'to_review'
  const kpis: StrategyKPI[] = strategy?.kpis || []
  const completedKPIs = kpis.filter(k => k.current >= k.target && k.target > 0).length

  const editorialLine = strategy?.editorial_line || null
  const priorities = editorialLine?.platform_priorities || []

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto select-none">
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over Side Panel container */}
      <aside
        className={`absolute inset-y-0 right-0 max-w-full w-[380px] sm:w-[420px] flex flex-col shadow-2xl border-l transition-transform duration-300 animate-in slide-in-from-right ${
          darkMode ? 'bg-[#111A2E] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Top Header */}
        <div
          className={`px-4.5 py-3.5 border-b flex items-center justify-between shrink-0 ${
            darkMode ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-100 bg-slate-50/70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-[#1677FF]/10 text-[#1677FF] dark:text-[#38BDF8] flex items-center justify-center border border-[#1677FF]/20 shadow-xs">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-[14.5px] font-extrabold tracking-tight m-0 leading-tight">
                Stratégie de Marque
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">
                Panneau de pilotage mensuel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenFullModal}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
              title="Ouvrir la vue complète"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
              title="Fermer le panneau"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Month / Period Navigation Bar & Status Selector */}
        <div
          className={`px-4.5 py-3 border-b flex items-center justify-between gap-2 shrink-0 ${
            darkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100/90 bg-white'
          }`}
        >
          {/* Period selector with Left / Right arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelectPeriod(getAdjacentPeriod(selectedPeriod, -1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-[13px] font-extrabold px-1.5 min-w-[110px] text-center">
              {formatPeriodLabel(selectedPeriod)}
            </span>

            <button
              type="button"
              onClick={() => onSelectPeriod(getAdjacentPeriod(selectedPeriod, 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick status dropdown */}
          <select
            value={status}
            onChange={e => onUpdateStatus(e.target.value as StrategyStatus)}
            disabled={!isOwnerOrCM}
            className={`text-[11.5px] font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer transition-colors ${
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
        </div>

        {/* Main Scrolling Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 no-scrollbar">
          {loading ? (
            <div className="flex flex-col gap-3 py-6 items-center justify-center text-slate-400 text-[12.5px]">
              <div className="w-6 h-6 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin" />
              <span>Chargement de la stratégie...</span>
            </div>
          ) : !strategy ? (
            /* Empty State for this period */
            <div
              className={`p-5 rounded-xl border border-dashed text-center flex flex-col items-center gap-3 my-auto ${
                darkMode ? 'border-slate-700 bg-slate-900/40' : 'border-slate-300 bg-slate-50/70'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-[#1677FF] dark:text-[#38BDF8] flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[14px] font-extrabold m-0">Aucune stratégie pour {formatPeriodLabel(selectedPeriod)}</h3>
                <p className="text-[12px] text-slate-400 m-0 mt-1 max-w-[260px] mx-auto leading-relaxed">
                  Définissez les objectifs du mois, votre ligne éditoriale et vos KPIs de performance.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenFullModal}
                className="mt-1 px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-[#1266DF] text-white text-[12.5px] font-extrabold flex items-center gap-1.5 shadow-blue-glow transition-all cursor-pointer border-none"
              >
                <Plus className="w-4 h-4" />
                <span>Créer la stratégie</span>
              </button>
            </div>
          ) : (
            /* Populated Strategy Content */
            <>
              {/* 1. Objectif du Mois */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-card-subtle'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[#1677FF] dark:text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span>Focus Objectif</span>
                  </span>
                  <span className="text-[10.5px] text-slate-400 font-semibold">
                    {formatPeriodLabel(selectedPeriod)}
                  </span>
                </div>
                <p className="text-[13px] font-medium leading-snug m-0 text-slate-800 dark:text-slate-100">
                  {strategy.monthly_objective || 'Aucun objectif défini.'}
                </p>
              </div>

              {/* 2. KPIs de Performance */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col gap-2.5 ${
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-card-subtle'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>KPIs Clés</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {completedKPIs}/{kpis.length} atteints
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {kpis.length === 0 ? (
                    <span className="text-[12px] text-slate-400">Aucun KPI suivi pour ce mois.</span>
                  ) : (
                    kpis.slice(0, 4).map(k => {
                      const targetVal = Number(k.target) || 1
                      const currVal = Number(k.current) || 0
                      const pct = Math.min(Math.round((currVal / targetVal) * 100), 100)
                      const isComplete = currVal >= targetVal && targetVal > 0

                      return (
                        <div key={k.id} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="font-semibold truncate max-w-[170px]">{k.name}</span>
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              {currVal} / {k.target} {k.unit}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700/80 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 rounded-full ${
                                isComplete
                                  ? 'bg-emerald-500'
                                  : pct > 50
                                  ? 'bg-[#1677FF] dark:bg-[#38BDF8]'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* 3. Cible & Audience Visée */}
              {strategy.target_audience && (
                <div
                  className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${
                    darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-card-subtle'
                  }`}
                >
                  <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Cible Prioritaire</span>
                  </span>
                  <p className="text-[12.5px] text-slate-600 dark:text-slate-300 leading-snug m-0">
                    {strategy.target_audience}
                  </p>
                </div>
              )}

              {/* 4. Ligne Éditoriale & Plateformes */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col gap-2.5 ${
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-card-subtle'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Ligne Éditoriale</span>
                  </span>
                  {editorialLine?.tone && (
                    <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                      {editorialLine.tone}
                    </span>
                  )}
                </div>

                {/* Priority platforms pill tags */}
                {priorities.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {priorities.slice(0, 3).map(p => (
                      <div
                        key={p.platform}
                        className={`px-2.5 py-1.5 rounded-lg text-[11.5px] flex items-center justify-between gap-2 ${
                          darkMode ? 'bg-slate-800/80 text-slate-200' : 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <PlatformIcon platform={p.platform} size={14} />
                          <span className="font-bold capitalize">{p.platform}</span>
                          <span className="text-slate-400 dark:text-slate-500 truncate">· {p.content_type}</span>
                        </div>
                        {p.frequency && (
                          <span className="text-[10px] font-bold text-[#1677FF] dark:text-[#38BDF8] shrink-0">
                            {p.frequency}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[12px] text-slate-400">Aucune priorité réseau configurée.</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Bottom Actions Footer */}
        <div
          className={`p-4 border-t flex flex-col gap-2 shrink-0 ${
            darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-slate-50/90'
          }`}
        >
          <button
            type="button"
            onClick={onOpenFullModal}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1677FF] hover:bg-[#1266DF] text-white text-[13px] font-extrabold flex items-center justify-center gap-2 shadow-blue-glow transition-all cursor-pointer border-none"
          >
            <span>Vue complète & Édition</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </div>
  )
}

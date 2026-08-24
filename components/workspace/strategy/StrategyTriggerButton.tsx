'use client'

import React from 'react'
import { Compass, Target, Sparkles, ChevronRight } from 'lucide-react'
import { useTheme } from '@/components/context/ThemeContext'
import { formatPeriodLabel } from '@/hooks/useStrategy'
import type { Strategy, StrategyStatus } from '@/types'

interface StrategyTriggerButtonProps {
  onClick: () => void
  strategy: Strategy | null
  selectedPeriod: string
}

export function StrategyTriggerButton({
  onClick,
  strategy,
  selectedPeriod
}: StrategyTriggerButtonProps) {
  const { darkMode } = useTheme()
  const status: StrategyStatus = strategy?.status || 'to_review'

  return (
    <button
      type="button"
      onClick={onClick}
      title="Ouvrir le panneau Stratégie de Marque"
      className={`fixed right-4 md:right-8 bottom-20 md:bottom-6 z-40 flex items-center gap-2.5 px-3.5 py-2.5 rounded-full shadow-lg border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer select-none group ${
        darkMode
          ? 'bg-[#1E293B]/90 hover:bg-[#1E293B] border-slate-700/80 text-white backdrop-blur-md shadow-black/40'
          : 'bg-white/95 hover:bg-white border-slate-200/90 text-slate-800 backdrop-blur-md shadow-slate-200/80'
      }`}
    >
      <div className="w-6 h-6 rounded-full bg-[#1677FF] text-white flex items-center justify-center shrink-0 shadow-xs">
        <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300" />
      </div>

      <div className="flex flex-col text-left leading-none">
        <div className="flex items-center gap-1.5">
          <span className="text-[12.5px] font-extrabold tracking-tight">Stratégie</span>
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              status === 'up_to_date'
                ? 'bg-emerald-500'
                : status === 'to_review'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-slate-400'
            }`}
          />
        </div>
        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
          {formatPeriodLabel(selectedPeriod)}
        </span>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform ml-0.5" />
    </button>
  )
}

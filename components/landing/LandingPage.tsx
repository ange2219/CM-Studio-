'use client'

import React, { useState, useEffect } from 'react'
import { LandingPageV1 } from './LandingPageV1'
import { LandingPageV2 } from './LandingPageV2'
import { LandingPageV3 } from './LandingPageV3'
import { Sparkles, Layers, Eye, Zap } from 'lucide-react'

export function LandingPage() {
  // Par défaut sur la Version 2 avec l'animation de cartes intégrée
  const [version, setVersion] = useState<'v1' | 'v2' | 'v3'>('v2')

  useEffect(() => {
    // Permet de forcer une version via l'URL (ex: ?v=3, ?v=2 ou ?v=1)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const v = params.get('v') || params.get('version')
      if (v === '3' || v === 'v3') {
        setVersion('v3')
      } else if (v === '2' || v === 'v2') {
        setVersion('v2')
      } else if (v === '1' || v === 'v1') {
        setVersion('v1')
      }
    }
  }, [])

  return (
    <div className="relative">
      {/* ── Switcher flottant discret pour basculer facilement entre les 3 versions ── */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl">
        <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 hidden sm:flex items-center gap-1.5 border-r border-slate-700">
          <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Aperçu :</span>
        </div>

        <button
          onClick={() => setVersion('v1')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            version === 'v1'
              ? 'bg-[#1677FF] text-white shadow-md shadow-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>V1 (Précédente)</span>
        </button>

        <button
          onClick={() => setVersion('v2')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            version === 'v2'
              ? 'bg-[#1677FF] text-white shadow-md shadow-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>V2 (Mode Sombre)</span>
        </button>

        <button
          onClick={() => setVersion('v3')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            version === 'v3'
              ? 'bg-[#1677FF] text-white shadow-md shadow-blue-500/30 font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Zap className="w-3 h-3 text-amber-300" />
          <span>V3 (Animée)</span>
        </button>
      </div>

      {/* Rendu de la version sélectionnée */}
      {version === 'v1' && <LandingPageV1 />}
      {version === 'v2' && <LandingPageV2 />}
      {version === 'v3' && <LandingPageV3 />}
    </div>
  )
}




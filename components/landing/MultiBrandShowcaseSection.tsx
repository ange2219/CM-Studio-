'use client'

import React from 'react'
import { Building2, CheckCircle2, Layers, ShieldCheck, Zap } from 'lucide-react'

export function MultiBrandShowcaseSection() {
  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        {/* Left: Text & Key Arguments */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-[#1677FF] mb-3 border border-blue-200/80">
            <Building2 className="w-3.5 h-3.5" />
            <span>Multi-Organisations &amp; Clients</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight mb-4">
            Gérez 5 à 10 marques sans jamais mélanger leurs voix.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
            Chaque organisation possède son propre centre de création (Nouveau post, Calendrier, Analytique, Inspiration) avec ses personas cibles et ses règles éditoriales strictement isolées.
          </p>

          <div className="space-y-3.5 text-xs sm:text-sm text-slate-700">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <span><strong>Cloisonnement total :</strong> Les historiques et tonalités de la marque A ne croisent jamais la marque B.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <span><strong>Sélecteur 1-clic :</strong> Basculez instantanément entre vos clients depuis l'en-tête.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <span><strong>Vue Posts récents :</strong> Suivez les visuels et statuts de chaque canal d'un coup d'œil.</span>
            </div>
          </div>
        </div>

        {/* Right: Real App Screenshot */}
        <div className="relative rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden p-2 sm:p-2.5">
          <div className="h-8 px-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            </div>
            <div className="text-[10px] font-mono text-slate-300">
              app.cmstudio.ai/workspace
            </div>
            <div className="text-[9px] font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800/50">
              Organisation : Horizon
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-slate-800 aspect-[16/10] bg-slate-900">
            <img
              src="/images/real-app/app_workspace.png"
              alt="CM Studio - Centre de création Workspace et gestion multi-organisations"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

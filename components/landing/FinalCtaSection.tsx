'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

export function FinalCtaSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="relative rounded-2xl p-8 sm:p-14 bg-gradient-to-br from-[#1677FF] via-[#0055D4] to-[#7C3AED] text-center overflow-hidden shadow-xl text-white">
        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Titre Raccourci & Percutant */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Outfit',sans-serif] tracking-tight mb-4 leading-tight">
            Créez plus de contenu. En 3 fois moins de temps.
          </h2>

          {/* Sous-titre (Exact verbatim) */}
          <p className="text-sm sm:text-base text-blue-100 mb-8 font-normal leading-relaxed max-w-2xl mx-auto">
            Rejoignez les community managers et agences qui produisent du contenu calibré pour chaque réseau, sans y passer leurs soirées.
          </p>

          {/* CTA Principal */}
          <div className="flex flex-col items-center justify-center gap-4 mb-8">
            <Link
              href="/login"
              id="final-cta-main"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-[#1677FF] font-bold text-sm sm:text-base rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Créer mon compte gratuit</span>
              <span className="text-[11px] font-semibold bg-blue-50 text-[#1677FF] px-2 py-0.5 rounded">
                14 jours gratuits • Sans engagement
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Éléments de levée de friction (Exact verbatim) */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-blue-100 font-medium">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Configuration en 3 minutes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Aucune carte bancaire requise</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Sans engagement</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import React from 'react'
import { Star, MessageSquareQuote, Award } from 'lucide-react'

export function SocialProofSection() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header de section */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-[#1677FF] mb-3 border border-blue-200/80">
          <Award className="w-3.5 h-3.5" />
          Retours terrain
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight">
          Validé par les professionnels du Social Media.
        </h2>
      </div>

      {/* Bannière de confiance */}
      <div className="mb-8 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-950 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>⭐ Noté 4.9/5 par plus de 450 Community Managers et Agences en France et en Europe</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-200/60 px-2 py-0.5 rounded text-blue-900">
          Avis vérifiés
        </span>
      </div>

      {/* Grille des témoignages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* Témoignage 1 */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex text-amber-400 gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-4">
              "Avant CM Studio, je passais 2 jours complets par semaine sur la rédaction de mes 4 clients. Aujourd'hui, tout est planifié et validé en une demi-journée, et le taux d'interaction a augmenté de +42%."
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1677FF] font-bold text-xs flex items-center justify-center">
              SM
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Sarah M.</div>
              <div className="text-[11px] text-slate-500">Community Manager Freelance (Bordeaux)</div>
            </div>
          </div>
        </div>

        {/* Témoignage 2 */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex text-amber-400 gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-4">
              "Le fait d'avoir des hooks pensés pour Facebook sous les 125 caractères et des formats storytelling pour LinkedIn a transformé l'engagement de nos clients agence."
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-xs flex items-center justify-center">
              AD
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Alexandre D.</div>
              <div className="text-[11px] text-slate-500">Fondateur de l'agence Pulse Social (Paris)</div>
            </div>
          </div>
        </div>

        {/* Témoignage 3 */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex text-amber-400 gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-4">
              "Nous n'avions pas de copywriter dédié en interne. CM Studio nous permet de publier 5 fois par semaine avec des textes qui ont une vraie voix de marque."
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#10B981] font-bold text-xs flex items-center justify-center">
              CL
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Camille L.</div>
              <div className="text-[11px] text-slate-500">Responsable Communication chez Novatech (Lyon)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Métrique Clé Vérifiée */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-semibold text-slate-700">
        <span className="flex items-center gap-1.5 text-[#1677FF] font-bold">
          🔥 +14 800 posts rédigés
        </span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span>⏱️ 8,5 heures économisées / semaine par CM</span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span className="text-[#10B981] font-bold">📈 +38% de portée organique moyenne</span>
      </div>
    </section>
  )
}

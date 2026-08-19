'use client'

import React from 'react'
import { Quote, Sparkles } from 'lucide-react'

/**
 * Manifeste / Pourquoi nous avons créé CM Studio
 */
export function ManifestSection() {
  return (
    <section id="manifeste" className="py-16 sm:py-20 bg-transparent text-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-b from-[#13203A] to-[#0A1222] border border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Liseré lumineux */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#38BDF8] via-[#1677FF] to-[#8B5CF6]" />
          
          <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF8] uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Notre Histoire &amp; Manifeste</span>
          </div>

          <blockquote className="text-lg sm:text-xl lg:text-2xl font-['Outfit',sans-serif] font-bold text-slate-100 leading-snug mb-6">
            &ldquo;Nous étions à votre place : 12 onglets ouverts chaque lundi, des prompts ChatGPT génériques à réécrire, et des heures perdues le dimanche soir. On a créé CM Studio pour redonner le contrôle aux Community Managers.&rdquo;
          </blockquote>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
            <div className="w-10 h-10 rounded-full bg-[#1677FF] flex items-center justify-center font-black text-xs text-white shadow-md">
              CM
            </div>
            <div>
              <div className="text-sm font-bold text-white">L&#39;Équipe Fondatrice</div>
              <div className="text-xs text-slate-400">Anciens CMs &amp; Créateurs de contenu</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

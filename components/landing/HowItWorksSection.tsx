'use client'

import React from 'react'
import { Compass, FileText, Sparkles, ArrowRight } from 'lucide-react'

export function HowItWorksSection() {
  return (
    <section id="methode" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header de section */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-[#1677FF] mb-3 border border-blue-200/80">
          <Compass className="w-3.5 h-3.5" />
          Méthode
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight">
          De l'idée brute au post prêt à publier en 3 étapes guidées.
        </h2>
      </div>

      {/* Les 3 Étapes du Tunnel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        {/* Étape 1 */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all relative flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#1677FF] text-white font-black text-sm flex items-center justify-center mb-5 shadow-sm shadow-[#1677FF]/30">
              01
            </div>
            <div className="text-xs font-bold text-[#1677FF] uppercase tracking-wider mb-1">
              Étape 01 — Les Angles
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-2">
              L'IA extrait 3 à 5 angles stratégiques depuis vos piliers.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Vous ne partez jamais d'une feuille blanche. À partir de votre thématique du jour et des piliers de votre marque, CM Studio vous soumet plusieurs angles d'attaque : retour d'expérience, contre-intuitif, étude de cas ou conseil direct.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-[#1677FF]">
            <span>3 à 5 options au choix</span>
          </div>
        </div>

        {/* Étape 2 */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all relative flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#0284C7] text-white font-black text-sm flex items-center justify-center mb-5 shadow-sm shadow-[#0284C7]/30">
              02
            </div>
            <div className="text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-1">
              Étape 02 — Le Brief
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-2">
              Vous choisissez votre angle, nous structurons le brief.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pas de boîte de texte vide. L'outil génère un plan de message clair avec l'objectif du post, l'élément déclencheur et l'appel à l'action visé. Vous pouvez l'ajuster en 10 secondes ou le valider tel quel.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-[#0284C7]">
            <span>Plan structuré & modifiable</span>
          </div>
        </div>

        {/* Étape 3 */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all relative flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#10B981] text-white font-black text-sm flex items-center justify-center mb-5 shadow-sm shadow-[#10B981]/30">
              03
            </div>
            <div className="text-xs font-bold text-[#10B981] uppercase tracking-wider mb-1">
              Étape 03 — La Rédaction & le Visuel
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-2">
              Un texte taillé pour le réseau cible, dans le ton exact de la marque.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Choisissez parmi 5 tonalités (<em>Direct, Inspirant, Émotionnel, Humoristique, Professionnel</em>). CM Studio rédige le post en respectant les contraintes typographiques de la plateforme et génère l'image IA associée dans les dimensions natives.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
            <span>5 tonalités + Image IA native</span>
          </div>
        </div>
      </div>
    </section>
  )
}

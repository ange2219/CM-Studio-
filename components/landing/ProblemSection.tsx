'use client'

import React from 'react'
import { Layers, HelpCircle, BotOff, AlertTriangle } from 'lucide-react'

export function ProblemSection() {
  return (
    <section id="probleme" className="py-20 bg-slate-50/70 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-xs font-bold text-red-600 mb-3 border border-red-200/80">
            <AlertTriangle className="w-3.5 h-3.5" />
            Le quotidien du Community Management en 2026
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight">
            Créer du bon contenu prend trop de temps. Les outils actuels n'aident pas vraiment.
          </h2>
        </div>

        {/* 3 Blocs de douleur concrets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {/* Bloc 1 */}
          <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">
                La dispersion mentale permanente
              </h3>
              <p className="text-sm font-semibold text-slate-800 mb-2">
                4 onglets ouverts pour un seul post.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Vous commencez sur ChatGPT pour le brouillon, passez sur Canva pour le visuel, ouvrez Buffer ou Hootsuite pour planifier, puis validez sur WhatsApp avec votre client. Cette friction quotidienne vous fait perdre 8 à 12 heures chaque semaine.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-red-600">
              Perte moyenne : 10h/semaine
            </div>
          </div>

          {/* Bloc 2 */}
          <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">
                Le syndrome de la page blanche du lundi matin
              </h3>
              <p className="text-sm font-semibold text-slate-800 mb-2">
                Trouver 5 idées percutantes par semaine et par client.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Quand vous gérez 3, 5 ou 10 marques différentes, le réservoir d'inspiration s'épuise vite. Vous finissez par recycler les mêmes structures et publier par obligation plutôt que par stratégie.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-amber-600">
              Inspiration épuisée
            </div>
          </div>

          {/* Bloc 3 */}
          <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                <BotOff className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">
                L'illusion des générateurs IA génériques
              </h3>
              <p className="text-sm font-semibold text-slate-800 mb-2">
                Un post LinkedIn n'est pas un post Facebook raccourci.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Les outils de génération génériques produisent des textes fades, polis et immédiatement reconnaissables comme "générés par IA". Résultat : zéro portée organique, zéro commentaire, zéro conversion.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-700">
              0 engagement réel
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

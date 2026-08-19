'use client'

import React, { useState } from 'react'
import {
  Building2,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  Layers,
  Sliders,
  Calendar,
  MessageSquareShare
} from 'lucide-react'

export function FeaturesStickyShowcase() {
  const [activeFeature, setActiveFeature] = useState<number>(0)

  const items = [
    {
      id: 'workspace',
      tag: 'Multi-Organisations',
      title: 'Espaces clients 100% hermétiques',
      description:
        'Gérez 5 à 10 marques sans jamais mélanger leurs voix. Chaque organisation dispose de son propre centre de création, ses personas et ses règles éditoriales isolées.',
      icon: <Building2 className="w-4 h-4" />,
      color: 'text-[#1677FF] bg-blue-50 border-blue-200',
      activeColor: 'border-[#1677FF] bg-white shadow-md shadow-blue-500/5',
      image: '/images/real-app/app_workspace.png',
      urlPath: 'app.cmstudio.ai/workspace',
      badge: 'Organisation : Horizon',
      badgeColor: 'text-sky-400 bg-sky-950 border-sky-800/50',
      bullets: [
        'Cloisonnement strict des personas et tonalités',
        'Sélecteur 1-clic pour basculer de marque',
        'Centre de création complet (Posts, Calendrier, Analytique)',
      ],
    },
    {
      id: 'generator',
      tag: 'Copilote IA',
      title: 'Rédaction calibrée par réseau social',
      description:
        "Basculez entre LinkedIn, Facebook et TikTok avec un prompt engineering dédié. Vos textes respectent les coupures d'affichage natives et intègrent l'image IA sans logiciel tiers.",
      icon: <Sparkles className="w-4 h-4" />,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      activeColor: 'border-purple-600 bg-white shadow-md shadow-purple-500/5',
      image: '/images/real-app/app_generator.png',
      urlPath: 'app.cmstudio.ai/generator',
      badge: 'Prêt pour publication',
      badgeColor: 'text-[#38BDF8] bg-sky-950 border-sky-800/60',
      bullets: [
        '5 tons éditoriaux étanches (Direct, Inspirant, PAS...)',
        'Hooks < 125 caractères pour forcer le clic',
        'Génération de visuels IA aux formats natifs',
      ],
    },
    {
      id: 'community',
      tag: 'Réseau Professionnel',
      title: 'Le Hub d’entraide entre Community Managers',
      description:
        'Ne créez plus isolé. Partagez vos meilleurs templates de posts, testez des hooks et restez alerté en direct des évolutions d’algorithmes par vos pairs.',
      icon: <Users className="w-4 h-4" />,
      color: 'text-[#10B981] bg-emerald-50 border-emerald-200',
      activeColor: 'border-[#10B981] bg-white shadow-md shadow-emerald-500/5',
      image: '/images/real-app/app_community.png',
      urlPath: 'app.cmstudio.ai/community',
      badge: '28 membres actifs',
      badgeColor: 'text-emerald-400 bg-emerald-950 border-emerald-800/50',
      bullets: [
        'Feed d’échange et partage de prompts vérifiés',
        'Veille algorithmique continue (LinkedIn, Meta, TikTok)',
        'Réseau professionnel de CMs et créateurs actifs',
      ],
    },
  ]

  const current = items[activeFeature]

  return (
    <section id="plateforme" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header de section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-[#1677FF] mb-3 border border-blue-200/80">
          <Layers className="w-3.5 h-3.5" />
          <span>Plateforme &amp; Studio</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight">
          Tout votre écosystème réuni en un seul endroit.
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Cliquez sur une fonctionnalité pour explorer l'interface en direct :
        </p>
      </div>

      {/* Layout Scrollytelling / Sticky Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* ── Colonne Gauche : Paragraphes / Cartes de sélection ── */}
        <div className="lg:col-span-5 space-y-3.5">
          {items.map((item, idx) => {
            const isActive = activeFeature === idx
            return (
              <div
                key={item.id}
                onClick={() => setActiveFeature(idx)}
                className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer text-left ${
                  isActive
                    ? `${item.activeColor} border-l-4`
                    : 'bg-white/80 hover:bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${item.color}`}>
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {item.tag}
                    </span>
                  </div>
                  {isActive && (
                    <span className="flex h-2 w-2 rounded-full bg-[#1677FF] animate-pulse" />
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] mb-1.5 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                  {item.description}
                </p>

                {isActive && (
                  <div className="space-y-1.5 pt-2.5 border-t border-slate-100 text-xs text-slate-700">
                    {item.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Colonne Droite : Fenêtre Sticky avec Image Nette & Stable (Modèle Audira) ── */}
        <div className="lg:col-span-7 lg:sticky lg:top-24">
          <div className="relative rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden p-2 sm:p-3">
            {/* Barre de contrôle supérieure native */}
            <div className="h-9 px-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              </div>
              <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                {current.urlPath}
              </div>
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${current.badgeColor}`}>
                {current.badge}
              </div>
            </div>

            {/* Cadre de l'image (Image fixe, nette, sans animation parasite) */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 aspect-[16/10] bg-slate-950">
              <img
                key={current.image}
                src={current.image}
                alt={current.title}
                className="w-full h-full object-cover object-top transition-opacity duration-300"
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-700 shadow-sm">
                <span className="font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1677FF]" />
                  <strong>Vue active :</strong> {current.title}
                </span>
                <span className="text-[11px] font-bold text-[#38BDF8]">
                  CM Studio v2.4
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

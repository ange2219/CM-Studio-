'use client'

import React, { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Compass,
  Sparkles,
  Sliders,
  Calendar,
  FolderKanban,
  Image as ImageIcon,
  MessageSquareShare,
} from 'lucide-react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function MethodFeaturesCompact() {
  const sectionRef = useRef<HTMLElement>(null)

  const steps = [
    {
      num: '01',
      badge: 'Étape 01 — Les Angles',
      title: "L'IA extrait 3 à 5 angles stratégiques depuis vos piliers",
      desc: "Vous ne partez jamais d'une feuille blanche. À partir de votre thématique du jour, CM Studio vous soumet plusieurs angles d'attaque (retour d'expérience, contre-intuitif, étude de cas ou conseil direct).",
      features: [
        { icon: <Sparkles className="w-3.5 h-3.5 text-[#1677FF]" />, label: 'Prompt Engineering multi-plateforme' },
        { icon: <MessageSquareShare className="w-3.5 h-3.5 text-rose-600" />, label: 'Hub communautaire CMs' },
      ],
      numBg: 'bg-[#1677FF] text-white',
    },
    {
      num: '02',
      badge: 'Étape 02 — Le Brief',
      title: 'Vous choisissez votre angle, nous structurons le brief',
      desc: "Pas de boîte de texte vide. L'outil génère un plan de message clair avec l'objectif du post, l'élément déclencheur et l'appel à l'action. Modifiable en 10 secondes ou validable tel quel.",
      features: [
        { icon: <Sliders className="w-3.5 h-3.5 text-purple-600" />, label: '5 Tons éditoriaux étanches' },
        { icon: <FolderKanban className="w-3.5 h-3.5 text-[#0284C7]" />, label: 'Espaces multi-marques isolés' },
      ],
      numBg: 'bg-[#0284C7] text-white',
    },
    {
      num: '03',
      badge: 'Étape 03 — Rédaction & Visuel',
      title: 'Texte taillé pour le réseau cible & Visuel IA natif',
      desc: 'Rédaction selon les contraintes typographiques réelles (LinkedIn, FB, TikTok) et génération du visuel IA associé aux dimensions natives.',
      features: [
        { icon: <ImageIcon className="w-3.5 h-3.5 text-[#F59E0B]" />, label: "Générateur d'images IA intégré" },
        { icon: <Calendar className="w-3.5 h-3.5 text-[#10B981]" />, label: 'Planning de publication interactif' },
      ],
      numBg: 'bg-[#10B981] text-white',
    },
  ]

  useGSAP(() => {
    if (!sectionRef.current) return

    // Header
    gsap.from('.method-header', {
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 82%',
        once: true,
      },
    })

    // Les 3 cartes en stagger — comme les services du portfolio
    gsap.from('.method-card', {
      y: 50,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.method-grid',
        start: 'top 80%',
        once: true,
      },
    })

    // Numéros des cartes — effect "pop" avec back.out
    gsap.from('.method-num', {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      stagger: 0.15,
      ease: 'back.out(1.7)',
      delay: 0.3,
      scrollTrigger: {
        trigger: '.method-grid',
        start: 'top 80%',
        once: true,
      },
    })

  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="methode" className="py-14 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="method-header text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-[#1677FF] mb-3 border border-blue-200/80">
          <Compass className="w-3.5 h-3.5" />
          La Méthode Guidée
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight">
          De l'idée brute au post prêt à publier en 3 étapes.
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Tous les modules nécessaires intégrés dans un tunnel de création fluide.
        </p>
      </div>

      {/* 3 Cartes Étape */}
      <div className="method-grid grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="method-card p-5 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className={`method-num w-8 h-8 rounded-lg ${step.numBg} font-black text-xs flex items-center justify-center shadow-xs`}>
                  {step.num}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {step.badge}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] mb-2 leading-snug">
                {step.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {step.desc}
              </p>
            </div>

            {/* Modules natifs */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Fonctionnalités intégrées :
              </div>
              {step.features.map((feat, fIdx) => (
                <div
                  key={fIdx}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800"
                >
                  {feat.icon}
                  <span className="text-[11px]">{feat.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

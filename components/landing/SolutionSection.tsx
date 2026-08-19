'use client'

import React, { useEffect, useRef } from 'react'
import {
  AlertTriangle,
  HelpCircle,
  BotOff,
  Compass,
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function SolutionSection({ hideSteps = false }: { hideSteps?: boolean }) {
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const cardLeftRef = useRef<HTMLDivElement>(null)
  const cardCenterRef = useRef<HTMLDivElement>(null)
  const cardRightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // ── Animation 100% IDENTIQUE et SYNCHRONE pour les 3 cartes ──
      mm.add('(min-width: 768px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: cardsContainerRef.current,
            start: 'top 95%',
            end: 'top 55%',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })

        // Les 3 cartes montent exactement de la même manière depuis le bas
        const cards = [cardLeftRef.current, cardCenterRef.current, cardRightRef.current].filter(Boolean)
        cards.forEach((card) => {
          tl.fromTo(
            card,
            { y: 60, opacity: 0, scale: 0.96 },
            { y: 0, opacity: 1, scale: 1, ease: 'none' },
            0
          )
        })
      })

      // ── MOBILE : Animation identique ──
      mm.add('(max-width: 767px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: cardsContainerRef.current,
            start: 'top 95%',
            end: 'top 60%',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })

        const cards = [cardLeftRef.current, cardCenterRef.current, cardRightRef.current].filter(Boolean)
        cards.forEach((card) => {
          tl.fromTo(
            card,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, ease: 'none' },
            0
          )
        })
      })
    }, cardsContainerRef)

    ScrollTrigger.refresh()

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section id="solution" className={`${hideSteps ? 'pt-16 pb-4 sm:pt-20 sm:pb-6' : 'py-16 sm:py-20'} bg-[#0D1527] overflow-hidden`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${hideSteps ? '' : 'space-y-16'}`}>

        {/* ── 1. LE PROBLÈME (Pourquoi la méthode actuelle est cassée) ── */}
        <div id="probleme" className="scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-xs font-bold text-red-400 mb-3 border border-red-500/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>VOS DEFIES, NOS SOLUTIONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Outfit',sans-serif] text-white tracking-tight leading-tight">
              La création de contenu classique est{' '}
              <span className="text-[#38BDF8] relative inline-block whitespace-nowrap">
                cassée.
                <svg
                  className="absolute -bottom-2 left-0 w-full text-[#38BDF8]/60"
                  viewBox="0 0 100 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 5.5C30 2 70 2 99 5.5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
          </div>

          <div
            ref={cardsContainerRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Carte 1 — Dispersion des outils */}
            <div
              ref={cardLeftRef}
              className="relative p-5 sm:p-6 rounded-xl bg-gradient-to-b from-[#111C33] to-[#0A1222] border border-slate-800/90 hover:border-[#EF4444]/50 shadow-xl hover:shadow-[0_12px_28px_rgba(239,68,68,0.15)] transition-all duration-300 flex flex-col justify-between will-change-transform group overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-[#EF4444] before:via-[#FB7185] before:to-transparent"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#F87171] flex items-center justify-center mb-3 shadow-inner">
                  <AlertTriangle className="w-4 h-4 text-[#F87171]" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug group-hover:text-[#FCA5A5] transition-colors">
                  La dispersion mentale des outils
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Basculer entre ChatGPT pour le texte, Canva pour le visuel et un tableur pour le planning vous fait perdre 8 à 12h chaque semaine.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-bold text-[#F87171] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                <span className="text-[#F87171]">Perte de 8 à 12h / semaine</span>
              </div>
            </div>

            {/* Carte 2 — Page blanche */}
            <div
              ref={cardCenterRef}
              className="relative p-5 sm:p-6 rounded-xl bg-gradient-to-b from-[#111C33] to-[#0A1222] border border-slate-800/90 hover:border-[#F59E0B]/50 shadow-xl hover:shadow-[0_12px_28px_rgba(245,158,11,0.15)] transition-all duration-300 flex flex-col justify-between will-change-transform group overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-[#F59E0B] before:via-[#FCD34D] before:to-transparent"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#FBBF24] flex items-center justify-center mb-3 shadow-inner">
                  <HelpCircle className="w-4 h-4 text-[#FBBF24]" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug group-hover:text-[#FDE68A] transition-colors">
                  L&#39;angoisse de la page blanche
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Réinventer des idées pertinentes chaque lundi pour plusieurs marques épuise votre créativité et retarde vos publications.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-bold text-[#FBBF24] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                <span className="text-[#FBBF24]">Fatigue décisionnelle</span>
              </div>
            </div>

            {/* Carte 3 — Textes IA sans âme */}
            <div
              ref={cardRightRef}
              className="relative p-5 sm:p-6 rounded-xl bg-gradient-to-b from-[#111C33] to-[#0A1222] border border-slate-800/90 hover:border-[#8B5CF6]/50 shadow-xl hover:shadow-[0_12px_28px_rgba(139,92,246,0.15)] transition-all duration-300 flex flex-col justify-between will-change-transform group overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-[#8B5CF6] before:via-[#C4B5FD] before:to-transparent"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#A78BFA] flex items-center justify-center mb-3 shadow-inner">
                  <BotOff className="w-4 h-4 text-[#A78BFA]" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug group-hover:text-[#DDD6FE] transition-colors">
                  Les textes IA sans âme
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Les prompts génériques produisent des posts clichés, remplis d&#39;émojis superflus, ignorés par les algorithmes et vos abonnés.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-bold text-[#A78BFA] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
                <span className="text-[#A78BFA]">0 engagement généré</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. LA MÉTHODE EN 3 ÉTAPES GUIDÉES (masquée en V2/V3) ── */}
        {!hideSteps && (
          <div id="methode" className="scroll-mt-24 pt-6">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-xs font-bold text-blue-400 mb-3 border border-blue-500/30">
                <Compass className="w-3.5 h-3.5" />
                <span>La Méthode CM Studio</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-white tracking-tight">
                Du brief au post prêt en 3 étapes.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Étape 1 */}
              <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-blue-500/40 shadow-xl transition-all flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#1677FF] text-white font-black text-xs flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
                    01
                  </div>
                  <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                    Étape 01 — Les Angles
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug">
                    Extraction d&#39;angles
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    À partir de votre thématique du jour, CM Studio vous propose des angles d&#39;attaque précis : retour d&#39;expérience, contre-intuitif, étude de cas ou conseil direct.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-blue-400">
                  ✓ 3 à 5 options au choix
                </div>
              </div>

              {/* Étape 2 */}
              <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-sky-500/40 shadow-xl transition-all flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#0284C7] text-white font-black text-xs flex items-center justify-center mb-3 shadow-md shadow-sky-500/20">
                    02
                  </div>
                  <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-1">
                    Étape 02 — Le Brief
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug">
                    Structuration automatique du brief
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    L&#39;outil génère un plan de message clair avec l&#39;objectif du post, l&#39;élément déclencheur et l&#39;appel à l&#39;action. Modifiable en 10 secondes ou validable tel quel.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-sky-400">
                  ✓ Plan structuré &amp; 100% modifiable
                </div>
              </div>

              {/* Étape 3 */}
              <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-emerald-500/40 shadow-xl transition-all flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#10B981] text-white font-black text-xs flex items-center justify-center mb-3 shadow-md shadow-emerald-500/20">
                    03
                  </div>
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    Étape 03 — Rédaction &amp; Visuel
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug">
                    Rédaction ciblée &amp; Visuel IA
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Choisissez parmi 5 tonalités. CM Studio rédige le post en respectant les normes de coupure d&#39;affichage et génère l&#39;image IA associée aux dimensions natives.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-emerald-400">
                  ✓ 5 tons + Image IA intégrée
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

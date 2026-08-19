'use client'

import React, { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Section Étapes en Stacking Réconcilié & Sans Bug :
 * - Le header "Du brief au post prêt en 3 étapes" est visible naturellement.
 * - Dès que le conteneur des cartes atteint la Navbar (top: 64px), il se pinne sans aucun saut.
 * - Carte 02 monte et se cale au 2ème tiers.
 * - Carte 03 monte et se cale au 3ème tiers.
 * - Les 3 cartes restent unies et défilent ensemble de manière continue et fluide.
 */
export function StickyStepsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const pinContainerRef = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)
  const card3Ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!pinContainerRef.current || !card2Ref.current || !card3Ref.current) return

    // Position initiale des cartes 2 et 3 en dessous de l'écran
    gsap.set(card2Ref.current, { y: '100%' })
    gsap.set(card3Ref.current, { y: '100%' })

    // Timeline ScrollTrigger fluide 1:1 direct
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinContainerRef.current,
        start: 'top 64px',
        end: '+=160%',
        pin: true,
        pinSpacing: true,
        scrub: true,
        invalidateOnRefresh: true,
      },
    })

    // 1. Carte 02 monte et s'arrête exactement à 1/3 de la hauteur utile
    tl.to(card2Ref.current, {
      y: () => {
        const availableHeight = window.innerHeight - 64
        return availableHeight / 3
      },
      ease: 'none',
      duration: 1,
    })

    // 2. Carte 03 monte et s'arrête exactement à 2/3 de la hauteur utile
    tl.to(card3Ref.current, {
      y: () => {
        const availableHeight = window.innerHeight - 64
        return (availableHeight * 2) / 3
      },
      ease: 'none',
      duration: 1,
    })

    // Recalcul dynamique immédiat pour s'adapter à toute section ajoutée au-dessus
    ScrollTrigger.refresh()
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="methode" className="relative w-full bg-[#0D1527]">
      
      {/* ─── Header Introductif (Compact & Dense) ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-6 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Outfit',sans-serif] text-white tracking-tight leading-tight">
          Du brief au post prêt en{' '}
          <span className="text-[#38BDF8] relative inline-block whitespace-nowrap">
            3 étapes.
            <svg
              className="absolute -bottom-2 left-0 w-full text-[#38BDF8]/60"
              viewBox="0 0 120 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 5.5C35 2 85 2 119 5.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-slate-300 mt-4 max-w-2xl mx-auto leading-relaxed font-normal">
          Une méthode claire, complète et pensée pour les Community Managers qui veulent aller plus vite et obtenir de meilleurs résultats.
        </p>
      </div>

      {/* ── Conteneur Pinned (Hauteur utile exacte : 100vh - 64px) ── */}
      <div
        ref={pinContainerRef}
        className="relative w-full h-[calc(100vh-64px)] overflow-hidden"
      >

        {/* ─── CARTE 01 : Inspiration & ADN de marque (#0F172A - Base Ardoise Profonde) ─── */}
        <div className="absolute top-0 left-0 w-full h-full z-10 bg-[#0F172A] text-white flex flex-col justify-start">
          <div className="h-[calc((100vh-64px)/3)] flex items-center px-4 sm:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-14 items-center">
                
                {/* Gauche : Badge Style Filigrane "01 / ÉTAPE 1" + Titre 2 Lignes */}
                <div className="md:col-span-6 flex items-center gap-4 sm:gap-6">
                  <div className="relative flex items-center justify-center shrink-0 w-24 sm:w-28 h-16 sm:h-20 select-none">
                    <span className="absolute inset-0 flex items-center justify-center font-['Outfit',sans-serif] font-black text-6xl sm:text-7xl text-white/10 tracking-tighter">
                      01
                    </span>
                    <span className="relative z-10 font-mono font-black text-[11px] sm:text-xs text-[#38BDF8] tracking-[0.25em] uppercase text-center">
                      ÉTAPE 1
                    </span>
                  </div>

                  <div>
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-['Outfit',sans-serif] font-black tracking-tight text-white leading-[1.08]">
                      <span className="block">Inspiration &amp;</span>
                      <span className="block">ADN de marque</span>
                    </h3>
                  </div>
                </div>

                {/* Droite : Description Aérée (Max 3 lignes) */}
                <div className="md:col-span-6 flex flex-col justify-center">
                  <p className="text-sm sm:text-base lg:text-[17px] text-slate-300 leading-relaxed max-w-xl line-clamp-3">
                    L&#39;IA analyse les tendances du moment et l&#39;ADN de votre marque pour générer 5 angles percutants. Fini la page blanche : choisissez la meilleure idée en un clic.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ─── CARTE 02 : Le Brief (#18263E - Ardoise Bleue Surélevée) ─── */}
        <div
          ref={card2Ref}
          className="absolute top-0 left-0 w-full h-full z-20 bg-[#18263E] text-white flex flex-col justify-start shadow-[0_-16px_36px_rgba(0,0,0,0.35)]"
          style={{ willChange: 'transform' }}
        >
          <div className="h-[calc((100vh-64px)/3)] flex items-center px-4 sm:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-14 items-center">
                
                {/* Gauche : Badge Style Filigrane "02 / ÉTAPE 2" + Titre 2 Lignes */}
                <div className="md:col-span-6 flex items-center gap-4 sm:gap-6">
                  <div className="relative flex items-center justify-center shrink-0 w-24 sm:w-28 h-16 sm:h-20 select-none">
                    <span className="absolute inset-0 flex items-center justify-center font-['Outfit',sans-serif] font-black text-6xl sm:text-7xl text-white/10 tracking-tighter">
                      02
                    </span>
                    <span className="relative z-10 font-mono font-black text-[11px] sm:text-xs text-[#60A5FA] tracking-[0.25em] uppercase text-center">
                      ÉTAPE 2
                    </span>
                  </div>

                  <div>
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-['Outfit',sans-serif] font-black tracking-tight text-white leading-[1.08]">
                      <span className="block">Structuration</span>
                      <span className="block">automatique</span>
                    </h3>
                  </div>
                </div>

                {/* Droite : Description Aérée (Max 3 lignes) */}
                <div className="md:col-span-6 flex flex-col justify-center">
                  <p className="text-sm sm:text-base lg:text-[17px] text-slate-200 leading-relaxed max-w-xl line-clamp-3">
                    Structurez instantanément un message optimisé avec accroche, valeur et appel à l&#39;action. Modifiable en 10 secondes et hermétiquement cloisonné par marque.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ─── CARTE 03 : Rédaction & Visuel (#223452 - Bleu Acier Lumineux) ─── */}
        <div
          ref={card3Ref}
          className="absolute top-0 left-0 w-full h-full z-30 bg-[#223452] text-white flex flex-col justify-start shadow-[0_-16px_36px_rgba(0,0,0,0.45)]"
          style={{ willChange: 'transform' }}
        >
          <div className="h-[calc((100vh-64px)/3)] flex items-center px-4 sm:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-14 items-center">
                
                {/* Gauche : Badge Style Filigrane "03 / ÉTAPE 3" + Titre 2 Lignes */}
                <div className="md:col-span-6 flex items-center gap-4 sm:gap-6">
                  <div className="relative flex items-center justify-center shrink-0 w-24 sm:w-28 h-16 sm:h-20 select-none">
                    <span className="absolute inset-0 flex items-center justify-center font-['Outfit',sans-serif] font-black text-6xl sm:text-7xl text-white/10 tracking-tighter">
                      03
                    </span>
                    <span className="relative z-10 font-mono font-black text-[11px] sm:text-xs text-[#38BDF8] tracking-[0.25em] uppercase text-center">
                      ÉTAPE 3
                    </span>
                  </div>

                  <div>
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-['Outfit',sans-serif] font-black tracking-tight text-white leading-[1.08]">
                      <span className="block">Rédaction ciblée</span>
                      <span className="block">&amp; Visuel IA</span>
                    </h3>
                  </div>
                </div>

                {/* Droite : Description Aérée (Max 3 lignes) */}
                <div className="md:col-span-6 flex flex-col justify-center">
                  <p className="text-sm sm:text-base lg:text-[17px] text-slate-100 font-normal leading-relaxed max-w-xl line-clamp-3">
                    Rédigez aux normes d&#39;affichage de chaque réseau (LinkedIn, TikTok, Meta) et générez le visuel IA associé, immédiatement prêt à être publié.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

    </section>
  )
}

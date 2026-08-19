'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Sparkles, Zap, TrendingUp } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const ROTATING_VERBS = [
  { text: "Générez", tracking: "0.05em" },
  { text: "Concevez", tracking: "normal" },
  { text: "Rédigez", tracking: "0.05em" },
  { text: "Planifiez", tracking: "normal" },
  { text: "Propulsez", tracking: "normal" },
  { text: "Optimisez", tracking: "normal" }
]

export function HeroSection() {
  const heroSectionRef = useRef<HTMLElement>(null)
  const bgImageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [verbIndex, setVerbIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setVerbIndex((prev) => (prev + 1) % ROTATING_VERBS.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Parallaxe de l'image de fond (se déplace plus lentement pour créer de la profondeur)
      if (bgImageRef.current && heroSectionRef.current) {
        gsap.to(bgImageRef.current, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        })
      }

      // 2. Parallaxe du contenu textuel (glisse légèrement vers le haut avec estompage doux)
      if (contentRef.current && heroSectionRef.current) {
        gsap.to(contentRef.current, {
          y: -35,
          opacity: 0.85,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        })
      }
    }, heroSectionRef)

    ScrollTrigger.refresh()

    return () => {
      ctx.revert()
    }
  }, [])

  const currentVerb = ROTATING_VERBS[verbIndex % ROTATING_VERBS.length]

  return (
    <section
      ref={heroSectionRef}
      className="relative min-h-screen w-full flex flex-col justify-start items-center pt-16 sm:pt-20 pb-10 px-4 sm:px-6 lg:px-8 text-center overflow-hidden"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes heroVerbFluidUp {
          0% {
            transform: translateY(105%);
            opacity: 0;
            filter: blur(4px);
          }
          100% {
            transform: translateY(0);
            opacity: 1;
            filter: blur(0px);
          }
        }
        .hero-verb-animated {
          display: inline-block;
          animation: heroVerbFluidUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      ` }} />

      {/* ── Image de Fond Immersive Intégrale (Studio Desk 3 Écrans & Réseaux Sociaux) ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none -z-20 overflow-hidden select-none">
        <div ref={bgImageRef} className="w-full h-full will-change-transform relative">
          <img
            src="/images/hero-setup-bg.jpg?v=2"
            alt="CM Studio Setup Workspace"
            className="w-full h-full object-cover object-center"
          />
        </div>
        {/* Fondu très bas, uniquement sur l'extrême bord inférieur */}
        <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-t from-[#0D1527] via-[#0D1527]/60 to-transparent pointer-events-none" />
      </div>

      {/* ── Contenu du Hero (Remonté vers le haut) ── */}
      <div ref={contentRef} className="will-change-transform max-w-3xl lg:max-w-4xl mx-auto z-10 pt-0 sm:pt-1">
        {/* Surtitre / Badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50/95 backdrop-blur-md border border-blue-200/90 text-xs sm:text-sm font-bold text-[#1677FF] mb-7 sm:mb-8 shadow-sm">
          <span>Le studio pour Community Managers</span>
        </div>

        {/* Titre Principal Net & Dégradé */}
        <h1 className="text-2xl sm:text-4xl lg:text-[2.65rem] font-extrabold font-['Outfit',sans-serif] tracking-tight text-slate-900 mx-auto leading-[1.22] mb-7 sm:mb-8 max-w-2xl lg:max-w-3xl">
          <span className="inline-flex items-center justify-end overflow-hidden h-[1.25em] align-middle w-[110px] sm:w-[155px] lg:w-[195px] mr-2 sm:mr-2.5">
            <span
              key={verbIndex}
              className="hero-verb-animated bg-gradient-to-r from-[#0284C7] via-[#1677FF] to-[#7C3AED] bg-clip-text text-transparent whitespace-nowrap text-right"
              style={{ letterSpacing: currentVerb.tracking }}
            >
              {currentVerb.text}
            </span>
          </span>
          <span className="inline-block whitespace-nowrap text-slate-900">des posts calibrés</span>
          <br className="hidden sm:inline" />
          <span className="inline-block text-slate-900">pour vos réseaux sociaux.</span>
        </h1>

        {/* Sous-titre avec typographie Inter fine & épurée */}
        <p className="font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif] font-normal text-slate-600 sm:text-slate-700 text-xs sm:text-sm md:text-base lg:text-[16.5px] tracking-[-0.015em] leading-relaxed max-w-5xl mx-auto mb-10 sm:mb-12 whitespace-normal sm:whitespace-nowrap">
          L&#39;IA qui apprend l&#39;ADN de votre marque pour rédiger, planifier et publier sur tous vos réseaux.
        </p>

        {/* CTA Intégré */}
        <div className="flex flex-col items-center justify-center">
          <Link
            href="/login"
            id="hero-cta-main"
            className="w-full sm:w-auto px-9 py-3.5 bg-[#1677FF] hover:bg-[#1266DF] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 backdrop-blur-md transition-all text-center tracking-wide hover:scale-105"
          >
            Démarrer
          </Link>
        </div>
      </div>
    </section>
  )
}

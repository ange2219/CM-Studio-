'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CheckCircle2, ArrowRight, Tag, Sparkles } from 'lucide-react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function PricingCompact() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (!sectionRef.current) return

    // Header
    gsap.from('.pricing-header', {
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

    // Les 3 cartes en stagger (comme les services du portfolio)
    gsap.from('.pricing-card', {
      y: 60,
      opacity: 0,
      duration: 0.75,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.pricing-grid',
        start: 'top 80%',
        once: true,
      },
    })

    // Les prix comptent vers le haut (effet compteur)
    const priceEls = sectionRef.current.querySelectorAll<HTMLElement>('.price-value')
    priceEls.forEach((el) => {
      const target = parseInt(el.dataset.price || '0', 10)
      const obj = { val: 0 }
      gsap.to(obj, {
        val: target,
        duration: 1.5,
        ease: 'power2.out',
        delay: 0.5,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
        onUpdate: () => {
          el.textContent = `${Math.round(obj.val)} €`
        },
      })
    })

  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="tarifs" className="py-14 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="pricing-header text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-[#1677FF] mb-3 border border-blue-200/80">
          <Tag className="w-3.5 h-3.5" />
          Tarifs
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight">
          Une tarification simple, sans frais cachés.
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Sans engagement. Démarrez votre essai gratuit en 3 minutes.
        </p>
      </div>

      {/* 3 Plans */}
      <div className="pricing-grid grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
        
        {/* Plan 1 — Freelance / Starter */}
        <div className="pricing-card p-5 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Plan 1</div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">Freelance / Starter</h3>
            <p className="text-xs text-slate-600 mt-0.5 mb-4">
              Pour les créateurs et CMs indépendants démarrant leur activité.
            </p>

            <div className="mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-baseline gap-1">
                <span
                  className="price-value text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-mono"
                  data-price="0"
                >
                  0 €
                </span>
                <span className="text-xs text-slate-500 font-semibold">/ mois</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /><span><strong>1</strong> marque gérée (10 posts / mois)</span></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /><span>Génération de posts multi-plateformes</span></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /><span>Accès aux 5 tonalités éditoriales</span></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /><span>Calendrier de publication de base</span></li>
            </ul>
          </div>

          <Link
            href="/login"
            className="mt-6 w-full py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
          >
            Commencer gratuitement
          </Link>
        </div>

        {/* Plan 2 — Pro [POPULAIRE] */}
        <div className="pricing-card p-5 sm:p-6 rounded-xl bg-gradient-to-b from-blue-50/40 to-white border-2 border-[#1677FF] relative flex flex-col justify-between shadow-lg shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#1677FF] text-white text-[10px] font-bold tracking-wide uppercase shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Plan le plus populaire</span>
          </div>

          <div>
            <div className="text-[11px] font-bold text-[#1677FF] uppercase tracking-wide mb-1 mt-0.5">Plan 2</div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">Pro / Multi-Marques</h3>
            <p className="text-xs text-slate-600 mt-0.5 mb-4">
              Pour les freelances actifs et les petites équipes avec plusieurs clients.
            </p>

            <div className="mb-4 pb-4 border-b border-blue-100">
              <div className="flex items-baseline gap-1">
                <span
                  className="price-value text-2xl sm:text-3xl font-extrabold text-[#1677FF] font-mono"
                  data-price="29"
                >
                  29 €
                </span>
                <span className="text-xs text-slate-500 font-semibold">/ mois</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-800 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /><span>Jusqu'à <strong>5 marques</strong> distinctes</span></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /><span>Génération de posts illimitée</span></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /><span>Générateur de visuels IA inclus</span></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /><span>Alertes et notifications de publication</span></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /><span>Espaces clients cloisonnés</span></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /><span>Accès au Hub communautaire des CMs</span></li>
            </ul>
          </div>

          <Link
            href="/login"
            className="mt-6 w-full py-2.5 text-center text-xs font-bold text-white bg-[#1677FF] hover:bg-[#1266DF] shadow-md shadow-[#1677FF]/20 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <span>Démarrer l'essai pro (14j)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Plan 3 — Agence */}
        <div className="pricing-card p-5 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Plan 3</div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">Agence & Équipe</h3>
            <p className="text-xs text-slate-600 mt-0.5 mb-4">
              Pour les agences et structures gérant un portefeuille client étendu.
            </p>

            <div className="mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-baseline gap-1">
                <span
                  className="price-value text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-mono"
                  data-price="79"
                >
                  79 €
                </span>
                <span className="text-xs text-slate-500 font-semibold">/ mois</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /><span><strong>Marques illimitées</strong></span></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /><span>Gestion des rôles et accès collaborateurs</span></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /><span>Validation client simplifiée</span></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" /><span>Support dédié et prioritaire</span></li>
            </ul>
          </div>

          <Link
            href="/login"
            className="mt-6 w-full py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
          >
            Contacter l'équipe
          </Link>
        </div>
      </div>
    </section>
  )
}

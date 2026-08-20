'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { HelpCircle, ChevronDown, ArrowRight, Check } from 'lucide-react'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

export function FaqCtaCompact() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const sectionRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const ctaTitleRef = useRef<HTMLHeadingElement>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqItems = [
    {
      q: "Est-ce que CM Studio remplace le travail d'un Community Manager ?",
      a: "Non. CM Studio agit comme un assistant de production ultra-qualifié. Il prend en charge 80% du travail chronophage (la recherche d'angles, le premier jet rédigé selon les bons frameworks, le formatage aux normes de chaque réseau et la planification). Vous gardez le contrôle total sur la relecture, l'alignement stratégique et la validation finale.",
    },
    {
      q: "Mes données et celles de mes clients sont-elles isolées et confidentielles ?",
      a: "Oui, strictement. Chaque marque ou client possède son propre espace organisationnel hermétique. Les lignes éditoriales, personas, historiques de génération et données analytiques de la marque A ne sont jamais croisés ni partagés avec la marque B. Vos données ne sont pas non plus utilisées pour entraîner des modèles publics.",
    },
    {
      q: "Les comptes sociaux connectés sont-ils sécurisés ?",
      a: "Oui. Les connexions aux plateformes sociales s'effectuent exclusivement via les API officielles (OAuth standard sécurisé) d'Instagram, Facebook, LinkedIn et TikTok. CM Studio ne stocke jamais vos mots de passe et ne demande que les permissions strictement requises.",
    },
    {
      q: "En quoi est-ce différent d'un abonnement ChatGPT Plus ou de Predis.ai ?",
      a: "ChatGPT génère du texte brut sans connaître les contraintes d'affichage précises de chaque réseau (comme la coupure des 125 caractères sur Facebook ou les formats de posts LinkedIn). CM Studio applique des prompts narratifs structurés (AIDA, BAB, Storytelling) et une segmentation par réseau qui maximisent l'engagement réel.",
    },
    {
      q: "Puis-je annuler ou modifier mon abonnement à tout moment ?",
      a: "Oui, sans condition. Tous les forfaits sont sans engagement. Vous pouvez changer de formule, mettre en pause ou résilier votre abonnement directement depuis les paramètres de votre compte en un seul clic.",
    },
  ]

  useGSAP(() => {
    if (!sectionRef.current) return

    // FAQ items en stagger
    gsap.from('.faq-header', {
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

    gsap.from('.faq-item', {
      y: 24,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.faq-list',
        start: 'top 80%',
        once: true,
      },
    })

    // CTA — révélation du titre caractère par caractère (comme l'About du portfolio)
    if (ctaTitleRef.current) {
      try {
        SplitText.create(ctaTitleRef.current, {
          type: 'chars',
          onSplit(self: any) {
            gsap.set(self.chars, { opacity: 0.15 })
            gsap.to(self.chars, {
              opacity: 1,
              stagger: 0.03,
              duration: 0.05,
              ease: 'none',
              scrollTrigger: {
                trigger: ctaRef.current,
                start: 'top 75%',
                end: 'center center',
                scrub: 0.8,
              },
            })
          },
        })
      } catch {
        // SplitText GSAP Club - fallback si non disponible
        gsap.from(ctaTitleRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 80%',
            once: true,
          },
        })
      }
    }

    // CTA bloc complet — background transition au scroll (effet CTA du portfolio)
    gsap.from(ctaRef.current, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ctaRef.current,
        start: 'top 85%',
        once: true,
      },
    })

    // Bouton CTA pop
    gsap.from('.cta-btn', {
      scale: 0.85,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.7)',
      delay: 0.3,
      scrollTrigger: {
        trigger: ctaRef.current,
        start: 'top 80%',
        once: true,
      },
    })

    // Badges sous le bouton
    gsap.from('.cta-badge', {
      y: 12,
      opacity: 0,
      stagger: 0.08,
      duration: 0.4,
      ease: 'power2.out',
      delay: 0.6,
      scrollTrigger: {
        trigger: ctaRef.current,
        start: 'top 80%',
        once: true,
      },
    })

  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="faq" className="py-14 sm:py-16 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ── FAQ ── */}
        <div>
          <div className="faq-header text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-[#1677FF] mb-2.5 border border-blue-200/80">
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight">
              Questions fréquentes
            </h2>
          </div>

          <div className="faq-list space-y-2.5">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="faq-item rounded-xl bg-white border border-slate-200/90 overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-[#1677FF] transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#1677FF]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── CTA Final ── */}
        <div
          ref={ctaRef}
          className="relative rounded-2xl p-7 sm:p-10 bg-gradient-to-br from-[#1677FF] via-[#0055D4] to-[#7C3AED] text-center overflow-hidden shadow-xl text-white"
        >
          {/* Halo décoratif */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12)_0%,transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(124,58,237,0.3)_0%,transparent_50%)] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h3
              ref={ctaTitleRef}
              className="text-xl sm:text-3xl font-extrabold font-['Outfit',sans-serif] tracking-tight mb-3"
            >
              Reprenez le contrôle de votre temps dès cette semaine.
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 mb-6 font-normal leading-relaxed">
              Rejoignez les community managers et agences qui produisent du contenu calibré pour chaque réseau, sans y passer leurs soirées.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 mb-5">
              <Link
                href="/login"
                id="final-cta-compact-btn"
                className="cta-btn w-full sm:w-auto px-7 py-3 bg-white hover:bg-slate-50 text-[#1677FF] font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Créer mon compte gratuit</span>
                <span className="text-[10px] font-semibold bg-blue-50 text-[#1677FF] px-2 py-0.5 rounded">
                  Essai 14j gratuit
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-blue-100 font-medium">
              <span className="cta-badge flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                Configuration en 3 min
              </span>
              <span className="cta-badge flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                Sans carte bancaire
              </span>
              <span className="cta-badge flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                Sans engagement
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

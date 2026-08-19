'use client'

import React, { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  UserCheck,
  Building2,
  Briefcase,
  Users,
  Star,
} from 'lucide-react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function PersonaTabsCompact() {
  const [activePersona, setActivePersona] = useState<'freelance' | 'agence' | 'pme'>('freelance')
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const personas = {
    freelance: {
      id: 'freelance',
      title: 'CM Freelance multi-clients',
      icon: <UserCheck className="w-4 h-4" />,
      color: 'text-[#1677FF] bg-blue-50 border-blue-200',
      activeTabClass: 'bg-[#1677FF] text-white shadow-sm shadow-blue-500/30',
      enjeu: 'Gérer 5 à 10 clients différents sans mélanger leurs tonalités ni exploser votre temps de travail.',
      benefice:
        "Des espaces clients hermétiques qui conservent l'ADN et les règles de chaque marque. Vous bouclez la semaine éditoriale d'un client en 45 minutes chrono.",
      metric: '45 min / semaine par client',
      testimonial:
        "Avant CM Studio, je passais 2 jours complets par semaine sur la rédaction de mes 4 clients. Aujourd'hui, tout est planifié en une demi-journée.",
      author: 'Sarah M. • Freelance Social Media (Bordeaux)',
    },
    agence: {
      id: 'agence',
      title: "L'Agence Social Media & Équipe",
      icon: <Building2 className="w-4 h-4" />,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      activeTabClass: 'bg-purple-600 text-white shadow-sm shadow-purple-500/30',
      enjeu: `Coordonner les rédacteurs, valider les posts avec les clients et maintenir un standard d'écriture élevé.`,
      benefice:
        `Un planning partagé, des rôles d'équipe clairs et un flux de validation direct pour en finir avec les allers-retours interminables sur Google Docs ou WhatsApp.`,
      metric: "Flux d'équipe & rôles isolés",
      testimonial:
        "Le fait d'avoir des hooks pensés pour Facebook sous les 125 caractères et des formats storytelling pour LinkedIn a transformé l'engagement de nos clients agence.",
      author: "Alexandre D. • Fondateur d'agence (Paris)",
    },
    pme: {
      id: 'pme',
      title: 'Responsable Communication / Marketing PME',
      icon: <Briefcase className="w-4 h-4" />,
      color: 'text-[#10B981] bg-emerald-50 border-emerald-200',
      activeTabClass: 'bg-[#10B981] text-white shadow-sm shadow-emerald-500/30',
      enjeu: `Assurer une présence régulière et professionnelle sans avoir le temps d'apprendre le copywriting expert.`,
      benefice:
        `L'application automatique des meilleurs frameworks de rédaction (AIDA, PAS, Storytelling) sur chacun de vos posts, même sans compétences d'écriture préalables.`,
      metric: 'Copywriting de niveau expert appliqué',
      testimonial:
        `Nous n'avions pas de copywriter dédié en interne. CM Studio nous permet de publier 5 fois par semaine avec des textes qui ont une vraie voix de marque.`,
      author: 'Camille L. • Resp. Communication (Lyon)',
    },
  }

  const current = personas[activePersona]

  // Animation scroll-reveal initial
  useGSAP(() => {
    if (!sectionRef.current) return

    gsap.from('.persona-header', {
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

    gsap.from('.persona-tabs', {
      y: 24,
      opacity: 0,
      duration: 0.6,
      delay: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 78%',
        once: true,
      },
    })

    gsap.from('.persona-card', {
      y: 40,
      opacity: 0,
      duration: 0.7,
      delay: 0.35,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
      },
    })
  }, { scope: sectionRef })

  // Animation de la carte lors du changement d'onglet
  useEffect(() => {
    if (!cardRef.current) return
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 16, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' }
    )
  }, [activePersona])

  return (
    <section ref={sectionRef} id="pour-qui" className="py-14 sm:py-16 bg-slate-50/70 border-y border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="persona-header text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-[#1677FF] mb-3 border border-blue-200/80">
            <Users className="w-3.5 h-3.5" />
            Cas d'usage
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight">
            Pensé pour votre façon de travailler.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Sélectionnez votre profil pour voir vos gains concrets :
          </p>
        </div>

        {/* Onglets 1-clic */}
        <div className="persona-tabs flex flex-wrap items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setActivePersona('freelance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              activePersona === 'freelance'
                ? personas.freelance.activeTabClass
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>CM Freelance</span>
          </button>

          <button
            onClick={() => setActivePersona('agence')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              activePersona === 'agence'
                ? personas.agence.activeTabClass
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Agence & Équipe</span>
          </button>

          <button
            onClick={() => setActivePersona('pme')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              activePersona === 'pme'
                ? personas.pme.activeTabClass
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Responsable Com PME</span>
          </button>
        </div>

        {/* Carte active — animée au changement d'onglet */}
        <div ref={cardRef} className="persona-card p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Enjeu & Bénéfice */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl border ${current.color}`}>
                  {current.icon}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                    {current.title}
                  </h3>
                  <span className="text-[11px] font-bold text-[#1677FF]">
                    Impact : {current.metric}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <strong className="text-slate-900 block mb-0.5">Votre enjeu quotidien :</strong>
                  <span className="text-slate-600 leading-relaxed">{current.enjeu}</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <strong className="text-[#1677FF] block mb-0.5">La réponse CM Studio :</strong>
                  <span className="text-slate-800 leading-relaxed">{current.benefice}</span>
                </div>
              </div>
            </div>

            {/* Témoignage */}
            <div className="lg:col-span-5 p-4 sm:p-5 rounded-xl bg-slate-900 text-white flex flex-col justify-between h-full border border-slate-800">
              <div>
                <div className="flex text-amber-400 gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed mb-4">
                  "{current.testimonial}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>{current.author}</span>
                <span className="text-[#10B981] font-semibold">✓ Vérifié</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

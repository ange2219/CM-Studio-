'use client'

import React, { useState } from 'react'
import {
  UserCheck,
  Building2,
  Briefcase,
  Users,
  Star
} from 'lucide-react'

export function PersonasSection() {
  const [activePersona, setActivePersona] = useState<'freelance' | 'agence' | 'pme'>('freelance')

  const personas = {
    freelance: {
      id: 'freelance',
      title: 'CM Freelance multi-clients',
      icon: <UserCheck className="w-4 h-4" />,
      color: 'text-[#38BDF8] bg-blue-500/15 border-blue-500/30',
      activeTabClass: 'bg-[#1677FF] text-white shadow-md shadow-blue-500/30 border-[#1677FF]',
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
      color: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
      activeTabClass: 'bg-purple-600 text-white shadow-md shadow-purple-500/30 border-purple-600',
      enjeu: 'Coordonner les rédacteurs, valider les posts avec les clients et maintenir un standard d’écriture élevé.',
      benefice:
        'Un planning partagé, des rôles d’équipe clairs et un flux de validation direct pour en finir avec les allers-retours interminables sur Google Docs ou WhatsApp.',
      metric: "Flux d'équipe & rôles isolés",
      testimonial:
        "Le fait d'avoir des hooks pensés pour Facebook sous les 125 caractères et des formats storytelling pour LinkedIn a transformé l'engagement de nos clients agence.",
      author: "Alexandre D. • Fondateur d'agence (Paris)",
    },
    pme: {
      id: 'pme',
      title: 'Responsable Communication / Marketing PME',
      icon: <Briefcase className="w-4 h-4" />,
      color: 'text-[#34D399] bg-emerald-500/15 border-emerald-500/30',
      activeTabClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 border-emerald-600',
      enjeu: 'Assurer une présence régulière et professionnelle sans avoir le temps d’apprendre le copywriting expert.',
      benefice:
        'L’application automatique des meilleurs frameworks de rédaction (AIDA, PAS, Storytelling) sur chacun de vos posts, même sans compétences d’écriture préalables.',
      metric: 'Copywriting de niveau expert appliqué',
      testimonial:
        "Nous n'avions pas de copywriter dédié en interne. CM Studio nous permet de publier 5 fois par semaine avec des textes qui ont une vraie voix de marque.",
      author: 'Camille L. • Resp. Communication (Lyon)',
    },
  }

  const current = personas[activePersona]

  return (
    <section id="pour-qui" className="py-16 sm:py-20 bg-transparent">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de section */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-xs font-bold text-blue-400 mb-3 border border-blue-500/30">
            <Users className="w-3.5 h-3.5" />
            <span>Cas d'usage</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-white tracking-tight">
            Pensé pour votre façon de travailler.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Sélectionnez votre profil pour voir vos gains concrets :
          </p>
        </div>

        {/* ── Onglets 1-clic ── */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setActivePersona('freelance')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
              activePersona === 'freelance'
                ? current.activeTabClass
                : 'bg-[#0F172A] text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>CM Freelance</span>
          </button>

          <button
            onClick={() => setActivePersona('agence')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
              activePersona === 'agence'
                ? current.activeTabClass
                : 'bg-[#0F172A] text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Agence &amp; Équipe</span>
          </button>

          <button
            onClick={() => setActivePersona('pme')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
              activePersona === 'pme'
                ? current.activeTabClass
                : 'bg-[#0F172A] text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Responsable Com &amp; PME</span>
          </button>
        </div>

        {/* ── Carte Active (Enjeu + Bénéfice + Retour Terrain) ── */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Colonne Enjeu & Bénéfice */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${current.color}`}>
                  {current.icon}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {current.title}
                  </h3>
                  <span className="text-[11px] font-bold text-[#38BDF8]">
                    Impact : {current.metric}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <strong className="text-white block mb-0.5">Votre enjeu quotidien :</strong>
                  <span className="text-slate-300 leading-relaxed">{current.enjeu}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/50">
                  <strong className="text-[#38BDF8] block mb-0.5">La réponse CM Studio :</strong>
                  <span className="text-slate-200 leading-relaxed">{current.benefice}</span>
                </div>
              </div>
            </div>

            {/* Colonne Retour Terrain / Témoignage */}
            <div className="lg:col-span-5 p-5 rounded-xl bg-[#070A10] text-white flex flex-col justify-between h-full border border-slate-800/90">
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
                <span className="text-[#34D399] font-semibold">✓ Vérifié</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

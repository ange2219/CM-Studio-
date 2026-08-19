'use client'

import React, { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Sparkles,
  Sliders,
  Calendar,
  FolderKanban,
  Image as ImageIcon,
  MessageSquareShare,
  Layers,
  ArrowRight
} from 'lucide-react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const features = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      color: 'text-[#38BDF8] bg-blue-500/15 border border-blue-500/30',
      title: 'Prompt Engineering multi-plateforme',
      benefit: 'Des structures de hooks, longueurs de paragraphes et formats de CTA adaptés nativement à LinkedIn, Facebook, Instagram et TikTok.',
    },
    {
      icon: <Sliders className="w-5 h-5" />,
      color: 'text-purple-400 bg-purple-500/15 border border-purple-500/30',
      title: '5 Tons éditoriaux étanches',
      benefit: 'Basculez entre le ton Direct, Inspirant, Émotionnel, Humoristique ou Professionnel pour coller à chaque charte de marque.',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      color: 'text-[#34D399] bg-emerald-500/15 border border-emerald-500/30',
      title: 'Calendrier de publication interactif',
      benefit: 'Planifiez vos posts au mois ou à la semaine, déplacez-les en glisser-déposer et visualisez les statuts de validation d\'un coup d\'œil.',
    },
    {
      icon: <FolderKanban className="w-5 h-5" />,
      color: 'text-sky-400 bg-sky-500/15 border border-sky-500/30',
      title: 'Espaces multi-organisations isolés',
      benefit: 'Gérez plusieurs marques ou clients dans un seul compte, avec des lignes éditoriales, des personas et des historiques strictement cloisonnés.',
    },
    {
      icon: <ImageIcon className="w-5 h-5" />,
      color: 'text-amber-400 bg-amber-500/15 border border-amber-500/30',
      title: 'Génération d\'images IA intégrée',
      benefit: 'Créez des visuels d\'accompagnement cohérents avec votre sujet directement depuis l\'éditeur, sans ouvrir un logiciel externe.',
    },
    {
      icon: <MessageSquareShare className="w-5 h-5" />,
      color: 'text-rose-400 bg-rose-500/15 border border-rose-500/30',
      title: 'Hub communautaire interne',
      benefit: 'Échangez vos retours d\'expérience, posez vos questions sur les évolutions d\'algorithmes et collaborez avec d\'autres community managers.',
    },
  ]

  useGSAP(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    // Calcul de la distance horizontale exacte à faire défiler
    const getScrollAmount = () => {
      return track.scrollWidth - window.innerWidth + 80
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 64px',
        end: () => `+=${getScrollAmount()}`,
        pin: true,
        pinSpacing: true,
        scrub: true,
        invalidateOnRefresh: true,
      },
    })

    tl.to(track, {
      x: () => -getScrollAmount(),
      ease: 'none',
    })

  }, { scope: sectionRef })

  return (
    <div
      ref={sectionRef}
      id="fonctionnalites"
      className="relative bg-[#0D1527] overflow-hidden"
    >
      {/* ── Header de section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Outfit',sans-serif] text-white tracking-tight leading-tight">
            <span className="block">Moins d&#39;outils ouverts.</span>
            <span className="block">Plus d&#39;impact sur vos réseaux.</span>
          </h2>
        </div>
      </div>

      {/* ── Track horizontal animé GSAP (Cartes intactes) ── */}
      <div
        ref={trackRef}
        className="flex gap-4 pl-4 sm:pl-[calc((100vw-80rem)/2+2rem)] pr-16 pb-20"
        style={{ willChange: 'transform' }}
      >
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="shrink-0 w-[300px] sm:w-[360px] md:w-[400px] p-6 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-blue-500/40 hover:bg-[#121E36] shadow-2xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center mb-4 shadow-sm`}>
                {feature.icon}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {feature.benefit}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

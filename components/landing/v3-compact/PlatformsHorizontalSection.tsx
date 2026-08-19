'use client'

import React, { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CheckCircle2, Sparkles } from 'lucide-react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Section Plateformes en Scroll Horizontal
 * Reproduction fidèle de Work.jsx du portfolio rupzweb.
 * GSAP pin + scrub : les cartes défilent latéralement au scroll vertical.
 * Couleurs V2 : #F8FAFC bg, #1677FF primaire, #0F172A texte.
 */

const PLATFORMS = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    bgLight: 'bg-[#EBF4FF]',
    borderColor: 'border-[#0A66C2]/30',
    badge: 'B2B Storytelling',
    rule: 'Structure Insight + Hook 2 lignes',
    framework: 'Storytelling de terrain + Chiffres',
    format: 'Long-form B2B',
    hooks: ['Retour d\'expérience', 'Contre-intuitif', 'Conseil actionnable'],
    preview: `On a failli perdre notre plus gros client le mois dernier.\nLa raison ? Un contrat d'engagement de 12 mois qu'il refusait de signer.\n\nOn a supprimé la clause.\nRésultat : +28% de conversions.`,
    stat: '+3.2× portée organique',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    bgLight: 'bg-[#EFF5FF]',
    borderColor: 'border-[#1877F2]/30',
    badge: 'Coupure < 125 car.',
    rule: 'Coupure forcée avant 125 caractères',
    framework: 'Framework PAS (Problème → Agitation → Solution)',
    format: 'Court impact',
    hooks: ['Coupure PAS', 'Question directe', 'Chiffre shocking'],
    preview: `Payer 12 mois pour un outil qu'on n'utilise plus au bout de 3 semaines...\n\nOn a tous connu ça. C'est pour ça qu'on a changé les règles.\n\nÀ partir d'aujourd'hui : accès libre, sans engagement 👇`,
    stat: '+2.8× taux de clics',
  },
  {
    id: 'tiktok',
    name: 'TikTok / Reels',
    color: '#0F172A',
    bgLight: 'bg-slate-50',
    borderColor: 'border-slate-300',
    badge: 'Script IA',
    rule: 'Accroche 3 secondes + rythme dynamique',
    framework: 'Framework AIDA Vidéo (Attention → Intérêt → Action)',
    format: 'Script & Voix-off',
    hooks: ['Hook visuel 0–3s', 'Problème 3–15s', 'Solution 15–30s'],
    preview: `[0–3s] "3 erreurs des 90% des CMs sur leurs briefs..."\n[3–15s] Jongler entre 4 onglets pour un seul visuel...\n[15–30s] 5 angles calibrés en 45 secondes chrono.\n[CTA] Lien en bio pour tester.`,
    stat: '+4.1× temps de visionnage',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E1306C',
    bgLight: 'bg-[#FFF0F6]',
    borderColor: 'border-[#E1306C]/30',
    badge: 'Carousel & Reels',
    rule: 'Accroche slide 1 + rythme de swipe',
    framework: 'Storytelling visuel AIDA',
    format: 'Carousel & Caption',
    hooks: ['Slide 1 choc', 'Curiosity gap', 'CTA swipe'],
    preview: `Slide 1 : "Ce que personne ne te dit sur l'algorithme Instagram 2026"\nSlide 2-8 : Conseils actionnables\nSlide 9 : CTA + lien en bio\nCaption : court, émojis ciblés.`,
    stat: '+3.6× enregistrements',
  },
  {
    id: 'youtube',
    name: 'YouTube Shorts',
    color: '#FF0000',
    bgLight: 'bg-[#FFF2F2]',
    borderColor: 'border-red-300',
    badge: 'Script court',
    rule: 'Hook 0–3s + valeur immédiate',
    framework: 'BABS (Before, After, Bridge, Solution)',
    format: 'Short vertical 60s',
    hooks: ['Hook surprise', 'Promesse directe', 'Pattern interrupt'],
    preview: `[0–3s HOOK] "Pourquoi 90% des CMs perdent 8h/semaine sur du contenu invisible ?"\n[3–40s VALEUR] La méthode CM Studio expliquée en 3 étapes.\n[40–60s CTA] "Lien en description pour 14j gratuits."`,
    stat: '+5.2× rétention',
  },
]

export function PlatformsHorizontalSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!sectionRef.current || !trackRef.current) return

    const trackWidth = trackRef.current.scrollWidth
    const scrollDistance = trackWidth - window.innerWidth

    // Scroll horizontal piloté par GSAP — reproduction exacte de Work.jsx du portfolio
    gsap.to(trackRef.current, {
      x: -scrollDistance,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${trackWidth}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })

  }, { scope: sectionRef })

  return (
    <div
      ref={sectionRef}
      className="relative bg-[#0D1527] overflow-hidden"
    >
      {/* ── Header flottant (reste visible pendant le scroll horizontal) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-xs font-bold text-[#38BDF8] mb-3 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Calibrage Algorithmique 2026</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-white tracking-tight leading-tight">
              Un post parfait<br />pour chaque plateforme.
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Faites défiler pour découvrir comment CM Studio adapte votre contenu aux règles de chaque réseau.
            </p>
          </div>
          {/* Indicateur de scroll */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Faites défiler</span>
            <div className="flex gap-1">
              {PLATFORMS.map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              ))}
            </div>
            <svg className="w-4 h-4 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Track horizontal (les cartes défilent) ── */}
      <div
        ref={trackRef}
        className="flex gap-5 pl-4 sm:pl-[calc((100vw-80rem)/2+2rem)] pr-12 pb-16"
        style={{ willChange: 'transform' }}
      >
        {PLATFORMS.map((platform) => (
          <div
            key={platform.id}
            className="relative shrink-0 w-[340px] md:w-[420px] lg:w-[460px] rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Header plateforme */}
            <div
              className="px-5 py-4 flex items-center justify-between border-b border-slate-800"
              style={{ backgroundColor: `${platform.color}15` }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-sm"
                  style={{ backgroundColor: platform.color }}
                >
                  {platform.name.charAt(0)}
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white font-['Outfit',sans-serif]">
                    {platform.name}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {platform.format}
                  </div>
                </div>
              </div>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white shadow-sm"
                style={{ backgroundColor: platform.color }}
              >
                {platform.badge}
              </span>
            </div>

            {/* Corps */}
            <div className="p-5 flex flex-col gap-4 flex-1">
              
              {/* Règle algorithmique */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Règle d'affichage active
                </div>
                <div className="text-xs font-semibold text-slate-200">{platform.rule}</div>
              </div>

              {/* Framework */}
              <div className="p-3 rounded-xl border" style={{ backgroundColor: `${platform.color}12`, borderColor: `${platform.color}30` }}>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Framework de rédaction
                </div>
                <div className="text-xs font-bold" style={{ color: platform.color === '#0F172A' ? '#94A3B8' : platform.color }}>
                  {platform.framework}
                </div>
              </div>

              {/* Hooks */}
              <div className="flex flex-wrap gap-1.5">
                {platform.hooks.map((hook, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg border text-slate-300 bg-slate-900/90 border-slate-800"
                  >
                    {hook}
                  </span>
                ))}
              </div>

              {/* Aperçu du post */}
              <div className="bg-[#070A10] rounded-xl p-4 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line border border-slate-800/90 flex-1">
                <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-800">
                  <CheckCircle2 className="w-3 h-3 text-[#10B981] shrink-0" />
                  <span className="text-[10px] font-bold text-white">Post optimisé CM Studio</span>
                </div>
                {platform.preview}
              </div>
            </div>

            {/* Footer stat */}
            <div
              className="px-5 py-3 border-t border-slate-800 text-[11px] font-bold flex items-center gap-1.5 bg-slate-900/60"
              style={{
                color: platform.color === '#0F172A' ? '#38BDF8' : platform.color,
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-[#10B981]">{platform.stat}</span>
              <span className="text-slate-400 font-normal ml-auto text-[10px]">vs. post générique</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import React, { useEffect, useRef } from 'react'
import {
  CheckCircle2
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function AudiraShowcaseSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const section1Ref = useRef<HTMLDivElement>(null)
  const content1Ref = useRef<HTMLDivElement>(null)
  const section2Ref = useRef<HTMLDivElement>(null)
  const content2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // -------------------------------------------------------------
    // Calibrage exact selon votre capture d'écran :
    // - Démarrage : entrée de la section en bas ("top 95%")
    // - Fin / Verrouillage : exactement à la position de votre capture ("top 20%")
    // - Course : y: 100px vers 0 avec opacité progressive
    // -------------------------------------------------------------
    const ctx = gsap.context(() => {
      if (section1Ref.current && content1Ref.current) {
        gsap.fromTo(
          content1Ref.current,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section1Ref.current,
              start: 'top 85%',
              end: 'top 25%',
              scrub: true,
            },
          }
        )
      }

      if (section2Ref.current && content2Ref.current) {
        gsap.fromTo(
          content2Ref.current,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section2Ref.current,
              start: 'top 85%',
              end: 'top 25%',
              scrub: true,
            },
          }
        )
      }
    }, containerRef)

    ScrollTrigger.refresh()

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <div ref={containerRef} className="space-y-16 sm:space-y-24 py-12">
      {/* ── PARAGRAPHE 1 (Audira Model) : Multi-Marques & Organisation ── */}
      <section
        ref={section1Ref}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full">
          {/* Image Statique */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden p-2 sm:p-2.5">
              {/* Header macOS/App */}
              <div className="h-8 px-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  app.cmstudio.ai/workspace
                </div>
                <div className="text-[9px] font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800/50">
                  Organisation : Horizon
                </div>
              </div>
              {/* Image Réelle */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 aspect-[16/10] bg-slate-950">
                <img
                  src="/images/real-app/app_workspace.png"
                  alt="CM Studio Workspace - Gestion Multi-Marques"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* Bloc de Contenu Texte */}
          <div
            ref={content1Ref}
            className="lg:col-span-5 flex flex-col justify-start space-y-4 will-change-transform pt-1"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Outfit',sans-serif] text-white tracking-tight leading-tight">
              Gérez 5 à 10 marques sans mélanger leurs voix.
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Chaque organisation possède son propre centre de création (Nouveau post, Calendrier, Analytique, Inspiration) avec ses personas cibles et ses règles éditoriales strictement isolées.
            </p>

            <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                <span><strong className="text-white">Cloisonnement total :</strong> Ligne éditoriale, personas et historique propres à chaque marque.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                <span><strong className="text-white">Sélecteur 1-clic :</strong> Basculez instantanément d'un client à l'autre depuis l'en-tête.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                <span><strong className="text-white">Suivi centralisé :</strong> Vue d'ensemble des posts récents et des plannings par canal.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PARAGRAPHE 2 (Audira Model) : Le Hub Communautaire ── */}
      <section
        ref={section2Ref}
        className="py-16 sm:py-20 bg-transparent"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full">
            {/* Bloc de Contenu Texte */}
            <div
              ref={content2Ref}
              className="order-2 lg:order-1 lg:col-span-5 flex flex-col justify-start space-y-4 will-change-transform pt-1"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Outfit',sans-serif] text-white tracking-tight leading-tight">
                Espace d'entraide entre Community Managers.
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Ne travaillez plus isolé. Partagez vos meilleurs prompts, échangez sur les dernières mises à jour d'algorithmes et collaborez en temps réel avec des professionnels du secteur.
              </p>

              <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                  <span><strong className="text-white">Templates &amp; Hooks partagés :</strong> Découvrez les structures de posts qui génèrent le plus d'engagement.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                  <span><strong className="text-white">Veille algorithmique continue :</strong> Alertes sur les changements de portée LinkedIn, Meta et TikTok.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                  <span><strong className="text-white">Communauté active :</strong> 28 membres en ligne pour échanger et valider vos idées.</span>
                </div>
              </div>
            </div>

            {/* Image Statique */}
            <div className="order-1 lg:order-2 lg:col-span-7">
              <div className="relative rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden p-2 sm:p-2.5">
                {/* Header macOS/App */}
                <div className="h-8 px-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    app.cmstudio.ai/community
                  </div>
                  <div className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    28 membres actifs
                  </div>
                </div>
                {/* Image Réelle */}
                <div className="relative rounded-xl overflow-hidden border border-slate-800 aspect-[16/10] bg-slate-950">
                  <img
                    src="/images/real-app/app_community.png"
                    alt="CM Studio - Hub Communautaire"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

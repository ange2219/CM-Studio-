'use client'

import React, { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  XCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function ComparisonCompact() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (!sectionRef.current) return

    // Header de section
    gsap.from('.comparison-header', {
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
      },
    })

    // Les 2 colonnes arrivent en slide latéral opposé
    gsap.from('.comparison-col-left', {
      x: -60,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.comparison-grid',
        start: 'top 80%',
        once: true,
      },
    })

    gsap.from('.comparison-col-right', {
      x: 60,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.1,
      scrollTrigger: {
        trigger: '.comparison-grid',
        start: 'top 80%',
        once: true,
      },
    })

    // Chaque bullet point de la colonne gauche en stagger
    gsap.from('.pain-point', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.comparison-col-left',
        start: 'top 75%',
        once: true,
      },
    })

    // Chaque bullet point de la colonne droite en stagger décalé
    gsap.from('.gain-point', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      delay: 0.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.comparison-col-right',
        start: 'top 75%',
        once: true,
      },
    })

  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="comparaison" className="py-14 sm:py-16 bg-slate-50/70 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="comparison-header text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-[#1677FF] mb-3 border border-blue-200/80">
            <Sparkles className="w-3.5 h-3.5" />
            La Réalité du Marché
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight">
            Pourquoi les générateurs IA classiques échouent là où nous convertissons.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2.5">
            Un post LinkedIn n'est pas un post Facebook raccourci. Voici la différence concrète sur votre semaine.
          </p>
        </div>

        {/* Tableau Comparatif */}
        <div className="comparison-grid grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 items-stretch">
          
          {/* Colonne Sans CM Studio */}
          <div className="comparison-col-left p-5 sm:p-6 rounded-xl bg-white border border-red-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-red-100">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-600 uppercase tracking-wide">
                    Sans CM Studio (ChatGPT + 4 onglets ouverts)
                  </h3>
                  <div className="text-[11px] text-slate-500">Repurposing générique et dispersion</div>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="pain-point flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Dispersion mentale : 4 onglets pour un seul post</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      ChatGPT pour le texte, Canva pour l'image, Buffer pour planifier, WhatsApp pour le client. 
                      <strong className="text-red-600 font-semibold"> Perte de 8 à 12h chaque semaine</strong>.
                    </p>
                  </div>
                </div>

                <div className="pain-point flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Page blanche du lundi matin</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Difficile de renouveler les idées pour 5 clients différents. On finit par recycler les mêmes structures plates et publier par obligation.
                    </p>
                  </div>
                </div>

                <div className="pain-point flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">0 engagement réel & textes clichés</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Les textes IA génériques sont truffés d'émojis superflus (🚀🎉), sans hook d'accroche. Résultat : ignorés par 99% des abonnés.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-red-100 text-[11px] font-bold text-red-700 bg-red-50/70 p-2.5 rounded-lg flex items-center justify-between">
              <span>Bilan : 10h perdues/semaine</span>
              <span>Portée organique en chute</span>
            </div>
          </div>

          {/* Colonne Avec CM Studio */}
          <div className="comparison-col-right p-5 sm:p-6 rounded-xl bg-white border-2 border-[#1677FF] shadow-lg shadow-blue-500/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-100">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1677FF] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1677FF] uppercase tracking-wide">
                    Avec CM Studio (Prompt Engineering Dédié)
                  </h3>
                  <div className="text-[11px] text-slate-500">Studio tout-en-un & algorithmes 2026</div>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="gain-point flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Workflow unifié de A à Z en 45 min/client</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Recherche d'angles, rédaction calibrée, image IA native et calendrier interactif dans une seule interface hermétique par marque.
                    </p>
                  </div>
                </div>

                <div className="gain-point flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">3 à 5 angles stratégiques par pilier</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Vous ne partez jamais d'une page blanche. L'IA extrait des angles concrets (retour d'expérience, contre-intuitif, étude de cas).
                    </p>
                  </div>
                </div>

                <div className="gain-point flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Hooks chirurgicaux (FB &lt; 125 car. / LinkedIn Insights)</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Application des frameworks <strong className="text-slate-900">AIDA, PAS et Storytelling</strong> qui forcent le clic sur <em>"Voir plus"</em> et génèrent des commentaires qualifiés.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-blue-100 text-[11px] font-bold text-[#1677FF] bg-blue-50/70 p-2.5 rounded-lg flex items-center justify-between">
              <span>Bilan : 45 min/semaine par marque</span>
              <span className="text-[#10B981]">Conversions & rétention x4</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

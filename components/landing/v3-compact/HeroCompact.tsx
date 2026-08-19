'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Sliders,
} from 'lucide-react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

// ── Gradient CM Studio (reproduction fidèle du portfolio rupzweb) ──
const GRADIENT = 'linear-gradient(90deg, #1677FF 0%, #7C3AED 50%, #0EA5E9 100%)'

export function HeroCompact() {
  const [activeTab, setActiveTab] = useState<'linkedin' | 'facebook' | 'tiktok'>('linkedin')
  const heroRef = useRef<HTMLElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const studioRef = useRef<HTMLDivElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)
  const orbitRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    if (!heroRef.current) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // 1. Badge slide depuis le haut
    tl.from(badgeRef.current, {
      y: -30,
      opacity: 0,
      duration: 0.6,
    })

    // 2. Titre : split manuel — chaque mot arrive en cascade depuis le bas
    if (titleRef.current) {
      const rawText = titleRef.current.textContent || ''
      const words = rawText.split(' ')
      titleRef.current.innerHTML = words
        .map((w) => `<span class="hero-word" style="display:inline-block; overflow:hidden; line-height:1.2;"><span class="hero-word-inner" style="display:inline-block;">${w}&nbsp;</span></span>`)
        .join('')

      tl.from('.hero-word-inner', {
        y: '100%',
        opacity: 0,
        duration: 0.7,
        stagger: 0.04,
        ease: 'power4.out',
      }, '-=0.3')
    }

    // 3. Sous-titre fade-in
    tl.from(subtitleRef.current, {
      y: 24,
      opacity: 0,
      duration: 0.6,
    }, '-=0.4')

    // 4. CTA bouton pop
    tl.from(ctaRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(1.7)',
    }, '-=0.3')

    // 5. Vitrine studio slide depuis le bas
    tl.from(studioRef.current, {
      y: 60,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
    }, '-=0.2')

    // 6. Rotation continue du halo SVG (comme l'étoile du portfolio)
    if (orbitRef.current) {
      gsap.to(orbitRef.current, {
        rotation: 360,
        transformOrigin: 'center center',
        duration: 22,
        ease: 'linear',
        repeat: -1,
      })
    }

    // 7. Pulsation du halo lumineux
    if (haloRef.current) {
      gsap.to(haloRef.current, {
        scale: 1.08,
        opacity: 0.85,
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    }

  }, { scope: heroRef })

  // Animate la vitrine à chaque changement d'onglet
  useEffect(() => {
    gsap.fromTo('.studio-preview-content', 
      { opacity: 0, x: 16 },
      { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
    )
  }, [activeTab])

  return (
    <section ref={heroRef} className="relative pt-10 sm:pt-14 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      
      {/* ── Halo SVG rotatif (inspiré de l'étoile portfolio rupzweb) ── */}
      <div ref={haloRef} className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[340px] pointer-events-none -z-10">
        {/* Halo lumineux */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1677FF]/12 via-[#38BDF8]/10 to-[#8B5CF6]/8 blur-[120px] rounded-full" />
        {/* Orbite SVG rotative */}
        <svg
          ref={orbitRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] opacity-15"
          viewBox="0 0 653 631" fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M290.361 1.55611L333.686 284.91L333.88 286.179L334.595 285.114L496.712 43.7172L530.894 66.1542L354.53 298.39L353.719 299.458L355.031 299.182L644.761 238.164L651.694 276.116L359.086 321.398L357.759 321.603L358.897 322.315L605.849 476.828L581.885 510.336L344.939 341.783L343.894 341.039L344.16 342.294L403.733 622.683L363.139 630.092L319.819 346.737L319.626 345.469L318.911 346.534L156.783 587.928L122.522 565.048L298.964 333.261L299.777 332.192L298.463 332.469L8.73045 393.474L1.564 354.212L294.405 310.247L295.74 310.046L294.596 309.329L47.5646 154.375L71.6092 121.305L308.567 289.864L309.612 290.609L309.345 289.353L249.767 8.96559L290.361 1.55611Z"
            stroke="url(#hero_gradient_orbit)"
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient id="hero_gradient_orbit" x1="4" y1="374" x2="648" y2="257" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1677FF" />
              <stop offset="0.33" stopColor="#7C3AED" />
              <stop offset="0.66" stopColor="#0EA5E9" />
              <stop offset="1" stopColor="#1677FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── En-tête Hero ── */}
      <div className="text-center max-w-4xl mx-auto mb-8">
        
        {/* Badge animé */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-xs font-bold text-[#1677FF] mb-5 shadow-2xs"
        >
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>Le copilote IA et studio complet des Community Managers</span>
        </div>

        {/* Titre Principal — animé mot par mot */}
        <h1
          ref={titleRef}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-['Outfit',sans-serif] tracking-tight text-[#0F172A] leading-[1.12] mb-5"
          style={{ wordSpacing: '0.02em' }}
        >
          Arrêtez de jongler entre 4 outils pour publier des posts qui se ressemblent tous.
        </h1>

        {/* Sous-titre */}
        <p
          ref={subtitleRef}
          className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto mb-7 font-normal leading-relaxed"
        >
          CM Studio apprend le profil de votre marque, votre audience et votre ton unique pour concevoir des campagnes complètes, rédiger du contenu sur-mesure et planifier sur tous vos réseaux.
        </p>

        {/* CTA */}
        <div ref={ctaRef} className="flex flex-col items-center justify-center gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/login"
              id="hero-cta-compact"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#1677FF] hover:bg-[#1266DF] text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-[#1677FF]/25 hover:shadow-lg hover:shadow-[#1677FF]/35 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Essayer CM Studio gratuitement</span>
              <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded text-white/90">
                14 jours gratuits
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
            <span>Sans carte bancaire</span>
            <span>•</span>
            <span>Configuration en moins de 3 minutes</span>
          </p>
        </div>
      </div>

      {/* ── Vitrine Interactive Studio ── */}
      <div ref={studioRef} className="relative max-w-5xl mx-auto">
        <div className="relative rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden p-2 sm:p-3">
          
          {/* Header fenêtre studio */}
          <div className="h-10 px-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            </div>

            {/* Sélecteur réseau interactif */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
              <button
                onClick={() => setActiveTab('linkedin')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'linkedin'
                    ? 'bg-[#0A66C2] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>LinkedIn</span>
                <span className="text-[9px] opacity-80">(B2B Storytelling)</span>
              </button>

              <button
                onClick={() => setActiveTab('facebook')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'facebook'
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Facebook</span>
                <span className="text-[9px] opacity-80">(PAS &lt; 125 car.)</span>
              </button>

              <button
                onClick={() => setActiveTab('tiktok')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'tiktok'
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>TikTok / Reels</span>
                <span className="text-[9px] opacity-80">(Script IA)</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-[#1677FF] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              <Sparkles className="w-3 h-3" />
              <span>Algorithmes 2026</span>
            </div>
          </div>

          {/* Corps de la prévisualisation */}
          <div className="studio-preview-content grid grid-cols-1 lg:grid-cols-12 gap-3 bg-slate-900 text-white rounded-xl p-4 sm:p-5 border border-slate-800">
            
            {/* Colonne Gauche : Paramètres IA */}
            <div className="lg:col-span-4 bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Calibrage Algorithmique</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-700">
                    <div className="text-[10px] text-slate-400">Règle d'affichage active :</div>
                    <div className="font-semibold text-white mt-0.5">
                      {activeTab === 'linkedin' && 'Structure Insight & Hook 2 lignes'}
                      {activeTab === 'facebook' && 'Coupure forcée avant 125 caractères'}
                      {activeTab === 'tiktok' && 'Accroche 3 secondes + rythme dynamique'}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-700">
                    <div className="text-[10px] text-slate-400">Framework de rédaction :</div>
                    <div className="font-semibold text-emerald-400 mt-0.5">
                      {activeTab === 'linkedin' && 'Storytelling de terrain + Chiffres'}
                      {activeTab === 'facebook' && 'Framework PAS (Problème - Agitation - Solution)'}
                      {activeTab === 'tiktok' && 'Framework AIDA vidéo (Attention - Intérêt - Action)'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Génération instantanée</span>
                <span className="text-[#38BDF8] font-bold">1-Clic</span>
              </div>
            </div>

            {/* Colonne Droite : Post généré */}
            <div className="lg:col-span-8 bg-slate-950 rounded-xl p-4 sm:p-5 border border-slate-800 flex flex-col justify-between font-sans">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-white font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    Post optimisé prêt pour publication
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {activeTab === 'linkedin' && 'Format : Long B2B'}
                    {activeTab === 'facebook' && 'Format : Court 125 car.'}
                    {activeTab === 'tiktok' && 'Format : Script & Voix-off'}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                  {activeTab === 'linkedin' &&
                    `On a failli perdre notre plus gros client le mois dernier.\nLa raison ? Un contrat d'engagement de 12 mois qu'il refusait de signer.\n\nOn a fait ce que beaucoup d'agences refusent : on a supprimé la clause d'engagement.\nRésultat 30 jours plus tard : +28% de conversions, rétention identique.\n\nLa valeur se prouve chaque semaine, pas dans un PDF juridique. Vous en pensez quoi ?`}

                  {activeTab === 'facebook' &&
                    `Payer un abonnement pendant 12 mois pour un outil qu'on n'utilise plus au bout de 3 semaines... la pire sensation ?\n\nOn a tous connu ça. C'est pour cette raison qu'on a décidé de changer les règles.\n\nÀ partir d'aujourd'hui, toutes nos formules passent en accès 100% libre, sans aucun engagement de durée. Cliquez ci-dessous pour découvrir la suite 👇`}

                  {activeTab === 'tiktok' &&
                    `[0-3s - HOOK VISUEL] : "3 erreurs que font 90% des Community Managers sur leurs briefs..."\n[3-15s - PROBLÈME] : "Jongler entre 4 onglets différents pour un seul visuel..."\n[15-30s - SOLUTION CM STUDIO] : "Voici comment on génère 5 angles calibrés en 45 secondes chrono."\n[CTA FINAL] : "Lien en bio pour tester gratuitement."`}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>✓ Conforme aux algorithmes 2026</span>
                <span className="text-[#10B981] font-semibold">Taux d'engagement estimé : Élevé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

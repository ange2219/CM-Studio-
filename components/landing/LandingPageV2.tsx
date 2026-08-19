'use client'

import React from 'react'
import { Navbar } from './Navbar'
import { HeroSection } from './HeroSection'
import { ManifestSection } from './ManifestSection'
import { SolutionSection } from './SolutionSection'
import { StickyStepsSection } from './v3-compact/StickyStepsSection'
import { FeaturesSection } from './FeaturesSection'
import { AudiraShowcaseSection } from './AudiraShowcaseSection'
import { PersonasSection } from './PersonasSection'
import { PricingSection } from './PricingSection'
import { FaqSection } from './FaqSection'
import { FinalCtaSection } from './FinalCtaSection'
import { Footer } from './Footer'

export function LandingPageV2() {
  return (
    <div className="min-h-screen w-full bg-[#0D1527] text-slate-100 selection:bg-[#1677FF] selection:text-white font-sans antialiased relative overflow-x-clip">
      {/* Background Matrix Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(56,189,248,0.06)_1.2px,transparent_1.2px)] bg-[size:28px_28px] opacity-70" />
      </div>

      {/* 1. Header / Navbar Fixe */}
      <Navbar />

      <main className="relative z-10">
        {/* 2. Hero Section avec Capture Réelle de l'Éditeur */}
        <HeroSection />

        {/* 2.5. Manifeste & Histoire (Section insérée avant les étapes) */}
        <ManifestSection />

        {/* 3. VOS DEFIES, NOS SOLUTIONS / Problème */}
        <SolutionSection hideSteps={true} />

        {/* 4. Animation des 3 Étapes Stacking 1:1 Ultra-Fluide */}
        <StickyStepsSection />

        {/* 5. Fonctionnalités Clés */}
        <FeaturesSection />

        {/* 6. Modèle Animation Audira : Image Fixe & Texte qui monte au scroll */}
        <AudiraShowcaseSection />

        {/* 7. Pour qui ? (Cas d'usage interactif) */}
        <PersonasSection />

        {/* 8. Tarification Transparente */}
        <PricingSection />

        {/* 9. Foire Aux Questions (FAQ) */}
        <FaqSection />

        {/* 10. CTA Final */}
        <FinalCtaSection />
      </main>

      {/* 11. Footer */}
      <Footer />
    </div>
  )
}

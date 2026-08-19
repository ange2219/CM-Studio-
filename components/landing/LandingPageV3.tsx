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

export function LandingPageV3() {
  return (
    <div className="min-h-screen w-full bg-[#0D1527] text-slate-100 selection:bg-[#1677FF] selection:text-white font-sans antialiased relative overflow-x-clip">
      {/* Background Matrix Overlay (Slate Navy Lumineux) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(56,189,248,0.06)_1.2px,transparent_1.2px)] bg-[size:28px_28px] opacity-70" />
      </div>

      {/* 1. Navbar */}
      <Navbar />

      <main className="relative z-10">
        {/* 2. Hero */}
        <HeroSection />

        {/* 2.5. Manifeste & Histoire */}
        <ManifestSection />

        {/* 3. Solution Section (Problème) */}
        <SolutionSection hideSteps={true} />

        {/* 4. Méthode en 3 Étapes — Sticky Stacking 1:1 direct */}
        <StickyStepsSection />

        {/* 5. Fonctionnalités Clés — Scroll Horizontal */}
        <FeaturesSection />

        {/* 6. Audira Showcase */}
        <AudiraShowcaseSection />

        {/* 7. Pour qui ? */}
        <PersonasSection />

        {/* 8. Tarification */}
        <PricingSection />

        {/* 9. FAQ */}
        <FaqSection />

        {/* 10. CTA Final */}
        <FinalCtaSection />
      </main>

      {/* 11. Footer */}
      <Footer />
    </div>
  )
}

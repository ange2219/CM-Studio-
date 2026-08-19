'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  Layers,
  Image as ImageIcon,
  Check,
  Star,
  Users,
  Building2,
  Calendar,
  Sliders,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  HelpCircle,
  Menu,
  X
} from 'lucide-react'

export function LandingPageV1() {
  const [activePlatform, setActivePlatform] = useState<'linkedin' | 'instagram' | 'facebook' | 'tiktok'>('linkedin')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [isAnnual, setIsAnnual] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-[#0F172A] selection:bg-[#1677FF] selection:text-white font-sans antialiased relative overflow-x-clip">
      {/* Ambient background matrix overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(22,119,255,0.06)_1.2px,transparent_1.2px)] bg-[size:28px_28px] opacity-70" />
      </div>

      {/* ── 1. NAVBAR TOP ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200/80 transition-all shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-['Outfit',sans-serif] text-xl text-[#0F172A] tracking-tight">
              <strong className="font-black">CM S</strong>
              <span className="font-medium text-slate-700">tudio</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100/70 transition-colors">
              Fonctionnalités
            </a>
            <a href="#multibrand" className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100/70 transition-colors">
              Multi-Marques
            </a>
            <a href="#community" className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100/70 transition-colors">
              Communauté CM
            </a>
            <a href="#pricing" className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100/70 transition-colors">
              Tarifs
            </a>
            <a href="#faq" className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100/70 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200/90 rounded-xl hover:bg-slate-50 transition-all shadow-2xs"
            >
              Connexion
            </Link>
            <Link
              href="/login"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1677FF] hover:bg-[#1266DF] shadow-sm hover:shadow-md shadow-[#1677FF]/20 rounded-xl transition-all flex items-center gap-1.5"
            >
              Essayer gratuitement
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── 2. HERO SECTION (Version Visuelle Précédente) ── */}
      <section className="relative pt-12 sm:pt-16 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow Spheres */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-gradient-to-br from-[#1677FF]/12 via-[#38BDF8]/10 to-[#8B5CF6]/8 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Badge Surtitre */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-xs font-bold text-[#1677FF] mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Plateforme Tout-en-un pour Community Managers & Agences</span>
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
        </div>

        {/* Titre Précédent */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-['Outfit',sans-serif] tracking-tight text-[#0F172A] max-w-4xl mx-auto leading-[1.12] mb-6">
          Générez des posts viraux et des visuels captivants en{' '}
          <span className="bg-gradient-to-r from-[#1677FF] via-[#0284C7] to-[#8B5CF6] bg-clip-text text-transparent">
            3 clics grâce à l'IA
          </span>
        </h1>

        {/* Sous-titre Précédent */}
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto mb-8 font-normal leading-relaxed">
          CM Studio apprend le profil de votre marque, votre audience et votre ton unique pour concevoir des campagnes complètes, rédiger du contenu sur-mesure et planifier sur tous vos réseaux
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-3.5 bg-[#1677FF] hover:bg-[#1266DF] text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-[#1677FF]/25 hover:shadow-lg hover:shadow-[#1677FF]/35 transition-all flex items-center justify-center gap-2"
          >
            <span>Démarrer gratuitement</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#demo"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm sm:text-base rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2"
          >
            <span>Voir la démo interactive</span>
          </a>
        </div>

        {/* Vitrine Dashboard */}
        <div className="relative max-w-5xl mx-auto text-left">
          <div className="relative rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden p-2 sm:p-3">
            <div className="relative aspect-[16/9] w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
              <img
                src="/images/hero-dashboard.jpg"
                alt="CM Studio - Dashboard complet"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SECTION MULTI-MARQUES ── */}
      <section id="multibrand" className="py-20 bg-slate-50/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-[#1677FF] mb-3 border border-blue-200/80">
                <Building2 className="w-3.5 h-3.5" />
                Multi-Organisations & Clients
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight mb-4">
                Gérez 10 marques sans jamais mélanger leurs voix.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                Chaque organisation possède son propre profil éditorial, ses personas cibles, ses piliers de contenu et ses canaux connectés. Basculez d'un client à l'autre en un instant.
              </p>
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Cloisonnement total des données et des chartes graphiques</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Historiques de génération et banques de prompts dédiés</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Gestion des droits et accès collaborateurs par marque</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 shadow-md p-2 overflow-hidden">
              <img
                src="/images/multibrand-visual.jpg"
                alt="Gestion multi-marques CM Studio"
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SECTION HUB COMMUNAUTAIRE ── */}
      <section id="community" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1 rounded-2xl bg-white border border-slate-200 shadow-md p-2 overflow-hidden">
            <img
              src="/images/community-hub.jpg"
              alt="Hub Communautaire CM Studio"
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-xs font-bold text-purple-600 mb-3 border border-purple-200/80">
              <Users className="w-3.5 h-3.5" />
              Réseau & Collaboration
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight mb-4">
              Le premier espace d'entraide dédié aux Community Managers.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Ne travaillez plus isolé. Partagez vos meilleurs prompts, échangez sur les dernières mises à jour d'algorithmes et débloquez des badges d'expertise au fil de votre progression.
            </p>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Feed communautaire exclusif et messagerie directe</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Partage de templates et de hooks performants</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Groupes thématiques débloqués par niveau d'activité</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. GRILLE DES TARIFS ── */}
      <section id="pricing" className="py-20 bg-slate-50/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-[#1677FF] mb-3 border border-blue-200/80">
            Tarifs
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight mb-4">
            Des formules transparentes et sans engagement.
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto mb-10">
            Choisissez l'offre adaptée à votre volume de production et faites évoluer votre formule à tout moment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto text-left">
            {/* Free */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Découverte</h3>
                <p className="text-xs text-slate-500 mb-4">Pour tester l'outil gratuitement</p>
                <div className="text-2xl font-black text-[#0F172A] mb-4">0 € <span className="text-xs font-normal text-slate-500">/ mois</span></div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#10B981]" /> 1 Marque gérée</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#10B981]" /> 10 générations / mois</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#10B981]" /> Calendrier de base</li>
                </ul>
              </div>
              <Link href="/login" className="mt-6 w-full py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl">
                Créer un compte
              </Link>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-xl bg-white border-2 border-[#1677FF] shadow-md relative flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1677FF] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase">
                Populaire
              </span>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Pro Freelance</h3>
                <p className="text-xs text-slate-500 mb-4">Pour les CMs actifs</p>
                <div className="text-2xl font-black text-[#1677FF] mb-4">29 € <span className="text-xs font-normal text-slate-500">/ mois</span></div>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#10B981]" /> Jusqu'à 5 marques</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#10B981]" /> Générations illimitées</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#10B981]" /> Générateur d'images IA</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#10B981]" /> Hub communautaire CM</li>
                </ul>
              </div>
              <Link href="/login" className="mt-6 w-full py-2.5 text-center text-xs font-bold text-white bg-[#1677FF] hover:bg-[#1266DF] rounded-xl shadow-sm">
                Démarrer l'essai 14j
              </Link>
            </div>

            {/* Agency */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Agence & Équipe</h3>
                <p className="text-xs text-slate-500 mb-4">Pour les agences et structures</p>
                <div className="text-2xl font-black text-[#0F172A] mb-4">79 € <span className="text-xs font-normal text-slate-500">/ mois</span></div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#10B981]" /> Marques illimitées</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#10B981]" /> Rôles et collaborateurs</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#10B981]" /> Validation client directe</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#10B981]" /> Support prioritaire</li>
                </ul>
              </div>
              <Link href="/login" className="mt-6 w-full py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl">
                Contacter l'équipe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FAQ ── */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight">
            Questions Fréquentes
          </h2>
        </div>

        <div className="space-y-3">
          {[
            { q: "Puis-je essayer CM Studio gratuitement ?", a: "Oui ! Le forfait Découverte vous permet de générer vos premiers contenus sans carte bancaire requise." },
            { q: "Comment l'IA s'adapte-t-elle à ma marque ?", a: "Lors de la configuration de chaque marque, vous définissez vos piliers, votre audience et votre ton. L'IA applique ces directives à chaque post généré." },
            { q: "Quels réseaux sociaux sont pris en charge ?", a: "CM Studio génère du contenu calibré pour LinkedIn, Facebook, Instagram et TikTok, avec les structures de hooks propres à chaque canal." },
            { q: "Puis-je annuler à tout moment ?", a: "Oui, tous nos forfaits sont sans aucun engagement de durée." }
          ].map((item, idx) => {
            const isOpen = openFaq === idx
            return (
              <div key={idx} className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-2xs">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 text-sm font-bold text-slate-900 hover:text-[#1677FF] transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#1677FF]' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 7. FOOTER ── */}
      <footer className="border-t border-slate-200/80 bg-white py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 font-['Outfit']">CM Studio</span>
            <span>• © {new Date().getFullYear()} Tous droits réservés.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-slate-800">Connexion</Link>
            <Link href="/privacy" className="hover:text-slate-800">Confidentialité</Link>
            <Link href="/privacy" className="hover:text-slate-800">Mentions légales</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

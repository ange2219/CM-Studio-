'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Tag } from 'lucide-react'

export function PricingSection() {
  return (
    <section id="tarifs" className="py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-xs font-bold text-blue-400 mb-3 border border-blue-500/30">
            <Tag className="w-3.5 h-3.5" />
            Tarifs
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-white tracking-tight">
            Une tarification simple, sans frais cachés.
          </h2>
        </div>

        {/* Grille des 3 Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
          {/* Plan 1 — Freelance / Starter */}
          <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                Plan 1
              </div>
              <h3 className="text-lg font-bold text-white">Freelance / Starter</h3>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                Pour les créateurs et CMs indépendants démarrant leur activité.
              </p>

              {/* Prix */}
              <div className="mb-6 pb-5 border-b border-slate-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                    0 €
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ mois</span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span><strong className="text-white">1</strong> marque gérée (10 posts / mois)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span>Génération de posts multi-plateformes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span>Accès aux 5 tonalités éditoriales</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span>Calendrier de publication interactif</span>
                </li>
              </ul>
            </div>

            <Link
              href="/login"
              className="mt-8 w-full py-3 text-center text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Plan 2 — Pro / Multi-Marques [PLAN MIS EN AVANT — LE PLUS POPULAIRE] */}
          <div className="p-6 rounded-xl bg-gradient-to-b from-blue-950/40 via-[#0F172A] to-[#0F172A] border-2 border-[#1677FF] relative flex flex-col justify-between shadow-2xl shadow-blue-500/20">
            {/* Badge Plan Mis en avant */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#1677FF] text-white text-[10px] font-bold tracking-wide uppercase shadow-md">
              Plan mis en avant — Le plus populaire
            </div>

            <div>
              <div className="text-xs font-bold text-[#38BDF8] uppercase tracking-wide mb-1 mt-1">
                Plan 2
              </div>
              <h3 className="text-lg font-bold text-white">Pro / Multi-Marques</h3>
              <p className="text-xs text-slate-300 mt-1 mb-5">
                Pour les freelances actifs et les petites équipes avec plusieurs clients.
              </p>

              {/* Prix */}
              <div className="mb-6 pb-5 border-b border-blue-900/50">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#38BDF8] font-mono">
                    29 €
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ mois</span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span>Jusqu'à <strong className="text-white">5 marques</strong> distinctes</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span>Génération de posts illimitée</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span>Générateur de visuels IA inclus</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span>Alertes et notifications de publication</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span>Espaces clients cloisonnés</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span>Accès au Hub communautaire des CMs</span>
                </li>
              </ul>
            </div>

            <Link
              href="/login"
              className="mt-8 w-full py-3 text-center text-xs font-bold text-white bg-[#1677FF] hover:bg-[#1266DF] shadow-lg shadow-[#1677FF]/30 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Démarrer l'essai pro (14j)
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Plan 3 — Agence & Équipe */}
          <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                Plan 3
              </div>
              <h3 className="text-lg font-bold text-white">Agence & Équipe</h3>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                Pour les agences et structures gérant un portefeuille client étendu.
              </p>

              {/* Prix */}
              <div className="mb-6 pb-5 border-b border-slate-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                    79 €
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ mois</span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span><strong className="text-white">Marques illimitées</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span>Gestion des rôles et accès collaborateurs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span>Validation client simplifiée</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span>Support dédié et prioritaire</span>
                </li>
              </ul>
            </div>

            <Link
              href="/login"
              className="mt-8 w-full py-3 text-center text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
            >
              Contacter l'équipe
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#090E1A] border-t border-slate-800/80 py-14 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-3 group">
              <img
                src="/logo.png?v=30"
                alt="CM Studio Logo"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
              />
              <span className="font-['Outfit',sans-serif] text-xl sm:text-[22px] text-white tracking-tight">
                <strong className="font-black text-white">CM S</strong>
                <span className="font-medium text-slate-300">tudio</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              La plateforme SaaS de création, planification et collaboration calibrée pour les community managers et agences.
            </p>
          </div>

          {/* Col 2: Méthode & Produit */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <a href="#probleme" className="hover:text-white transition-colors">
                  Le Problème
                </a>
              </li>
              <li>
                <a href="#methode" className="hover:text-white transition-colors">
                  Méthode en 3 étapes
                </a>
              </li>
              <li>
                <a href="#fonctionnalites" className="hover:text-white transition-colors">
                  Fonctionnalités
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Offres & Profils */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <a href="#pour-qui" className="hover:text-white transition-colors">
                  CM Freelance
                </a>
              </li>
              <li>
                <a href="#pour-qui" className="hover:text-white transition-colors">
                  Agences Social Media
                </a>
              </li>
              <li>
                <a href="#pour-qui" className="hover:text-white transition-colors">
                  Responsables Com PME
                </a>
              </li>
              <li>
                <a href="#tarifs" className="hover:text-white transition-colors">
                  Grille des Tarifs
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Légal & Accès */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Compte & Légal
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Connexion à l'espace
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Inscription gratuite
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & legal disclaimer */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} CM Studio. Tous droits réservés.
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Confidentialité
            </Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

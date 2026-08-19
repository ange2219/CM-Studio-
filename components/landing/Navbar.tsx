'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight } from 'lucide-react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  // Animation d'entrée : glisse depuis le haut (reproduction portfolio rupzweb)
  useGSAP(() => {
    gsap.from(navRef.current, {
      y: -80,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      delay: 0.1,
    })
  }, { scope: navRef })

  return (
    <header ref={navRef} className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0D1527]/90 border-b border-slate-800/80 transition-all shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
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

        {/* Desktop Navigation (Sections actives du développement) */}
        <nav className="hidden md:flex items-center gap-1">
          <a
            href="#manifeste"
            className="px-3 py-2 text-[13px] font-bold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all tracking-tight"
          >
            Manifeste
          </a>
          <a
            href="#methode"
            className="px-3 py-2 text-[13px] font-bold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all tracking-tight"
          >
            La Méthode
          </a>
          <a
            href="#fonctionnalites"
            className="px-3 py-2 text-[13px] font-bold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all tracking-tight"
          >
            Fonctionnalités
          </a>
          <a
            href="#pour-qui"
            className="px-3 py-2 text-[13px] font-bold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all tracking-tight"
          >
            Pour qui ?
          </a>
          <a
            href="#tarifs"
            className="px-3 py-2 text-[13px] font-bold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all tracking-tight"
          >
            Tarifs
          </a>
          <a
            href="#faq"
            className="px-3 py-2 text-[13px] font-bold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all tracking-tight"
          >
            FAQ
          </a>
        </nav>

        {/* Header Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            href="/login"
            className="px-3.5 py-2 text-xs sm:text-[13px] font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-all whitespace-nowrap"
          >
            Connexion
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 text-xs sm:text-[13px] font-bold text-white bg-[#1677FF] hover:bg-[#1266DF] active:scale-[0.98] shadow-md shadow-blue-600/30 hover:shadow-lg hover:shadow-blue-600/40 rounded-xl transition-all inline-flex items-center justify-center whitespace-nowrap leading-tight"
          >
            Inscription
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-200 hover:bg-white/5 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-[#0D1527] border-b border-slate-800 space-y-3 shadow-2xl">
          <div className="flex flex-col gap-1">
            <a
              href="#manifeste"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white rounded-lg hover:bg-slate-800/60"
            >
              Manifeste
            </a>
            <a
              href="#methode"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white rounded-lg hover:bg-slate-800/60"
            >
              La Méthode
            </a>
            <a
              href="#fonctionnalites"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white rounded-lg hover:bg-slate-800/60"
            >
              Fonctionnalités
            </a>
            <a
              href="#pour-qui"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white rounded-lg hover:bg-slate-800/60"
            >
              Pour qui ?
            </a>
            <a
              href="#tarifs"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white rounded-lg hover:bg-slate-800/60"
            >
              Tarifs
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white rounded-lg hover:bg-slate-800/60"
            >
              FAQ
            </a>
          </div>
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full py-2.5 text-center text-sm font-semibold text-slate-200 border border-slate-700 rounded-xl hover:bg-slate-800"
            >
              Connexion
            </Link>
            <Link
              href="/login"
              className="w-full py-2.5 text-center text-sm font-semibold text-white bg-[#1677FF] hover:bg-[#1266DF] rounded-xl shadow-md"
            >
              Inscription
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

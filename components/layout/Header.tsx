'use client'

import React, { useState } from 'react';
import { Search, Sun, Moon, Sparkles, ChevronDown, User, Shield, LogOut, Check } from 'lucide-react';
import { FeatherLogo } from '@/components/FeatherLogo';
import Link from 'next/link';

export function Header({
  darkMode,
  setDarkMode,
  activeView = 'home',
  onSelectView
}: {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeView?: string;
  onSelectView?: (view: string) => void;
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBrandMenu, setShowBrandMenu] = useState(false);
  const [activeBrand, setActiveBrand] = useState('Antigravity Studio');

  const brands = [
    { id: 1, name: 'Antigravity Studio', plan: 'Pro' },
    { id: 2, name: 'Pulse Media', plan: 'Free' },
    { id: 3, name: 'Tech Horizon', plan: 'Free' },
  ];

  return (
    <header className={`h-16 px-4 md:px-6 flex items-center justify-between border-b shrink-0 transition-colors duration-300 relative z-30 select-none ${
      darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80 shadow-xs'
    }`}>
      
      {/* LEFT SECTION: Logo & Brand Indicator */}
      <div className="flex items-center gap-4">
        <Link 
          href="/home" 
          onClick={() => onSelectView && onSelectView('home')}
          className="flex items-center gap-2.5 text-decoration-none group cursor-pointer"
        >
          <FeatherLogo className="w-6 h-6" darkMode={darkMode} />
          <span className={`text-[17px] font-black tracking-tight ${
            darkMode ? 'text-white' : 'text-[#0F172A]'
          }`}>
            CM Studio
          </span>
        </Link>

        {/* Brand Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowBrandMenu(!showBrandMenu)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl text-[12px] font-semibold border transition-all cursor-pointer ${
              darkMode 
                ? 'bg-[#0F172A] border-slate-700 text-slate-200 hover:border-slate-600' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">{activeBrand}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showBrandMenu && (
            <div className={`absolute top-full left-0 mt-2 w-48 rounded-xl border shadow-xl p-1 z-50 ${
              darkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Marques actives
              </div>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setActiveBrand(b.name);
                    setShowBrandMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                    activeBrand === b.name
                      ? darkMode ? 'bg-slate-800 text-[#38BDF8]' : 'bg-blue-50 text-[#1677FF]'
                      : darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <span>{b.name}</span>
                  {activeBrand === b.name && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CENTER SECTION: Global Search Input */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border transition-all ${
          darkMode 
            ? 'bg-[#0F172A] border-slate-700/80 focus-within:border-[#1677FF]' 
            : 'bg-[#F3F5F9] border-slate-200/60 focus-within:border-[#1677FF] focus-within:bg-white'
        }`}>
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher des membres, posts ou templates..."
            className={`w-full text-[12.5px] bg-transparent outline-none ${
              darkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      {/* RIGHT SECTION: Controls & User Menu */}
      <div className="flex items-center gap-3">
        
        {/* Dark/Light Mode Toggle Switch */}
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            darkMode 
              ? 'bg-[#0F172A] border-slate-700 text-amber-400 hover:bg-slate-800' 
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
          title={darkMode ? "Passer au mode clair" : "Passer au mode sombre"}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile Dropdown Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center gap-2 p-1 pr-2.5 rounded-full border transition-all cursor-pointer ${
              darkMode 
                ? 'bg-[#0F172A] border-slate-700 hover:border-slate-600' 
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Alexandra Borke"
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
            <span className={`text-[12.5px] font-bold hidden lg:inline ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Alexandra
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown Content */}
          {showProfileMenu && (
            <div className={`absolute top-full right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in duration-150 ${
              darkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[13px] font-bold leading-tight">Alexandra Borke</p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">alexandra@studio.com</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#1677FF] dark:text-[#38BDF8]">
                  Plan Pro CM Studio
                </span>
              </div>

              <div className="py-1">
                <Link
                  href="/profile/me"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onSelectView) onSelectView('profile');
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-semibold rounded-xl transition-all cursor-pointer text-decoration-none ${
                    darkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Mon Profil</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onSelectView) onSelectView('settings');
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-semibold rounded-xl transition-all cursor-pointer text-decoration-none ${
                    darkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Paramètres</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                <button
                  type="button"
                  onClick={() => alert('Déconnexion')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-semibold rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

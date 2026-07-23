'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Search, Moon, Sun, ChevronDown, User, Settings, LogOut, Award } from 'lucide-react';
import { FeatherLogo } from '@/components/FeatherLogo';
import Link from 'next/link';

export function Header({ 
  darkMode, 
  onToggleDarkMode, 
  onSelectView 
}: { 
  darkMode: boolean; 
  onToggleDarkMode: () => void; 
  onSelectView?: (view: string) => void; 
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`h-[64px] w-full px-8 flex items-center justify-between border-b transition-colors duration-300 ${darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/90'} shrink-0 z-20 shadow-xs relative`}>
      {/* Left: Logo CM Studio avec Plume */}
      <div 
        onClick={() => onSelectView && onSelectView('home')}
        className="flex items-center gap-2.5 cursor-pointer group select-none"
      >
        <FeatherLogo className="w-6 h-6" darkMode={darkMode} />
        <span className={`font-extrabold text-[19px] tracking-tight font-['Inter'] ${darkMode ? 'text-white' : 'text-[#1E293B]'}`}>
          CM Studio
        </span>
      </div>

      {/* Middle: Search Input */}
      <div className={`flex items-center gap-2.5 h-10 px-4 rounded-full w-[260px] md:w-[340px] lg:w-[400px] transition-colors ${darkMode ? 'bg-[#334155]' : 'bg-[#F3F5F9]'}`}>
        <Search className={`w-4.5 h-4.5 shrink-0 ${darkMode ? 'text-slate-400' : 'text-[#94A3B8]'}`} />
        <input
          type="text"
          placeholder="Rechercher dans CM Studio..."
          className={`bg-transparent text-[14px] outline-none w-full font-normal ${darkMode ? 'text-slate-100 placeholder-slate-400' : 'text-slate-700 placeholder-[#94A3B8]'}`}
        />
      </div>

      {/* Right Side: Mode Toggle Icon + User Profile Dropdown Button */}
      <div className="flex items-center gap-3.5">
        {/* Dark / Light Mode Toggle Button */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          title={darkMode ? 'Passer au Mode Clair' : 'Passer au Mode Sombre'}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-blue-glow border-none ${darkMode ? 'bg-[#38BDF8] text-slate-900 hover:bg-[#7dd3fc]' : 'bg-[#1677FF] text-white hover:bg-[#1266DF]'}`}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 fill-current stroke-[2]" />
          ) : (
            <Moon className="w-5 h-5 fill-current stroke-[2]" />
          )}
        </button>

        {/* User Profile Button */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-[24px] bg-transparent border border-transparent transition-all duration-200 ease-in-out cursor-pointer ${darkMode
                ? 'hover:bg-slate-700/80 hover:border-slate-600/50 text-white'
                : 'hover:bg-slate-100 hover:border-slate-200/70 text-[#1E293B]'
              }`}
          >
            {/* User Avatar */}
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Alexandra Borke"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FF3B30] ring-offset-1 shrink-0"
            />

            {/* User Name in Bold with Active Organization underneath */}
            <div className="flex flex-col text-left leading-tight hidden sm:flex">
              <span className="text-[13.5px] font-bold truncate max-w-[130px]">
                Alexandra Borke
              </span>
              <span className="text-[11px] font-semibold text-[#1677FF] dark:text-[#38BDF8] truncate max-w-[130px]">
                CM Studio Org
              </span>
            </div>

            {/* Chevron Arrow */}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'rotate-180' : ''} ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isMenuOpen && (
            <div className={`absolute right-0 mt-2 w-72 rounded-2xl p-3.5 shadow-2xl border transition-all z-50 animate-in fade-in slide-in-from-top-2 ${darkMode ? 'bg-[#1E293B] border-slate-700 text-slate-100' : 'bg-white border-slate-100 text-slate-800'
              }`}>
              {/* Profile Card Header in Menu */}
              <div className="flex items-center gap-3.5 p-2 pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Alexandra Borke"
                  className="w-[48px] h-[48px] rounded-full object-cover ring-2 ring-[#FF3B30] shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-[14.5px] font-bold truncate leading-snug">Alexandra Borke</span>
                  <span className="text-[11.5px] text-slate-400 truncate leading-snug">alexandra.borke@cmstudio.com</span>
                </div>
              </div>

              {/* Navigation Shortcuts Links */}
              <div className="py-2 flex flex-col gap-0.5">
                <Link
                  href="/profile/me"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors text-decoration-none ${darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                >
                  <User className="w-4.5 h-4.5 text-[#1677FF]" />
                  <span>Profil</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors text-decoration-none ${darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                >
                  <Award className="w-4.5 h-4.5 text-[#1677FF]" />
                  <span>Mes marques</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors text-decoration-none ${darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                >
                  <Settings className="w-4.5 h-4.5 text-[#1677FF]" />
                  <span>Paramètres</span>
                </Link>
              </div>

              {/* Divider & Logout Option */}
              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    alert('Déconnexion réussie');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer bg-transparent border-none"
                >
                  <LogOut className="w-4.5 h-4.5 text-red-500" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

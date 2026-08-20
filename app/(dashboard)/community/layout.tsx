'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Users } from 'lucide-react'
import { useTheme } from '@/components/context/ThemeContext'

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { darkMode } = useTheme()

  const tabs = [
    {
      id: 'general',
      label: 'Général',
      href: '/community/general',
      icon: MessageSquare,
      exact: true
    },
    {
      id: 'membres',
      label: 'Membres',
      href: '/community/membres',
      icon: Users,
      exact: false
    }
  ]

  return (
    <div className="flex-1 w-full h-full flex flex-col gap-3 overflow-hidden select-none">
      
      {/* ── SOUS-NAVIGATION COMMUNAUTÉ ── */}
      <div className={`shrink-0 flex items-center justify-between px-3.5 py-2 rounded-xl border transition-colors ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/90 shadow-card-subtle'
      }`}>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.exact 
              ? pathname === tab.href 
              : pathname.startsWith(tab.href)

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-2 px-3 py-1.5 text-[13px] font-bold rounded-lg transition-all no-underline ${
                  isActive
                    ? darkMode
                      ? 'bg-[#0F172A] text-[#38BDF8] shadow-xs border border-slate-700'
                      : 'bg-blue-50 text-[#1677FF] shadow-xs border border-blue-100'
                    : darkMode
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${
                  isActive
                    ? darkMode ? 'text-[#38BDF8]' : 'text-[#1677FF]'
                    : 'text-slate-400'
                }`} />
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Espace Communauté CM Studio</span>
        </div>
      </div>

      {/* ── CONTENU DE LA SECTION ACTIVE ── */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {children}
      </div>

    </div>
  )
}

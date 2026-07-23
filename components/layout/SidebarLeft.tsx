'use client'

import React from 'react';
import { Home, LayoutGrid, MessageSquare, Bell, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SidebarLeft({
  darkMode,
  activeView = 'home',
  onSelectView
}: {
  darkMode: boolean;
  activeView?: string;
  onSelectView?: (view: string) => void;
}) {
  const pathname = usePathname();

  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home, href: '/home' },
    { id: 'workspace', label: 'Workspace', icon: LayoutGrid, href: '/workspace' },
    { id: 'messages', label: 'Messagerie', icon: MessageSquare, badge: '3', href: '/messages' },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: '5', href: '/notifications' },
    { id: 'members', label: 'Réseau', icon: Users, href: '/members' },
  ];

  return (
    <aside className="w-[200px] xl:w-[220px] shrink-0 hidden md:flex flex-col h-full justify-between overflow-y-auto no-scrollbar pb-4 select-none">
      {/* Top Section: Navigation Menu */}
      <div className="flex flex-col gap-2">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id || (pathname && pathname.startsWith(item.href));
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  if (onSelectView) onSelectView(item.id);
                }}
                className={`flex items-center gap-3 px-3 py-2 text-[13.5px] font-semibold rounded-xl transition-all cursor-pointer w-full text-left text-decoration-none ${
                  isActive
                    ? darkMode
                      ? 'bg-[#1E293B] text-[#38BDF8] border border-slate-800 shadow-sm font-bold'
                      : 'bg-white text-[#1677FF] border border-slate-100/80 shadow-card-subtle font-bold'
                    : darkMode
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${
                  isActive
                    ? darkMode ? 'text-[#38BDF8]' : 'text-[#1677FF]'
                    : 'text-[#94A3B8]'
                }`} />
                <span>{item.label}</span>

                {item.badge && (
                  <span className="ml-auto bg-[#FF3B30] text-white text-[10.5px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Carte « Passez à Pro » */}
      <div className="mt-6">
        <div className="bg-gradient-to-br from-[#1677FF] via-[#0066FF] to-[#0047BA] text-white rounded-2xl p-3.5 shadow-blue-glow border border-blue-400/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>

          <div className="flex items-center gap-1.5 text-[13.5px] font-extrabold tracking-tight text-white">
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
            <span>Passez à Pro</span>
          </div>

          <p className="text-[11px] text-blue-100 leading-snug font-medium mt-1">
            Plus d'outils, plus d'options, plus de puissance.
          </p>

          <Link
            href="/settings?tab=billing"
            onClick={() => onSelectView && onSelectView('workspace_create')}
            className="w-full mt-3 bg-white hover:bg-blue-50 text-[#1677FF] font-extrabold text-[11.5px] py-1.5 px-3 rounded-xl shadow-sm transition-all cursor-pointer text-center block text-decoration-none"
          >
            Découvrir
          </Link>
        </div>
      </div>
    </aside>
  );
}

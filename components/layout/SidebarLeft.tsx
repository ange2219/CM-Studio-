'use client'

import React, { useState, useEffect } from 'react';
import { Home, LayoutGrid, MessageSquare, Bell, Users, Sparkles, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';

export function SidebarLeft({
  darkMode,
  activeView = 'workspace',
  onSelectView
}: {
  darkMode: boolean;
  activeView?: string;
  onSelectView?: (view: string) => void;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const supabase = createClient();

  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    const currentUserId = user.id;

    async function fetchCounts() {
      try {
        // 1. Unread notifications count
        const { count: notifCount } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', currentUserId)
          .eq('is_read', false);

        setUnreadNotifsCount(notifCount || 0);

        // 2. Unread messages count
        const { data: msgs } = await supabase
          .from('messages')
          .select('id, message_reads!left(user_id)')
          .neq('sender_id', currentUserId);

        if (msgs) {
          const count = msgs.filter((m: any) => {
            const reads = m.message_reads || [];
            return !reads.some((r: any) => r.user_id === currentUserId);
          }).length;
          setUnreadMessagesCount(count);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des compteurs non lus:", err);
      }
    }

    fetchCounts();

    // Subscribe to realtime updates for notifications and messages
    const channel = supabase
      .channel('sidebar_unread_counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchCounts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchCounts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reads' }, () => {
        fetchCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const navItems = [
    { id: 'workspace', label: 'Workspace', icon: LayoutGrid, href: '/workspace' },
    { id: 'messages', label: 'Messagerie', icon: MessageSquare, badge: unreadMessagesCount > 0 ? String(unreadMessagesCount) : null, href: '/messages' },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount > 0 ? String(unreadNotifsCount) : null, href: '/notifications' },
    { id: 'settings', label: 'Paramètres', icon: Settings, href: '/settings' },
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

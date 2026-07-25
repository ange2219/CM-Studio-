'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Search, Moon, Sun, ChevronDown, User, Settings, LogOut, Award, Check, Bell } from 'lucide-react';
import { FeatherLogo } from '@/components/FeatherLogo';
import { useUser } from '@/components/context/UserContext';
import { useOrg } from '@/components/context/OrgContext';
import { createClient } from '@/lib/supabase/client';
import { UserAvatar } from '@/components/ui/UserAvatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header({ 
  darkMode, 
  onToggleDarkMode, 
  onSelectView 
}: { 
  darkMode: boolean; 
  onToggleDarkMode: () => void; 
  onSelectView?: (view: string) => void; 
}) {
  const { user } = useUser()
  const { activeOrganization, organizations, switchOrganization } = useOrg()
  const supabase = createClient()
  const router = useRouter()
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBrandList, setShowBrandList] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setShowBrandList(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch and subscribe to unread notifications count
  useEffect(() => {
    if (!user) return;
    const currentUserId = user.id;

    async function fetchCounts() {
      try {
        const { count: notifCount } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', currentUserId)
          .eq('is_read', false);

        setUnreadNotifsCount(notifCount || 0);
      } catch (err) {
        console.error("Erreur lors de la récupération des compteurs non lus:", err);
      }
    }

    fetchCounts();

    const channel = supabase
      .channel('header_unread_notifs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await supabase.auth.signOut();
    router.push('/login');
  };

  const displayName = user?.full_name || 'Utilisateur';
  const displayEmail = user?.email || '';
  const displayOrg = activeOrganization?.name || 'Ma Marque';

  return (
    <header className={`h-[64px] w-full px-4 md:px-8 flex items-center justify-between border-b transition-colors duration-300 ${darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/90'} shrink-0 z-20 shadow-xs relative`}>
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
      <div className={`hidden sm:flex items-center gap-2.5 h-10 px-4 rounded-full w-[260px] md:w-[340px] lg:w-[400px] transition-colors ${darkMode ? 'bg-[#334155]' : 'bg-[#F3F5F9]'}`}>
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
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-blue-glow border-none ${darkMode ? 'bg-[#38BDF8] text-slate-900 hover:bg-[#7dd3fc]' : 'bg-[#1677FF] text-white hover:bg-[#1266DF]'}`}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 fill-current stroke-[2]" />
          ) : (
            <Moon className="w-5 h-5 fill-current stroke-[2]" />
          )}
        </button>

        {/* Notifications Icon - Visible ONLY on Mobile */}
        <Link
          href="/notifications"
          className={`relative p-2 rounded-full md:hidden flex items-center justify-center transition-colors ${
            darkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-5.5 h-5.5" />
          {unreadNotifsCount > 0 && (
            <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadNotifsCount}
            </span>
          )}
        </Link>



        {/* User Profile Button - Desktop ONLY (hidden on mobile) */}
        <div className="relative hidden md:block" ref={menuRef}>
          <Link
            href={user?.username ? `/profile/${user.username}` : `/profile/${user?.id || 'me'}`}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-[24px] bg-transparent border border-transparent transition-all duration-200 ease-in-out cursor-pointer text-decoration-none ${darkMode
                ? 'hover:bg-slate-700/80 hover:border-slate-600/50 text-white'
                : 'hover:bg-slate-100 hover:border-slate-200/70 text-[#1E293B]'
              }`}
          >
            {/* User Avatar */}
            <UserAvatar
              avatarUrl={user?.avatar_url}
              size={36}
              className="ring-2 ring-[#1677FF] ring-offset-1 shrink-0"
            />

            {/* User Name in Bold with Active Organization underneath */}
            <div className="flex flex-col text-left leading-tight hidden sm:flex">
              <span className="text-[14.5px] font-bold truncate max-w-[160px]">
                {displayName}
              </span>
              <span className={`text-[11.5px] font-normal truncate max-w-[160px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {displayEmail}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

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
      <Link 
        href="/workspace"
        className="flex items-center gap-2.5 cursor-pointer group select-none"
      >
        <FeatherLogo darkMode={darkMode} />
        <span className={`font-bold text-[18px] tracking-tight font-['Inter'] ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
          CM Studio
        </span>
      </Link>

      {/* Middle: Search Input */}
      <div className={`hidden sm:flex items-center gap-2.5 h-10 px-4 rounded-full w-[260px] md:w-[340px] lg:w-[400px] transition-colors ${darkMode ? 'bg-[#334155]' : 'bg-[#F3F5F9]'}`}>
        <Search className={`w-4.5 h-4.5 shrink-0 ${darkMode ? 'text-slate-400' : 'text-[#94A3B8]'}`} />
        <input
          type="text"
          placeholder="Rechercher dans CM Studio..."
          className={`bg-transparent text-[14px] outline-none w-full font-normal ${darkMode ? 'text-slate-100 placeholder-slate-400' : 'text-slate-700 placeholder-[#94A3B8]'}`}
        />
      </div>

      {/* Right Side: Navigation Icons & User Profile Dropdown Button */}
      <div className="flex items-center gap-3.5">
        
        {/* Notifications Icon (Bell) - Encircled & Neutral for all views */}
        <Link
          href="/notifications"
          title="Notifications"
          className={`relative w-10 h-10 rounded-full flex items-center justify-center border border-[var(--b1)] bg-[var(--card)] shadow-xs transition-all duration-200 cursor-pointer ${
            darkMode 
              ? 'text-slate-300 hover:text-white hover:bg-slate-700/80 hover:border-slate-600' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300'
          }`}
        >
          <Bell className="w-5 h-5" />
          {unreadNotifsCount > 0 && (
            <span 
              className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm"
              style={{ border: '2px solid var(--card)' }}
            >
              {unreadNotifsCount}
            </span>
          )}
        </Link>

        {/* Dark / Light Mode Toggle Button - Encircled & Neutral */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          title={darkMode ? 'Passer au Mode Clair' : 'Passer au Mode Sombre'}
          className={`w-10 h-10 rounded-full flex items-center justify-center border border-[var(--b1)] bg-[var(--card)] shadow-xs transition-all duration-200 cursor-pointer ${
            darkMode 
              ? 'text-slate-300 hover:text-white hover:bg-slate-700/80 hover:border-slate-600' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300'
          }`}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 stroke-[2]" />
          ) : (
            <Moon className="w-5 h-5 stroke-[2]" />
          )}
        </button>



        {/* User Profile Dropdown Button */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-expanded={isMenuOpen}
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-[12px] transition-all duration-150 cursor-pointer border select-none ${
              isMenuOpen
                ? darkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-100 border-slate-200 text-[#0F172A]'
                : darkMode
                  ? 'bg-transparent border-transparent hover:bg-slate-800/60 text-slate-200'
                  : 'bg-transparent border-transparent hover:bg-slate-100/80 text-slate-700'
            }`}
          >
            {/* User Avatar */}
            <UserAvatar
              avatarUrl={user?.avatar_url}
              size={34}
              className="ring-2 ring-[#1677FF] ring-offset-1 shrink-0"
            />

            {/* User Name in Bold with Email underneath */}
            <div className="flex flex-col text-left leading-tight hidden md:flex">
              <span className="text-[13.5px] font-bold truncate max-w-[140px]">
                {displayName}
              </span>
              <span className={`text-[11px] font-normal truncate max-w-[140px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {displayEmail}
              </span>
            </div>

            <ChevronDown className={`w-4 h-4 transition-transform duration-200 hidden sm:block ${isMenuOpen ? 'rotate-180 text-[#1677FF]' : 'text-slate-400'}`} />
          </button>

          {/* Context Dropdown Menu */}
          {isMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '240px',
                borderRadius: '12px',
                zIndex: 50,
                boxShadow: '0 10px 30px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
              }}
              className={`p-1.5 border animate-in fade-in zoom-in-95 duration-150 ${
                darkMode
                  ? 'bg-[#1E293B] border-slate-700/80 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {/* User Header in Menu */}
              <div className={`px-3 py-2.5 rounded-lg mb-1 ${darkMode ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                <p className="text-[13px] font-bold truncate m-0 text-[var(--t1)]">
                  {displayName}
                </p>
                <p className={`text-[11px] truncate m-0 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {displayEmail}
                </p>
              </div>

              {/* Menu Links */}
              <div className="flex flex-col gap-0.5">
                <Link
                  href={user?.username ? `/profile/${user.username}` : `/profile/${user?.id || 'me'}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-lg transition-colors text-decoration-none ${
                    darkMode
                      ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Mon Profil</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-lg transition-colors text-decoration-none ${
                    darkMode
                      ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Paramètres</span>
                </Link>

                <div className={`my-1 border-t ${darkMode ? 'border-slate-700/80' : 'border-slate-200'}`} />

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:text-red-400 rounded-lg transition-colors text-left cursor-pointer border-none bg-transparent"
                >
                  <LogOut className="w-4 h-4" />
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

'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageSquare, UserPlus, Sparkles, CheckCheck, Bell } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function NotificationsPage({ darkMode: propDarkMode }: { darkMode?: boolean }) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const { user } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'socials'
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function loadNotifs() {
      if (!user) return;
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (data && data.length > 0) {
        setNotifications(data.map(n => ({
          id: n.id,
          category: n.platform === 'cm_studio' ? 'studio' : 'socials',
          type: n.type || 'system',
          title: n.title || n.message,
          subtitle: n.title ? n.message : undefined,
          time: getShortTimeAgo(n.created_at),
          read: n.is_read || false,
          action_url: n.action_url || null,
        })));
      } else {
        setNotifications([]);
      }
    }
    loadNotifs();
  }, [supabase, user]);

  const handleNotifClick = async (notif: any) => {
    if (!notif.read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      if (user) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notif.id);
      }
    }

    if (notif.action_url) {
      let url = notif.action_url;
      if (url.startsWith('/community')) {
        url = url.replace('/community', '/home');
      }
      router.push(url);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (user) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id);
    }
  };

  const filteredNotifs = notifications.filter(n => n.category === activeTab);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-[#1677FF]" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col gap-4 overflow-y-auto no-scrollbar select-none">
      
      {/* Top Header Card */}
      <div className={`rounded-2xl p-4 md:p-5 shadow-card-subtle border shrink-0 transition-colors duration-300 flex items-center justify-between ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#1677FF] dark:text-[#38BDF8]">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold leading-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Centre de Notifications
            </h2>
            <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Restez informé de l'activité de votre communauté et de vos réseaux.
            </p>
          </div>
        </div>

        <button
          onClick={markAllAsRead}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer border-none ${
            darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <CheckCheck className="w-4 h-4 text-[#1677FF]" />
          <span>Tout marquer comme lu</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className={`flex items-center gap-4 px-2 border-b shrink-0 ${
        darkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <button
          onClick={() => setActiveTab('studio')}
          className={`py-2 text-[13.5px] font-bold relative transition-all cursor-pointer bg-transparent border-none ${
            activeTab === 'studio'
              ? darkMode ? 'text-white' : 'text-[#1677FF]'
              : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>CM Studio</span>
          {activeTab === 'studio' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1677FF] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('socials')}
          className={`py-2 text-[13.5px] font-bold relative transition-all cursor-pointer bg-transparent border-none ${
            activeTab === 'socials'
              ? darkMode ? 'text-white' : 'text-[#1677FF]'
              : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Réseaux Sociaux</span>
          {activeTab === 'socials' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1677FF] rounded-full" />
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-2.5 pb-6">
        {filteredNotifs.map((notif) => (
          <div
            key={notif.id}
            onClick={() => handleNotifClick(notif)}
            className={`rounded-2xl p-4 shadow-card-subtle border flex items-center justify-between transition-all ${
              notif.action_url ? 'cursor-pointer hover:border-blue-400/50' : 'cursor-default'
            } ${
              !notif.read
                ? darkMode ? 'bg-[#1E293B] border-blue-500/30' : 'bg-blue-50/40 border-blue-100'
                : darkMode ? 'bg-[#1E293B]/70 border-slate-800/80' : 'bg-white border-slate-100'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-[#1677FF] flex items-center justify-center shrink-0">
                {getIcon(notif.type)}
              </div>

              <div className="flex flex-col min-w-0">
                <span className={`text-[13.5px] font-bold leading-snug ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                  {notif.title}
                </span>
                {notif.subtitle && (
                  <span className={`text-[12px] leading-snug mt-0.5 truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {notif.subtitle}
                  </span>
                )}
                <span className={`text-[11px] font-medium mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {notif.time}
                </span>
              </div>
            </div>

            {!notif.read && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#1677FF] shrink-0 ml-3" />
            )}
          </div>
        ))}
      </div>

    </div>
  );
}

function getShortTimeAgo(dateStr: string | null | undefined) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "à l'instant";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} h`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} j`;
}

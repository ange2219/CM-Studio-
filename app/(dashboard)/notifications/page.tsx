'use client'

import React, { useState } from 'react';
import { Heart, MessageSquare, UserPlus, Sparkles, CheckCheck, Bell } from 'lucide-react';

export default function NotificationsPage({ darkMode = false }: { darkMode?: boolean }) {
  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'socials'
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      category: 'studio',
      type: 'like',
      title: 'Laura Fisher a aimé votre publication',
      time: 'Il y a 10 minutes',
      read: false,
      user: {
        name: 'Laura Fisher',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      }
    },
    {
      id: 2,
      category: 'studio',
      type: 'comment',
      title: 'Marc Dubois a commenté votre post',
      subtitle: '"C\'est absolument grandiose ! Quel endroit exact est-ce ?"',
      time: 'Il y a 1 heure',
      read: false,
      user: {
        name: 'Marc Dubois',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      }
    },
    {
      id: 3,
      category: 'studio',
      type: 'follow',
      title: 'Sophie Martin a commencé à vous suivre',
      time: 'Il y a 3 heures',
      read: true,
      user: {
        name: 'Sophie Martin',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      }
    },
    {
      id: 4,
      category: 'socials',
      type: 'social',
      platform: 'Instagram',
      title: 'Votre post Instagram est maintenant en ligne !',
      subtitle: 'Campagne Été 2026 • 248 impressions au cours de la première heure.',
      time: 'Il y a 4 heures',
      read: false,
    },
    {
      id: 5,
      category: 'socials',
      type: 'social',
      platform: 'LinkedIn',
      title: 'Nouveau pic d\'engagement sur LinkedIn (+35%)',
      subtitle: 'Votre publication sur le Design System Antigravity suscite de vives réactions.',
      time: 'Hier',
      read: true,
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
            className={`rounded-2xl p-4 shadow-card-subtle border flex items-center justify-between transition-all cursor-pointer ${
              !notif.read
                ? darkMode ? 'bg-[#1E293B] border-blue-500/30' : 'bg-blue-50/40 border-blue-100'
                : darkMode ? 'bg-[#1E293B]/70 border-slate-800/80' : 'bg-white border-slate-100'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {notif.user ? (
                <div className="relative shrink-0">
                  <img
                    src={notif.user.avatar}
                    alt={notif.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border shadow-sm ${
                    darkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-white border-slate-200'
                  }`}>
                    {getIcon(notif.type)}
                  </span>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-[#1677FF] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
              )}

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

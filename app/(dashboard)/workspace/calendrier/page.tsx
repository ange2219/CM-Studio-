'use client'

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';

export default function CalendarPage({ darkMode: propDarkMode }: { darkMode?: boolean }) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const [currentMonth, setCurrentMonth] = useState('Juillet 2026');

  const scheduledPosts = [
    { day: 5, time: '10:00', title: 'Reels - Coulisses Studio', platform: 'Instagram', color: 'bg-rose-500' },
    { day: 12, time: '14:30', title: 'Post Carrousel Design System', platform: 'LinkedIn', color: 'bg-blue-600' },
    { day: 18, time: '09:15', title: 'Vidéo Tuto IA CM Studio', platform: 'TikTok', color: 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900' },
    { day: 24, time: '18:00', title: 'Bilan Mensuel & Nouveautés', platform: 'Facebook', color: 'bg-blue-500' },
  ];

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex-1 h-full flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6 select-none">
      
      {/* Top Header Card */}
      <div className={`rounded-2xl p-4 md:p-5 shadow-card-subtle border shrink-0 transition-colors duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-[#1677FF] dark:text-[#38BDF8] flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold leading-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Calendrier Éditorial
            </h2>
            <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Planifiez et visualisez la diffusion de vos contenus dans le temps.
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            darkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <button className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer bg-transparent border-none">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className={`text-[13px] font-bold px-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {currentMonth}
            </span>
            <button className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer bg-transparent border-none">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button className="bg-[#1677FF] hover:bg-[#1266DF] text-white text-[12px] font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-blue-glow cursor-pointer border-none">
            <Plus className="w-4 h-4" />
            <span>Planifier</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className={`flex-1 rounded-2xl p-4 shadow-card-subtle border flex flex-col justify-between ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] uppercase font-bold text-slate-400">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mer</span>
          <span>Jeu</span>
          <span>Ven</span>
          <span>Sam</span>
          <span>Dim</span>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
          {daysInMonth.map((day) => {
            const postsForDay = scheduledPosts.filter(p => p.day === day);
            const isToday = day === 23;

            return (
              <div
                key={day}
                className={`p-1.5 rounded-xl border min-h-[70px] flex flex-col justify-between transition-all ${
                  isToday
                    ? 'border-[#1677FF] bg-blue-50/30 dark:bg-blue-500/10'
                    : darkMode ? 'border-slate-800/80 bg-[#0F172A]/40' : 'border-slate-100 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[12px] font-bold px-1.5 py-0.5 rounded-md ${
                    isToday
                      ? 'bg-[#1677FF] text-white'
                      : darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {day}
                  </span>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  {postsForDay.map((post, idx) => (
                    <div
                      key={idx}
                      onClick={() => alert(`Détails du post : ${post.title}`)}
                      className={`p-1 px-1.5 rounded-lg text-[10px] text-white font-semibold truncate cursor-pointer shadow-sm ${post.color}`}
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span className="truncate">{post.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

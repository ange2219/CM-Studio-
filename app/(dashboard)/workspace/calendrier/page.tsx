'use client'

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Sparkles } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';
import Link from 'next/link';

export default function CalendarPage({ darkMode: propDarkMode }: { darkMode?: boolean }) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const { user } = useUser();
  const supabase = createClient();

  const [currentMonth, setCurrentMonth] = useState('Juillet 2026');
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);

  useEffect(() => {
    async function loadScheduledPosts() {
      if (!user) return;
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .not('scheduled_at', 'is', null)
        .order('scheduled_at', { ascending: true });

      if (data && data.length > 0) {
        setScheduledPosts(data.map(p => ({
          id: p.id,
          title: p.title || p.content?.slice(0, 40) || 'Post planifié',
          platform: p.platform || 'Multi-réseaux',
          date: new Date(p.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          time: new Date(p.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })));
      } else {
        setScheduledPosts([
          {
            id: '1',
            title: 'Lancement officiel Campagne Été 2026',
            platform: 'Instagram & Facebook',
            date: '24 Jul',
            time: '14:00',
          },
          {
            id: '2',
            title: 'Webinaire IA & Community Management',
            platform: 'LinkedIn',
            date: '27 Jul',
            time: '10:30',
          }
        ]);
      }
    }
    loadScheduledPosts();
  }, [supabase, user]);

  return (
    <div className="flex-1 h-full flex flex-col gap-4 overflow-y-auto no-scrollbar select-none pb-6">
      
      {/* Top Header Card */}
      <div className={`rounded-2xl p-4 md:p-5 shadow-card-subtle border shrink-0 transition-colors duration-300 flex items-center justify-between ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1677FF] text-white flex items-center justify-center shadow-blue-glow">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold leading-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Calendrier Éitorial
            </h2>
            <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Visualisez et organisez vos publications programmées au fil du mois.
            </p>
          </div>
        </div>

        <Link
          href="/workspace/create"
          className="bg-[#1677FF] hover:bg-[#1266DF] text-white text-[12.5px] font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-blue-glow cursor-pointer border-none transition-all text-decoration-none"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Planifier un contenu</span>
        </Link>
      </div>

      {/* Calendar Grid & Scheduled Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Calendar View (Left Col) */}
        <div className={`lg:col-span-8 rounded-2xl p-4 md:p-5 shadow-card-subtle border flex flex-col gap-4 ${
          darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-[15px] font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              {currentMonth}
            </h3>
            <div className="flex items-center gap-1">
              <button className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days Grid Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-[12px] font-bold text-slate-400">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mer</div>
            <div>Jeu</div>
            <div>Ven</div>
            <div>Sam</div>
            <div>Dim</div>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }).map((_, idx) => {
              const dayNum = idx + 1;
              const hasPost = dayNum === 24 || dayNum === 27;
              return (
                <div
                  key={dayNum}
                  className={`h-16 p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                    hasPost
                      ? darkMode ? 'bg-blue-500/10 border-blue-500/40' : 'bg-blue-50/70 border-blue-200'
                      : darkMode ? 'bg-[#0F172A] border-slate-800 hover:border-slate-700' : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <span className={`text-[12px] font-bold ${hasPost ? 'text-[#1677FF] dark:text-[#38BDF8]' : darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {dayNum}
                  </span>
                  {hasPost && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1677FF] text-white truncate">
                      Post planifié
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Scheduled Posts Sidebar (Right Col) */}
        <div className={`lg:col-span-4 rounded-2xl p-4 md:p-5 shadow-card-subtle border flex flex-col gap-3 ${
          darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
        }`}>
          <h3 className={`text-[14px] font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
            Prochaines Publications
          </h3>

          <div className="flex flex-col gap-3">
            {scheduledPosts.map((post) => (
              <div
                key={post.id}
                className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                  darkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#1677FF] text-white">
                    {post.platform}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.date} à {post.time}
                  </span>
                </div>
                <p className={`text-[13px] font-bold line-clamp-2 ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                  {post.title}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

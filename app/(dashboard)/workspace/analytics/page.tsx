'use client'

import React from 'react';
import { BarChart2, TrendingUp, Eye, Heart, MessageSquare } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';

export default function AnalyticsPage({ darkMode: propDarkMode }: { darkMode?: boolean }) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const kpis = [
    { title: 'Impressions Totales', value: '128,450', change: '+24.5%', isUp: true, icon: Eye, color: 'text-[#1677FF] bg-blue-50 dark:bg-blue-500/10' },
    { title: 'Taux d\'engagement', value: '5.82%', change: '+1.2%', isUp: true, icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
    { title: 'Total J\'aime', value: '14,210', change: '+18.4%', isUp: true, icon: Heart, color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' },
    { title: 'Commentaires & Partages', value: '3,840', change: '+8.9%', isUp: true, icon: MessageSquare, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
  ];

  return (
    <div className="flex-1 h-full flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6 select-none">
      
      {/* Header */}
      <div className={`rounded-2xl p-4 md:p-5 shadow-card-subtle border shrink-0 transition-colors duration-300 flex items-center justify-between ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-[#1677FF] dark:text-[#38BDF8] flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold leading-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Analytiques & Performances
            </h2>
            <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Suivez l'impact et la croissance de vos réseaux sociaux en temps réel.
            </p>
          </div>
        </div>

        <select className={`text-[12.5px] font-semibold p-2 px-3 rounded-xl border outline-none ${
          darkMode ? 'bg-[#0F172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <option>Les 30 derniers jours</option>
          <option>Les 7 derniers jours</option>
          <option>Ce mois-ci</option>
        </select>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((kpi, idx) => {
          const IconComp = kpi.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl p-4 shadow-card-subtle border flex flex-col justify-between transition-colors ${
                darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[12px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {kpi.title}
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <IconComp className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between mt-2">
                <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                  {kpi.value}
                </span>
                <span className="text-[11.5px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {kpi.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Visual Simulation Card */}
      <div className={`rounded-2xl p-5 shadow-card-subtle border flex flex-col gap-4 ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-[14px] font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
            Évolution de l'engagement quotidien
          </h3>
          <span className="text-[12px] font-semibold text-[#1677FF] dark:text-[#38BDF8]">
            Instagram + LinkedIn
          </span>
        </div>

        {/* Visual Bar Chart simulation */}
        <div className="h-44 w-full flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
          {[45, 65, 30, 85, 95, 60, 75, 90, 100, 70, 80, 110].map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div
                style={{ height: `${val}%` }}
                className="w-full bg-[#1677FF] hover:bg-[#1266DF] rounded-t-lg transition-all cursor-pointer relative group-hover:scale-y-105"
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow pointer-events-none transition-opacity">
                  {val * 12}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">{`J${idx + 1}`}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

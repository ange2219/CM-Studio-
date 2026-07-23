'use client'

import React, { useState } from 'react';
import { 
  PenTool, 
  Calendar, 
  BarChart2, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  CheckSquare, 
  Square, 
  Trash2, 
  Send, 
  Video, 
  Grid3X3, 
  Image as ImageIcon, 
  Pencil, 
  X,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';

import { useTheme } from '@/components/context/ThemeContext';

export function PostsDashboard({
  darkMode: propDarkMode,
  onNavigateCreate,
  onSelectView
}: {
  darkMode?: boolean;
  onNavigateCreate?: () => void;
  onSelectView?: (view: string) => void;
}) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const [selectedIds, setSelectedIds] = useState(new Set<string>());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInspirationModal, setShowInspirationModal] = useState(false);
  const [previewPost, setPreviewPost] = useState<any>(null);

  // Recent posts data
  const [posts, setPosts] = useState([
    {
      id: '1',
      content: "L'hiver est le moment parfait pour révéler ta vraie puissance créative et préparer des campagnes marquantes...",
      platform: 'linkedin',
      status: 'draft',
      statusLabel: 'Brouillon',
      media_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
      time: 'Il y a 2h'
    },
    {
      id: '2',
      content: 'Quand l\'innovation rencontre la passion, des projets uniques voient le jour. Découvrez nos coulisses !',
      platform: 'linkedin',
      status: 'draft',
      statusLabel: 'Brouillon',
      media_url: null,
      time: 'Il y a 5h'
    },
    {
      id: '3',
      content: 'L\'inertie des entreprises face aux nouvelles technologies IA : comment garder une longueur d\'avance ?',
      platform: 'linkedin',
      status: 'draft',
      statusLabel: 'Brouillon',
      media_url: null,
      time: 'Hier'
    }
  ]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return new Set(next);
    });
  };

  const deleteSelected = () => {
    setPosts(prev => prev.filter(p => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  };

  const inspirationIdeas = [
    { title: "Coulisses & REX", text: "Partagez 3 leçons apprises lors de votre dernier projet clé." },
    { title: "Tendance & IA", text: "Comment l'IA transforme votre secteur d'activité cette année ?" },
    { title: "Tutoriel rapide", text: "5 étapes simples pour booster son taux d'engagement sur LinkedIn." },
  ];

  return (
    <div className="flex-1 h-full flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6 relative select-none">
      
      {/* 1. Header Title & Subtitle */}
      <div>
        <h1 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
          Workspace
        </h1>
        <p className={`text-[13px] font-medium mt-1 ${darkMode ? 'text-slate-400' : 'text-[#64748B]'}`}>
          Votre centre de création, de planification et d'analyse.
        </p>
      </div>

      {/* 2. Top 4 Action Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
        
        {/* Card 1: Nouveau post */}
        <div 
          onClick={() => setShowCreateModal(true)}
          className={`p-3.5 rounded-[16px] border shadow-card-subtle flex flex-col justify-between gap-3 min-h-[135px] transition-all duration-200 group hover:-translate-y-0.5 cursor-pointer ${
            darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-[36px] h-[36px] rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#1677FF] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <PenTool className="w-4.5 h-4.5" />
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowCreateModal(true); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <h3 className={`text-[13.5px] font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Nouveau post
            </h3>
            <p className={`text-[11px] leading-tight mt-0.5 ${darkMode ? 'text-slate-400' : 'text-[#64748B]'}`}>
              Créez ou générez du contenu avec l'IA.
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setShowCreateModal(true); }}
            className="w-full py-1.5 px-3 rounded-[12px] text-[11.5px] font-bold bg-[#1677FF] hover:bg-[#1266DF] text-white flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-all mt-1"
          >
            <span>Créer</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 2: Calendrier */}
        <Link 
          href="/workspace/calendrier"
          className={`p-3.5 rounded-[16px] border shadow-card-subtle flex flex-col justify-between gap-3 min-h-[135px] transition-all duration-200 group hover:-translate-y-0.5 cursor-pointer text-decoration-none ${
            darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-[36px] h-[36px] rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#1677FF] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <span className="text-slate-400 p-1 rounded-lg">
                <Plus className="w-4 h-4" />
              </span>
            </div>
            <h3 className={`text-[13.5px] font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Calendrier
            </h3>
            <p className={`text-[11px] leading-tight mt-0.5 ${darkMode ? 'text-slate-400' : 'text-[#64748B]'}`}>
              Planifiez et programmez vos publications.
            </p>
          </div>

          <div className="w-full py-1.5 px-3 rounded-[12px] text-[11.5px] font-bold bg-[#1677FF] hover:bg-[#1266DF] text-white flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-all mt-1">
            <span>Ouvrir</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 3: Analytique */}
        <Link 
          href="/workspace/analytics"
          className={`p-3.5 rounded-[16px] border shadow-card-subtle flex flex-col justify-between gap-3 min-h-[135px] transition-all duration-200 group hover:-translate-y-0.5 cursor-pointer text-decoration-none ${
            darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-[36px] h-[36px] rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#1677FF] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <BarChart2 className="w-4.5 h-4.5" />
              </div>
            </div>
            <h3 className={`text-[13.5px] font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Analytique
            </h3>
            <p className={`text-[11px] leading-tight mt-0.5 ${darkMode ? 'text-slate-400' : 'text-[#64748B]'}`}>
              Suivez vos performances et votre croissance.
            </p>
          </div>

          <div className="w-full py-1.5 px-3 rounded-[12px] text-[11.5px] font-bold bg-[#1677FF] hover:bg-[#1266DF] text-white flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-all mt-1">
            <span>Voir</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 4: Inspiration */}
        <div 
          onClick={() => setShowInspirationModal(true)}
          className={`p-3.5 rounded-[16px] border shadow-card-subtle flex flex-col justify-between gap-3 min-h-[135px] transition-all duration-200 group hover:-translate-y-0.5 cursor-pointer ${
            darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-[36px] h-[36px] rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#1677FF] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
            </div>
            <h3 className={`text-[13.5px] font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Inspiration
            </h3>
            <p className={`text-[11px] leading-tight mt-0.5 ${darkMode ? 'text-slate-400' : 'text-[#64748B]'}`}>
              Idées de contenu tendance pour vous.
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setShowInspirationModal(true); }}
            className="w-full py-1.5 px-3 rounded-[12px] text-[11.5px] font-bold bg-[#1677FF] hover:bg-[#1266DF] text-white flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-all mt-1"
          >
            <span>Explorer</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

      {/* 3. Section Posts récents */}
      <div className="flex flex-col gap-3.5 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Posts récents
            </h2>
            <span className="bg-[#1677FF] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {posts.length}
            </span>
          </div>

          {selectedIds.size > 0 && (
            <button
              onClick={deleteSelected}
              className="text-rose-500 hover:text-rose-600 text-[12px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer ({selectedIds.size})</span>
            </button>
          )}
        </div>

        {/* Portrait Cards Grid (Fixed Light Mode & Dark Mode colors) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 w-full">
          {posts.map((post) => {
            const isSelected = selectedIds.has(post.id);
            return (
              <div
                key={post.id}
                onClick={() => setPreviewPost && setPreviewPost(post)}
                className={`rounded-[14px] overflow-hidden border shadow-card-subtle flex flex-col justify-between transition-all cursor-pointer group relative aspect-[1/1.3] max-w-[230px] w-full ${
                  isSelected
                    ? 'ring-2 ring-[#1677FF] border-[#1677FF]'
                    : darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
                }`}
              >
                {/* Top Image / Media Area */}
                <div className={`h-[175px] w-full relative overflow-hidden flex items-center justify-center shrink-0 ${
                  darkMode ? 'bg-[#0A0F1D]' : 'bg-slate-100'
                }`}>
                  {post.media_url ? (
                    <img
                      src={post.media_url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-700">
                      <svg className="w-9 h-9 stroke-[1.2] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}

                  {/* Checkbox Overlay (Top Left) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(post.id); }}
                    className="absolute top-2.5 left-2.5 z-10 p-0.5 rounded bg-slate-900/30 dark:bg-slate-950/40 backdrop-blur-xs text-white cursor-pointer hover:scale-105 transition-transform"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4.5 h-4.5 text-[#1677FF] fill-white" />
                    ) : (
                      <Square className="w-4.5 h-4.5 text-white/80 dark:text-white/70" />
                    )}
                  </button>

                  {/* Platform Logo Badge (Top Right) */}
                  <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded bg-[#0077B5] text-white flex items-center justify-center font-bold text-[10.5px] shadow-sm">
                    in
                  </div>
                </div>

                {/* Bottom Footer Info Area */}
                <div className={`p-2.5 flex-1 flex flex-col justify-between border-t ${
                  darkMode 
                    ? 'bg-slate-900/60 border-slate-800 text-slate-200' 
                    : 'bg-[#F8FAFC] border-slate-100 text-slate-800'
                }`}>
                  <p className={`text-[11.5px] leading-tight font-semibold line-clamp-2 ${
                    darkMode ? 'text-slate-200' : 'text-[#1E293B]'
                  }`}>
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`font-extrabold text-[10.5px] ${
                      darkMode ? 'text-amber-400' : 'text-amber-600'
                    }`}>
                      {post.statusLabel}
                    </span>

                    <button 
                      onClick={(e) => { e.stopPropagation(); if (onNavigateCreate) onNavigateCreate(); }}
                      className="text-[#1677FF] hover:text-[#1266DF] p-1 cursor-pointer transition-colors"
                      title="Modifier / Envoi"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 4. MODALE "Que voulez-vous créer ?" */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-[640px] p-[1.5rem] rounded-[16px] border shadow-2xl relative ${
            darkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Que voulez-vous créer ?</h3>
                <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Choisissez l'une de nos fonctionnalités pour propulser votre présence sociale.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Générer par IA", desc: "Générez un post optimisé pour vos réseaux sociaux avec notre IA.", icon: Sparkles, color: "bg-blue-50 text-[#1677FF] dark:bg-blue-500/10 dark:text-[#38BDF8]" },
                { title: "Créer un Réel / Vidéo", desc: "Générez ou planifiez un Réel Instagram, TikTok ou YouTube Short.", icon: Video, color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400", badge: "Bientôt" },
                { title: "Créer un Carrousel", desc: "Concevez un carrousel d'images engageant avec du texte généré par l'IA.", icon: Grid3X3, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400", badge: "Bientôt" },
                { title: "Créer une Story / Image", desc: "Générez une image simple ou une story avec des prompts IA.", icon: ImageIcon, color: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400", badge: "Bientôt" },
                { title: "Planifier une publication", desc: "Planifiez et organisez une série de posts à l'avance dans le calendrier.", icon: Calendar, color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400", badge: "Bientôt" },
                { title: "Créer manuellement", desc: "Rédigez vous-même votre contenu et importez vos propres visuels.", icon: Pencil, color: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400" },
              ].map((opt, i) => {
                const IconC = opt.icon;
                return (
                  <div
                    key={i}
                    onClick={() => {
                      setShowCreateModal(false);
                      if (onNavigateCreate) onNavigateCreate();
                    }}
                    className={`p-3.5 rounded-[12px] border transition-all cursor-pointer group flex items-start gap-3 ${
                      darkMode ? 'bg-[#0F172A] border-slate-800 hover:border-[#1677FF]' : 'bg-slate-50 border-slate-200 hover:border-[#1677FF]'
                    }`}
                  >
                    <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 ${opt.color}`}>
                      <IconC className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-[13.5px] font-bold group-hover:text-[#1677FF] transition-colors">{opt.title}</h4>
                        {opt.badge && <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{opt.badge}</span>}
                      </div>
                      <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Inspiration Modal */}
      {showInspirationModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-5 border shadow-2xl ${
            darkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Idées d'Inspiration IA</h3>
              </div>
              <button
                onClick={() => setShowInspirationModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {inspirationIdeas.map((idea, i) => (
                <div key={i} className={`p-3 rounded-xl border ${
                  darkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[12.5px] font-bold text-[#1677FF] block mb-1">
                    {idea.title}
                  </span>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-snug">
                    {idea.text}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowInspirationModal(false);
                if (onNavigateCreate) onNavigateCreate();
              }}
              className="w-full mt-4 py-2.5 bg-[#1677FF] hover:bg-[#1266DF] text-white text-[12.5px] font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Générer avec ces idées →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

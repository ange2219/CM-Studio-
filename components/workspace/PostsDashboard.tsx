'use client'

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  FileText, 
  Filter, 
  Search, 
  ChevronRight,
  Send
} from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';
import Link from 'next/link';

export function PostsDashboard({
  darkMode: propDarkMode,
  onNavigateCreate,
}: {
  darkMode?: boolean;
  onNavigateCreate?: () => void;
}) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const { user } = useUser();
  const supabase = createClient();

  const [selectedIds, setSelectedIds] = useState(new Set<string>());
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'scheduled' | 'draft'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [postsList, setPostsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserPosts() {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setPostsList(data.map(p => ({
          id: p.id,
          title: p.title || p.content?.slice(0, 45) || 'Publication sans titre',
          platform: p.platform || 'Multi-réseaux',
          status: p.status || 'draft',
          date: p.scheduled_at ? new Date(p.scheduled_at).toLocaleDateString('fr-FR') : new Date(p.created_at).toLocaleDateString('fr-FR'),
          content: p.content,
        })));
      } else {
        // Fallback default sample posts if DB table is empty
        setPostsList([
          {
            id: '1',
            title: 'Lancement officiel de la campagne Été 2026',
            platform: 'Instagram & Facebook',
            status: 'scheduled',
            date: '24 Juillet 2026 • 14:00',
            content: 'Découvrez nos nouveautés estivales en avant-première !',
          },
          {
            id: '2',
            title: 'Top 5 des conseils pour optimiser votre présence LinkedIn',
            platform: 'LinkedIn',
            status: 'published',
            date: '21 Juillet 2026',
            content: 'La régularité et l\'engagement sont les clés du succès.',
          },
          {
            id: '3',
            title: 'Annonce partenariat stratégique CM Studio',
            platform: 'Multi-réseaux',
            status: 'draft',
            date: 'Brouillon enregistré',
            content: 'Nous sommes fiers d\'annoncer notre nouveau partenariat.',
          }
        ]);
      }
      setLoading(false);
    }
    loadUserPosts();
  }, [supabase, user]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const idsArray = Array.from(selectedIds);
    setPostsList(prev => prev.filter(p => !selectedIds.has(p.id)));
    setSelectedIds(new Set());

    if (user) {
      await supabase.from('posts').delete().in('id', idsArray);
    }
  };

  const filteredPosts = postsList.filter(p => {
    const matchesTab = activeTab === 'all' || p.status === activeTab;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle className="w-3 h-3" />
            Publié
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1677FF] dark:bg-blue-500/10 dark:text-[#38BDF8]">
            <Clock className="w-3 h-3" />
            Planifié
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <FileText className="w-3 h-3" />
            Brouillon
          </span>
        );
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col gap-4 overflow-y-auto no-scrollbar select-none pb-6">
      
      {/* Top Header Card */}
      <div className={`rounded-2xl p-4 md:p-5 shadow-card-subtle border shrink-0 transition-colors duration-300 flex items-center justify-between ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1677FF] text-white flex items-center justify-center shadow-blue-glow">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold leading-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Workspace — Publications & Calendrier
            </h2>
            <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Gérez l'ensemble de vos contenus créés, planifiés ou enregistrés en brouillon.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-rose-500 hover:bg-rose-600 text-white text-[12px] font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer border-none transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer ({selectedIds.size})</span>
            </button>
          )}

          <Link
            href="/workspace/create"
            className="bg-[#1677FF] hover:bg-[#1266DF] text-white text-[12.5px] font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-blue-glow cursor-pointer border-none transition-all text-decoration-none"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nouvelle Publication</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className={`rounded-2xl p-3 shadow-card-subtle border shrink-0 flex flex-wrap items-center justify-between gap-3 ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'Tous les posts' },
            { id: 'published', label: 'Publiés' },
            { id: 'scheduled', label: 'Planifiés' },
            { id: 'draft', label: 'Brouillons' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-[12.5px] font-bold transition-all cursor-pointer border-none ${
                activeTab === tab.id
                  ? 'bg-[#1677FF] text-white shadow-sm'
                  : darkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 bg-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border w-full sm:w-[240px] ${
          darkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer les posts..."
            className={`w-full text-[12.5px] bg-transparent outline-none ${
              darkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      {/* Posts Table List */}
      <div className={`rounded-2xl shadow-card-subtle border overflow-hidden shrink-0 transition-colors duration-300 ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                darkMode ? 'bg-[#0F172A] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
              }`}>
                <th className="p-3.5 pl-4 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(new Set(filteredPosts.map(p => p.id)));
                      else setSelectedIds(new Set());
                    }}
                    checked={selectedIds.size > 0 && selectedIds.size === filteredPosts.length}
                    className="cursor-pointer"
                  />
                </th>
                <th className="p-3.5">Publication & Contenu</th>
                <th className="p-3.5">Plateforme</th>
                <th className="p-3.5">Statut</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-[13px]">
                    Aucune publication ne correspond à ces critères.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const isSelected = selectedIds.has(post.id);
                  return (
                    <tr
                      key={post.id}
                      className={`transition-colors ${
                        isSelected
                          ? darkMode ? 'bg-slate-800/80' : 'bg-blue-50/50'
                          : darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <td className="p-3.5 pl-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(post.id)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5 min-w-[240px]">
                        <div className="flex flex-col">
                          <span className={`font-bold leading-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                            {post.title}
                          </span>
                          {post.content && (
                            <span className={`text-[11.5px] truncate max-w-[280px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              {post.content}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-600 dark:text-slate-300">
                        {post.platform}
                      </td>
                      <td className="p-3.5">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="p-3.5 text-[12px] font-medium text-slate-500 dark:text-slate-400">
                        {post.date}
                      </td>
                      <td className="p-3.5 text-right pr-4">
                        <Link
                          href="/workspace/create"
                          className="text-[#1677FF] hover:underline font-bold text-[12px] text-decoration-none"
                        >
                          Éditer
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

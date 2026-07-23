'use client'

import React, { useState } from 'react';
import { Search, UserPlus, Check, Sparkles } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';

export default function MembersPage({ darkMode: propDarkMode }: { darkMode?: boolean }) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const [activeTab, setActiveTab] = useState('suggestions'); // 'suggestions' | 'groups'
  const [searchTerm, setSearchTerm] = useState('');

  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'Julia Smith',
      handle: '@juliasmith',
      role: 'Social Media Manager',
      reason: '2 groupes en commun',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      following: false,
    },
    {
      id: 2,
      name: 'Vermillion D. Gray',
      handle: '@vermilliongray',
      role: 'Content Creator',
      reason: 'Recommandé pour vous',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      following: false,
    },
    {
      id: 3,
      name: 'Mai Senpai',
      handle: '@maisenpai',
      role: 'DA & UI Designer',
      reason: 'Suivi(e) par Marc & Laura',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      following: false,
    },
    {
      id: 4,
      name: 'Azunyan U. Wu',
      handle: '@azunyandesu',
      role: 'Copywriter Freelance',
      reason: 'Populaire ce mois-ci',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      following: true,
    },
    {
      id: 5,
      name: 'Oarack Babama',
      handle: '@obama21',
      role: 'Growth Marketer',
      reason: 'Nouveau membre',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      following: false,
    },
  ]);

  const [groups, setGroups] = useState([
    {
      id: 101,
      name: 'Créateurs & CM Francophones',
      membersCount: 1420,
      description: 'Entraide, conseils et partages des meilleures stratégies social media.',
      joined: true,
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 102,
      name: 'IA & Automatisation Content',
      membersCount: 890,
      description: 'Astuces, prompts et hacks pour optimiser la création de contenus avec Gemini & AI.',
      joined: false,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 103,
      name: 'Designers & Video Makers',
      membersCount: 640,
      description: 'Revue de visuels, reels, carrousels et tendances graphiques.',
      joined: false,
      image: 'https://images.unsplash.com/photo-1542744094-3a31727202b3?w=400&auto=format&fit=crop&q=80',
    }
  ]);

  const toggleFollow = (id: number) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, following: !m.following } : m));
  };

  const toggleJoinGroup = (id: number) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, joined: !g.joined } : g));
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 h-full flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6 select-none">
      
      {/* Top Header Card */}
      <div className={`rounded-2xl p-4 md:p-5 shadow-card-subtle border shrink-0 transition-colors duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div>
          <h2 className={`text-base font-bold leading-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
            Réseau & Communauté
          </h2>
          <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Découvrez d'autres créateurs et rejoignez des groupes thématiques.
          </p>
        </div>

        {/* Search Input */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border w-full sm:w-[260px] ${
          darkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className={`w-full text-[13px] bg-transparent outline-none ${
              darkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-4 px-2 border-b shrink-0 ${
        darkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`py-2 text-[13.5px] font-bold relative transition-all cursor-pointer bg-transparent border-none ${
            activeTab === 'suggestions'
              ? darkMode ? 'text-white' : 'text-[#1677FF]'
              : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Suggestions de membres ({filteredMembers.length})</span>
          {activeTab === 'suggestions' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1677FF] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`py-2 text-[13.5px] font-bold relative transition-all cursor-pointer bg-transparent border-none ${
            activeTab === 'groups'
              ? darkMode ? 'text-white' : 'text-[#1677FF]'
              : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Groupes ({filteredGroups.length})</span>
          {activeTab === 'groups' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1677FF] rounded-full" />
          )}
        </button>
      </div>

      {/* Content Grid */}
      {activeTab === 'suggestions' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className={`rounded-2xl p-4 shadow-card-subtle border flex flex-col justify-between transition-all ${
                darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-[#0284C7]/20"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className={`text-[14px] font-bold truncate leading-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                    {member.name}
                  </span>
                  <span className={`text-[12px] font-medium text-[#1677FF] dark:text-[#38BDF8] truncate mt-0.5`}>
                    {member.handle}
                  </span>
                  <span className={`text-[11.5px] truncate mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {member.role}
                  </span>
                </div>
              </div>

              <div className={`py-1.5 px-2.5 rounded-xl text-[11px] font-medium mb-3 flex items-center gap-1.5 ${
                darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">{member.reason}</span>
              </div>

              <button
                onClick={() => toggleFollow(member.id)}
                className={`w-full py-2 px-3 rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
                  member.following
                    ? darkMode
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-[#1677FF] hover:bg-[#1266DF] text-white shadow-blue-glow'
                }`}
              >
                {member.following ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Abonné(e)</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Suivre</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className={`rounded-2xl overflow-hidden shadow-card-subtle border flex flex-col justify-between transition-all ${
                darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
              }`}
            >
              <div className="h-28 w-full overflow-hidden relative">
                <img
                  src={group.image}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10.5px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {group.membersCount} membres
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h4 className={`text-[14px] font-bold leading-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                    {group.name}
                  </h4>
                  <p className={`text-[12px] leading-relaxed mt-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {group.description}
                  </p>
                </div>

                <button
                  onClick={() => toggleJoinGroup(group.id)}
                  className={`w-full py-2 px-3 rounded-xl text-[12.5px] font-bold transition-all cursor-pointer border-none ${
                    group.joined
                      ? darkMode
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                      : 'bg-[#1677FF] hover:bg-[#1266DF] text-white shadow-blue-glow'
                  }`}
                >
                  {group.joined ? 'Membre (Quitter)' : 'Rejoindre le groupe'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

'use client'

import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, Sparkles, Users } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function MembersPage({ darkMode: propDarkMode }: { darkMode?: boolean }) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const { user } = useUser();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState('suggestions'); // 'suggestions' | 'groups'
  const [searchTerm, setSearchTerm] = useState('');

  const [members, setMembers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadMembersAndGroups() {
      if (!user) return;

      // Load user's follows
      const { data: follows } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (follows) {
        setFollowedIds(new Set(follows.map(f => f.following_id)));
      }

      // Load public profiles
      const { data: profiles } = await supabase
        .from('user_public_profiles')
        .select('*')
        .neq('id', user.id)
        .limit(20);

      if (profiles && profiles.length > 0) {
        setMembers(profiles);
      } else {
        setMembers([
          {
            id: '1',
            full_name: 'Laura Fisher',
            role: 'Social Media Lead',
            avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            bio: 'Spécialiste de la stratégie de marque et des campagnes virales.',
          },
          {
            id: '2',
            full_name: 'Sam Brown',
            role: 'Content Strategist',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            bio: 'Passionné par l\'optimisation de l\'engagement et l\'analyse de données.',
          },
          {
            id: '3',
            full_name: 'Julien Mercier',
            role: 'Brand Manager',
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            bio: 'Expert en création de contenu visuel et stratégie multi-canal.',
          }
        ]);
      }

      // Load groups
      const { data: groupsData } = await supabase
        .from('community_groups')
        .select('*')
        .limit(10);

      if (groupsData && groupsData.length > 0) {
        setGroups(groupsData);
      } else {
        setGroups([
          {
            id: '101',
            name: 'Growth & Social Media 2026',
            description: 'Espace d\'échange dédié aux stratégies d\'acquisition et de croissance sociale.',
            membersCount: 1420,
          },
          {
            id: '102',
            name: 'Créateurs & Prompt Engineers IA',
            description: 'Partage des meilleurs workflows de génération visuelle et textuelle IA.',
            membersCount: 890,
          }
        ]);
      }
    }

    loadMembersAndGroups();
  }, [supabase, user]);

  const toggleFollow = async (targetUserId: string) => {
    if (!user) return;
    const isFollowing = followedIds.has(targetUserId);
    const nextSet = new Set(followedIds);

    if (isFollowing) {
      nextSet.delete(targetUserId);
      setFollowedIds(nextSet);
      await supabase
        .from('user_follows')
        .delete()
        .match({ follower_id: user.id, following_id: targetUserId });
    } else {
      nextSet.add(targetUserId);
      setFollowedIds(nextSet);
      await supabase
        .from('user_follows')
        .insert({ follower_id: user.id, following_id: targetUserId });
    }
  };

  const filteredMembers = members.filter(m =>
    (m.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 h-full flex flex-col gap-4 overflow-y-auto no-scrollbar select-none pb-6">
      
      {/* Top Header */}
      <div className={`rounded-2xl p-4 md:p-5 shadow-card-subtle border shrink-0 transition-colors duration-300 flex items-center justify-between ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold leading-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Membres & Groupes de la Communauté
            </h2>
            <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Connectez-vous avec d'autres Community Managers et rejoignez des espaces d'échange.
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border w-[220px] ${
          darkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un membre..."
            className={`w-full text-[12.5px] bg-transparent outline-none ${
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
          <span>Membres ({filteredMembers.length})</span>
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
          <span>Groupes & Espaces ({groups.length})</span>
          {activeTab === 'groups' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1677FF] rounded-full" />
          )}
        </button>
      </div>

      {/* Members Grid */}
      {activeTab === 'suggestions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const isFollowed = followedIds.has(member.id);
            return (
              <div
                key={member.id}
                className={`rounded-2xl p-4 shadow-card-subtle border flex flex-col justify-between gap-3 transition-all ${
                  darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    avatarUrl={member.avatar_url}
                    size={48}
                    className="ring-2 ring-[#1677FF] ring-offset-1 shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className={`text-[14px] font-bold truncate ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                      {member.full_name || 'Membre'}
                    </span>
                    <span className="text-[11.5px] font-semibold text-[#1677FF] dark:text-[#38BDF8] truncate">
                      {member.role || 'Community Manager'}
                    </span>
                  </div>
                </div>

                <p className={`text-[12px] leading-relaxed line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {member.bio || "Membre passionné par la gestion de communauté et les réseaux sociaux."}
                </p>

                <button
                  onClick={() => toggleFollow(member.id)}
                  className={`w-full py-2 px-3 rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
                    isFollowed
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-[#1677FF] hover:bg-[#1266DF] text-white shadow-blue-glow'
                  }`}
                >
                  {isFollowed ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Abonné</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Suivre le membre</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Groups Grid */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`rounded-2xl p-4 shadow-card-subtle border flex flex-col justify-between gap-3 ${
                darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className={`text-[14.5px] font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                    {group.name}
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1677FF] dark:bg-blue-500/10 dark:text-[#38BDF8]">
                    {group.membersCount || 120} membres
                  </span>
                </div>
                <p className={`text-[12.5px] leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {group.description}
                </p>
              </div>

              <button
                onClick={() => alert(`Vous avez rejoint le groupe : ${group.name}`)}
                className="w-full py-2 px-3 rounded-xl text-[12.5px] font-bold bg-[#1677FF] hover:bg-[#1266DF] text-white shadow-blue-glow cursor-pointer border-none transition-all"
              >
                Rejoindre cet espace
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

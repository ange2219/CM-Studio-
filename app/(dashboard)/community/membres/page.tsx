'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, UserPlus, Check, Users, Sparkles } from 'lucide-react'
import { useTheme } from '@/components/context/ThemeContext'
import { useUser } from '@/components/context/UserContext'
import { useFollow } from '@/hooks/useFollow'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { createClient } from '@/lib/supabase/client'

interface MemberItem {
  id: string
  full_name: string
  username: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  is_following: boolean
  followers_count: number
  suggestion_reason: string
  relevance_score: number
}

interface GroupItem {
  id: string
  name: string
  description?: string | null
  membersCount?: number
}

export default function CommunityMembersPage() {
  const { darkMode } = useTheme()
  const { user } = useUser()
  const { isFollowing, toggleFollow } = useFollow()
  const supabase = useMemo(() => createClient(), [])

  const [activeTab, setActiveTab] = useState<'suggestions' | 'groups'>('suggestions')
  const [searchTerm, setSearchTerm] = useState('')
  const [members, setMembers] = useState<MemberItem[]>([])
  const [groups, setGroups] = useState<GroupItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user) return
      setLoading(true)
      try {
        // 1. Récupération des membres via l'API dédiée
        const res = await fetch('/api/members')
        if (res.ok) {
          const json = await res.json()
          setMembers(json.suggestions || [])
        } else {
          console.error('Erreur retour API /api/members:', res.statusText)
        }

        // 2. Récupération des groupes communautaires
        const { data: groupsData } = await supabase
          .from('community_groups')
          .select('*')
          .limit(10)

        setGroups((groupsData as GroupItem[]) || [])
      } catch (err) {
        console.error('Erreur lors du chargement des membres et groupes:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, supabase])

  // Filtrage local existant
  const filteredMembers = members.filter(m =>
    (m.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.bio || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex-1 h-full flex flex-col gap-4 overflow-y-auto no-scrollbar select-none pb-6">
      
      {/* ── 1. HEADER (Titre & Recherche locale) ── */}
      <div className={`rounded-xl p-4 md:p-5 shadow-card-subtle border shrink-0 transition-colors duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#1677FF] dark:text-[#38BDF8] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`text-base font-bold leading-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Membres & Espaces de la Communauté
            </h1>
            <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Connectez-vous avec d'autres Community Managers et rejoignez des espaces d'échange.
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border w-full sm:w-[240px] shrink-0 ${
          darkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
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

      {/* ── 2. ONGLETS (Membres & Groupes) ── */}
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

      {/* ── 3. GRILLE DES CARTES MEMBRES ── */}
      {activeTab === 'suggestions' && (
        <>
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-[13px]">
              Chargement des membres...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-[13px]">
              {searchTerm ? 'Aucun membre ne correspond à votre recherche.' : 'Aucun nouveau membre à suggérer pour le moment.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredMembers.map((member) => {
                const isFollowed = isFollowing(member.id)
                const profileHref = `/profile/${member.username || member.id}`

                return (
                  <div
                    key={member.id}
                    className={`rounded-xl p-4 shadow-card-subtle border flex flex-col justify-between gap-3 transition-all ${
                      darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
                    }`}
                  >
                    {/* Haut de carte cliquable vers le profil */}
                    <Link
                      href={profileHref}
                      className="flex items-start gap-3 group no-underline text-inherit"
                    >
                      <UserAvatar
                        avatarUrl={member.avatar_url}
                        size={46}
                        className="ring-2 ring-[#1677FF]/20 dark:ring-[#38BDF8]/20 shrink-0 group-hover:opacity-90 transition-opacity"
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className={`text-[14px] font-bold truncate group-hover:text-[#1677FF] dark:group-hover:text-[#38BDF8] transition-colors ${
                          darkMode ? 'text-white' : 'text-[#0F172A]'
                        }`}>
                          {member.full_name || 'Membre'}
                        </span>
                        <span className="text-[11.5px] font-medium text-slate-400 dark:text-slate-500 truncate">
                          {member.username ? `@${member.username}` : 'Membre CM Studio'}
                        </span>

                        {/* Badges : Abonnés réels & Motif de suggestion */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#1677FF] dark:bg-blue-500/10 dark:text-[#38BDF8]">
                            {member.followers_count} {member.followers_count > 1 ? 'abonnés' : 'abonné'}
                          </span>
                          {member.suggestion_reason && (
                            <span 
                              className="text-[10.5px] text-slate-400 dark:text-slate-500 truncate max-w-[140px]" 
                              title={member.suggestion_reason}
                            >
                              • {member.suggestion_reason}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Bio */}
                    <p className={`text-[12px] leading-relaxed line-clamp-2 ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {member.bio || 'Membre passionné par la gestion de communauté et les réseaux sociaux.'}
                    </p>

                    {/* Bouton Follow / Unfollow */}
                    <button
                      onClick={() => toggleFollow(member.id, member.full_name || member.username)}
                      className={`w-full py-2 px-3 rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
                        isFollowed
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
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
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── 4. GRILLE DES GROUPES (Inchangée / Factice) ── */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`rounded-xl p-4 shadow-card-subtle border flex flex-col justify-between gap-3 ${
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
  )
}

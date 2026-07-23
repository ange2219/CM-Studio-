'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useTheme } from '@/components/context/ThemeContext'
import Link from 'next/link'

export function SidebarRight({ darkMode: propDarkMode }: { darkMode?: boolean }) {
  const { darkMode: ctxDarkMode } = useTheme()
  const darkMode = propDarkMode ?? ctxDarkMode
  const supabase = createClient()

  const [suggestions, setSuggestions] = useState<any[]>([])
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set())
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setCurrentUser(user)

      // Fetch user's existing follows
      const { data: follows } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followedSet = new Set<string>(follows?.map((f: any) => f.following_id) || [])
      setFollowedIds(followedSet)

      // Fetch suggested user profiles (REAL PEOPLE from Supabase user_public_profiles)
      const { data: profiles } = await supabase
        .from('user_public_profiles')
        .select('id, full_name, avatar_url, username, role, plan')
        .neq('id', user.id)
        .limit(10)

      if (profiles) {
        setSuggestions(profiles)
        setOnlineUsers(profiles.slice(0, 5))
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  const toggleFollow = async (targetUserId: string) => {
    if (!currentUser) return

    const isFollowing = followedIds.has(targetUserId)
    const nextSet = new Set(followedIds)

    if (isFollowing) {
      nextSet.delete(targetUserId)
      setFollowedIds(nextSet)
      await supabase
        .from('user_follows')
        .delete()
        .match({ follower_id: currentUser.id, following_id: targetUserId })
    } else {
      nextSet.add(targetUserId)
      setFollowedIds(nextSet)
      await supabase
        .from('user_follows')
        .insert({ follower_id: currentUser.id, following_id: targetUserId })
    }
  }

  return (
    <aside className="w-[300px] xl:w-[320px] shrink-0 h-full flex flex-col gap-4 hidden lg:flex select-none">
      
      {/* 1. Suggestions Card */}
      <div className={`rounded-2xl p-4 shadow-card-subtle border shrink-0 transition-colors duration-300 ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className={`text-[14px] font-bold tracking-tight ${darkMode ? 'text-white' : 'text-[#1E293B]'}`}>
            Suggestions
          </h3>
          <Link href="/members" className="text-[12px] font-bold text-[#1677FF] hover:underline cursor-pointer">
            Voir tout
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="text-[12px] text-slate-400 py-2 text-center">Chargement des suggestions...</div>
          ) : suggestions.length === 0 ? (
            <div className="text-[12px] text-slate-400 py-2 text-center">Aucun membre suggéré pour le moment.</div>
          ) : (
            suggestions.slice(0, 4).map((person) => {
              const isFollowed = followedIds.has(person.id)
              return (
                <div key={person.id} className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar
                      avatarUrl={person.avatar_url}
                      size={36}
                      className="ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className={`text-[13px] font-bold truncate leading-tight ${darkMode ? 'text-white' : 'text-[#1E293B]'}`}>
                        {person.full_name || 'Membre'}
                      </span>
                      <span className={`text-[11px] truncate leading-tight mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {person.role || (person.username ? `@${person.username}` : 'Membre CM Studio')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFollow(person.id)}
                    title={isFollowed ? "Abonné" : "Ajouter / Suivre"}
                    className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all cursor-pointer border-none shrink-0 ${
                      isFollowed
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-[#1677FF] hover:bg-[#1266DF] text-white shadow-blue-glow'
                    }`}
                  >
                    {isFollowed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 2. Online Users Card */}
      <div className={`rounded-2xl p-4 shadow-card-subtle border shrink-0 transition-colors duration-300 ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className={`text-[14px] font-bold tracking-tight ${darkMode ? 'text-white' : 'text-[#1E293B]'}`}>
              En ligne maintenant
            </h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
            {onlineUsers.length} actifs
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          {onlineUsers.length === 0 ? (
            <span className="text-[12px] text-slate-400">Aucun membre en ligne</span>
          ) : (
            onlineUsers.map((u) => (
              <div key={u.id} className="relative group cursor-pointer shrink-0" title={u.full_name || 'Membre'}>
                <UserAvatar
                  avatarUrl={u.avatar_url}
                  size={40}
                  className="ring-2 ring-emerald-500 ring-offset-1"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1E293B]" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Footer Links */}
      <div className={`text-[11px] px-2 leading-relaxed ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        <p>© 2026 CM Studio — Assistant Community Manager IA.</p>
        <div className="flex flex-wrap gap-2 mt-1 font-semibold">
          <a href="#" className="hover:underline">Conditions</a>
          <span>•</span>
          <a href="#" className="hover:underline">Confidentialité</a>
          <span>•</span>
          <a href="#" className="hover:underline">Aide</a>
        </div>
      </div>

    </aside>
  )
}

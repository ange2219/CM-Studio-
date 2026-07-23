'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UserAvatar } from '@/components/ui/UserAvatar'
import Link from 'next/link'

export function SidebarRight({ darkMode }: { darkMode: boolean }) {
  const supabase = createClient()
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set())
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUser(user)

      // Fetch user's follows
      const { data: followsData } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followed = new Set((followsData || []).map((f: any) => f.following_id))
      setFollowedIds(followed)

      // Fetch suggested users from user_public_profiles
      const { data: profiles } = await supabase
        .from('user_public_profiles')
        .select('id, full_name, username, avatar_url')
        .neq('id', user.id)
        .limit(10)

      if (profiles) {
        setSuggestions(profiles.filter(p => !followed.has(p.id)).slice(0, 5))
        setOnlineUsers(profiles.slice(0, 4))
      }
    }
    loadData()
  }, [supabase])

  const toggleAddFriend = async (targetId: string) => {
    if (!currentUser) return
    const isFollowed = followedIds.has(targetId)

    // Optimistic update
    setFollowedIds(prev => {
      const next = new Set(prev)
      if (isFollowed) next.delete(targetId)
      else next.add(targetId)
      return next
    })

    if (isFollowed) {
      await supabase.from('user_follows').delete().match({ follower_id: currentUser.id, following_id: targetId })
    } else {
      await supabase.from('user_follows').insert({ follower_id: currentUser.id, following_id: targetId })
      // Send notification
      await supabase.from('notifications').insert({
        user_id: targetId,
        type: 'follow',
        title: 'Nouvel abonné',
        message: 'Quelqu\'un a commencé à vous suivre.',
        action_url: `/profile/${currentUser.id}`,
        platform: 'cm_studio',
        is_read: false
      })
    }
  }

  return (
    <aside className="w-[240px] xl:w-[260px] shrink-0 hidden lg:flex flex-col h-full overflow-y-auto no-scrollbar pb-6 gap-4 select-none">
      
      {/* SECTION 1: SUGGESTIONS */}
      <div className={`rounded-2xl p-4 shadow-card-subtle border transition-colors duration-300 ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-[14px] font-bold tracking-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
            Suggestions
          </h3>
          <Link href="/members" className={`text-[12px] font-bold transition-colors cursor-pointer text-decoration-none ${
            darkMode ? 'text-[#38BDF8] hover:text-[#7DD3FC]' : 'text-[#1677FF] hover:text-[#1266DF]'
          }`}>
            Voir tout
          </Link>
        </div>

        {/* Top Divider */}
        <div className={`h-[1px] w-full mb-1 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />

        {/* List of Suggestions */}
        <div className="flex flex-col">
          {suggestions.length === 0 ? (
            <div className="py-3 text-center text-[12px] text-slate-400">
              Aucune suggestion pour le moment.
            </div>
          ) : (
            suggestions.map((user, index) => {
              const isFollowed = followedIds.has(user.id)
              return (
                <React.Fragment key={user.id}>
                  <div 
                    className={`flex items-center justify-between py-2 px-2 rounded-xl transition-all cursor-pointer group ${
                      darkMode ? 'hover:bg-slate-800/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Left: Avatar + Info */}
                    <Link href={`/profile/${user.username || user.id}`} className="flex items-center gap-3 min-w-0 flex-1 text-decoration-none">
                      <UserAvatar
                        avatarUrl={user.avatar_url}
                        size={36}
                        accentBg
                        fallbackColor="var(--accent)"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[13px] font-bold truncate leading-tight ${darkMode ? 'text-slate-100' : 'text-[#1E293B]'}`}>
                          {user.full_name || 'Utilisateur'}
                        </span>
                        <span className={`text-[11.5px] font-medium truncate leading-tight mt-0.5 ${darkMode ? 'text-slate-400' : 'text-[#94A3B8]'}`}>
                          @{user.username || 'membre'}
                        </span>
                      </div>
                    </Link>

                    {/* Right: Plus/Check Button */}
                    <button
                      onClick={() => toggleAddFriend(user.id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isFollowed
                          ? darkMode
                            ? 'bg-blue-500/20 text-[#38BDF8]'
                            : 'bg-blue-50 text-[#1677FF]'
                          : darkMode
                            ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                            : 'text-slate-400 hover:text-[#1677FF] hover:bg-blue-50'
                      }`}
                      title={isFollowed ? "Abonné" : "Suivre"}
                    >
                      {isFollowed ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Plus className="w-4.5 h-4.5 stroke-[2] text-slate-500 dark:text-slate-400 group-hover:text-[#1677FF]" />
                      )}
                    </button>
                  </div>

                  {/* Row Divider */}
                  {index < suggestions.length - 1 && (
                    <div className={`h-[1px] w-full my-0.5 ${darkMode ? 'bg-slate-800/60' : 'bg-slate-100/80'}`} />
                  )}
                </React.Fragment>
              )
            })
          )}
        </div>
      </div>

      {/* SECTION 2: EN LIGNE MAINTENANT (4 Avatars Max) */}
      <div className={`rounded-2xl p-4 shadow-card-subtle border transition-colors duration-300 ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <h3 className={`text-[14px] font-bold tracking-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              En ligne maintenant
            </h3>
          </div>
          <Link href="/members" className={`text-[12px] font-bold transition-colors cursor-pointer text-decoration-none ${
            darkMode ? 'text-[#38BDF8] hover:text-[#7DD3FC]' : 'text-[#1677FF] hover:text-[#1266DF]'
          }`}>
            Voir tout
          </Link>
        </div>

        {/* 4 Horizontal Avatars Grid */}
        <div className="grid grid-cols-4 gap-2 w-full items-start justify-items-center">
          {onlineUsers.slice(0, 4).map((user) => (
            <Link key={user.id} href={`/profile/${user.username || user.id}`} className="flex flex-col items-center gap-1.5 cursor-pointer group w-full min-w-0 text-decoration-none">
              <div className="relative">
                <div className={`w-10 h-10 xl:w-11 xl:h-11 rounded-full overflow-hidden border p-0.5 transition-transform group-hover:scale-105 ${
                  darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
                }`}>
                  <UserAvatar
                    avatarUrl={user.avatar_url}
                    size={38}
                  />
                </div>
                {/* Green online status badge */}
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ${
                  darkMode ? 'ring-[#1E293B]' : 'ring-white'
                }`} />
              </div>

              {/* Name below avatar */}
              <span className={`text-[11px] font-medium truncate w-full text-center leading-tight ${
                darkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'
              }`}>
                {(user.full_name || 'Membre').split(' ')[0]}
              </span>
            </Link>
          ))}
        </div>
      </div>

    </aside>
  )
}

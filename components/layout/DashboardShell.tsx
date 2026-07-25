'use client'

import React from 'react'
import { Header } from '@/components/layout/Header'
import { SidebarLeft } from '@/components/layout/SidebarLeft'
import { ThemeProvider, useTheme } from '@/components/context/ThemeContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, LayoutGrid, Plus, MessageSquare } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'

function DashboardShellContent({
  user,
  children
}: {
  user: any;
  children: React.ReactNode;
}) {
  const { darkMode, toggleDarkMode } = useTheme()
  const pathname = usePathname()

  const getActiveView = () => {
    if (!pathname) return 'home'
    if (pathname.startsWith('/home') || pathname === '/') return 'home'
    if (pathname.startsWith('/workspace')) return 'workspace'
    if (pathname.startsWith('/messages')) return 'messages'
    if (pathname.startsWith('/notifications')) return 'notifications'
    if (pathname.startsWith('/members') || pathname.startsWith('/network')) return 'members'
    if (pathname.startsWith('/settings')) return 'settings'
    return 'home'
  }

  return (
    <div className={`h-screen w-full flex flex-col transition-colors duration-300 ${
      darkMode ? 'bg-[#0F172A] text-slate-100 dark' : 'bg-[#FAFCFF] text-slate-800'
    } overflow-hidden font-sans`}>
      
      {/* Full Width Top Navigation Bar */}
      <Header 
        darkMode={darkMode} 
        onToggleDarkMode={toggleDarkMode}
        onSelectView={() => {}}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 w-full flex justify-between gap-0 md:gap-6 p-0 md:p-6 max-w-[1536px] mx-auto overflow-hidden">
        {/* Left Sidebar Column */}
        <SidebarLeft 
          darkMode={darkMode} 
          activeView={getActiveView()}
        />

        {/* Center / Main View */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto no-scrollbar pb-24 md:pb-0">
          {children}
        </main>
      </div>

      <nav className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-[400px] h-[64px] rounded-full shadow-2xl flex items-center justify-around px-4 border md:hidden transition-all duration-300 ${
        darkMode ? 'bg-slate-950/40 border-white/15 backdrop-blur-xl shadow-black/40' : 'bg-white/40 border-black/5 backdrop-blur-xl shadow-slate-200/60'
      }`}>
        <Link 
          href="/home" 
          className={`flex items-center justify-center p-2.5 rounded-full transition-colors ${
            getActiveView() === 'home' 
              ? darkMode ? 'text-[#38BDF8] bg-slate-800/40' : 'text-[#1677FF] bg-slate-100'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5.5 h-5.5" />
        </Link>

        <Link 
          href="/workspace" 
          className={`flex items-center justify-center p-2.5 rounded-full transition-colors ${
            getActiveView() === 'workspace' 
              ? darkMode ? 'text-[#38BDF8] bg-slate-800/40' : 'text-[#1677FF] bg-slate-100'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-5.5 h-5.5" />
        </Link>

        {/* Plus Button: Opens Create Modal via ?create=true */}
        <Link 
          href="/home?create=true" 
          className={`flex items-center justify-center w-11 h-11 rounded-full shadow-lg transition-transform active:scale-95 ${
            darkMode 
              ? 'bg-[#38BDF8] text-slate-950 hover:bg-[#0EA5E9]' 
              : 'bg-[#1677FF] text-white hover:bg-[#1266DF]'
          }`}
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </Link>

        <Link 
          href="/messages" 
          className={`flex items-center justify-center p-2.5 rounded-full transition-colors ${
            getActiveView() === 'messages' 
              ? darkMode ? 'text-[#38BDF8] bg-slate-800/40' : 'text-[#1677FF] bg-slate-100'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-5.5 h-5.5" />
        </Link>

        <Link 
          href={user?.username ? `/profile/${user.username}` : `/profile/${user?.id || ''}`}
          className={`flex items-center justify-center p-0.5 rounded-full border-2 transition-all ${
            pathname && pathname.startsWith('/profile')
              ? darkMode ? 'border-[#38BDF8] scale-105' : 'border-[#1677FF] scale-105'
              : 'border-transparent hover:scale-105'
          }`}
        >
          <UserAvatar avatarUrl={user?.avatar_url} size={28} />
        </Link>
      </nav>

    </div>
  )
}

export function DashboardShell({
  user,
  children
}: {
  user: any;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <DashboardShellContent user={user}>
        {children}
      </DashboardShellContent>
    </ThemeProvider>
  )
}

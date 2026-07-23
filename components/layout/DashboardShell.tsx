'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { SidebarLeft } from '@/components/layout/SidebarLeft'
import { usePathname } from 'next/navigation'

export function DashboardShell({
  user,
  children
}: {
  user: any;
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Sync dark mode class with html element
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [darkMode])

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
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onSelectView={() => {}}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 w-full flex justify-between gap-6 p-4 md:p-6 max-w-[1536px] mx-auto overflow-hidden">
        {/* Left Sidebar Column */}
        <SidebarLeft 
          darkMode={darkMode} 
          activeView={getActiveView()}
        />

        {/* Center / Main View */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto no-scrollbar">
          {children}
        </main>
      </div>

    </div>
  )
}

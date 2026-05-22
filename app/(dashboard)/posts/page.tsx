'use client'

import { useState } from 'react'
import { Layout, Calendar, BarChart3 } from 'lucide-react'
import PostsDashboard from '@/components/PostsDashboard'
import CalendarTab from '@/components/workspace/CalendarTab'
import AnalyticsTab from '@/components/workspace/AnalyticsTab'

type Tab = 'posts' | 'calendar' | 'analytics'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'posts',     label: 'Mes Posts',   icon: Layout    },
  { id: 'calendar',  label: 'Calendrier',  icon: Calendar  },
  { id: 'analytics', label: 'Analytics',   icon: BarChart3 },
]

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<Tab>('posts')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Tab bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '0 0 0 4px',
        borderBottom: '1px solid var(--b1)',
        marginBottom: '0',
        flexShrink: 0,
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              id={`workspace-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '12px 18px',
                background: 'none',
                border: 'none',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                color: active ? 'var(--accent)' : 'var(--text3)',
                fontSize: '.85rem', fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                transition: 'color .15s, border-color .15s',
                marginBottom: '-1px',
              }}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab content ── */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'posts'     && <PostsDashboard />}
        {activeTab === 'calendar'  && <CalendarTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  )
}

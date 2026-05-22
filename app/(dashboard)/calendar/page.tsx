'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import CalendarTab from '@/components/workspace/CalendarTab'

export default function CalendarPage() {
  const router = useRouter()
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--b1)' }}>
        <button
          onClick={() => router.push('/posts')}
          style={{ background: 'var(--s2)', border: '1px solid var(--b1)', color: 'var(--t1)', padding: '.4rem .8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.4rem', transition: '.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--card)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--s2)'}
        >
          <ArrowLeft size={14} /> Workspace
        </button>
      </div>
      <CalendarTab />
    </div>
  )
}

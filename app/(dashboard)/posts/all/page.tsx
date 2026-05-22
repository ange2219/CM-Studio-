'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Grid3X3, List, Filter } from 'lucide-react'
import PostsDashboard from '@/components/PostsDashboard'

export default function MesPostsPage() {
  const router = useRouter()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem', padding: '1.5rem 2rem 0' }}>
        <button
          onClick={() => router.push('/posts')}
          style={{ background: 'var(--s2)', border: '1px solid var(--b1)', color: 'var(--t1)', padding: '.4rem .8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.4rem', transition: '.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--card)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--s2)'}
        >
          <ArrowLeft size={14} /> Workspace
        </button>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--t1)', margin: 0 }}>
          Mes Posts
        </h1>
      </div>
      <PostsDashboard />
    </div>
  )
}

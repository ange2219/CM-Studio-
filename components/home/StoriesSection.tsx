'use client'

import { Plus } from 'lucide-react'

const MOCK_STORIES = [
  { id: 1, name: 'Aicha B.', avatar: null },
  { id: 2, name: 'David K.', avatar: null },
  { id: 3, name: 'Sarah L.', avatar: null },
  { id: 4, name: 'Mamadou T.', avatar: null },
  { id: 5, name: 'Christelle P.', avatar: null },
  { id: 6, name: 'Dennis Han', avatar: null },
  { id: 7, name: 'Cynthia Lopez', avatar: null },
]

export function StoriesSection() {
  return (
    <div className="scrollbar-hide" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      
      {/* Ajouter Story */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, cursor: 'pointer' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px dashed var(--b1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
          <Plus size={28} strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: '12px', color: 'var(--t1)', fontWeight: 500 }}>Ajouter</span>
      </div>

      {MOCK_STORIES.map(story => (
        <div key={story.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, cursor: 'pointer' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', padding: '3px',
              border: '2px solid #22c55e'
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--t1)', fontSize: '18px' }}>{story.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
            </div>
            {/* Pastille verte */}
            <div style={{ position: 'absolute', bottom: '1px', right: '1px', width: '16px', height: '16px', borderRadius: '50%', background: '#22c55e', border: '3px solid var(--bg)' }} />
          </div>
          <span style={{ fontSize: '12px', color: 'var(--t1)', fontWeight: 500 }}>{story.name.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  )
}

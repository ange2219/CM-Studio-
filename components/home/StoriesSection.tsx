'use client'

import { Plus } from 'lucide-react'

const MOCK_STORIES = [
  { id: 1, name: 'Aicha B.', avatar: null, color: '#FF4D4D' },
  { id: 2, name: 'David K.', avatar: null, color: '#4DFF4D' },
  { id: 3, name: 'Sarah L.', avatar: null, color: '#4D4DFF' },
  { id: 4, name: 'Mamadou T.', avatar: null, color: '#FFFF4D' },
  { id: 5, name: 'Christelle P.', avatar: null, color: '#FF4DFF' },
  { id: 6, name: 'Dennis Han', avatar: null, color: '#4DFFFF' },
  { id: 7, name: 'Cynthia Lopez', avatar: null, color: '#FFA500' },
]

export function StoriesSection() {
  return (
    <div className="scrollbar-hide" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      
      {/* Ajouter Story */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, cursor: 'pointer' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px dashed var(--b1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)' }}>
          <Plus size={24} />
        </div>
        <span style={{ fontSize: '11px', color: 'var(--t2)', fontWeight: 500 }}>Ajouter</span>
      </div>

      {MOCK_STORIES.map(story => (
        <div key={story.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, cursor: 'pointer' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '50%', padding: '3px',
            background: `linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)`
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--bg)', background: story.color + '33', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--t1)', fontSize: '14px' }}>{story.name.split(' ').map(n => n[0]).join('')}</span>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--t1)', fontWeight: 500 }}>{story.name.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  )
}

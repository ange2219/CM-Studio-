'use client'

import { Users, ChevronRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const MOCK_GROUPS = [
  { id: 1, name: 'Community Managers France', members: '12.4K', type: 'Public', color: 'var(--accent)' },
  { id: 2, name: 'Social Media Pro', members: '8.7K', type: 'Privé', color: '#10B981' },
]

export function PopularGroups() {
  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--t1)' }}>Groupes populaires</span>
        <Link href="/community" style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
          Voir tout <ChevronRight size={12} />
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {MOCK_GROUPS.map(group => (
          <div key={group.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: `${group.color}15`, color: group.color, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
              <Users size={16} style={{ margin: 'auto' }} />
              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: group.color }} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Groupe {group.type}</span>
                <span>•</span>
                <span>{group.members}</span>
              </div>
            </div>
            <div style={{ width: '28px', height: '14px', flexShrink: 0 }}>
                <TrendingUp size={13} style={{ color: group.color, opacity: 0.6 }} />
            </div>
          </div>
        ))}
      </div>

      <button className="act-btn" style={{ marginTop: '0.25rem', width: '100%', padding: '8px', borderRadius: '10px', background: 'var(--s2)', border: '1px solid var(--b1)', color: 'var(--t2)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
        Découvrir d'autres groupes
      </button>
    </div>
  )
}

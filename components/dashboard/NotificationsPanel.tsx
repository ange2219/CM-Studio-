'use client'

import { Bell, Heart, MessageSquare, Share2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const MOCK_NOTIFS = [
  { id: 1, type: 'post_like', user: 'Aicha B.', text: 'a publié un nouveau post dans Community Managers France', time: 'il y a 1 h', icon: <Bell size={14} />, color: '#1E57CD' },
  { id: 2, type: 'comment', user: 'David K.', text: 'a commenté votre post dans Social Media Pro', time: 'il y a 2 h', icon: <MessageSquare size={14} />, color: '#10B981' },
  { id: 3, type: 'reaction', user: 'Mamadou T.', text: 'a réagi à votre post dans IA & Contenu Créatif', time: 'il y a 3 h', icon: <Heart size={14} />, color: '#F59E0B' },
  { id: 4, type: 'share', user: 'Christelle P.', text: 'a partagé un conseil dans Freelances CM', time: 'il y a 4 h', icon: <Share2 size={14} />, color: '#EF4444' },
]

export function NotificationsPanel() {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--t1)' }}>Notifications</span>
          <div style={{ background: 'var(--red)', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>4</div>
        </div>
        <Link href="/notifications" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
           Voir tout <ChevronRight size={12} />
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {MOCK_NOTIFS.map(notif => (
          <div key={notif.id} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--s2)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--accent)' }}>
                {notif.user.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--t1)', lineHeight: 1.4 }}>
                <span style={{ fontWeight: 700 }}>{notif.user}</span> {notif.text}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--t3)', marginTop: '2px' }}>{notif.time}</div>
            </div>
          </div>
        ))}
      </div>

      <Link href="/notifications" style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', marginTop: '4px' }}>
        Voir toutes les notifications
      </Link>
    </div>
  )
}

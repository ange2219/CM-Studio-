import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, Heart, MessageCircle, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export const revalidate = 0

export default async function NotificationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Fetch notifications with actor info
  const { data: notifications, error } = await admin
    .from('notifications')
    .select(`
      *,
      actor:actor_id (full_name, avatar_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0

  const getIcon = (type: string) => {
    switch (type) {
      case 'post_like':
      case 'comment_like':
        return <Heart size={18} className="text-red" />
      case 'comment_reply':
        return <MessageCircle size={18} className="text-accent" />
      default:
        return <Bell size={18} className="text-t3" />
    }
  }

  const getMessage = (type: string, actorName: string) => {
    switch (type) {
      case 'post_like':
        return <span><strong>{actorName}</strong> a aimé votre publication</span>
      case 'comment_like':
        return <span><strong>{actorName}</strong> a aimé votre commentaire</span>
      case 'comment_reply':
        return <span><strong>{actorName}</strong> a répondu à votre commentaire</span>
      default:
        return <span>Nouvelle notification de <strong>{actorName}</strong></span>
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1rem 0' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--t1)', marginBottom: '.5rem' }}>Notifications</h1>
          <p style={{ color: 'var(--t2)', fontSize: '.95rem' }}>
            Restez informé des interactions avec vos contenus.
          </p>
        </div>
        {unreadCount > 0 && (
          <div style={{ padding: '4px 12px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
            {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
          </div>
        )}
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {notifications && notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                background: notif.is_read ? 'var(--card)' : 'rgba(var(--accent-rgb), 0.05)',
                border: '1px solid var(--b1)',
                borderRadius: '16px',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {!notif.is_read && (
                <div style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '24px', background: 'var(--accent)', borderRadius: '0 4px 4px 0' }} />
              )}
              
              <div style={{ position: 'relative' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: 'var(--s2)', border: '2px solid var(--b1)' }}>
                  {notif.actor?.avatar_url ? (
                    <img src={notif.actor.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontWeight: 600 }}>
                      {notif.actor?.full_name?.slice(0, 2).toUpperCase() || '??'}
                    </div>
                  )}
                </div>
                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: 'var(--card)', borderRadius: '50%', padding: '4px', border: '1px solid var(--b1)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                  {getIcon(notif.type)}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--t1)', fontSize: '0.95rem' }}>
                  {getMessage(notif.type, notif.actor?.full_name || 'Un utilisateur')}
                </div>
                <div style={{ color: 'var(--t3)', fontSize: '0.8rem', marginTop: '4px' }}>
                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                </div>
              </div>

              {notif.is_read ? (
                <div style={{ color: 'var(--t3)', opacity: 0.5 }}><Check size={16} /></div>
              ) : (
                <button 
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex' }}
                  title="Marquer comme lu"
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                </button>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--t3)' }}>
            <div style={{ marginBottom: '1rem', opacity: 0.2 }}>
              <Bell size={48} style={{ margin: '0 auto' }} />
            </div>
            <p>Aucune notification pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}

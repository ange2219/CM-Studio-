'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronDown, Bell, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import { NotificationsSkeleton } from '@/components/ui/Skeleton'
import type { Platform } from '@/types'

function getShortTimeAgo(dateStr: string | null | undefined) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "à l'instant";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} j`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} sem`;
}

export default function NotificationsPage() {
  const [mainTab, setMainTab] = useState<'cm_studio' | 'social'>('cm_studio')
  const [notifications, setNotifications] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadNotifs() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      setUser(authUser)

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
      
      if (data) setNotifications(data)
      setLoading(false)
    }
    loadNotifs()
  }, [])

  const filteredNotifs = notifications.filter(n => 
    mainTab === 'cm_studio' ? n.platform === 'cm_studio' : n.platform !== 'cm_studio'
  )

  const unreadCmStudio = notifications.filter(n => !n.is_read && n.platform === 'cm_studio').length
  const unreadSocial = notifications.filter(n => !n.is_read && n.platform !== 'cm_studio').length

  const handleMarkAllRead = async () => {
    if (!user) return
    const idsToUpdate = filteredNotifs.filter(n => !n.is_read).map(n => n.id)
    if (idsToUpdate.length === 0) return

    await supabase.from('notifications').update({ is_read: true }).in('id', idsToUpdate)
    
    setNotifications(prev => prev.map(n => 
      idsToUpdate.includes(n.id) ? { ...n, is_read: true } : n
    ))
  }

  const handleNotifClick = async (notif: any) => {
    if (!notif.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id)
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
    }
    if (notif.action_url) {
      router.push(notif.action_url)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '2rem', height: '100%', alignItems: 'flex-start' }}>
      
      {/* ── Left Column: Notifications List ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0, maxWidth: '800px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--t1)', marginBottom: '.5rem' }}>Vos Notifications</h1>
        </header>

        {/* Main Tabs & Mark as read */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setMainTab('cm_studio')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: '.2s',
                background: mainTab === 'cm_studio' ? 'rgba(59, 130, 246, 0.1)' : 'var(--card)', 
                border: mainTab === 'cm_studio' ? '1px solid var(--accent)' : '1px solid transparent' 
              }}
            >
              <div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--t1)', marginBottom: '4px' }}>CM Studio</div>
                <div style={{ fontSize: '.75rem', color: 'var(--t3)' }}>Notifications internes</div>
              </div>
              {unreadCmStudio > 0 && (
                <div style={{ background: 'var(--accent)', color: '#fff', fontSize: '.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>{unreadCmStudio}</div>
              )}
            </button>
            <button 
              onClick={() => setMainTab('social')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: '.2s',
                background: mainTab === 'social' ? 'rgba(59, 130, 246, 0.1)' : 'var(--card)', 
                border: mainTab === 'social' ? '1px solid var(--accent)' : '1px solid transparent' 
              }}
            >
              <div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--t1)', marginBottom: '4px' }}>Réseaux Sociaux</div>
                <div style={{ fontSize: '.75rem', color: 'var(--t3)' }}>Activité de vos publications</div>
              </div>
              {unreadSocial > 0 && (
                <div style={{ background: 'var(--accent)', color: '#fff', fontSize: '.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>{unreadSocial}</div>
              )}
            </button>
          </div>

          <button onClick={handleMarkAllRead} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--t3)', fontSize: '.8rem', cursor: 'pointer' }}>
            <Check size={14} /> Tout marquer comme lu
          </button>
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading ? (
            <NotificationsSkeleton />
          ) : filteredNotifs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--card)', borderRadius: '12px', color: 'var(--t2)', border: '1px dashed var(--b1)' }}>
              Aucune notification pour le moment.
            </div>
          ) : (
            filteredNotifs.map(notif => {
              const isCmStudio = notif.platform === 'cm_studio'
              const accentColor = isCmStudio ? '59, 130, 246' : '168, 85, 247'
              const hexColor = isCmStudio ? '#3b82f6' : '#a855f7'

              return (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotifClick(notif)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.25rem', 
                    background: 'var(--card)', borderRadius: '12px', 
                    border: '1px solid transparent', position: 'relative', cursor: notif.action_url ? 'pointer' : 'default',
                    opacity: notif.is_read ? 0.7 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    if (notif.action_url) e.currentTarget.style.border = '1px solid var(--b2)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '1px solid transparent'
                  }}
                >
                  {/* Unread Dot */}
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: !notif.is_read ? 'var(--accent)' : 'transparent', flexShrink: 0 }} />
                  
                  {/* Avatar/Icon */}
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `rgba(${accentColor}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: hexColor }}>
                    {isCmStudio ? <Bell size={18} /> : <PlatformIcon platform={notif.platform as Platform} size={18} />}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--t1)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notif.title}</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--t3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notif.message}</div>
                  </div>

                  {/* Badge & Time */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                    <div style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '.65rem', fontWeight: 600, background: `rgba(${accentColor}, 0.1)`, color: hexColor }}>
                      {notif.type === 'like' ? 'Like' : notif.type === 'comment' ? 'Commentaire' : notif.type}
                    </div>
                    <div style={{ fontSize: '.7rem', color: 'var(--t3)' }}>{getShortTimeAgo(notif.created_at)}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

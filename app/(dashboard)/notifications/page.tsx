'use client'

import { useState } from 'react'
import { Check, Users, BarChart2, Award, ChevronDown, Bell, MessageSquare, UserPlus, Mail, Lightbulb, Activity } from 'lucide-react'

const NOTIFICATIONS = [
  { id: 1, unread: true, initial: 'AB', color: '#F59E0B', title: 'Aïcha B. vous a mentionné dans un commentaire', desc: '"@CM Studio superbe analyse ! Merci pour ton partage ✨"', badge: 'Mention', badgeColor: '#a855f7', badgeBg: 'rgba(168, 85, 247, 0.1)', time: '14:32' },
  { id: 2, unread: true, initial: 'DK', color: '#3B82F6', title: 'David K. vous a envoyé un message', desc: "Salut ! J'aimerais avoir ton avis sur le calendrier éditorial.", badge: 'Message', badgeColor: '#3b82f6', badgeBg: 'rgba(59, 130, 246, 0.1)', time: '13:15' },
  { id: 3, unread: true, icon: Users, color: '#10b981', title: 'Nouveau post dans le groupe Community Managers France', desc: 'Sarah L. a publié : "Quels sont vos outils préférés pour la veille ?"', badge: 'Groupe', badgeColor: '#10b981', badgeBg: 'rgba(16, 185, 129, 0.1)', time: '11:48' },
  { id: 4, unread: true, icon: Users, color: '#a855f7', title: '12 nouvelles personnes ont rejoint votre communauté', desc: 'Votre communauté CM Studio continue de grandir 🚀', badge: 'Communauté', badgeColor: '#a855f7', badgeBg: 'rgba(168, 85, 247, 0.1)', time: '10:22' },
  { id: 5, unread: false, initial: 'SL', color: '#ec4899', title: 'Sarah L. a répondu à votre commentaire', desc: '"Merci pour ton conseil, je vais essayer ça !"', badge: 'Commentaire', badgeColor: '#f59e0b', badgeBg: 'rgba(245, 158, 11, 0.1)', time: '09:35' },
  { id: 6, unread: true, icon: BarChart2, color: '#3b82f6', title: 'Votre rapport hebdomadaire est prêt', desc: 'Découvrez les performances de vos publications cette semaine.', badge: 'Système', badgeColor: '#3b82f6', badgeBg: 'rgba(59, 130, 246, 0.1)', time: 'Hier, 18:45' },
  { id: 7, unread: true, icon: Award, color: '#ec4899', title: 'Vous avez obtenu un nouveau badge', desc: 'Félicitations ! Vous avez obtenu le badge "Expert Engagement" 🏆', badge: 'Badge', badgeColor: '#ec4899', badgeBg: 'rgba(236, 72, 153, 0.1)', time: 'Hier, 17:20' }
]

const TABS = ['Toutes', 'Mentions', 'Messages', 'Groupes', 'Communauté', 'Système']

const RECENT_ACTIVITY = [
  { id: 1, initial: 'AB', color: '#F59E0B', title: 'Aïcha B. a commenté votre post', time: 'Il y a 2 min' },
  { id: 2, initial: 'DK', color: '#3B82F6', title: 'David K. a partagé votre post', time: 'Il y a 15 min' },
  { id: 3, initial: 'SL', color: '#ec4899', title: 'Sarah L. a aimé votre publication', time: 'Il y a 47 min' }
]

export default function NotificationsPage() {
  const [mainTab, setMainTab] = useState<'cm_studio' | 'social'>('cm_studio')
  const [subTab, setSubTab] = useState('Toutes')

  return (
    <div style={{ display: 'flex', gap: '2rem', height: '100%', alignItems: 'flex-start' }}>
      
      {/* ── Left Column: Notifications List ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
        
        {/* Main Tabs & Mark as read */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setMainTab('cm_studio')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: '.2s',
                background: mainTab === 'cm_studio' ? 'rgba(59, 130, 246, 0.1)' : 'var(--card)', 
                border: mainTab === 'cm_studio' ? '1px solid var(--accent)' : '1px solid var(--b1)' 
              }}
            >
              <div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--t1)', marginBottom: '4px' }}>CM Studio</div>
                <div style={{ fontSize: '.75rem', color: 'var(--t3)' }}>Notifications internes</div>
              </div>
              <div style={{ background: 'var(--accent)', color: '#fff', fontSize: '.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>12</div>
            </button>
            <button 
              onClick={() => setMainTab('social')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: '.2s',
                background: mainTab === 'social' ? 'rgba(59, 130, 246, 0.1)' : 'var(--card)', 
                border: mainTab === 'social' ? '1px solid var(--accent)' : '1px solid var(--b1)' 
              }}
            >
              <div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--t1)', marginBottom: '4px' }}>Réseaux Sociaux</div>
                <div style={{ fontSize: '.75rem', color: 'var(--t3)' }}>Activité de vos publications</div>
              </div>
            </button>
          </div>

          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--t3)', fontSize: '.8rem', cursor: 'pointer' }}>
            <Check size={14} /> Tout marquer comme lu
          </button>
        </div>

        {/* Sub Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {TABS.map(tab => (
            <button 
              key={tab}
              onClick={() => setSubTab(tab)}
              style={{ 
                padding: '.45rem 1rem', borderRadius: '20px', cursor: 'pointer', fontSize: '.8rem', fontWeight: 500, transition: '.15s', whiteSpace: 'nowrap',
                background: subTab === tab ? 'rgba(59, 130, 246, 0.15)' : 'var(--card)',
                color: subTab === tab ? 'var(--accent)' : 'var(--t2)',
                border: subTab === tab ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--b1)'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {NOTIFICATIONS.map(notif => (
            <div key={notif.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.25rem', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--b1)', position: 'relative' }}>
              {/* Unread Dot */}
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: notif.unread ? 'var(--accent)' : 'transparent', flexShrink: 0 }} />
              
              {/* Avatar/Icon */}
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: notif.icon ? `rgba(${notif.color === '#10b981' ? '16, 185, 129' : notif.color === '#a855f7' ? '168, 85, 247' : notif.color === '#ec4899' ? '236, 72, 153' : '59, 130, 246'}, 0.1)` : notif.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: notif.icon ? notif.color : '#fff', fontSize: '.8rem', fontWeight: 700, border: notif.icon ? `1px solid ${notif.color}30` : 'none' }}>
                {notif.icon ? <notif.icon size={18} /> : notif.initial}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--t1)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notif.title}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--t3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notif.desc}</div>
              </div>

              {/* Badge & Time */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                <div style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '.65rem', fontWeight: 600, background: notif.badgeBg, color: notif.badgeColor }}>
                  {notif.badge}
                </div>
                <div style={{ fontSize: '.7rem', color: 'var(--t3)' }}>{notif.time}</div>
              </div>
            </div>
          ))}
          
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '1rem', background: 'none', border: 'none', color: 'var(--t3)', fontSize: '.8rem', cursor: 'pointer', marginTop: '4px' }}>
            Voir plus de notifications <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* ── Right Column: Widgets ── */}
      <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Résumé du jour */}
        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--b1)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.9rem', fontWeight: 600, color: 'var(--t1)', marginBottom: '1.25rem' }}>
            <Activity size={16} color="var(--accent)" /> Résumé du jour
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--b1)' }}>
              <Bell size={18} color="#F59E0B" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '2px' }}>12</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '.7rem', color: 'var(--t3)' }}>Notifications</span>
                <span style={{ fontSize: '.65rem', color: '#10b981', fontWeight: 600 }}>+12%</span>
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--b1)' }}>
              <MessageSquare size={18} color="#ec4899" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '2px' }}>5</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '.7rem', color: 'var(--t3)' }}>Mentions</span>
                <span style={{ fontSize: '.65rem', color: '#10b981', fontWeight: 600 }}>+25%</span>
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--b1)' }}>
              <UserPlus size={18} color="#3b82f6" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '2px' }}>2</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '.7rem', color: 'var(--t3)' }}>Membres</span>
                <span style={{ fontSize: '.65rem', color: '#10b981', fontWeight: 600 }}>+8%</span>
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--b1)' }}>
              <Mail size={18} color="#a855f7" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '2px' }}>3</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '.7rem', color: 'var(--t3)' }}>Messages</span>
                <span style={{ fontSize: '.65rem', color: '#10b981', fontWeight: 600 }}>+15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--b1)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--t1)' }}>Activité récente</span>
            <span style={{ fontSize: '.75rem', color: 'var(--accent)', cursor: 'pointer' }}>Voir tout</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {RECENT_ACTIVITY.map(act => (
              <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: act.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.65rem', fontWeight: 700, flexShrink: 0 }}>
                  {act.initial}
                </div>
                <div>
                  <div style={{ fontSize: '.8rem', color: 'var(--t2)', marginBottom: '2px' }}>{act.title}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--t3)' }}>{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Astuce du jour */}
        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--b1)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.9rem', fontWeight: 600, color: '#F59E0B', marginBottom: '1rem' }}>
            <Lightbulb size={16} /> Astuce du jour
          </div>
          <p style={{ fontSize: '.8rem', color: 'var(--t2)', lineHeight: 1.5, marginBottom: '1rem' }}>
            Les posts publiés entre 18h et 21h génèrent en moyenne 40% plus d&apos;engagement.
          </p>
          <button style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: 'var(--accent)', padding: '.5rem', width: '100%', borderRadius: '8px', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', transition: '.2s' }}>
            Voir les statistiques →
          </button>
        </div>

      </div>
    </div>
  )
}

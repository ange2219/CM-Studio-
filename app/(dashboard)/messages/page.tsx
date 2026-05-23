'use client'
import { useState } from 'react'
import { Search, Edit3, Phone, Video, MoreHorizontal, Paperclip, Image, Smile, Mic, Send, Star, Archive, X, User, Bell, FileText } from 'lucide-react'

const CONVERSATIONS = [
  { id: 1, name: 'Équipe Marketing', avatar: 'EM', color: '#7B5CF5', last: 'Sarah : On se retrouve à 14h...', time: '14:32', unread: 2, pinned: true, online: false, group: true },
  { id: 2, name: 'CM France', avatar: 'CM', color: '#E1306C', last: 'David : Merci pour le post 🔥', time: '13:15', unread: 0, pinned: true, online: false, group: true },
  { id: 3, name: 'Aïcha B.', avatar: 'AI', color: '#F59E0B', last: 'Parfait, je te l\'envoie tout de suite.', time: '12:45', unread: 1, pinned: false, online: true, img: 'https://i.pravatar.cc/40?img=5' },
  { id: 4, name: 'David K.', avatar: 'DK', color: '#3B82F6', last: 'Ok super, merci !', time: '12:10', unread: 0, pinned: false, online: true },
  { id: 5, name: 'Mamadou', avatar: 'MT', color: '#10B981', last: 'Peux-tu me confirmer ça ?', time: '11:53', unread: 0, pinned: false, online: false },
  { id: 6, name: 'Christelle', avatar: 'CP', color: '#EC4899', last: 'J\'ai publié le post 👍', time: '11:20', unread: 0, pinned: false, online: false },
  { id: 7, name: 'Social Media Pro', avatar: 'SM', color: '#8B5CF6', last: 'Nouveau post publié !', time: '10:05', unread: 0, pinned: false, online: false, group: true },
  { id: 8, name: 'Dennis', avatar: 'DH', color: '#F97316', last: 'Merci beaucoup !', time: 'Hier', unread: 0, pinned: false, online: false },
  { id: 9, name: 'Cynthia', avatar: 'CL', color: '#06B6D4', last: 'Pas de souci !', time: 'Hier', unread: 0, pinned: false, online: false },
]

const MESSAGES = [
  { id: 1, from: 'other', text: 'Salut ! 👋\n\nEst-ce que tu peux jeter un œil à ce post avant publication ?', time: '12:30' },
  { id: 2, from: 'me', text: 'Bien sûr, je regarde ça tout de suite.', time: '12:31', seen: true },
  { id: 3, from: 'other', text: 'Merci 🙏\n\nJe veux être sûr que le message est clair et impactant.', time: '12:32' },
  { id: 4, from: 'other', type: 'link', title: '5 stratégies pour booster votre productivité', desc: 'Découvrez 5 stratégies efficaces...', site: 'cmstudio.app', time: '12:33' },
  { id: 5, from: 'me', text: 'Top ! 🔥\n\nJ\'aime beaucoup, on peut y aller.', time: '12:34', seen: true, reaction: '❤️ 1' },
]

const SHARED_IMGS = ['#7B5CF5','#E1306C','#3B82F6','#10B981','#F59E0B','#EC4899']
const SHARED_FILES = [
  { name: 'Brief_Projet_Q2.pdf', type: 'PDF', size: '2.4 MB', color: '#EF4444' },
  { name: 'Ideas_Contenu.xlsx', type: 'XLSX', size: '1.1 MB', color: '#10B981' },
  { name: 'Charte_Editoriale.docx', type: 'DOCX', size: '856 KB', color: '#3B82F6' },
]

const s: Record<string, any> = {
  page: { display: 'flex', height: '100%', background: 'var(--bg)' },
  sidebar: { width: 300, flexShrink: 0, borderRight: '1px solid var(--b1)', display: 'flex', flexDirection: 'column', background: 'var(--card)' },
  sHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.1rem .75rem', borderBottom: '1px solid var(--b1)' },
  sTitle: { fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '1.2rem', fontWeight: 700, color: 'var(--t1)', margin: 0 },
  sSearch: { margin: '.6rem .8rem', position: 'relative' },
  sInput: { width: '100%', background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: 10, padding: '.5rem .75rem .5rem 2.1rem', fontSize: '.82rem', color: 'var(--t1)', outline: 'none' },
  filterRow: { display: 'flex', gap: 6, padding: '0 .8rem .7rem', flexShrink: 0 },
  filterBtn: (active: boolean) => ({ padding: '.28rem .7rem', borderRadius: 20, border: 'none', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', background: active ? 'var(--accent)' : 'var(--s2)', color: active ? '#fff' : 'var(--t2)', transition: '.12s' }),
  section: { padding: '.4rem .8rem .2rem', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--t3)' },
  convList: { flex: 1, overflowY: 'auto' },
  convItem: (active: boolean) => ({ display: 'flex', alignItems: 'center', gap: '.65rem', padding: '.65rem .8rem', cursor: 'pointer', background: active ? 'rgba(0,68,34,.08)' : 'transparent', borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent', transition: '.12s' }),
  avatar: (color: string) => ({ width: 38, height: 38, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 700, color: '#fff', flexShrink: 0, position: 'relative' as const }),
  onlineDot: { position: 'absolute' as const, bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#22C55E', border: '2px solid var(--card)' },
  convName: { fontSize: '.83rem', fontWeight: 600, color: 'var(--t1)', marginBottom: 2 },
  convLast: { fontSize: '.72rem', color: 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 },
  badge: { background: '#EF4444', color: '#fff', borderRadius: 10, fontSize: '.62rem', fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' as const },
  chat: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  chatHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem 1.25rem', borderBottom: '1px solid var(--b1)', background: 'var(--card)', flexShrink: 0 },
  chatBody: { flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.75rem' },
  dateSep: { textAlign: 'center' as const, fontSize: '.72rem', color: 'var(--t3)', margin: '.5rem 0', position: 'relative' as const },
  msgRow: (fromMe: boolean) => ({ display: 'flex', gap: '.5rem', justifyContent: fromMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end' }),
  bubble: (fromMe: boolean) => ({ maxWidth: 340, padding: '.65rem .9rem', borderRadius: fromMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: fromMe ? 'var(--accent)' : 'var(--card)', border: fromMe ? 'none' : '1px solid var(--b1)', color: fromMe ? '#fff' : 'var(--t1)', fontSize: '.85rem', lineHeight: 1.55, whiteSpace: 'pre-wrap' }),
  linkCard: { background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: 10, overflow: 'hidden', maxWidth: 280, marginTop: 6 },
  linkImg: { height: 80, background: 'linear-gradient(135deg,var(--accent),#22C55E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' },
  linkBody: { padding: '.6rem .75rem' },
  msgTime: { fontSize: '.65rem', color: 'var(--t3)', marginTop: 4, textAlign: 'right' as const },
  reaction: { fontSize: '.72rem', background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: 10, padding: '2px 7px', display: 'inline-block', marginTop: 4 },
  inputBar: { padding: '.75rem 1.1rem', borderTop: '1px solid var(--b1)', background: 'var(--card)', flexShrink: 0 },
  inputRow: { display: 'flex', alignItems: 'center', gap: '.5rem', background: 'var(--s2)', borderRadius: 14, border: '1px solid var(--b1)', padding: '.45rem .75rem' },
  inputField: { flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '.85rem', color: 'var(--t1)', fontFamily: 'inherit' },
  iconBtn: (color?: string) => ({ background: 'none', border: 'none', cursor: 'pointer', color: color || 'var(--t3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 7, transition: '.12s' }),
  sendBtn: { background: 'var(--accent)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 },
  aiBtn: { display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,68,34,.12)', border: '1px solid rgba(0,68,34,.25)', borderRadius: 8, padding: '.3rem .65rem', color: 'var(--accent)', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer' },
  info: { width: 260, flexShrink: 0, borderLeft: '1px solid var(--b1)', overflowY: 'auto', background: 'var(--card)', display: 'flex', flexDirection: 'column' },
  infoHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.9rem 1rem .75rem', borderBottom: '1px solid var(--b1)' },
  infoTitle: { fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)' },
  infoSection: { padding: '1rem' },
  infoSectionTitle: { fontSize: '.75rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { fontSize: '.7rem', color: 'var(--accent)', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 500 },
  imgGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4 },
  imgCell: (c: string) => ({ aspectRatio: '1', borderRadius: 8, background: c, cursor: 'pointer', transition: '.15s' }),
  fileItem: { display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.45rem 0', borderBottom: '1px solid var(--b1)' },
  fileIcon: (c: string) => ({ width: 32, height: 32, borderRadius: 7, background: c + '20', color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', fontWeight: 700, flexShrink: 0 }),
  optionRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.7rem 0', cursor: 'pointer', borderBottom: '1px solid var(--b1)' },
  optionLabel: { fontSize: '.82rem', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '.5rem' },
}

export default function MessagesPage() {
  const [activeConv, setActiveConv] = useState(2)
  const [filter, setFilter] = useState('tous')
  const [msg, setMsg] = useState('')
  const [showInfo, setShowInfo] = useState(true)
  const conv = CONVERSATIONS.find(c => c.id === activeConv)!

  return (
    <div style={s.page}>
      {/* Left sidebar */}
      <div style={s.sidebar}>
        <div style={s.sHead}>
          <h2 style={s.sTitle}>Messagerie</h2>
          <button style={{ background: 'var(--accent)', border: 'none', borderRadius: 9, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <Edit3 size={14} />
          </button>
        </div>

        <div style={s.sSearch}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }} />
          <input placeholder="Rechercher une conversation..." style={s.sInput} />
        </div>

        <div style={s.filterRow}>
          {[['tous', 'Tous', 12], ['nonlus', 'Non lus', 5], ['groupes', 'Groupes', null]].map(([k, label, count]) => (
            <button key={k as string} onClick={() => setFilter(k as string)} style={s.filterBtn(filter === k)}>
              {label}{count ? ` ${count}` : ''}
            </button>
          ))}
        </div>

        <div style={s.convList}>
          <div style={s.section}>Épinglées</div>
          {CONVERSATIONS.filter(c => c.pinned).map(c => (
            <ConvItem key={c.id} c={c} active={activeConv === c.id} onClick={() => setActiveConv(c.id)} />
          ))}
          <div style={s.section}>Récentes</div>
          {CONVERSATIONS.filter(c => !c.pinned).map(c => (
            <ConvItem key={c.id} c={c} active={activeConv === c.id} onClick={() => setActiveConv(c.id)} />
          ))}
        </div>

        {/* Pro banner */}
        <div style={{ margin: '.75rem', background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: 12, padding: '1rem', flexShrink: 0 }}>
          <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '.3rem' }}>Passez Pro 🚀</div>
          <div style={{ fontSize: '.72rem', color: 'var(--t3)', lineHeight: 1.5, marginBottom: '.75rem' }}>Accédez à toutes les fonctionnalités premium de CM Studio.</div>
          <button style={{ width: '100%', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '.45rem', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer' }}>Découvrir</button>
        </div>
      </div>

      {/* Chat area */}
      <div style={s.chat}>
        {/* Header */}
        <div style={s.chatHead}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <div style={{ ...s.avatar(conv.color), width: 38, height: 38 }}>
              {conv.avatar}
              {conv.online && <span style={s.onlineDot} />}
            </div>
            <div>
              <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)' }}>{conv.name}</div>
              <div style={{ fontSize: '.72rem', color: conv.online ? '#22C55E' : 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {conv.online && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />}
                {conv.online ? 'En ligne' : 'Hors ligne'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[Phone, Video, MoreHorizontal].map((Icon, i) => (
              <button key={i} style={{ background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: 9, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--t2)' }}>
                <Icon size={15} />
              </button>
            ))}
            <button onClick={() => setShowInfo(v => !v)} style={{ background: showInfo ? 'rgba(0,68,34,.1)' : 'var(--s2)', border: `1px solid ${showInfo ? 'var(--accent)' : 'var(--b1)'}`, borderRadius: 9, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: showInfo ? 'var(--accent)' : 'var(--t2)' }}>
              <User size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={s.chatBody}>
          <div style={s.dateSep}>
            <span style={{ background: 'var(--s2)', padding: '2px 12px', borderRadius: 20, border: '1px solid var(--b1)' }}>Aujourd&apos;hui</span>
          </div>
          {MESSAGES.map(m => (
            <div key={m.id} style={s.msgRow(m.from === 'me')}>
              {m.from === 'other' && (
                <div style={{ ...s.avatar(conv.color), width: 30, height: 30, fontSize: '.62rem' }}>{conv.avatar}</div>
              )}
              <div>
                <div style={s.bubble(m.from === 'me')}>
                  {m.type === 'link' ? (
                    <div>
                      <div style={{ fontSize: '.82rem' }}>Regarde ce lien 👇</div>
                      <div style={s.linkCard}>
                        <div style={s.linkImg}>🖥️</div>
                        <div style={s.linkBody}>
                          <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--t1)', marginBottom: 2 }}>{m.title}</div>
                          <div style={{ fontSize: '.7rem', color: 'var(--t3)' }}>{m.desc}</div>
                          <div style={{ fontSize: '.65rem', color: 'var(--accent)', marginTop: 4 }}>🔗 {m.site}</div>
                        </div>
                      </div>
                    </div>
                  ) : m.text}
                </div>
                <div style={{ ...s.msgTime, color: m.from === 'me' ? 'var(--t3)' : 'var(--t3)', display: 'flex', gap: 6, alignItems: 'center', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                  {m.time}
                  {m.seen && <span style={{ color: 'var(--accent)' }}>✓✓</span>}
                </div>
                {m.reaction && <div style={s.reaction}>{m.reaction}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={s.inputBar}>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
            <div style={s.inputRow}>
              {[Paperclip, Image, Smile, FileText, Mic].map((Icon, i) => (
                <button key={i} style={s.iconBtn()}><Icon size={16} /></button>
              ))}
              <input
                value={msg} onChange={e => setMsg(e.target.value)}
                placeholder="Écrire un message..."
                style={s.inputField}
                onKeyDown={e => e.key === 'Enter' && setMsg('')}
              />
            </div>
            <button style={s.aiBtn}>✦ Assistant IA</button>
            <button style={s.sendBtn}><Send size={15} /></button>
          </div>
        </div>
      </div>

      {/* Right info panel */}
      {showInfo && (
        <div style={s.info}>
          <div style={s.infoHead}>
            <span style={s.infoTitle}>Informations</span>
            <button onClick={() => setShowInfo(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)' }}><X size={15} /></button>
          </div>

          {/* Contact info */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--b1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
            <div style={{ ...s.avatar(conv.color), width: 52, height: 52, fontSize: '.9rem' }}>
              {conv.avatar}
              {conv.online && <span style={s.onlineDot} />}
            </div>
            <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: '.9rem' }}>{conv.name}</div>
            <div style={{ fontSize: '.72rem', color: conv.online ? '#22C55E' : 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {conv.online && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />}
              {conv.online ? 'En ligne' : 'Hors ligne'}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '.75rem 1rem', borderBottom: '1px solid var(--b1)' }}>
            {[{ icon: User, label: 'Profil' }, { icon: Search, label: 'Rechercher' }, { icon: Bell, label: 'Notifications' }].map(({ icon: Icon, label }) => (
              <button key={label} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--s2)', border: '1px solid var(--b1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)' }}>
                  <Icon size={15} />
                </div>
                <span style={{ fontSize: '.65rem', color: 'var(--t3)' }}>{label}</span>
              </button>
            ))}
          </div>

          {/* Médias */}
          <div style={s.infoSection}>
            <div style={s.infoSectionTitle}>
              Médias partagés
              <button style={s.seeAll}>Voir tout ∨</button>
            </div>
            <div style={s.imgGrid}>
              {SHARED_IMGS.map((c, i) => (
                <div key={i} style={s.imgCell(c)} />
              ))}
            </div>
          </div>

          {/* Fichiers */}
          <div style={{ ...s.infoSection, borderTop: '1px solid var(--b1)' }}>
            <div style={s.infoSectionTitle}>
              Fichiers partagés
              <button style={s.seeAll}>Voir tout ∨</button>
            </div>
            {SHARED_FILES.map(f => (
              <div key={f.name} style={s.fileItem}>
                <div style={s.fileIcon(f.color)}>{f.type}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                  <div style={{ fontSize: '.68rem', color: 'var(--t3)' }}>{f.type} · {f.size}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Options */}
          <div style={{ ...s.infoSection, borderTop: '1px solid var(--b1)' }}>
            <div style={{ ...s.infoSectionTitle, marginBottom: '.5rem' }}>Options</div>
            {[{ icon: Star, label: 'Noter la conversation' }, { icon: Archive, label: 'Archiver la conversation' }].map(({ icon: Icon, label }) => (
              <div key={label} style={s.optionRow}>
                <span style={s.optionLabel}><Icon size={14} /> {label}</span>
                <span style={{ color: 'var(--t3)', fontSize: '.8rem' }}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ConvItem({ c, active, onClick }: { c: typeof CONVERSATIONS[0]; active: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={s.convItem(active)}>
      <div style={s.avatar(c.color)}>
        {c.avatar}
        {c.online && <span style={s.onlineDot} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <span style={s.convName}>{c.name}</span>
          <span style={{ fontSize: '.68rem', color: 'var(--t3)' }}>{c.time}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={s.convLast}>{c.last}</span>
          {c.unread > 0 && <span style={s.badge}>{c.unread}</span>}
        </div>
      </div>
    </div>
  )
}

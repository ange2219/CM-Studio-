'use client'
import { useState } from 'react'
import { Search, Edit3, Paperclip, Smile, Send } from 'lucide-react'

const CONVS = [
  { id: 1, name: 'Équipe Marketing', last: 'On se retrouve à 14h pour la réunion...', time: '14:32', avatar: 'EM', color: '#7B5CF5' },
  { id: 2, name: 'Aïcha B.', last: "J'ai oublié comment c'était av...", time: '13:45', avatar: 'AI', color: '#F59E0B', active: true },
  { id: 3, name: 'David K.', last: "Mais on va probablement...", time: '12:09', avatar: 'DK', color: '#3B82F6' },
  { id: 4, name: 'Mamadou', last: "C'est pas si mal...", time: '12:09', avatar: 'MT', color: '#10B981' },
  { id: 5, name: 'Christelle', last: 'Wasup pour la 3ème fois li...', time: '12:09', avatar: 'CP', color: '#EC4899' },
  { id: 6, name: 'Dennis', last: 'howdoyoudoaspace', time: '12:09', avatar: 'DH', color: '#F97316' },
]

const MSGS = [
  { id: 1, from: 'them', text: 'Salut ! 👋 Est-ce que tu peux jeter un œil à ce post ?' },
  { id: 2, from: 'them', text: "Je m'en souviens plus comment c'était avant..." },
  { id: 3, from: 'me', text: '... à propos de qui on était.' },
  { id: 4, from: 'me', text: 'Tu es sérieux ?' },
  { id: 5, from: 'them', text: 'Quand on était jeunes et libres...' },
  { id: 6, from: 'them', text: "J'ai oublié comment c'était avant" },
]

export default function MessagesPage() {
  const [active, setActive] = useState(1)
  const [input, setInput] = useState('')
  const conv = CONVS.find(c => c.id === active)!

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg)', fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── Left panel ── */}
      <div style={{ width: 280, borderRight: '1px solid var(--b1)', display: 'flex', flexDirection: 'column', background: 'var(--card)', flexShrink: 0 }}>

        {/* Search + compose */}
        <div style={{ padding: '1rem .9rem .75rem', display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }} />
            <input placeholder="Search" style={{ width: '100%', background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: 20, padding: '.45rem .75rem .45rem 2rem', fontSize: '.82rem', color: 'var(--t1)', outline: 'none' }} />
          </div>
          <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Edit3 size={14} />
          </button>
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {CONVS.map(c => {
            const isActive = c.id === active
            return (
              <div
                key={c.id}
                onClick={() => setActive(c.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '.7rem .9rem', cursor: 'pointer', background: isActive ? 'var(--accent)' : 'transparent', transition: '.12s' }}
              >
                {/* Avatar */}
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {c.avatar}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: '.84rem', fontWeight: 700, color: isActive ? '#fff' : 'var(--t1)' }}>{c.name}</span>
                    <span style={{ fontSize: '.7rem', color: isActive ? 'rgba(255,255,255,.7)' : 'var(--t3)' }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize: '.75rem', color: isActive ? 'rgba(255,255,255,.75)' : 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.last}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Right chat area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* To: header */}
        <div style={{ padding: '.85rem 1.25rem', borderBottom: '1px solid var(--b1)', background: 'var(--card)', fontSize: '.88rem', color: 'var(--t2)' }}>
          To: <strong style={{ color: 'var(--t1)' }}>{conv.name}</strong>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Date separator */}
          <div style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--t3)', margin: '.5rem 0 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--b1)' }} />
            Aujourd&apos;hui, {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            <div style={{ flex: 1, height: 1, background: 'var(--b1)' }} />
          </div>

          {MSGS.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'them' ? 'flex-start' : 'flex-end' }}>
              <div style={{
                padding: '.6rem 1rem',
                borderRadius: m.from === 'them' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                background: m.from === 'them' ? 'var(--accent)' : 'var(--s2)',
                color: m.from === 'them' ? '#fff' : 'var(--t1)',
                border: m.from === 'them' ? 'none' : '1px solid var(--b1)',
                fontSize: '.85rem',
                maxWidth: 340,
                lineHeight: 1.5,
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div style={{ padding: '.75rem 1.25rem', borderTop: '1px solid var(--b1)', background: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: 12, padding: '.5rem .75rem' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex' }}><Paperclip size={16} /></button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setInput('')}
              placeholder="Écrire un message..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '.85rem', color: 'var(--t1)', fontFamily: 'inherit' }}
            />
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex' }}><Smile size={16} /></button>
            <button
              onClick={() => setInput('')}
              style={{ background: input ? 'var(--accent)' : 'var(--s2)', border: '1px solid var(--b1)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: input ? '#fff' : 'var(--t3)', transition: '.15s' }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

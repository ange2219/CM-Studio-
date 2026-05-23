'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Edit3, Paperclip, Smile, Send, ArrowLeft } from 'lucide-react'

const CONVS = [
  { id: 1, name: 'Équipe Marketing', last: 'On se retrouve à 14h pour la réunion...', time: '14:32', avatar: 'EM', color: '#7B5CF5' },
  { id: 2, name: 'Aïcha B.',          last: "J'ai oublié comment c'était av...",        time: '13:45', avatar: 'AI', color: '#F59E0B' },
  { id: 3, name: 'David K.',          last: "Mais on va probablement...",                time: '12:09', avatar: 'DK', color: '#3B82F6' },
  { id: 4, name: 'Mamadou',           last: "C'est pas si mal...",                       time: '12:09', avatar: 'MT', color: '#10B981' },
  { id: 5, name: 'Christelle',        last: "Wasup pour la 3ème fois li...",             time: '12:09', avatar: 'CP', color: '#EC4899' },
  { id: 6, name: 'Dennis',            last: 'howdoyoudoaspace',                          time: '12:09', avatar: 'DH', color: '#F97316' },
]

const MSGS_BY_CONV: Record<number, { id: number; from: 'me' | 'them'; text: string }[]> = {
  1: [
    { id: 1, from: 'them', text: 'Salut ! On se retrouve à 14h pour la réunion ?' },
    { id: 2, from: 'me',   text: 'Oui bien sûr, je serai là 👍' },
    { id: 3, from: 'them', text: "Super ! On parlera du planning du mois prochain." },
  ],
  2: [
    { id: 1, from: 'them', text: 'Salut ! 👋 Est-ce que tu peux jeter un œil à ce post ?' },
    { id: 2, from: 'them', text: "Je m'en souviens plus comment c'était avant..." },
    { id: 3, from: 'me',   text: '... à propos de qui on était.' },
    { id: 4, from: 'me',   text: 'Tu es sérieux ?' },
    { id: 5, from: 'them', text: 'Quand on était jeunes et libres...' },
    { id: 6, from: 'them', text: "J'ai oublié comment c'était avant" },
  ],
  3: [{ id: 1, from: 'them', text: 'Ok super, merci !' }, { id: 2, from: 'me', text: "De rien, à bientôt !" }],
  4: [{ id: 1, from: 'them', text: "Peux-tu me confirmer ça ?" }, { id: 2, from: 'me', text: "Oui, confirmé ✅" }],
  5: [{ id: 1, from: 'them', text: "J'ai publié le post 👍" }],
  6: [{ id: 1, from: 'them', text: 'howdoyoudoaspace' }, { id: 2, from: 'me', text: 'Haha 😄' }],
}

export default function MessagesPage() {
  const router = useRouter()
  const [active, setActive] = useState(2)
  const [input, setInput] = useState('')
  const conv = CONVS.find(c => c.id === active)!
  const messages = MSGS_BY_CONV[active] || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '1.8rem', fontWeight: 700, color: '#fff', letterSpacing: '-.02em', margin: 0 }}>
          Messagerie
        </h1>
        <p style={{ color: 'var(--t3)', fontSize: '.9rem', marginTop: '.2rem', margin: 0 }}>
          Votre boîte de réception pour interagir avec votre communauté.
        </p>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0, background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--b1)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>

      {/* ── Conversation list (internal sidebar) ── */}
      <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--b1)', display: 'flex', flexDirection: 'column', background: 'var(--sidebar-bg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem .9rem' }}>
          <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--t1)' }}>Messagerie</span>
          <button style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Edit3 size={13} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '0 .75rem .75rem', position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '1.3rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }} />
          <input placeholder="Rechercher..." style={{ width: '100%', background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: 20, padding: '.4rem .75rem .4rem 2rem', fontSize: '.8rem', color: 'var(--t1)', outline: 'none' }} />
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem' }}>
          {CONVS.map(c => {
            const isActive = c.id === active
            return (
              <div
                key={c.id}
                onClick={() => setActive(c.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '.65rem .9rem', cursor: 'pointer', background: isActive ? 'var(--accent)' : 'transparent', transition: '.12s', borderLeft: isActive ? '3px solid rgba(255,255,255,.3)' : '3px solid transparent' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--s2)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {c.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: '.82rem', fontWeight: 700, color: isActive ? '#fff' : 'var(--t1)' }}>{c.name}</span>
                    <span style={{ fontSize: '.68rem', color: isActive ? 'rgba(255,255,255,.6)' : 'var(--t3)' }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize: '.73rem', color: isActive ? 'rgba(255,255,255,.7)' : 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.last}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Chat header */}
        <div style={{ padding: '.85rem 1.25rem', borderBottom: '1px solid var(--b1)', background: 'transparent', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: conv.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.68rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {conv.avatar}
          </div>
          <span style={{ fontSize: '.88rem', color: 'var(--t2)' }}>
            À : <strong style={{ color: 'var(--t1)' }}>{conv.name}</strong>
          </span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Date separator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '.25rem 0 .75rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--b1)' }} />
            <span style={{ fontSize: '.72rem', color: 'var(--t3)', whiteSpace: 'nowrap' }}>
              Aujourd&apos;hui, {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--b1)' }} />
          </div>

          {messages.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'them' ? 'flex-start' : 'flex-end' }}>
              <div style={{
                padding: '.6rem 1rem',
                borderRadius: m.from === 'them' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                background: m.from === 'them' ? 'var(--accent)' : 'var(--s2)',
                color: m.from === 'them' ? '#fff' : 'var(--t1)',
                border: m.from === 'them' ? 'none' : '1px solid var(--b1)',
                fontSize: '.85rem',
                maxWidth: 380,
                lineHeight: 1.55,
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div style={{ padding: '.85rem 1.25rem', borderTop: '1px solid var(--b1)', background: 'transparent', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '.45rem .75rem' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex', padding: 4 }}><Paperclip size={16} /></button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setInput('')}
              placeholder="Écrire un message..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '.85rem', color: 'var(--t1)', fontFamily: 'inherit' }}
            />
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex', padding: 4 }}><Smile size={16} /></button>
            <button
              onClick={() => setInput('')}
              style={{ background: input ? 'var(--accent)' : 'transparent', border: '1px solid var(--b1)', borderRadius: 9, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: input ? '#fff' : 'var(--t3)', transition: '.15s', flexShrink: 0 }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

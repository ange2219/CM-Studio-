'use client'

import { Sparkles, MessageSquare, Lightbulb, Calendar, BarChart2 } from 'lucide-react'

export function AiAssistantPanel({ firstName }: { firstName: string }) {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--t1)' }}>Assistant IA</span>
        </div>
        <span className="badge-blue" style={{ fontSize: '10px' }}>NOUVEAU</span>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--t2)', lineHeight: 1.5 }}>
        Salut {firstName} ! Comment puis-je vous aider aujourd'hui ?
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="act-btn" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', textAlign: 'left', borderRadius: '10px', background: 'var(--s2)', border: '1px solid var(--b1)' }}>
          <MessageSquare size={14} />
          <span>Générer un post</span>
        </button>
        <button className="act-btn" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', textAlign: 'left', borderRadius: '10px', background: 'var(--s2)', border: '1px solid var(--b1)' }}>
          <Lightbulb size={14} />
          <span>Trouver des idées</span>
        </button>
        <button className="act-btn" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', textAlign: 'left', borderRadius: '10px', background: 'var(--s2)', border: '1px solid var(--b1)' }}>
          <Calendar size={14} />
          <span>Meilleur horaire</span>
        </button>
        <button className="act-btn" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', textAlign: 'left', borderRadius: '10px', background: 'var(--s2)', border: '1px solid var(--b1)' }}>
          <BarChart2 size={14} />
          <span>Analyser mes perfs</span>
        </button>
      </div>

      <button className="btn-full" style={{ marginTop: '0.5rem', background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <MessageSquare size={16} />
        Discuter avec l'IA
      </button>
    </div>
  )
}

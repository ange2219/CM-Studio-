'use client'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useSearchParams } from 'next/navigation'
import { useUser } from '@/components/context/UserContext'
import { MessagesSkeleton } from '@/components/ui/Skeleton'
import { Search, Edit3, Paperclip, Smile, Send, X } from 'lucide-react'

interface User { id: string; full_name: string | null; email?: string; avatar_url: string | null }
interface Message { id: string; conversation_id: string; sender_id: string; content: string; attachment_url?: string | null; attachment_name?: string | null; attachment_type?: string | null; created_at: string; sender?: User; message_reads?: { user_id: string }[] }
interface Conversation { id: string; updated_at: string; otherUser: User; lastMessage: string; unreadCount: number }

const EMOJIS = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '❤️', '🔥', '✅', '🎉', '💯', '🙏', '😭', '😅', '🤩', '💪', '🚀', '⚡', '🌟', '🎯', '✨', '👏', '🫡', '🫶', '😤', '🥲', '😇', '🤝', '🎊']

function getInitials(u: User) {
  if (u.full_name) { const p = u.full_name.trim().split(' '); return (p[0][0] + (p[1]?.[0] || '')).toUpperCase() }
  return 'U'
}
const AVATAR_COLORS = ['#7B5CF5', '#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#F97316']
function avatarColor(u: User) {
  const val = u.full_name || u.id || ''
  return AVATAR_COLORS[val.charCodeAt(0) % AVATAR_COLORS.length]
}

function Avatar({ user, size = 40 }: { user: User; size?: number }) {
  if (user.avatar_url && !user.avatar_url.startsWith('/api/social')) {
    return <img src={user.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: avatarColor(user), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.32, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
      {getInitials(user)}
    </div>
  )
}

function MessagesContent() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const searchParams = useSearchParams()
  const { user: me } = useUser() as { user: User | null }
  const [convs, setConvs] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [msgs, setMsgs] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [uSearch, setUSearch] = useState('')
  const [uResults, setUResults] = useState<User[]>([])
  const [showEmoji, setShowEmoji] = useState(false)
  const [convSearch, setConvSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const convsRef = useRef<Conversation[]>([])
  const activeConv = convs.find(c => c.id === activeId)

  useEffect(() => {
    convsRef.current = convs
  }, [convs])

  // Auto-ouvrir un DM si le paramètre ?dm=userId est présent (venant de la communauté)
  useEffect(() => {
    const dmUserId = searchParams.get('dm')
    if (!dmUserId || !me) return
    supabase.rpc('find_or_create_dm', { other_user_id: dmUserId }).then(({ data: convId, error }) => {
      if (error) {
        console.error('find_or_create_dm error (auto):', error)
        alert("Erreur lors de la création de la discussion : " + error.message)
        return
      }
      if (convId) {
        loadConvs().then(() => setActiveId(convId))
        // Nettoyer l'URL sans recharger la page
        window.history.replaceState(null, '', '/messages')
      }
    })
  }, [me, searchParams])

  // Load conversations
  const loadConvs = useCallback(async () => {
    if (!me) return
    const { data: convsData, error } = await supabase
      .from('vw_conversations_list')
      .select('*')
      .eq('my_user_id', me.id)
    
    if (error || !convsData) {
      setConvs([])
      return
    }

    const ids = convsData.map(c => c.conversation_id).filter(Boolean) as string[]
    const unreadMap: Record<string, number> = {}
    
    if (ids.length) {
      const { data: chatMsgs } = await supabase
        .from('messages')
        .select('id, conversation_id, message_reads!left(user_id)')
        .in('conversation_id', ids)
        .neq('sender_id', me.id)
        
      if (chatMsgs) {
        chatMsgs.forEach(m => {
          const reads = (m as any).message_reads || []
          const isRead = reads.some((r: any) => r.user_id === me.id)
          if (!isRead) {
            unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] || 0) + 1
          }
        })
      }
    }

    const result: Conversation[] = convsData
      .filter(c => c.last_message_created_at)
      .map(c => {
        const otherUser: User = {
          id: c.other_user_id || '',
          full_name: c.other_full_name || 'Membre CM Studio',
          username: c.other_username || 'membre',
          avatar_url: c.other_avatar_url,
        }
        return {
          id: c.conversation_id,
          updated_at: c.updated_at || '',
          otherUser,
          lastMessage: c.last_message_content || (c.last_message_attachment_name ? 'Pièce jointe' : 'Aucun message'),
          unreadCount: unreadMap[c.conversation_id] || 0,
        }
      })

    result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    setConvs(result)
  }, [me])

  useEffect(() => { if (me) loadConvs() }, [me, loadConvs])

  // Load messages
  const loadMsgs = useCallback(async (convId: string) => {
    if (!me) return
    const { data } = await supabase.from('messages').select('*,sender:users!sender_id(id,full_name,username,avatar_url),message_reads(user_id)').eq('conversation_id', convId).order('created_at', { ascending: true })
    if (data) {
      setMsgs(data as Message[])
      const ids = data.filter(m => m.sender_id !== me.id).map(m => m.id) || []
      if (ids.length) {
        await supabase.from('message_reads').upsert(ids.map(id => ({ message_id: id, user_id: me.id })), { onConflict: 'message_id,user_id' })
        loadConvs()
      }
    }
  }, [me, loadConvs])

  // Realtime global pour mettre à jour les conversations et notifications non lues des autres chats
  useEffect(() => {
    if (!me) return
    const globalChannel = supabase.channel('global-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        loadConvs()
      })
      .subscribe()
    return () => { supabase.removeChannel(globalChannel) }
  }, [me, loadConvs])

  // Load messages + realtime de la conversation active
  useEffect(() => {
    if (!activeId || !me) return
    loadMsgs(activeId)

    if (realtimeRef.current) supabase.removeChannel(realtimeRef.current)
    realtimeRef.current = supabase.channel(`msgs:${activeId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeId}` }, async payload => {
        const nm = payload.new as Message
        
        let sender: User | null = null
        if (me && nm.sender_id === me.id) {
          sender = me
        } else {
          const currentConv = convsRef.current.find(c => c.id === activeId)
          if (currentConv) {
            sender = currentConv.otherUser
          }
        }

        setMsgs(p => {
          // Filtrer le message temporaire correspondant pour éviter les doublons
          const withoutTemp = p.filter(m => !(m.isTemp && m.content === nm.content && m.sender_id === nm.sender_id))
          return [...withoutTemp, { ...nm, sender: sender as User, message_reads: [] }]
        })
        if (nm.sender_id !== me.id) {
          await supabase.from('message_reads').upsert({ message_id: nm.id, user_id: me.id }, { onConflict: 'message_id,user_id' })
        }
        loadConvs()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_reads' }, () => {
        // Un message a été lu (probablement par l'autre), recharger pour afficher les coches bleues
        loadMsgs(activeId)
      })
      .subscribe()
    return () => { if (realtimeRef.current) supabase.removeChannel(realtimeRef.current) }
  }, [activeId, me, loadMsgs])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  // User search
  useEffect(() => {
    if (uSearch.length < 2) { setUResults([]); return }
    const t = setTimeout(() => {
      fetch(`/api/messages/users/search?q=${encodeURIComponent(uSearch)}`).then(r => r.json()).then(d => setUResults(d))
    }, 300)
    return () => clearTimeout(t)
  }, [uSearch])

  async function send() {
    if (!input.trim() || !activeId || !me) return
    const content = input.trim()
    setInput('')

    // Créer un ID temporaire unique
    const tempId = `temp-${Date.now()}`
    const tempMsg: Message = {
      id: tempId,
      conversation_id: activeId,
      sender_id: me.id,
      content,
      created_at: new Date().toISOString(),
      sender: me as any,
      message_reads: [],
      isTemp: true,
      error: false
    }

    // Afficher immédiatement le message localement avec le statut "En cours..."
    setMsgs(prev => [...prev, tempMsg])

    try {
      const { error } = await supabase.from('messages').insert({ conversation_id: activeId, sender_id: me.id, content })
      if (error) {
        console.error('Insert error:', error)
        setMsgs(prev => prev.map(m => m.id === tempId ? { ...m, error: true } : m))
      }
    } catch (err) {
      console.error('Send catch error:', err)
      setMsgs(prev => prev.map(m => m.id === tempId ? { ...m, error: true } : m))
    }
  }

  async function startDm(user: User) {
    if (!me) return
    const { data: convId, error } = await supabase.rpc('find_or_create_dm', { other_user_id: user.id })
    if (error || !convId) {
      console.error('find_or_create_dm error:', error)
      alert("Impossible de démarrer la discussion : " + (error?.message || "ID de conversation non reçu."))
      return
    }
    setShowNew(false); setUSearch(''); setUResults([])
    // Construire la conversation directement pour éviter le bug de timing React
    const newConv: Conversation = { id: convId, updated_at: new Date().toISOString(), otherUser: user, lastMessage: 'Aucun message', unreadCount: 0 }
    setConvs(prev => {
      const exists = prev.find(c => c.id === convId)
      if (exists) return prev
      return [newConv, ...prev]
    })
    setActiveId(convId)
    // Recharger en arrière-plan pour avoir les vraies données
    loadConvs()
  }

  async function uploadFile(file: File) {
    if (!activeId || !me) return
    setUploading(true)
    const path = `${me.id}/${activeId}/${Date.now()}.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage.from('message-attachments').upload(path, file)
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from('message-attachments').getPublicUrl(path)
      await supabase.from('messages').insert({ conversation_id: activeId, sender_id: me.id, content: '', attachment_url: publicUrl, attachment_name: file.name, attachment_type: file.type })
    }
    setUploading(false)
  }

  const filteredConvs = convs.filter(c => !convSearch || c.otherUser.full_name?.toLowerCase().includes(convSearch.toLowerCase()))
  const totalUnread = convs.reduce((s, c) => s + c.unreadCount, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', flex: 1, minHeight: 0 }}>
      {/* NEW CONV MODAL */}
      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 16, width: 420, padding: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--t1)', fontSize: '1rem' }}>Nouveau message</span>
              <button onClick={() => { setShowNew(false); setUSearch(''); setUResults([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)' }}><X size={18} /></button>
            </div>
            <div style={{ position: 'relative', marginBottom: '.75rem' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }} />
              <input value={uSearch} onChange={e => setUSearch(e.target.value)} placeholder="Rechercher un utilisateur..." autoFocus style={{ width: '100%', background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: 20, padding: '.45rem .75rem .45rem 2rem', fontSize: '.83rem', color: 'var(--t1)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {uResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {uResults.map(u => (
                  <button key={u.id} onClick={() => startDm(u)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '.6rem .75rem', borderRadius: 10, background: 'var(--s2)', border: '1px solid var(--b1)', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <Avatar user={u} size={36} />
                    <div>
                      <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--t1)' }}>{u.full_name || 'Utilisateur'}</div>
                      {u.username && (
                        <div style={{ fontSize: '.73rem', color: 'var(--accent)' }}>@{u.username}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {uSearch.length >= 2 && uResults.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--t3)', fontSize: '.82rem', padding: '1rem 0' }}>Aucun utilisateur trouvé</p>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0, background: 'transparent', overflow: 'hidden' }}>
        {/* SIDEBAR */}
        <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--b1)', display: 'flex', flexDirection: 'column', background: 'var(--sidebar-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem .9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--t1)' }}>Messagerie</span>
              {totalUnread > 0 && <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 99, padding: '1px 7px', fontSize: '.68rem', fontWeight: 700 }}>{totalUnread}</span>}
            </div>
            <button onClick={() => setShowNew(true)} style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit3 size={13} /></button>
          </div>
          <div style={{ padding: '0 .75rem .75rem', position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '1.3rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }} />
            <input value={convSearch} onChange={e => setConvSearch(e.target.value)} placeholder="Rechercher..." style={{ width: '100%', background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: 20, padding: '.4rem .75rem .4rem 2rem', fontSize: '.8rem', color: 'var(--t1)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConvs.length === 0 && (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--t3)', fontSize: '.82rem' }}>
                {convs.length === 0 ? <>Aucune conversation.<br /><button onClick={() => setShowNew(true)} style={{ marginTop: '.5rem', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '.82rem', fontWeight: 600 }}>Démarrer une conversation</button></> : 'Aucun résultat'}
              </div>
            )}
            {filteredConvs.map(c => {
              const isActive = c.id === activeId
              return (
                <div key={c.id} onClick={() => setActiveId(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '.65rem .9rem', cursor: 'pointer', background: isActive ? 'var(--accent)' : 'transparent', transition: '.12s', borderLeft: isActive ? '3px solid rgba(255,255,255,.3)' : '3px solid transparent' }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--s2)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar user={c.otherUser} size={40} />
                    {c.unreadCount > 0 && !isActive && <span style={{ position: 'absolute', top: -2, right: -2, background: 'var(--accent)', color: '#fff', borderRadius: 99, padding: '1px 5px', fontSize: '.6rem', fontWeight: 700, border: '2px solid var(--bg)' }}>{c.unreadCount}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: '.82rem', fontWeight: c.unreadCount > 0 && !isActive ? 700 : 600, color: isActive ? '#fff' : 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {c.otherUser.full_name || 'Utilisateur'}
                        {c.otherUser.username && (
                          <span style={{ fontSize: '.72rem', color: isActive ? 'rgba(255,255,255,.6)' : 'var(--t3)', fontWeight: 400 }}>@{c.otherUser.username}</span>
                        )}
                      </span>
                      <span style={{ fontSize: '.68rem', color: isActive ? 'rgba(255,255,255,.6)' : 'var(--t3)', flexShrink: 0 }}>{new Date(c.updated_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ fontSize: '.73rem', color: isActive ? 'rgba(255,255,255,.7)' : c.unreadCount > 0 ? 'var(--t1)' : 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: c.unreadCount > 0 && !isActive ? 600 : 400 }}>{c.lastMessage}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CHAT AREA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {!activeConv ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--t3)' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit3 size={24} style={{ color: 'var(--accent)' }} /></div>
              <p style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--t2)' }}>Vos messages</p>
              <p style={{ fontSize: '.82rem', textAlign: 'center' }}>Envoyez des messages à vos collègues CM Studio</p>
              <button onClick={() => setShowNew(true)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '.55rem 1.2rem', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer' }}>Nouveau message</button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '.85rem 1.25rem', borderBottom: '1px solid var(--b1)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <Avatar user={activeConv.otherUser} size={34} />
                <div>
                  <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--t1)' }}>{activeConv.otherUser.full_name || 'Utilisateur'}</div>
                  {activeConv.otherUser.username && (
                    <div style={{ fontSize: '.72rem', color: 'var(--t3)' }}>@{activeConv.otherUser.username}</div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {msgs.map(m => {
                  const isMe = m.sender_id === me?.id
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                      {!isMe && m.sender && <Avatar user={m.sender} size={24} />}
                      <div style={{ maxWidth: 380 }}>
                        {m.attachment_url ? (
                          <div style={{ padding: '.6rem 1rem', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isMe ? 'var(--s2)' : 'var(--accent)', border: isMe ? '1px solid var(--b1)' : 'none' }}>
                            {m.attachment_type?.startsWith('image/') ? (
                              <img src={m.attachment_url} alt={m.attachment_name || 'image'} style={{ maxWidth: 240, borderRadius: 8, display: 'block' }} />
                            ) : (
                              <a href={m.attachment_url} target="_blank" rel="noopener noreferrer" style={{ color: isMe ? 'var(--accent)' : '#fff', fontSize: '.82rem', textDecoration: 'underline' }}>📎 {m.attachment_name}</a>
                            )}
                          </div>
                        ) : (
                          <div style={{ padding: '.6rem 1rem', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isMe ? 'var(--s2)' : 'var(--accent)', color: isMe ? 'var(--t1)' : '#fff', border: isMe ? '1px solid var(--b1)' : 'none', fontSize: '.85rem', lineHeight: 1.55 }}>
                            {m.content}
                          </div>
                        )}
                        <div style={{ fontSize: '.65rem', color: 'var(--t3)', textAlign: isMe ? 'right' : 'left', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 6 }}>
                          <span>{new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 700 }}>
                              {m.message_reads?.some(r => r.user_id === activeConv.otherUser.id) ? (
                                <span style={{ color: 'var(--accent)' }}>✓✓ Lu</span>
                              ) : (
                                <span style={{ color: 'var(--t3)' }}>✓ Envoyé</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '.85rem 1.25rem', borderTop: '1px solid var(--b1)', flexShrink: 0, position: 'relative' }}>
                {showEmoji && (
                  <div style={{ position: 'absolute', bottom: '100%', left: '1.25rem', background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 12, padding: '.75rem', display: 'flex', flexWrap: 'wrap', gap: 4, width: 280, boxShadow: '0 8px 30px rgba(0,0,0,.2)', zIndex: 10 }}>
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => { setInput(p => p + e); setShowEmoji(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', padding: '2px', borderRadius: 6, lineHeight: 1 }}
                        onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--s2)')}
                        onMouseLeave={ev => (ev.currentTarget.style.background = 'none')}>
                        {e}
                      </button>
                    ))}
                  </div>
                )}
                <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*,.pdf,.txt,.zip,.mp4" onChange={e => { if (e.target.files?.[0]) uploadFile(e.target.files[0]); e.target.value = '' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: 14, padding: '.45rem .75rem' }}>
                  <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: uploading ? 'var(--accent)' : 'var(--t3)', display: 'flex', padding: 4 }}><Paperclip size={16} /></button>
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())} placeholder="Écrire un message..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '.85rem', color: 'var(--t1)', fontFamily: 'inherit' }} />
                  <button onClick={() => setShowEmoji(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: showEmoji ? 'var(--accent)' : 'var(--t3)', display: 'flex', padding: 4 }}><Smile size={16} /></button>
                  <button onClick={send} disabled={!input.trim() || sending} style={{ background: input.trim() ? 'var(--accent)' : 'transparent', border: '1px solid var(--b1)', borderRadius: 9, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'not-allowed', color: input.trim() ? '#fff' : 'var(--t3)', transition: '.15s', flexShrink: 0 }}><Send size={14} /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesSkeleton />}>
      <MessagesContent />
    </Suspense>
  )
}

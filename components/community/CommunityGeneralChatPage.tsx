'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Send, 
  ArrowLeft, 
  Trash2, 
  RefreshCw, 
  MessageSquare, 
  Users, 
  Smile, 
  Clock,
  Sparkles,
  ChevronUp
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/context/UserContext'
import { useToast } from '@/components/ui/Toast'
import { UserAvatar } from '@/components/ui/UserAvatar'

interface ChatMessage {
  id: string
  user_id: string
  content: string
  attachment_url?: string | null
  created_at: string
  sender?: {
    id: string
    full_name: string | null
    username: string | null
    avatar_url: string | null
  }
}

function formatChatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    
    const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    if (isToday) return timeStr

    const dateFormatted = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    return `${dateFormatted}, ${timeStr}`
  } catch {
    return ''
  }
}

function normalizeMessage(item: any): ChatMessage {
  const senderObj = Array.isArray(item.sender) ? item.sender[0] : item.sender
  return {
    id: item.id,
    user_id: item.user_id,
    content: item.content,
    attachment_url: item.attachment_url,
    created_at: item.created_at,
    sender: senderObj || { id: item.user_id, full_name: 'Membre', username: null, avatar_url: null }
  }
}

export default function CommunityGeneralChatPage() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const supabase = createClient()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const isFirstLoadRef = useRef(true)

  // Auto-scroll to bottom helper
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
    }
  }, [])

  // 1. Fetch initial batch of messages (last 50)
  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('community_chat_messages')
        .select(`
          id,
          user_id,
          content,
          attachment_url,
          created_at,
          sender:user_public_profiles!user_id(id, full_name, username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Erreur chargement messages chat:', error)
        toast('Impossible de charger les messages du chat', 'error')
        return
      }

      const formatted = (data || []).map(normalizeMessage).reverse()
      setMessages(formatted)
      setHasMore((data || []).length === 50)

      setTimeout(() => {
        scrollToBottom(false)
        isFirstLoadRef.current = false
      }, 100)
    } catch (err) {
      console.error('Erreur inattendue:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, scrollToBottom])

  // 2. Fetch older messages (pagination au scroll vers le haut)
  const fetchOlderMessages = async () => {
    if (loadingOlder || !hasMore || messages.length === 0) return
    setLoadingOlder(true)

    const oldestTimestamp = messages[0].created_at
    const previousScrollHeight = chatContainerRef.current?.scrollHeight || 0

    try {
      const { data, error } = await supabase
        .from('community_chat_messages')
        .select(`
          id,
          user_id,
          content,
          attachment_url,
          created_at,
          sender:user_public_profiles!user_id(id, full_name, username, avatar_url)
        `)
        .lt('created_at', oldestTimestamp)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Erreur chargement anciens messages:', error)
        return
      }

      if (data && data.length > 0) {
        const olderFormatted = (data as any[]).map(normalizeMessage).reverse()
        setMessages(prev => [...olderFormatted, ...prev])
        setHasMore(data.length === 50)

        // Restore scroll position after prepending
        setTimeout(() => {
          if (chatContainerRef.current) {
            const newScrollHeight = chatContainerRef.current.scrollHeight
            chatContainerRef.current.scrollTop = newScrollHeight - previousScrollHeight
          }
        }, 50)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Erreur chargement anciens messages:', err)
    } finally {
      setLoadingOlder(false)
    }
  }

  // 3. Realtime subscription on dedicated channel 'community-general-chat'
  useEffect(() => {
    fetchMessages()

    const chatChannel = supabase.channel('community-general-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'community_chat_messages'
      }, async (payload) => {
        const newMsgRaw = payload.new as any

        // Check if message already exists locally (e.g. from optimistic insert)
        setMessages(prev => {
          if (prev.some(m => m.id === newMsgRaw.id)) return prev
          return prev
        })

        // Fetch sender profile info
        let senderData: any = null
        if (user && newMsgRaw.user_id === user.id) {
          senderData = {
            id: user.id,
            full_name: (user as any).full_name || (user as any).user_metadata?.full_name || 'Moi',
            username: (user as any).username || (user as any).user_metadata?.username || null,
            avatar_url: (user as any).avatar_url || (user as any).user_metadata?.avatar_url || null,
          }
        } else {
          const { data: profile } = await supabase
            .from('user_public_profiles')
            .select('id, full_name, username, avatar_url')
            .eq('id', newMsgRaw.user_id)
            .single()
          if (profile) senderData = profile
        }

        const newChatMessage: ChatMessage = {
          ...newMsgRaw,
          sender: senderData || { id: newMsgRaw.user_id, full_name: 'Membre CM Studio', username: null, avatar_url: null }
        }

        setMessages(prev => {
          if (prev.some(m => m.id === newChatMessage.id)) return prev
          return [...prev, newChatMessage]
        })

        // Auto-scroll to bottom on new message
        setTimeout(() => scrollToBottom(true), 50)
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'community_chat_messages'
      }, (payload) => {
        const deletedId = (payload.old as any)?.id
        if (deletedId) {
          setMessages(prev => prev.filter(m => m.id !== deletedId))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(chatChannel)
    }
  }, [fetchMessages, supabase, user, scrollToBottom])

  // 4. Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const content = inputText.trim()
    if (!content || !user || sending) return

    setSending(true)
    setInputText('')

    try {
      const { data, error } = await supabase
        .from('community_chat_messages')
        .insert({
          user_id: user.id,
          content: content
        })
        .select(`
          id,
          user_id,
          content,
          attachment_url,
          created_at,
          sender:user_public_profiles!user_id(id, full_name, username, avatar_url)
        `)
        .single()

      if (error) {
        console.error('Erreur lors de l\'envoi du message:', error)
        toast('Échec de l\'envoi du message', 'error')
        setInputText(content) // Restore text on error
      } else if (data) {
        const normalized = normalizeMessage(data)
        setMessages(prev => {
          if (prev.some(m => m.id === normalized.id)) return prev
          return [...prev, normalized]
        })
        setTimeout(() => scrollToBottom(true), 50)
      }
    } catch (err) {
      console.error('Erreur inattendue envoi message:', err)
      toast('Erreur lors de l\'envoi', 'error')
    } finally {
      setSending(false)
    }
  }

  // 5. Delete Message (own message only)
  const handleDeleteMessage = async (msgId: string) => {
    if (!user || deletingId) return
    setDeletingId(msgId)

    try {
      const { error } = await supabase
        .from('community_chat_messages')
        .delete()
        .eq('id', msgId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erreur suppression message:', error)
        toast('Impossible de supprimer ce message', 'error')
      } else {
        setMessages(prev => prev.filter(m => m.id !== msgId))
        toast('Message supprimé', 'success')
      }
    } catch (err) {
      console.error('Erreur suppression message:', err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 120px)',
      maxHeight: '900px',
      background: 'var(--card)',
      border: '1px solid var(--b1)',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)'
    }}>
      
      {/* ── HEADER DU CHAT ── */}
      <div style={{
        padding: '.75rem 1rem',
        borderBottom: '1px solid var(--b1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--card)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <button
            onClick={() => router.push('/workspace')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid var(--b1)',
              background: 'var(--s2)',
              color: 'var(--t1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--b1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--s2)'}
            title="Retour au Workspace"
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--t1)', margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Général
              </h2>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10B981',
                padding: '2px 7px',
                borderRadius: '6px',
                fontSize: '.65rem',
                fontWeight: 700
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                En direct
              </span>
            </div>
            <p style={{ fontSize: '.7rem', color: 'var(--t3)', margin: '1px 0 0 0' }}>
              Le salon public des créateurs et community managers de CM Studio.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchMessages()}
          style={{
            padding: '.4rem .65rem',
            borderRadius: '8px',
            border: '1px solid var(--b1)',
            background: 'var(--card)',
            color: 'var(--t2)',
            cursor: 'pointer',
            fontSize: '.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '.35rem'
          }}
          title="Rafraîchir les messages"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      {/* ── ZONE DE DÉFILEMENT DES MESSAGES ── */}
      <div 
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '.75rem',
          background: 'var(--bg, transparent)'
        }}
      >
        {/* Bouton charger plus de messages */}
        {hasMore && messages.length >= 50 && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '.25rem 0' }}>
            <button
              onClick={fetchOlderMessages}
              disabled={loadingOlder}
              style={{
                padding: '.3rem .8rem',
                borderRadius: '20px',
                border: '1px solid var(--b1)',
                background: 'var(--card)',
                color: 'var(--t2)',
                fontSize: '.7rem',
                fontWeight: 600,
                cursor: loadingOlder ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '.3rem',
                boxShadow: 'var(--shadow)'
              }}
            >
              <ChevronUp size={12} className={loadingOlder ? 'animate-spin' : ''} />
              <span>{loadingOlder ? 'Chargement...' : 'Afficher les messages plus anciens'}</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--s2)', animation: 'pulse 1.5s infinite' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem', width: '60%' }}>
                  <div style={{ width: '100px', height: '12px', background: 'var(--s2)', borderRadius: '4px' }} />
                  <div style={{ width: '100%', height: '32px', background: 'var(--s2)', borderRadius: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          /* Empty State */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem 1rem',
            color: 'var(--t3)',
            gap: '.6rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--s2)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--t1)', margin: '0 0 .2rem 0' }}>
                Aucun message pour l'instant
              </h4>
              <p style={{ fontSize: '.75rem', margin: 0, maxWidth: '320px' }}>
                Soyez le premier à engager la conversation dans le chat général !
              </p>
            </div>
          </div>
        ) : (
          /* Messages List */
          messages.map((msg, index) => {
            const isMe = user?.id === msg.user_id
            const senderName = msg.sender?.full_name || (msg.sender?.username ? `@${msg.sender.username}` : 'Membre')
            const avatarUrl = msg.sender?.avatar_url || null

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '.65rem',
                  alignItems: 'flex-start',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  position: 'relative'
                }}
                className="group"
              >
                {/* User Avatar */}
                <UserAvatar
                  avatarUrl={avatarUrl}
                  size={34}
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />

                {/* Message Bubble + Header */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '75%'
                }}>
                  {/* Sender Name & Timestamp */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.4rem',
                    marginBottom: '3px',
                    fontSize: '.65rem',
                    color: 'var(--t3)'
                  }}>
                    <span style={{ fontWeight: 700, color: isMe ? 'var(--accent)' : 'var(--t1)' }}>
                      {isMe ? 'Vous' : senderName}
                    </span>
                    <span>•</span>
                    <span>{formatChatTime(msg.created_at)}</span>
                  </div>

                  {/* Bubble Content */}
                  <div
                    style={{
                      padding: '.55rem .85rem',
                      borderRadius: '12px',
                      background: isMe ? 'var(--accent)' : 'var(--card)',
                      color: isMe ? '#fff' : 'var(--t1)',
                      border: isMe ? 'none' : '1px solid var(--b1)',
                      fontSize: '.82rem',
                      lineHeight: 1.45,
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      position: 'relative'
                    }}
                  >
                    {msg.content}
                  </div>

                  {/* Actions for Author (Delete) */}
                  {isMe && (
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      disabled={deletingId === msg.id}
                      title="Supprimer mon message"
                      style={{
                        marginTop: '2px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--t3)',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        fontSize: '.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        opacity: 0,
                        transition: 'opacity 0.15s, color 0.15s'
                      }}
                      className="group-hover:opacity-100 hover:text-red-500"
                    >
                      <Trash2 size={11} />
                      <span>Supprimer</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── BARRE DE SAISIE EN BAS ── */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: '.75rem 1rem',
          borderTop: '1px solid var(--b1)',
          background: 'var(--card)',
          display: 'flex',
          alignItems: 'center',
          gap: '.5rem'
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder={user ? "Écrivez un message public..." : "Connectez-vous pour participer au chat"}
            value={inputText}
            disabled={!user || sending}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            style={{
              width: '100%',
              padding: '.55rem .9rem',
              borderRadius: '12px',
              border: '1px solid var(--b1)',
              background: 'var(--s2)',
              color: 'var(--t1)',
              fontSize: '.82rem',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!user || !inputText.trim() || sending}
          style={{
            height: '38px',
            padding: '0 1rem',
            borderRadius: '12px',
            border: 'none',
            background: inputText.trim() ? 'var(--accent)' : 'var(--s2)',
            color: inputText.trim() ? '#fff' : 'var(--t3)',
            fontWeight: 700,
            fontSize: '.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '.4rem',
            cursor: !inputText.trim() || sending ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: inputText.trim() ? '0 2px 8px rgba(22, 119, 255, 0.25)' : 'none'
          }}
        >
          <Send size={14} className={sending ? 'animate-pulse' : ''} />
          <span className="hidden sm:inline">{sending ? 'Envoi...' : 'Envoyer'}</span>
        </button>
      </form>

    </div>
  )
}

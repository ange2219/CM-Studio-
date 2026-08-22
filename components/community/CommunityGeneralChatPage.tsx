'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Send, 
  RefreshCw, 
  Smile, 
  ChevronUp,
  Pin,
  Users,
  MoreHorizontal,
  Plus,
  Copy,
  Trash2,
  Check,
  Image as ImageIcon,
  X,
  MessageSquare
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/context/UserContext'
import { useTheme } from '@/components/context/ThemeContext'
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

interface OnlineMember {
  id: string
  full_name: string
  username: string | null
  avatar_url: string | null
  role: string
  roleColor: string
  isCurrentUser?: boolean
}

const STORAGE_KEY_REACTIONS = 'cm_chat_reactions_cache_v2'

// Couleurs par défaut selon les rôles réels
const ROLE_COLORS_MAP: Record<string, string> = {
  'admin': '#F59E0B',
  'moderator': '#F59E0B',
  'modérateur': '#F59E0B',
  'community manager': '#A855F7',
  'designer': '#F43F5E',
  'développeur': '#06B6D4',
  'developer': '#06B6D4',
  'rédacteur': '#38BDF8',
  'rédactrice': '#38BDF8',
  'writer': '#38BDF8',
  'graphiste': '#FB923C',
  'support': '#EC4899',
  'vidéaste': '#22C55E',
  'vidéo maker': '#22C55E',
  'copywriter': '#6366F1',
  'créateur': '#10B981',
  'membre': '#10B981',
}

function getRoleColor(roleStr?: string | null): string {
  if (!roleStr) return '#10B981'
  const normalized = roleStr.toLowerCase().trim()
  if (ROLE_COLORS_MAP[normalized]) return ROLE_COLORS_MAP[normalized]
  const palette = ['#A855F7', '#F59E0B', '#F43F5E', '#06B6D4', '#38BDF8', '#10B981', '#FB923C', '#EC4899', '#22C55E', '#6366F1']
  let hash = 0
  for (let i = 0; i < roleStr.length; i++) hash = roleStr.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

// Émojis populaires pour la sélection rapide
const POPULAR_EMOJIS = ['👍', '❤️', '👏', '🔥', '😂', '🎉', '🚀', '👀', '💯', '✨', '🙏', '😍', '💡', '🙌']

function formatChatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    
    const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    if (isToday) return `Aujourd'hui, ${timeStr}`

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
  const { darkMode } = useTheme()
  const { toast } = useToast()
  const supabase = useMemo(() => createClient(), [])

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Gestion persistante des réactions (message_id -> emoji -> user_id[])
  const [reactionsMap, setReactionsMap] = useState<Record<string, Record<string, string[]>>>({})

  // Barre latérale des vrais membres de Supabase
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [showMembersSidebar, setShowMembersSidebar] = useState(true)
  const [showMobileMembersDrawer, setShowMobileMembersDrawer] = useState(false)

  // Modals & Popovers
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [activeMessageForReaction, setActiveMessageForReaction] = useState<string | null>(null)
  const [showPinnedModal, setShowPinnedModal] = useState(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatChannelRef = useRef<any>(null)
  const isFirstLoadRef = useRef(true)
  const userRef = useRef(user)

  useEffect(() => {
    userRef.current = user
  }, [user])

  // Initialisation immédiate des réactions depuis le cache localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_REACTIONS)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed && typeof parsed === 'object') {
          setReactionsMap(parsed)
        }
      }
    } catch (e) {
      console.warn('Erreur lecture cache réactions:', e)
    }
  }, [])

  // Auto-scroll to bottom helper
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
    }
  }, [])

  // 1. Charger STRICTEMENT les vrais membres depuis Supabase
  const loadOnlineMembers = useCallback(async () => {
    setLoadingMembers(true)
    try {
      const { data: profiles, error } = await supabase
        .from('user_public_profiles')
        .select('id, full_name, username, avatar_url, bio')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Erreur chargement membres:', error)
        return
      }

      const currentUser = userRef.current
      const membersList: OnlineMember[] = []

      // 1. Ajouter l'utilisateur connecté en tête s'il est identifié
      if (currentUser) {
        membersList.push({
          id: currentUser.id,
          full_name: (currentUser as any).full_name || (currentUser as any).user_metadata?.full_name || 'Vous',
          username: (currentUser as any).username || (currentUser as any).user_metadata?.username || null,
          avatar_url: (currentUser as any).avatar_url || (currentUser as any).user_metadata?.avatar_url || null,
          role: 'Vous',
          roleColor: '#38BDF8',
          isCurrentUser: true
        })
      }

      // 2. Ajouter tous les autres profils réels trouvés en base
      if (profiles && profiles.length > 0) {
        profiles.forEach((p) => {
          if (currentUser && p.id === currentUser.id) return
          const roleLabel = p.bio ? (p.bio.length > 25 ? p.bio.slice(0, 25) + '...' : p.bio) : 'Créateur'
          membersList.push({
            id: p.id,
            full_name: p.full_name || (p.username ? `@${p.username}` : 'Membre CM Studio'),
            username: p.username || null,
            avatar_url: p.avatar_url || null,
            role: roleLabel,
            roleColor: getRoleColor(roleLabel),
            isCurrentUser: false
          })
        })
      }

      setOnlineMembers(membersList)
    } catch (err) {
      console.error('Erreur inattendue chargement membres:', err)
    } finally {
      setLoadingMembers(false)
    }
  }, [supabase])

  // 2. Charger les réactions persistées depuis Supabase
  const fetchReactions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('community_chat_reactions')
        .select('message_id, user_id, emoji')

      if (error) {
        // Si la table n'est pas encore migrée, on conserve le cache localStorage
        return
      }

      if (data) {
        const grouped: Record<string, Record<string, string[]>> = {}
        data.forEach((row: any) => {
          if (!grouped[row.message_id]) grouped[row.message_id] = {}
          if (!grouped[row.message_id][row.emoji]) grouped[row.message_id][row.emoji] = []
          if (!grouped[row.message_id][row.emoji].includes(row.user_id)) {
            grouped[row.message_id][row.emoji].push(row.user_id)
          }
        })

        setReactionsMap(prev => {
          const merged = { ...prev, ...grouped }
          try {
            localStorage.setItem(STORAGE_KEY_REACTIONS, JSON.stringify(merged))
          } catch {}
          return merged
        })
      }
    } catch (err) {
      console.warn('Erreur chargement réactions:', err)
    }
  }, [supabase])

  // 3. Récupérer les messages réels
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
      fetchReactions()
    }
  }, [supabase, toast, scrollToBottom, fetchReactions])

  // 4. Charger plus de messages anciens
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

  // 5. Souscription Realtime (Messages + Réactions)
  useEffect(() => {
    fetchMessages()
    loadOnlineMembers()

    const chatChannel = supabase.channel('community-general-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'community_chat_messages'
      }, async (payload) => {
        const newMsgRaw = payload.new as any

        let senderData: any = null
        const currentUser = userRef.current
        if (currentUser && newMsgRaw.user_id === currentUser.id) {
          senderData = {
            id: currentUser.id,
            full_name: (currentUser as any).full_name || (currentUser as any).user_metadata?.full_name || 'Vous',
            username: (currentUser as any).username || (currentUser as any).user_metadata?.username || null,
            avatar_url: (currentUser as any).avatar_url || (currentUser as any).user_metadata?.avatar_url || null,
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
      // Écoute des réactions en broadcast direct
      .on('broadcast', { event: 'reaction_toggle' }, (eventPayload) => {
        const { messageId, userId, emoji, added } = eventPayload.payload || {}
        if (!messageId || !userId || !emoji) return

        setReactionsMap(prev => {
          const msgMap = { ...(prev[messageId] || {}) }
          const userList = [...(msgMap[emoji] || [])]
          const idx = userList.indexOf(userId)

          if (added && idx === -1) {
            userList.push(userId)
            msgMap[emoji] = userList
          } else if (!added && idx > -1) {
            userList.splice(idx, 1)
            if (userList.length === 0) {
              delete msgMap[emoji]
            } else {
              msgMap[emoji] = userList
            }
          }

          const next = { ...prev, [messageId]: msgMap }
          try {
            localStorage.setItem(STORAGE_KEY_REACTIONS, JSON.stringify(next))
          } catch {}
          return next
        })
      })
      // Écoute des changements Postgres sur les réactions si la table est migrée
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'community_chat_reactions'
      }, () => {
        fetchReactions()
      })
      .subscribe()

    chatChannelRef.current = chatChannel

    return () => {
      supabase.removeChannel(chatChannel)
    }
  }, [supabase, fetchMessages, loadOnlineMembers, fetchReactions, scrollToBottom])

  // 6. Envoyer un message réel
  const handleSendMessage = async (e?: React.FormEvent, customAttachmentUrl?: string) => {
    if (e) e.preventDefault()
    const content = inputText.trim()
    if ((!content && !customAttachmentUrl) || !user || sending) return

    setSending(true)
    setInputText('')

    try {
      const { data, error } = await supabase
        .from('community_chat_messages')
        .insert({
          user_id: user.id,
          content: content || 'Pièce jointe',
          attachment_url: customAttachmentUrl || null
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
        setInputText(content)
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
      setShowEmojiPicker(false)
    }
  }

  // 7. Supprimer un message (auteur uniquement)
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

  // 8. Copier le contenu d'un message
  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(msgId)
    toast('Message copié dans le presse-papier', 'info')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // 9. Toggle réaction emoji (Persistance Supabase + LocalStorage + Broadcast)
  const handleToggleReaction = async (msgId: string, emoji: string) => {
    if (!user) {
      toast('Connectez-vous pour réagir', 'info')
      return
    }

    const currentMsgReactions = reactionsMap[msgId] || {}
    const currentUsers = currentMsgReactions[emoji] || []
    const isAlreadyReacted = currentUsers.includes(user.id)
    const nextAdded = !isAlreadyReacted

    // 1. Mise à jour optimiste immédiate dans React State & LocalStorage
    setReactionsMap(prev => {
      const msgMap = { ...(prev[msgId] || {}) }
      const userList = [...(msgMap[emoji] || [])]
      const idx = userList.indexOf(user.id)

      if (idx > -1) {
        userList.splice(idx, 1)
        if (userList.length === 0) {
          delete msgMap[emoji]
        } else {
          msgMap[emoji] = userList
        }
      } else {
        userList.push(user.id)
        msgMap[emoji] = userList
      }

      const nextState = { ...prev, [msgId]: msgMap }
      try {
        localStorage.setItem(STORAGE_KEY_REACTIONS, JSON.stringify(nextState))
      } catch {}
      return nextState
    })

    setActiveMessageForReaction(null)

    // 2. Diffusion Realtime Broadcast aux autres membres connectés
    try {
      chatChannelRef.current?.send({
        type: 'broadcast',
        event: 'reaction_toggle',
        payload: {
          messageId: msgId,
          userId: user.id,
          emoji,
          added: nextAdded
        }
      })
    } catch (e) {
      console.warn('Erreur broadcast réaction:', e)
    }

    // 3. Persistance dans la base Supabase
    try {
      if (isAlreadyReacted) {
        await supabase
          .from('community_chat_reactions')
          .delete()
          .match({ message_id: msgId, user_id: user.id, emoji })
      } else {
        await supabase
          .from('community_chat_reactions')
          .insert({ message_id: msgId, user_id: user.id, emoji })
      }
    } catch (err) {
      console.warn('Info: synchronisation DB réaction (table locale active):', err)
    }
  }

  // 10. Insertion d'émoji dans la barre de saisie
  const handleInsertEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // 11. Envoi d'une image/fichier réel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `chat_attachments/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        console.warn('Upload bucket fallback URL:', uploadError)
        const localUrl = URL.createObjectURL(file)
        await handleSendMessage(undefined, localUrl)
      } else {
        const { data: publicData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        if (publicData?.publicUrl) {
          await handleSendMessage(undefined, publicData.publicUrl)
        }
      }
    } catch (err) {
      console.error('Erreur upload:', err)
      toast('Erreur lors de l\'envoi du fichier', 'error')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex-1 w-full h-full flex flex-row gap-3 overflow-hidden select-none min-h-0">
      
      {/* ══════════════════════════════════════════════════════════════
          COLONNE GAUCHE / PRINCIPALE : LE SALON DE CHAT
      ══════════════════════════════════════════════════════════════ */}
      <div className={`flex-1 flex flex-col h-full rounded-xl border overflow-hidden transition-colors min-w-0 ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/90 shadow-card-subtle'
      }`}>
        
        {/* ── EN-TÊTE DU SALON GÉNERAL ── */}
        <div className={`px-3 sm:px-4 py-2.5 sm:py-3 border-b flex items-center justify-between shrink-0 transition-colors z-10 ${
          darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          {/* Titre & Statut */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={`text-[16px] sm:text-[17px] font-extrabold ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>#</span>
                <h1 className={`text-[14.5px] sm:text-[15.5px] font-extrabold tracking-tight truncate ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                  Général
                </h1>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] sm:text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden xs:inline">En direct</span>
                </span>
              </div>
              <p className={`text-[11.5px] truncate mt-0.5 hidden sm:block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Le salon public des créateurs et community managers de CM Studio.
              </p>
            </div>
          </div>

          {/* Actions d'en-tête */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Épingles */}
            <button
              onClick={() => setShowPinnedModal(!showPinnedModal)}
              className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer ${
                showPinnedModal
                  ? darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                  : darkMode ? 'bg-[#0F172A] border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Messages et règles épinglés"
            >
              <Pin size={15} />
            </button>

            {/* Toggle Membres connectés (Mobile: ouvre le Bottom Sheet, Desktop: toggle sidebar) */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  setShowMobileMembersDrawer(true)
                } else {
                  setShowMembersSidebar(!showMembersSidebar)
                }
              }}
              className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer relative ${
                (showMembersSidebar || showMobileMembersDrawer)
                  ? darkMode ? 'bg-[#0F172A] border-slate-700/80 text-[#38BDF8]' : 'bg-blue-50 border-blue-200 text-[#1677FF]'
                  : darkMode ? 'bg-[#0F172A] border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Membres en ligne"
            >
              <Users size={15} />
              {/* Badge compteur discret sur mobile */}
              <span className="md:hidden absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9.5px] font-black flex items-center justify-center">
                {onlineMembers.length}
              </span>
            </button>

            {/* Options */}
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer ${
                darkMode ? 'bg-[#0F172A] border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Options du salon"
            >
              <MoreHorizontal size={15} />
            </button>

            {/* Bouton Actualiser Bleu */}
            <button
              onClick={() => {
                fetchMessages()
                loadOnlineMembers()
              }}
              disabled={loading}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[#1677FF] hover:bg-[#1266DF] text-white font-bold text-[12.5px] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border-none ml-0.5 sm:ml-1 active:scale-95"
              title="Rafraîchir les messages"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>

        {/* ── POP-IN OPTIONS DU SALON ── */}
        {showOptionsMenu && (
          <div className={`p-3 border-b flex flex-col gap-2 text-[12px] animate-fadeIn transition-colors ${
            darkMode ? 'bg-[#0F172A] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[12.5px]">Options du salon Général</span>
              <button
                onClick={() => setShowOptionsMenu(false)}
                className="text-slate-400 hover:text-slate-200 p-0.5 border-none bg-transparent cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast('Lien du salon copié dans le presse-papiers', 'success')
                  setShowOptionsMenu(false)
                }}
                className={`px-3 py-1.5 rounded-lg border text-[11.5px] font-semibold cursor-pointer ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                📋 Copier le lien du salon
              </button>
              <Link
                href="/community/membres"
                onClick={() => setShowOptionsMenu(false)}
                className={`px-3 py-1.5 rounded-lg border text-[11.5px] font-semibold no-underline ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                👥 Annuaire des membres
              </Link>
            </div>
          </div>
        )}

        {/* ── MODAL MESSAGES ÉPINGLÉS (Pop-in) ── */}
        {showPinnedModal && (
          <div className={`p-3 border-b flex items-start justify-between gap-3 text-[12px] animate-fadeIn transition-colors ${
            darkMode ? 'bg-[#0F172A] border-slate-700 text-slate-300' : 'bg-blue-50/70 border-blue-100 text-slate-700'
          }`}>
            <div className="flex items-start gap-2.5">
              <Pin size={15} className="text-[#1677FF] dark:text-[#38BDF8] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[12.5px] block text-inherit">📌 Règles de la Communauté CM Studio :</span>
                <span className="text-[11.5px] opacity-90 block mt-0.5">
                  Échangez librement sur vos pratiques de Community Management, vos créations de contenus et collaborez en toute convivialité !
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowPinnedModal(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer border-none bg-transparent"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── ZONE DE FLUX DES MESSAGES (Stream Discord/Slack style) ── */}
        <div
          ref={chatContainerRef}
          className={`flex-1 overflow-y-auto p-4 flex flex-col gap-4 transition-colors ${
            darkMode ? 'bg-[#0F172A]/70' : 'bg-slate-50/50'
          }`}
        >
          {/* Charger les messages précédents */}
          {hasMore && messages.length >= 50 && (
            <div className="flex justify-center my-1">
              <button
                onClick={fetchOlderMessages}
                disabled={loadingOlder}
                className={`px-3 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  darkMode ? 'bg-[#1E293B] border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ChevronUp size={12} className={loadingOlder ? 'animate-spin' : ''} />
                <span>{loadingOlder ? 'Chargement...' : 'Afficher les messages plus anciens'}</span>
              </button>
            </div>
          )}

          {/* Skeleton de chargement */}
          {loading ? (
            <div className="flex flex-col gap-4 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-start animate-pulse">
                  <div className={`w-9 h-9 rounded-full shrink-0 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  <div className="flex flex-col gap-2 flex-1 max-w-[400px]">
                    <div className={`w-28 h-3.5 rounded ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    <div className={`w-full h-5 rounded ${darkMode ? 'bg-slate-800/60' : 'bg-slate-200/60'}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            /* État vide */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 gap-2">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                darkMode ? 'bg-[#1E293B] text-[#38BDF8]' : 'bg-blue-50 text-[#1677FF]'
              }`}>
                <MessageSquare size={24} />
              </div>
              <h3 className={`text-[14px] font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Aucun message pour l'instant
              </h3>
              <p className="text-[12px] max-w-[320px] text-slate-400">
                Soyez le premier à engager la conversation dans le salon général !
              </p>
            </div>
          ) : (
            /* Liste des messages réels dans le style Discord */
            messages.map((msg) => {
              const isMe = user?.id === msg.user_id
              const senderName = msg.sender?.full_name || (msg.sender?.username ? `@${msg.sender.username}` : 'Membre CM Studio')
              const avatarUrl = msg.sender?.avatar_url || null
              const msgReactions = reactionsMap[msg.id] || {}

              return (
                <div
                  key={msg.id}
                  className={`group relative flex items-start gap-3 p-1.5 -mx-1.5 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100/60'
                  }`}
                >
                  {/* Avatar avec pastille En Ligne */}
                  <div className="relative shrink-0 mt-0.5">
                    <UserAvatar
                      avatarUrl={avatarUrl}
                      size={36}
                      className="ring-1 ring-slate-700/50"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0F172A]" />
                  </div>

                  {/* Corps du message */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    {/* En-tête : Nom + Badge Vous + Date/Heure */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[13.5px] font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                        {senderName}
                      </span>
                      {isMe && (
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                          darkMode ? 'bg-blue-500/15 text-[#38BDF8] border border-blue-500/30' : 'bg-blue-50 text-[#1677FF] border border-blue-200'
                        }`}>
                          Vous
                        </span>
                      )}
                      <span className={`text-[11.5px] ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        {formatChatTime(msg.created_at)}
                      </span>
                    </div>

                    {/* Contenu textuel */}
                    <div className={`text-[13px] leading-relaxed mt-1 break-words whitespace-pre-wrap ${
                      darkMode ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      {msg.content}
                    </div>

                    {/* Pièce jointe / image si présente */}
                    {msg.attachment_url && (
                      <div className="mt-2 max-w-[320px] rounded-lg overflow-hidden border border-slate-700">
                        <img
                          src={msg.attachment_url}
                          alt="Pièce jointe"
                          className="w-full h-auto max-h-[240px] object-cover"
                        />
                      </div>
                    )}

                    {/* Rangée de Réactions emojis persistées */}
                    <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                      {/* Réactions existantes */}
                      {Object.entries(msgReactions).map(([emoji, usersList]) => {
                        const hasReacted = user ? usersList.includes(user.id) : false
                        const count = usersList.length
                        if (count === 0) return null

                        return (
                          <button
                            key={emoji}
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11.5px] font-bold border transition-all cursor-pointer ${
                              hasReacted
                                ? darkMode
                                  ? 'bg-blue-500/20 border-[#38BDF8]/40 text-[#38BDF8]'
                                  : 'bg-blue-50 border-blue-300 text-[#1677FF]'
                                : darkMode
                                  ? 'bg-[#1E293B] border-slate-700 text-slate-300 hover:bg-slate-750'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[10.5px]">{count}</span>
                          </button>
                        )
                      })}

                      {/* Bouton rapide d'ajout de réaction */}
                      <button
                        onClick={() => setActiveMessageForReaction(activeMessageForReaction === msg.id ? null : msg.id)}
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md border text-[11px] transition-colors cursor-pointer ${
                          darkMode
                            ? 'bg-[#1E293B]/60 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title="Ajouter une réaction"
                      >
                        <Smile size={13} />
                      </button>
                    </div>

                    {/* Popover rapide de sélection de réaction */}
                    {activeMessageForReaction === msg.id && (
                      <div className={`flex items-center gap-1 p-1.5 mt-2 rounded-lg border shadow-lg z-20 w-max ${
                        darkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'
                      }`}>
                        {POPULAR_EMOJIS.slice(0, 7).map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-700/30 text-[14px] cursor-pointer border-none bg-transparent"
                          >
                            {emoji}
                          </button>
                        ))}
                        <button
                          onClick={() => setActiveMessageForReaction(null)}
                          className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 ml-1 border-none bg-transparent cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ── BARRE D'ACTIONS RAPIDES AU SURVOL ── */}
                  <div className={`absolute right-2 top-2 hidden group-hover:flex items-center gap-1 p-1 rounded-lg border shadow-md z-10 transition-all ${
                    darkMode ? 'bg-[#1E293B] border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    {/* Réactions express */}
                    {['👏', '❤️', '👍'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleToggleReaction(msg.id, emoji)}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700/30 text-[12px] cursor-pointer border-none bg-transparent"
                        title={`Réagir avec ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}

                    <div className="w-[1px] h-3.5 bg-slate-700/50 mx-0.5" />

                    {/* Copier le message */}
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="p-1 rounded hover:bg-slate-700/30 text-slate-400 hover:text-slate-200 cursor-pointer border-none bg-transparent"
                      title="Copier le texte"
                    >
                      {copiedId === msg.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>

                    {/* Supprimer si auteur */}
                    {isMe && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        disabled={deletingId === msg.id}
                        className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 cursor-pointer border-none bg-transparent"
                        title="Supprimer mon message"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── BARRE DE SAISIE INFÉRIEURE AVEC +, EMOJI ET ENVOYER ── */}
        <div className={`p-3 border-t flex flex-col gap-2 relative transition-colors ${
          darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          
          {/* Popover Sélecteur d'Émojis */}
          {showEmojiPicker && (
            <div className={`absolute bottom-[60px] left-3 p-3 rounded-xl border shadow-xl z-30 w-[280px] sm:w-[320px] ${
              darkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
                <span className="text-[12px] font-bold">Émojis & Réactions</span>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-slate-400 hover:text-white p-0.5 border-none bg-transparent cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1.5 max-h-[160px] overflow-y-auto p-1">
                {POPULAR_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleInsertEmoji(emoji)}
                    className="w-8 h-8 flex items-center justify-center text-[18px] rounded-lg hover:bg-slate-700/40 border-none bg-transparent cursor-pointer transition-transform hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input file caché pour les pièces jointes réelles */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            {/* Bouton '+' Fichiers réels */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                darkMode ? 'bg-[#0F172A] border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Ajouter un fichier ou une image"
            >
              <Plus size={16} />
            </button>

            {/* Champ de texte de saisie */}
            <div className={`flex-1 flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all ${
              darkMode ? 'bg-[#0F172A] border-slate-700 focus-within:border-[#38BDF8]' : 'bg-slate-50 border-slate-200 focus-within:border-[#1677FF]'
            }`}>
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                disabled={!user || sending}
                onChange={e => setInputText(e.target.value)}
                placeholder={user ? "Écrivez un message public..." : "Connectez-vous pour participer au chat"}
                className={`w-full text-[13px] bg-transparent outline-none ${
                  darkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                }`}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />

              {/* Bouton Émoji 😊 */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`text-slate-400 hover:text-slate-200 p-1 border-none bg-transparent cursor-pointer shrink-0 transition-colors ${
                  showEmojiPicker ? 'text-[#38BDF8]' : ''
                }`}
                title="Insérer un émoji"
              >
                <Smile size={16} />
              </button>
            </div>

            {/* Bouton Envoyer Bleu */}
            <button
              type="submit"
              disabled={!user || !inputText.trim() || sending}
              className={`h-9 px-4 rounded-xl font-bold text-[12.5px] flex items-center gap-1.5 transition-all border-none shrink-0 ${
                inputText.trim() && !sending
                  ? 'bg-[#1677FF] hover:bg-[#1266DF] text-white shadow-blue-glow cursor-pointer active:scale-95'
                  : darkMode ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send size={13} className={sending ? 'animate-pulse' : ''} />
              <span className="hidden sm:inline">{sending ? 'Envoi...' : 'Envoyer'}</span>
            </button>
          </form>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════
          COLONNE DROITE : VRAIS MEMBRES CONNECTÉS (DESKTOP SEULEMENT)
      ══════════════════════════════════════════════════════════════ */}
      {showMembersSidebar && (
        <aside className={`hidden md:flex w-[240px] xl:w-[260px] shrink-0 h-full rounded-xl border flex-col overflow-hidden transition-all select-none ${
          darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/90 shadow-card-subtle'
        }`}>
          {/* En-tête En Ligne */}
          <div className={`px-3.5 py-3 border-b flex items-center justify-between shrink-0 ${
            darkMode ? 'border-slate-800/80' : 'border-slate-100'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className={`text-[11.5px] font-extrabold tracking-wider uppercase ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                En Ligne — {onlineMembers.length}
              </h2>
            </div>
            <Link
              href="/community/membres"
              className="text-[11px] font-bold text-[#1677FF] dark:text-[#38BDF8] hover:underline no-underline"
              title="Voir tous les membres"
            >
              Voir tous
            </Link>
          </div>

          {/* Liste des vrais membres de Supabase */}
          <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5 no-scrollbar">
            {loadingMembers ? (
              <div className="text-center py-6 text-slate-400 text-[11.5px]">
                Chargement des membres...
              </div>
            ) : onlineMembers.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-[11.5px]">
                Aucun membre connecté
              </div>
            ) : (
              onlineMembers.map((member) => {
                const isCurrent = member.isCurrentUser
                const profileLink = `/profile/${member.username || member.id}`

                return (
                  <Link
                    key={member.id}
                    href={profileLink}
                    className={`flex items-center gap-2.5 p-2 rounded-xl transition-colors no-underline group cursor-pointer ${
                      darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Avatar avec pastille verte */}
                    <div className="relative shrink-0">
                      <UserAvatar
                        avatarUrl={member.avatar_url}
                        size={32}
                        className="ring-1 ring-slate-700/40"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#1E293B]" />
                    </div>

                    {/* Nom & Rôle réel */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className={`text-[12.5px] font-bold truncate leading-tight group-hover:text-[#1677FF] dark:group-hover:text-[#38BDF8] transition-colors ${
                        darkMode ? 'text-white' : 'text-[#0F172A]'
                      }`}>
                        {member.full_name}
                      </span>

                      {/* Sous-titre Rôle */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isCurrent ? (
                          <span className="text-[11px] font-bold text-[#38BDF8] dark:text-[#38BDF8]">
                            Vous
                          </span>
                        ) : (
                          <>
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: member.roleColor }}
                            />
                            <span className={`text-[11px] font-medium truncate ${
                              darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              {member.role}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>

          {/* Pied de panneau discret */}
          <div className={`p-2.5 border-t text-[10.5px] text-center text-slate-400 shrink-0 ${
            darkMode ? 'border-slate-800/80' : 'border-slate-100'
          }`}>
            <span>🟢 Salon interactif en temps réel</span>
          </div>
        </aside>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL / BOTTOM SHEET MEMBRES CONNECTÉS SUR MOBILE
      ══════════════════════════════════════════════════════════════ */}
      {showMobileMembersDrawer && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
          {/* Clic en dehors pour fermer */}
          <div className="flex-1 w-full" onClick={() => setShowMobileMembersDrawer(false)} />

          {/* Tiroir coulissant (Bottom Sheet) */}
          <div className={`w-full max-h-[75vh] rounded-t-2xl border-t p-4 flex flex-col shadow-2xl transition-colors ${
            darkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Header Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-[13px] font-extrabold uppercase tracking-wider">
                  En Ligne — {onlineMembers.length}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/community/membres"
                  onClick={() => setShowMobileMembersDrawer(false)}
                  className="text-[12px] font-bold text-[#1677FF] dark:text-[#38BDF8] hover:underline no-underline"
                >
                  Voir tous
                </Link>
                <button
                  onClick={() => setShowMobileMembersDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white border-none bg-transparent cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Liste scrollable des membres sur mobile */}
            <div className="flex-1 overflow-y-auto py-2.5 flex flex-col gap-1.5 no-scrollbar">
              {onlineMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/profile/${member.username || member.id}`}
                  onClick={() => setShowMobileMembersDrawer(false)}
                  className={`flex items-center gap-3 p-2 rounded-xl transition-colors no-underline ${
                    darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <UserAvatar avatarUrl={member.avatar_url} size={36} />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#1E293B]" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={`text-[13px] font-bold truncate ${
                      darkMode ? 'text-white' : 'text-[#0F172A]'
                    }`}>
                      {member.full_name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {member.isCurrentUser ? (
                        <span className="text-[11px] font-bold text-[#38BDF8]">Vous</span>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: member.roleColor }} />
                          <span className={`text-[11px] font-medium truncate ${
                            darkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            {member.role}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

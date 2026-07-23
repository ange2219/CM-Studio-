'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Send, Paperclip, MoreVertical, Check, CheckCheck, Image as ImageIcon, Smile, X } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import Link from 'next/link';

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface MessageItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  created_at: string;
  sender?: UserProfile;
  message_reads?: { user_id: string }[];
}

interface ConversationItem {
  id: string; // conversation_id
  otherUser: UserProfile;
  lastMessage: string;
  updated_at: string;
  unreadCount: number;
  isMutualOnly?: boolean;
}

export default function MessagesPage({ darkMode: propDarkMode }: { darkMode?: boolean }) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const { user } = useUser();
  const supabase = createClient();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const activeConvIdRef = useRef<string | null>(null);
  useEffect(() => { activeConvIdRef.current = activeConvId; }, [activeConvId]);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── 1. Load active conversations & mutual follow contacts ──────────────────
  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Step A: Fetch existing conversations from vw_conversations_list
      const { data: convsData } = await supabase.from('vw_conversations_list').select('*');
      const myConvs = (convsData || []).filter((c: any) => c.my_user_id === user.id);

      const activeConvsList: ConversationItem[] = [];
      const existingUserIds = new Set<string>();

      for (const c of myConvs) {
        if (!c.other_user_id || !c.last_message_created_at) continue;

        existingUserIds.add(c.other_user_id);

        const otherUser: UserProfile = {
          id: c.other_user_id,
          full_name: c.other_full_name || 'Membre CM Studio',
          username: c.other_username || null,
          avatar_url: c.other_avatar_url || null,
        };

        // Calculate unread count
        const { data: unreadData } = await supabase
          .from('messages')
          .select('id, message_reads!left(user_id)')
          .eq('conversation_id', c.conversation_id)
          .neq('sender_id', user.id);

        const unreadCount = unreadData?.filter((m: any) => {
          const reads = m.message_reads || [];
          return !reads.some((r: any) => r.user_id === user.id);
        }).length || 0;

        activeConvsList.push({
          id: c.conversation_id,
          otherUser,
          lastMessage: c.last_message_content || 'Pièce jointe',
          updated_at: c.last_message_created_at || c.updated_at || new Date().toISOString(),
          unreadCount,
          isMutualOnly: false,
        });
      }

      // Sort active conversations by last message timestamp (most recent first)
      activeConvsList.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      // Step B: Fetch Mutual Follow Users ("I follow B AND B follows me")
      const { data: myFollowings } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = myFollowings?.map(f => f.following_id) || [];

      let mutualUserIds: string[] = [];
      if (followingIds.length > 0) {
        const { data: mutualsData } = await supabase
          .from('user_follows')
          .select('follower_id')
          .eq('following_id', user.id)
          .in('follower_id', followingIds);

        if (mutualsData) {
          mutualUserIds = mutualsData.map(m => m.follower_id);
        }
      }

      // Filter out users who ALREADY have an active conversation
      const newMutualUserIds = mutualUserIds.filter(id => !existingUserIds.has(id));

      const mutualContactsList: ConversationItem[] = [];
      if (newMutualUserIds.length > 0) {
        const { data: mutualProfiles } = await supabase
          .from('user_public_profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', newMutualUserIds);

        if (mutualProfiles) {
          mutualProfiles.forEach(p => {
            mutualContactsList.push({
              id: `mutual-${p.id}`,
              otherUser: {
                id: p.id,
                full_name: p.full_name || 'Membre CM Studio',
                username: p.username || null,
                avatar_url: p.avatar_url || null,
              },
              lastMessage: 'Démarrez une discussion',
              updated_at: new Date(0).toISOString(),
              unreadCount: 0,
              isMutualOnly: true,
            });
          });
        }
      }

      const combined = [...activeConvsList, ...mutualContactsList];
      setConversations(combined);

      // Default active conversation selection
      if (!activeConvIdRef.current && combined.length > 0) {
        setActiveConvId(combined[0].id);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) loadConversations();
  }, [user, loadConversations]);

  // ── 2. Global Realtime subscription to refresh left list on new messages ───
  useEffect(() => {
    if (!user) return;
    const globalChannel = supabase.channel('global-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        loadConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(globalChannel); };
  }, [user, supabase, loadConversations]);

  // ── 3. Load messages & read receipts for active conversation ──────────────
  const loadMessages = useCallback(async (convId: string) => {
    if (!user || convId.startsWith('mutual-')) {
      setMessages([]);
      return;
    }

    try {
      const { data } = await supabase
        .from('messages')
        .select('*, sender:user_public_profiles!sender_id(id, full_name, username, avatar_url), message_reads(user_id)')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data as MessageItem[]);

        // Mark unread messages sent by other user as read
        const unreadIds = data
          .filter(m => m.sender_id !== user.id)
          .filter(m => !(m.message_reads || []).some((r: any) => r.user_id === user.id))
          .map(m => m.id);

        if (unreadIds.length > 0) {
          await supabase
            .from('message_reads')
            .upsert(unreadIds.map(id => ({ message_id: id, user_id: user.id })), { onConflict: 'message_id,user_id' });
          
          setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des messages:', err);
    }
  }, [user, supabase]);

  // ── 4. Active conversation Realtime subscription ───────────────────────────
  useEffect(() => {
    if (!activeConvId || !user || activeConvId.startsWith('mutual-')) return;
    loadMessages(activeConvId);

    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    realtimeChannelRef.current = supabase.channel(`msgs:${activeConvId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConvId}` }, async payload => {
        const newMsg = payload.new as MessageItem;
        
        let localSender = user as any;
        if (newMsg.sender_id !== user.id) {
          const currentConv = conversations.find(c => c.id === activeConvId);
          if (currentConv && currentConv.otherUser.id === newMsg.sender_id) {
            localSender = currentConv.otherUser;
          } else {
            const { data } = await supabase
              .from('user_public_profiles')
              .select('id, full_name, username, avatar_url')
              .eq('id', newMsg.sender_id)
              .single();
            if (data) localSender = data;
          }
        }

        setMessages(prev => [...prev, { ...newMsg, sender: localSender, message_reads: [] }]);

        if (newMsg.sender_id !== user.id) {
          await supabase.from('message_reads').upsert({ message_id: newMsg.id, user_id: user.id }, { onConflict: 'message_id,user_id' });
        }
        loadConversations();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_reads' }, () => {
        loadMessages(activeConvId);
      })
      .subscribe();

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [activeConvId, user, supabase, loadMessages, loadConversations, conversations]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── 5. Select a conversation / contact ──────────────────────────────────────
  const handleSelectConversation = async (convItem: ConversationItem) => {
    if (convItem.isMutualOnly || convItem.id.startsWith('mutual-')) {
      // Find or create RPC DM conversation
      const { data: convId, error } = await supabase.rpc('find_or_create_dm', { other_user_id: convItem.otherUser.id });
      if (error || !convId) {
        console.error('Erreur find_or_create_dm:', error);
        return;
      }
      const updatedItem: ConversationItem = {
        ...convItem,
        id: convId,
        isMutualOnly: false,
      };
      setConversations(prev => prev.map(c => c.id === convItem.id ? updatedItem : c));
      setActiveConvId(convId);
    } else {
      setActiveConvId(convItem.id);
    }
  };

  // ── 6. Live User Search (/api/messages/users/search) ────────────────────────
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/messages/users/search?q=${encodeURIComponent(searchTerm.trim())}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setSearchResults(data);
        }
      } catch (err) {
        console.error('Erreur recherche utilisateurs:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleStartSearchUserDM = async (targetUser: UserProfile) => {
    setSearchTerm('');
    setSearchResults([]);

    const { data: convId, error } = await supabase.rpc('find_or_create_dm', { other_user_id: targetUser.id });
    if (error || !convId) {
      console.error('Erreur find_or_create_dm:', error);
      return;
    }

    const newConvItem: ConversationItem = {
      id: convId,
      otherUser: targetUser,
      lastMessage: 'Démarrez une discussion',
      updated_at: new Date().toISOString(),
      unreadCount: 0,
      isMutualOnly: false,
    };

    setConversations(prev => {
      const exists = prev.find(c => c.id === convId || c.otherUser.id === targetUser.id);
      if (exists) {
        return prev.map(c => (c.id === exists.id ? { ...newConvItem, id: convId } : c));
      }
      return [newConvItem, ...prev];
    });

    setActiveConvId(convId);
  };

  // ── 7. Send Message ────────────────────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !activeConvId || sending) return;

    setSending(true);
    const msgText = inputText.trim();
    setInputText('');

    try {
      let realConvId = activeConvId;
      const currentConv = conversations.find(c => c.id === activeConvId);

      if (activeConvId.startsWith('mutual-') && currentConv) {
        const { data: newId, error } = await supabase.rpc('find_or_create_dm', { other_user_id: currentConv.otherUser.id });
        if (error || !newId) throw error || new Error('Impossible de créer la discussion');
        realConvId = newId;
        setActiveConvId(newId);
      }

      // Optimistic message add
      const tempMsg: MessageItem = {
        id: `temp-${Date.now()}`,
        conversation_id: realConvId,
        sender_id: user.id,
        content: msgText,
        created_at: new Date().toISOString(),
        sender: {
          id: user.id,
          full_name: user.full_name || 'Moi',
          username: user.username || null,
          avatar_url: user.avatar_url || null,
        },
      };

      setMessages(prev => [...prev, tempMsg]);

      const { error: insertErr } = await supabase.from('messages').insert({
        conversation_id: realConvId,
        sender_id: user.id,
        content: msgText,
      });

      if (insertErr) {
        console.error('Erreur lors de l\'envoi du message:', insertErr);
      } else {
        loadConversations();
      }
    } catch (err) {
      console.error('Erreur envoi message:', err);
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId);

  return (
    <div className={`flex-1 h-[calc(100vh-96px)] flex rounded-2xl overflow-hidden border shadow-card-subtle transition-colors duration-300 select-none ${
      darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
    }`}>
      
      {/* ── Left Column: Conversations & Mutual Follow Contacts ── */}
      <div className={`w-full md:w-[320px] lg:w-[350px] shrink-0 border-r flex flex-col ${
        darkMode ? 'border-slate-800 bg-[#0F172A]/50' : 'border-slate-100 bg-slate-50/50'
      }`}>
        {/* Header & Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3 relative">
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Messagerie
            </h2>
            <span className="bg-[#1677FF] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {conversations.length} contacts
            </span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
            darkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un membre..."
              className={`w-full text-[13px] bg-transparent outline-none ${
                darkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setSearchResults([]); }}
                className="bg-transparent border-none text-slate-400 cursor-pointer p-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown Overlay */}
          {searchTerm.trim().length >= 2 && (
            <div className={`absolute top-full left-0 right-0 z-30 m-2 mt-1 rounded-xl border shadow-xl max-h-60 overflow-y-auto ${
              darkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'
            }`}>
              {searching ? (
                <div className="p-3 text-[12px] text-slate-400 text-center">Recherche en cours...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-[12px] text-slate-400 text-center">Aucun utilisateur trouvé.</div>
              ) : (
                searchResults.map(u => (
                  <div
                    key={u.id}
                    onClick={() => handleStartSearchUserDM(u)}
                    className={`p-2.5 px-3 flex items-center gap-3 cursor-pointer transition-colors ${
                      darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                    }`}
                  >
                    <UserAvatar avatarUrl={u.avatar_url} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] font-bold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {u.full_name || u.username || 'Membre'}
                      </div>
                      {u.username && (
                        <div className="text-[11px] text-slate-400 truncate">@{u.username}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 flex flex-col gap-1">
          {loading ? (
            <div className="text-[12px] text-slate-400 p-4 text-center">Chargement des conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="text-[12px] text-slate-400 p-4 text-center">Aucun contact ni discussion.</div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                    isActive
                      ? darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm border border-slate-200/80'
                      : darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-white/60'
                  }`}
                >
                  <div className="relative shrink-0">
                    <UserAvatar
                      avatarUrl={conv.otherUser.avatar_url}
                      size={40}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-[13.5px] font-bold truncate ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                        {conv.otherUser.full_name || conv.otherUser.username}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-[#1677FF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className={`text-[12px] truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Column: Chat Stream ── */}
      {activeConv ? (
        <div className="flex-1 flex flex-col h-full bg-transparent">
          
          {/* Active Chat Header */}
          <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
            darkMode ? 'border-slate-800 bg-[#1E293B]' : 'border-slate-100 bg-white'
          }`}>
            <Link
              href={`/profile/${activeConv.otherUser.username || activeConv.otherUser.id}`}
              className="flex items-center gap-3 no-underline group"
            >
              <UserAvatar
                avatarUrl={activeConv.otherUser.avatar_url}
                size={36}
                className="group-hover:opacity-90 transition-opacity"
              />
              <div>
                <h3 className={`text-[14px] font-bold leading-tight group-hover:underline ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                  {activeConv.otherUser.full_name || activeConv.otherUser.username}
                </h3>
                {activeConv.otherUser.username && (
                  <span className="text-[11px] text-slate-400">
                    @{activeConv.otherUser.username}
                  </span>
                )}
              </div>
            </Link>

            <button className={`p-1.5 rounded-full cursor-pointer transition-colors border-none bg-transparent ${
              darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}>
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Stream Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center text-[13px] text-slate-400">
                Envoyez un premier message à {activeConv.otherUser.full_name || activeConv.otherUser.username} pour démarrer l'échange.
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                const isReadByOther = (msg.message_reads || []).some(r => r.user_id === activeConv.otherUser.id);
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%] ${isMe ? 'ml-auto' : 'mr-auto'}`}
                  >
                    <div className={`p-3 px-4 rounded-2xl text-[13.5px] leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-[#1677FF] text-white rounded-br-none'
                        : darkMode
                          ? 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}>
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10.5px] text-slate-400 px-1">
                      <span>{new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && (
                        isReadByOther ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#1677FF] dark:text-[#38BDF8]" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-slate-400" />
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Chat Input Footer */}
          <form onSubmit={handleSendMessage} className={`p-3 px-4 border-t flex items-center gap-3 shrink-0 ${
            darkMode ? 'border-slate-800 bg-[#1E293B]' : 'border-slate-100 bg-white'
          }`}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Écrire un message..."
              className={`flex-1 text-[13.5px] px-4 py-2.5 rounded-xl outline-none border transition-all ${
                darkMode 
                  ? 'bg-[#0F172A] border-slate-700 text-white placeholder-slate-500 focus:border-[#1677FF]' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#1677FF] focus:bg-white'
              }`}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className={`p-2.5 rounded-xl text-white font-bold flex items-center justify-center transition-all border-none ${
                inputText.trim() && !sending
                  ? 'bg-[#1677FF] hover:bg-[#1266DF] cursor-pointer shadow-blue-glow'
                  : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[13px] text-slate-400">
          Sélectionnez un membre pour démarrer une discussion.
        </div>
      )}
    </div>
  );
}

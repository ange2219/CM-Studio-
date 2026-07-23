'use client'

import React, { useState, useEffect } from 'react';
import { Search, Send, Paperclip, MoreVertical, CheckCheck, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function MessagesPage({ darkMode: propDarkMode }: { darkMode?: boolean }) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const { user } = useUser();
  const supabase = createClient();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Load real profiles and messages from Supabase
  useEffect(() => {
    async function loadRealConversations() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);

      const { data: profiles } = await supabase
        .from('user_public_profiles')
        .select('id, full_name, avatar_url, username')
        .neq('id', user.id)
        .limit(20);

      if (profiles && profiles.length > 0) {
        const realConvs = profiles.map((p, idx) => ({
          id: p.id,
          name: p.full_name || p.username || 'Membre CM Studio',
          avatar: p.avatar_url,
          lastMessage: 'Démarrez une discussion',
          time: '',
          unread: 0,
          online: true,
          messages: []
        }));
        setConversations(realConvs);
        setActiveConvId(realConvs[0].id);
      }
      setLoading(false);
    }
    loadRealConversations();
  }, [supabase, user]);

  const activeConv = conversations.find(c => c.id === activeConvId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !activeConvId) return;

    const msgText = inputText.trim();
    setInputText('');

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConvId) {
        return {
          ...conv,
          lastMessage: msgText,
          time: newMsg.time,
          messages: [...conv.messages, newMsg]
        };
      }
      return conv;
    }));

    await supabase.from('direct_messages').insert({
      sender_id: user.id,
      recipient_id: activeConvId,
      content: msgText,
    });
  };

  const filteredConvs = conversations.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex-1 h-[calc(100vh-96px)] flex rounded-2xl overflow-hidden border shadow-card-subtle transition-colors duration-300 select-none ${
      darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
    }`}>
      
      {/* Left Conversations List Column */}
      <div className={`w-full md:w-[320px] lg:w-[350px] shrink-0 border-r flex flex-col ${
        darkMode ? 'border-slate-800 bg-[#0F172A]/50' : 'border-slate-100 bg-slate-50/50'
      }`}>
        {/* Header & Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Messagerie
            </h2>
            <span className="bg-[#1677FF] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {conversations.length} membres
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
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 flex flex-col gap-1">
          {loading ? (
            <div className="text-[12px] text-slate-400 p-4 text-center">Chargement des membres...</div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-[12px] text-slate-400 p-4 text-center">Aucun membre disponible.</div>
          ) : (
            filteredConvs.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c));
                  }}
                  className={`p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                    isActive
                      ? darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm border border-slate-200/80'
                      : darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-white/60'
                  }`}
                >
                  <div className="relative shrink-0">
                    <UserAvatar
                      avatarUrl={conv.avatar}
                      size={40}
                    />
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1E293B]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-[13.5px] font-bold truncate ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                        {conv.name}
                      </span>
                      <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        {conv.time}
                      </span>
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

      {/* Right Chat Stream Column */}
      {activeConv ? (
        <div className="flex-1 flex flex-col h-full bg-transparent">
          
          {/* Chat Active Header */}
          <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
            darkMode ? 'border-slate-800 bg-[#1E293B]' : 'border-slate-100 bg-white'
          }`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <UserAvatar
                  avatarUrl={activeConv.avatar}
                  size={36}
                />
                {activeConv.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1E293B]" />
                )}
              </div>
              <div>
                <h3 className={`text-[14px] font-bold leading-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                  {activeConv.name}
                </h3>
                <span className={`text-[11px] ${activeConv.online ? 'text-emerald-500 font-semibold' : 'text-slate-400'}`}>
                  {activeConv.online ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>

            <button className={`p-1.5 rounded-full cursor-pointer transition-colors border-none bg-transparent ${
              darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}>
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Stream Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">
            {activeConv.messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center text-[13px] text-slate-400">
                Envoyez un premier message à {activeConv.name} pour démarrer l'échange.
              </div>
            ) : (
              activeConv.messages.map((msg: any) => {
                const isMe = msg.sender === 'me';
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
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10.5px] text-slate-400 px-1">
                      <span>{msg.time}</span>
                      {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#1677FF] dark:text-[#38BDF8]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input Footer */}
          <form onSubmit={handleSendMessage} className={`p-3 px-4 border-t flex items-center gap-3 shrink-0 ${
            darkMode ? 'border-slate-800 bg-[#1E293B]' : 'border-slate-100 bg-white'
          }`}>
            <div className="flex items-center gap-1">
              <button type="button" className={`p-2 rounded-xl transition-colors cursor-pointer border-none bg-transparent ${
                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}>
                <ImageIcon className="w-5 h-5" />
              </button>
              <button type="button" className={`p-2 rounded-xl transition-colors cursor-pointer border-none bg-transparent ${
                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}>
                <Paperclip className="w-5 h-5" />
              </button>
            </div>

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
              disabled={!inputText.trim()}
              className={`p-2.5 rounded-xl text-white font-bold flex items-center justify-center transition-all border-none ${
                inputText.trim()
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

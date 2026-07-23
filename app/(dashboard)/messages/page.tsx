'use client'

import React, { useState } from 'react';
import { Search, Send, Smile, Paperclip, MoreVertical, CheckCheck, Image as ImageIcon } from 'lucide-react';

export default function MessagesPage({ darkMode = false }: { darkMode?: boolean }) {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'Laura Fisher',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      lastMessage: 'Super ! On valide le visuel pour demain ? 🚀',
      time: '14:32',
      unread: 2,
      online: true,
      messages: [
        { id: 1, sender: 'them', text: 'Coucou Alexandra ! J\'ai fini la maquette pour la campagne.', time: '14:28' },
        { id: 2, sender: 'me', text: 'Génial Laura ! Tu peux me partager l\'aperçu ?', time: '14:30' },
        { id: 3, sender: 'them', text: 'Super ! On valide le visuel pour demain ? 🚀', time: '14:32' },
      ]
    },
    {
      id: 2,
      name: 'Sam Brown',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      lastMessage: 'Merci pour le retour sur la publication LinkedIn !',
      time: 'Hier',
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: 'them', text: 'Salut ! As-tu jeté un œil à la métrique de la semaine ?', time: 'Hier 18:10' },
        { id: 2, sender: 'me', text: 'Oui, l\'engagement a augmenté de +18% !', time: 'Hier 18:15' },
        { id: 3, sender: 'them', text: 'Merci pour le retour sur la publication LinkedIn !', time: 'Hier 18:20' }
      ]
    },
    {
      id: 3,
      name: 'Julien Mercier',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      lastMessage: 'Le prochain script IA est disponible sur le studio.',
      time: 'Mar',
      unread: 1,
      online: true,
      messages: [
        { id: 1, sender: 'them', text: 'Le prochain script IA est disponible sur le studio.', time: 'Mardi 10:05' }
      ]
    },
    {
      id: 4,
      name: 'Sophie Martin',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      lastMessage: 'Est-ce qu\'on peut programmer les stories Instagram ?',
      time: '20 Juil',
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: 'them', text: 'Est-ce qu\'on peut programmer les stories Instagram ?', time: '20 Juil 16:40' }
      ]
    }
  ]);

  const [activeConvId, setActiveConvId] = useState(1);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConvId) {
        return {
          ...conv,
          lastMessage: inputText,
          time: newMsg.time,
          messages: [...conv.messages, newMsg]
        };
      }
      return conv;
    }));

    setInputText('');
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
              {conversations.reduce((acc, curr) => acc + curr.unread, 0)} non lus
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
              placeholder="Rechercher une discussion..."
              className={`w-full text-[13px] bg-transparent outline-none ${
                darkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 flex flex-col gap-1">
          {filteredConvs.map((conv) => {
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
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-10 h-10 rounded-full object-cover"
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
                  <p className={`text-[12px] truncate ${
                    conv.unread > 0 
                      ? darkMode ? 'font-bold text-white' : 'font-bold text-slate-900'
                      : darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {conv.lastMessage}
                  </p>
                </div>

                {conv.unread > 0 && (
                  <span className="bg-[#FF3B30] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0">
                    {conv.unread}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Chat Stream Column */}
      <div className="flex-1 flex flex-col h-full bg-transparent">
        
        {/* Chat Active Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          darkMode ? 'border-slate-800 bg-[#1E293B]' : 'border-slate-100 bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={activeConv.avatar}
                alt={activeConv.name}
                className="w-9 h-9 rounded-full object-cover"
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

          <button className={`p-1.5 rounded-full cursor-pointer transition-colors ${
            darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}>
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Stream Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">
          <div className="text-center my-2">
            <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${
              darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
            }`}>
              Aujourd'hui
            </span>
          </div>

          {activeConv.messages.map((msg: any) => {
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
          })}
        </div>

        {/* Chat Input Footer */}
        <form onSubmit={handleSendMessage} className={`p-3 px-4 border-t flex items-center gap-3 shrink-0 ${
          darkMode ? 'border-slate-800 bg-[#1E293B]' : 'border-slate-100 bg-white'
        }`}>
          <div className="flex items-center gap-1">
            <button type="button" className={`p-2 rounded-xl transition-colors cursor-pointer ${
              darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}>
              <ImageIcon className="w-5 h-5" />
            </button>
            <button type="button" className={`p-2 rounded-xl transition-colors cursor-pointer ${
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
            className={`p-2.5 rounded-xl text-white font-bold flex items-center justify-center transition-all ${
              inputText.trim()
                ? 'bg-[#1677FF] hover:bg-[#1266DF] cursor-pointer shadow-blue-glow'
                : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}

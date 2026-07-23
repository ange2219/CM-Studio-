'use client'

import React, { useState } from 'react';
import { Link2 } from 'lucide-react';
import { PostCard } from './PostCard';
import { useTheme } from '@/components/context/ThemeContext';

const MOCK_POSTS = [
  {
    id: 1,
    author: {
      name: 'Laura Fisher',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    time: 'Il y a 12 heures',
    content: 'Une des expériences les plus mémorables de ma vie ! La beauté de cette vallée alpine est tout simplement spectaculaire. ✨🏔️',
    images: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=500&auto=format&fit=crop&q=80',
    ],
    likesCount: 184,
    initialLiked: true,
    sharesCount: 24,
    comments: [
      {
        id: 101,
        name: 'Marc Dubois',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        time: 'Il y a 2h',
        text: 'C\'est absolument grandiose ! Quel endroit exact est-ce ? 🎒',
      },
      {
        id: 102,
        name: 'Sophie Martin',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        time: 'Il y a 1h',
        text: 'Tes photos sont magnifiques, la lumière est parfaite ! 🔥',
      }
    ]
  },
  {
    id: 2,
    author: {
      name: 'Sam Brown',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      verified: false,
    },
    time: 'Il y a 1 jour',
    content: 'Exploration des côtes de Positano ce week-end ! Les couleurs de ce village à flanc de falaise sont uniques. 🌊☀️',
    images: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80',
    ],
    likesCount: 96,
    initialLiked: false,
    sharesCount: 8,
    comments: [
      {
        id: 201,
        name: 'Clara Petit',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        time: 'Il y a 5h',
        text: 'Profite bien ! L\'Italie est incroyable en cette saison 🇮🇹',
      }
    ]
  },
  {
    id: 3,
    author: {
      name: 'Julien Mercier',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    time: 'Il y a 2 jours',
    content: 'Nouvelle session de design système achevée pour le projet Antigravity ! Qu\'en pensez-vous ? 🎨✨',
    images: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    ],
    likesCount: 312,
    initialLiked: false,
    sharesCount: 45,
    comments: [
      {
        id: 301,
        name: 'Alexandra Borke',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        time: 'Il y a 1 jour',
        text: 'Le rendu est super propre et moderne ! Beau travail 🚀',
      }
    ]
  }
];

export function Feed({ darkMode: propDarkMode }: { darkMode?: boolean }) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'suivi'
  const [postContent, setPostContent] = useState('');
  const [postsList, setPostsList] = useState(MOCK_POSTS);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const newPost = {
      id: Date.now(),
      author: {
        name: 'Alexandra Borke',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        verified: true,
      },
      time: 'À l\'instant',
      content: postContent,
      images: [],
      likesCount: 0,
      initialLiked: false,
      sharesCount: 0,
      comments: []
    };

    setPostsList([newPost, ...postsList]);
    setPostContent('');
  };

  return (
    <main className="flex-1 min-w-[360px] h-full flex flex-col gap-4 overflow-y-auto no-scrollbar pr-1 relative select-none">
      {/* What's new Post Box */}
      <form 
        onSubmit={handleCreatePost}
        className={`rounded-2xl p-3 px-4 flex items-center gap-3.5 shadow-card-subtle border shrink-0 transition-colors duration-300 ${darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'}`}
      >
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
          alt="Alexandra Borke"
          className="w-9 h-9 rounded-full object-cover shrink-0"
        />
        <input
          type="text"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="Quoi de neuf, Alexandra ?"
          className={`text-[13px] font-normal flex-1 outline-none bg-transparent ${darkMode ? 'text-slate-100 placeholder-slate-400' : 'text-slate-700 placeholder-[#94A3B8]'}`}
        />
        <button 
          type="submit"
          className="bg-[#1677FF] hover:bg-[#1266DF] text-white text-[12px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-blue-glow transition-all cursor-pointer shrink-0 border-none"
        >
          <Link2 className="w-4 h-4 stroke-[2.5] transform rotate-45" />
          <span>Publier !</span>
        </button>
      </form>

      {/* Sticky Feed Filtering Tabs (Général & Suivi) */}
      <div className={`sticky top-0 z-20 transition-colors duration-300 border-b backdrop-blur-md flex items-center gap-6 px-4 py-1 shrink-0 ${darkMode ? 'bg-[#0F172A]/95 border-slate-800' : 'bg-[#FAFCFF]/95 border-slate-200/70'}`}>
        <button
          onClick={() => setActiveTab('general')}
          className={`relative py-2 text-[14px] transition-all cursor-pointer bg-transparent border-none ${
            activeTab === 'general'
              ? darkMode ? 'font-bold text-white' : 'font-bold text-[#1E293B]'
              : darkMode ? 'font-medium text-slate-400 hover:text-slate-200' : 'font-medium text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <span>Général</span>
          {activeTab === 'general' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1677FF] rounded-full transition-all duration-200" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('suivi')}
          className={`relative py-2 text-[14px] transition-all cursor-pointer bg-transparent border-none ${
            activeTab === 'suivi'
              ? darkMode ? 'font-bold text-white' : 'font-bold text-[#1E293B]'
              : darkMode ? 'font-medium text-slate-400 hover:text-slate-200' : 'font-medium text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <span>Suivi</span>
          {activeTab === 'suivi' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1677FF] rounded-full transition-all duration-200" />
          )}
        </button>
      </div>

      {/* Posts Stream */}
      <div className="flex flex-col gap-4 pb-6">
        {postsList.map((post) => (
          <PostCard key={post.id} post={post} darkMode={darkMode} />
        ))}
      </div>
    </main>
  );
}

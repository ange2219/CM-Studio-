'use client'

import React, { useState, useEffect } from 'react';
import { Link2, ImageIcon, Sparkles } from 'lucide-react';
import { PostCard } from './PostCard';
import { useTheme } from '@/components/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function Feed({ darkMode: propDarkMode }: { darkMode?: boolean }) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const { user } = useUser();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'general' | 'suivi'>('general');
  const [postContent, setPostContent] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const [postsList, setPostsList] = useState<any[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Load real posts & user follows from Supabase
  useEffect(() => {
    async function loadData() {
      const { data: postsData } = await supabase
        .from('vw_community_posts')
        .select('*')
        .is('group_id', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (user) {
        const { data: followsData } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', user.id);

        if (followsData) {
          setFollowingIds(new Set(followsData.map(f => f.following_id)));
        }
      }

      if (postsData) {
        // Transform Supabase posts to match PostCard props while preserving real IDs & data
        const formatted = postsData.map(p => ({
          id: p.id,
          db_id: p.id,
          user_id: p.user_id,
          author: {
            name: p.full_name || 'Membre CM Studio',
            avatar: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            verified: p.plan && p.plan.toLowerCase() !== 'free',
          },
          time: getShortTimeAgo(p.created_at),
          content: p.content,
          images: p.image_url ? [p.image_url] : [],
          likesCount: p.likes_count || 0,
          commentsCount: p.comments_count || 0,
          sharesCount: 12,
        }));
        setPostsList(formatted);
      }
    }
    loadData();
  }, [supabase, user]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!postContent.trim() && !uploadedImageUrl) || isPosting) return;

    setIsPosting(true);
    const { data: inserted, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: user?.id,
        content: postContent.trim(),
        image_url: uploadedImageUrl || null,
        group_id: null,
      })
      .select('*')
      .single();

    setIsPosting(false);

    if (inserted) {
      const newPostObj = {
        id: inserted.id,
        db_id: inserted.id,
        user_id: user?.id,
        author: {
          name: user?.full_name || 'Alexandra Borke',
          avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          verified: true,
        },
        time: "À l'instant",
        content: inserted.content,
        images: inserted.image_url ? [inserted.image_url] : [],
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
      };
      setPostsList([newPostObj, ...postsList]);
      setPostContent('');
      setUploadedImageUrl(null);
    }
  };

  const filteredPosts = activeTab === 'general'
    ? postsList
    : postsList.filter(p => followingIds.has(p.user_id));

  return (
    <main className="flex-1 min-w-[360px] h-full flex flex-col gap-4 overflow-y-auto no-scrollbar pr-1 relative select-none">
      {/* What's new Post Box */}
      <form 
        onSubmit={handleCreatePost}
        className={`rounded-2xl p-3.5 px-4 flex flex-col gap-2.5 shadow-card-subtle border shrink-0 transition-colors duration-300 ${darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'}`}
      >
        <div className="flex items-center gap-3.5">
          <UserAvatar
            avatarUrl={user?.avatar_url}
            size={36}
            className="ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
          />
          <input
            type="text"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder={`Quoi de neuf, ${(user?.full_name || 'Alexandra').split(' ')[0]} ?`}
            className={`text-[13px] font-normal flex-1 outline-none bg-transparent ${darkMode ? 'text-slate-100 placeholder-slate-400' : 'text-slate-700 placeholder-[#94A3B8]'}`}
          />
          <button 
            type="submit"
            disabled={(!postContent.trim() && !uploadedImageUrl) || isPosting}
            className={`bg-[#1677FF] hover:bg-[#1266DF] text-white text-[12px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-blue-glow transition-all cursor-pointer shrink-0 border-none ${
              (!postContent.trim() && !uploadedImageUrl) || isPosting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Link2 className="w-4 h-4 stroke-[2.5] transform rotate-45" />
            <span>{isPosting ? 'Envoi...' : 'Publier !'}</span>
          </button>
        </div>

        {uploadedImageUrl && (
          <div className="pl-12 relative w-fit">
            <img src={uploadedImageUrl} alt="Upload preview" className="max-w-[200px] max-h-[140px] rounded-xl object-cover border" />
            <button
              type="button"
              onClick={() => setUploadedImageUrl(null)}
              className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center border-none cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
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
          <span>Suivi ({followingIds.size})</span>
          {activeTab === 'suivi' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1677FF] rounded-full transition-all duration-200" />
          )}
        </button>
      </div>

      {/* Posts Stream */}
      <div className="flex flex-col gap-4 pb-6">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} darkMode={darkMode} />
        ))}
      </div>
    </main>
  );
}

function getShortTimeAgo(dateStr: string | null | undefined) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "à l'instant";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}h`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}j`;
}

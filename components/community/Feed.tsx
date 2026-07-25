'use client'

import React, { useState, useEffect } from 'react';
import { Link2, ImageIcon } from 'lucide-react';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { useTheme } from '@/components/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { formatFacebookDate } from '@/lib/utils';

export function Feed({ darkMode: propDarkMode }: { darkMode?: boolean }) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const { user } = useUser();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'general' | 'suivi'>('general');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [postsList, setPostsList] = useState<any[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(new Set());
  const [highlightedCommentIds, setHighlightedCommentIds] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load real posts & user follows from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const { data: postsData } = await supabase
          .from('vw_community_posts')
          .select('*, community_post_images(image_url, position)')
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
          const formatted = postsData.map(p => {
            const multiImages = p.community_post_images
              ? p.community_post_images
                  .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
                  .map((img: any) => img.image_url)
              : [];

            const images = multiImages.length > 0
              ? multiImages
              : (p.image_url ? [p.image_url] : []);

            return {
              id: p.id,
              db_id: p.id,
              user_id: p.user_id,
              author: {
                name: p.full_name || 'Membre CM Studio',
                avatar: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                verified: p.plan && p.plan.toLowerCase() !== 'free',
              },
              time: formatFacebookDate(p.created_at),
              content: p.content,
              images,
              likesCount: p.likes_count || 0,
              commentsCount: p.comments_count || 0,
              sharesCount: p.shares_count || 0,
            };
          });
          setPostsList(formatted);
        }
      } catch (err) {
        console.error('Error loading posts:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [supabase, user]);

  // Handle URL hash anchor scrolling & opening comments with polling
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    console.log('[STEP 2 FEED] Read window.location.hash:', hash, 'postsList.length:', postsList.length);
    if (postsList.length === 0 || !hash) return;

    const pollAndScrollElement = (elementId: string, onFound?: () => void) => {
      let attempts = 0;
      const maxAttempts = 30; // 30 * 100ms = 3s
      const timer = setInterval(() => {
        attempts++;
        const el = document.getElementById(elementId);
        if (el) {
          clearInterval(timer);
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const originalBg = el.style.backgroundColor;
          el.style.transition = 'background-color 0.5s ease';
          el.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
          setTimeout(() => {
            el.style.backgroundColor = originalBg;
          }, 2000);
          onFound?.();
        } else if (attempts >= maxAttempts) {
          clearInterval(timer);
        }
      }, 100);
    };

    if (hash.startsWith('#post-')) {
      const raw = hash.replace('#post-', '');
      const isComments = raw.endsWith('-comments');
      const postId = isComments ? raw.replace('-comments', '') : raw;

      const postExistsInFeed = postsList.some(p => p.id === postId || p.db_id === postId);
      console.log('[STEP 3 FEED] #post- hash check:', { postId, postExistsInFeed, totalPostsInList: postsList.length });

      if (isComments) {
        setExpandedPostIds(prev => new Set(prev).add(postId));
      }
      pollAndScrollElement(`post-container-${postId}`);
      window.history.replaceState(null, '', window.location.pathname);

    } else if (hash.startsWith('#comment_')) {
      // Format: #comment_[commentId]_[postId]
      const parts = hash.replace('#comment_', '').split('_');
      if (parts.length >= 2) {
        const commentId = parts[0];
        const postId = parts[1];

        const postExistsInFeed = postsList.some(p => p.id === postId || p.db_id === postId);
        console.log('[STEP 3 FEED] #comment_ hash check:', { commentId, postId, postExistsInFeed, totalPostsInList: postsList.length });

        setExpandedPostIds(prev => new Set(prev).add(postId));
        setHighlightedCommentIds(prev => ({ ...prev, [postId]: commentId }));
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [postsList]);


  const filteredPosts = activeTab === 'general'
    ? postsList
    : postsList.filter(p => followingIds.has(p.user_id));

  return (
    <main className="flex-1 min-w-0 h-full flex flex-col gap-2 md:gap-4 overflow-y-auto no-scrollbar pr-0 md:pr-1 relative select-none">
      {/* What's new Post Box - Click opens CreatePostModal */}
      <div 
        onClick={() => setIsCreateModalOpen(true)}
        className={`rounded-none md:rounded-2xl p-3.5 px-4 flex items-center justify-between gap-3.5 shadow-card-subtle border-y md:border shrink-0 transition-colors duration-300 cursor-pointer ${darkMode ? 'bg-[#1E293B] border-slate-800 hover:bg-slate-800/80' : 'bg-white border-slate-100/80 hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <UserAvatar
            avatarUrl={user?.avatar_url}
            size={36}
            className="ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
          />
          <span className={`text-[13px] font-normal truncate ${darkMode ? 'text-slate-400' : 'text-[#94A3B8]'}`}>
            Quoi de neuf, {(user?.full_name || 'Membre').split(' ')[0]} ?
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1.5 text-slate-400 hover:text-[#1677FF] dark:hover:text-blue-400 rounded-full transition-colors shrink-0">
            <ImageIcon className="w-4.5 h-4.5" />
          </div>
          <button 
            type="button"
            className="bg-[#1677FF] hover:bg-[#1266DF] text-white text-[12px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-blue-glow transition-all cursor-pointer shrink-0 border-none"
          >
            <Link2 className="w-4 h-4 stroke-[2.5] transform rotate-45" />
            <span>Publier</span>
          </button>
        </div>
      </div>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={user}
        onPostCreated={(newPost) => {
          setPostsList(prev => [newPost, ...prev]);
        }}
      />

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
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`rounded-2xl p-5 border animate-pulse space-y-4 ${
                  darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700/40" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 w-32 bg-slate-700/40 rounded" />
                    <div className="h-2.5 w-20 bg-slate-700/30 rounded" />
                  </div>
                </div>
                <div className="h-48 w-full rounded-xl bg-slate-700/30" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className={`p-8 text-center text-sm font-medium rounded-2xl border ${darkMode ? 'bg-[#1E293B] border-slate-800 text-slate-400' : 'bg-white border-slate-100 text-slate-500'}`}>
            {activeTab === 'suivi'
              ? "Aucune publication des comptes que vous suivez pour le moment."
              : "Aucune publication pour le moment."}
          </div>
        ) : (
          filteredPosts.map((post) => {
          if (highlightedCommentIds[post.id]) {
            console.log('[STEP 4 FEED] Passing props to PostCard:', {
              postId: post.id,
              highlightCommentId: highlightedCommentIds[post.id],
              showComments: expandedPostIds.has(post.id)
            });
          }
          return (
            <PostCard
              key={post.id}
              post={post}
              darkMode={darkMode}
              showComments={expandedPostIds.has(post.id)}
              onToggleComments={(show) => {
                setExpandedPostIds(prev => {
                  const next = new Set(prev);
                  if (show) next.add(post.id);
                  else next.delete(post.id);
                  return next;
                });
              }}
              highlightCommentId={highlightedCommentIds[post.id] || null}
              onHighlightHandled={() => {
                setHighlightedCommentIds(prev => ({ ...prev, [post.id]: null }));
              }}
            />
          );
        }))}
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

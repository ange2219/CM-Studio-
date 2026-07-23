'use client'

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Send, 
  MoreHorizontal, 
  Smile, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

import { CommentsThread } from './CommentsThread';

export function PostCard({ post, darkMode: propDarkMode }: { post: any; darkMode?: boolean }) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const { user } = useUser();
  const supabase = createClient();

  const [liked, setLiked] = useState(post.initialLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Check if current user liked this post
  useEffect(() => {
    async function checkLiked() {
      if (!user || !post.db_id) return;
      const { data } = await supabase
        .from('community_likes')
        .select('id')
        .eq('post_id', post.db_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) setLiked(true);
    }
    checkLiked();
  }, [supabase, user, post.db_id]);

  const toggleLike = async () => {
    if (!user || !post.db_id) return;

    if (liked) {
      setLiked(false);
      setLikesCount((prev: number) => Math.max(0, prev - 1));
      await supabase
        .from('community_likes')
        .delete()
        .match({ post_id: post.db_id, user_id: user.id });
    } else {
      setLiked(true);
      setLikesCount((prev: number) => prev + 1);
      await supabase
        .from('community_likes')
        .insert({ post_id: post.db_id, user_id: user.id });
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/community#post-${post.id}`);
    }
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2200);
  };

  return (
    <article className={`rounded-2xl p-4 md:p-5 shadow-card-subtle border shrink-0 transition-colors duration-300 relative select-none ${darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'}`}>
      
      {/* Toast Notification for Sharing */}
      {copiedShare && (
        <div className="absolute top-3 right-12 z-20 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Lien du post copié !</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar
            avatarUrl={post.author?.avatar}
            size={40}
            className="ring-2 ring-[#0284C7] ring-offset-1 shrink-0"
          />
          <div className="flex flex-col">
            <span className={`text-[14px] font-bold leading-tight flex items-center gap-1.5 ${darkMode ? 'text-white' : 'text-[#1E293B]'}`}>
              {post.author?.name || 'Membre'}
              {post.author?.verified && (
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline-block" />
              )}
            </span>
            <span className={`text-[12px] font-medium leading-tight mt-0.5 ${darkMode ? 'text-slate-400' : 'text-[#94A3B8]'}`}>
              {post.time}
            </span>
          </div>
        </div>
        <button className={`transition-colors p-1.5 rounded-full cursor-pointer border-none bg-transparent ${darkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-[#CBD5E1] hover:text-slate-600 hover:bg-slate-100'}`}>
          <MoreHorizontal className="w-5.5 h-5.5" />
        </button>
      </div>

      {/* Content Text */}
      <p className={`text-[13.5px] leading-relaxed my-3.5 font-normal ${darkMode ? 'text-slate-200' : 'text-[#334155]'}`}>
        {post.content}
      </p>

      {/* Media Content */}
      {post.images && post.images.length === 1 && (
        <div className="h-[250px] md:h-[290px] w-full overflow-hidden rounded-xl">
          <img
            src={post.images[0]}
            alt="Post media"
            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500 cursor-pointer"
          />
        </div>
      )}

      {post.images && post.images.length > 1 && (
        <div className="grid grid-cols-2 gap-2.5 rounded-xl overflow-hidden">
          <div className="h-[250px] lg:h-[280px] w-full overflow-hidden rounded-xl">
            <img
              src={post.images[0]}
              alt="Gallery item 1"
              className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500 cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-2.5 h-[250px] lg:h-[280px]">
            {post.images.slice(1, 3).map((imgUrl: string, idx: number) => (
              <div key={idx} className="h-[121px] lg:h-[136px] w-full overflow-hidden rounded-xl">
                <img
                  src={imgUrl}
                  alt={`Gallery item ${idx + 2}`}
                  className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Summary Bar */}
      <div className={`flex items-center justify-between pt-3.5 pb-2 text-[12.5px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        <div className="flex items-center gap-1.5">
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {likesCount} {likesCount > 1 ? "J'aime" : "J'aime"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowComments(!showComments)}
            className="hover:underline transition-all cursor-pointer bg-transparent border-none p-0 text-inherit font-medium"
          >
            {commentsCount} {commentsCount > 1 ? "commentaires" : "commentaire"}
          </button>
          <span>•</span>
          <button onClick={handleShare} className="hover:underline transition-all cursor-pointer bg-transparent border-none p-0 text-inherit font-medium">
            {post.sharesCount || 12} partages
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className={`h-[1px] w-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />

      {/* 2. Main Action Buttons Bar */}
      <div className="flex items-center justify-between py-1">
        
        {/* Heart Like Button */}
        <button
          onClick={toggleLike}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer select-none border-none ${
            liked
              ? 'text-rose-500 bg-rose-50/70 dark:bg-rose-500/10 dark:text-rose-400'
              : darkMode 
                ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 bg-transparent' 
                : 'text-slate-600 hover:text-rose-500 hover:bg-slate-100/70 bg-transparent'
          }`}
        >
          <Heart className={`w-4.5 h-4.5 stroke-[2] transition-transform ${liked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
          <span>{liked ? 'Aimé' : 'J\'aime'}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer select-none border-none ${
            showComments
              ? darkMode ? 'text-[#1677FF] bg-blue-500/10' : 'text-[#1677FF] bg-blue-50'
              : darkMode 
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 bg-transparent' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 bg-transparent'
          }`}
        >
          <MessageCircle className="w-4.5 h-4.5 stroke-[2]" />
          <span>Commenter</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer select-none border-none ${
            darkMode 
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 bg-transparent' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 bg-transparent'
          }`}
        >
          <Share2 className="w-4.5 h-4.5 stroke-[2]" />
          <span>Partager</span>
        </button>

        {/* Bookmark Button */}
        <button
          onClick={() => setSaved(!saved)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer select-none border-none ${
            saved
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'
              : darkMode 
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 bg-transparent' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 bg-transparent'
          }`}
          title={saved ? "Enregistré" : "Enregistrer"}
        >
          <Bookmark className={`w-4.5 h-4.5 stroke-[2] ${saved ? 'fill-amber-500' : ''}`} />
          <span className="hidden sm:inline">{saved ? 'Enregistré' : 'Sauvegarder'}</span>
        </button>
      </div>

      {/* 3. Embedded Standalone CommentsThread Component */}
      {showComments && (
        <CommentsThread
          postId={post.db_id}
          onCommentAdded={() => setCommentsCount((prev: number) => prev + 1)}
          darkMode={darkMode}
        />
      )}

    </article>
  );
}

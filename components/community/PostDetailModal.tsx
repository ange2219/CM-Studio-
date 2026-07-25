'use client'

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  Check, 
  Sparkles,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useFollow } from '@/hooks/useFollow';
import { CommentsThread } from './CommentsThread';

export function PostDetailModal({
  isOpen,
  onClose,
  post,
  initialImageIndex = 0,
  darkMode = true
}: {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  initialImageIndex?: number;
  darkMode?: boolean;
}) {
  const { user } = useUser();
  const { isFollowing, toggleFollow } = useFollow();
  const supabase = createClient();

  const [activeImageIdx, setActiveImageIdx] = useState(initialImageIndex);
  const [liked, setLiked] = useState(post?.initialLiked || false);
  const [likesCount, setLikesCount] = useState(post?.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post?.commentsCount || 0);
  const [sharesCount, setSharesCount] = useState(post?.sharesCount || 0);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    setActiveImageIdx(initialImageIndex);
  }, [initialImageIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && post?.images?.length > 1) {
        setActiveImageIdx(prev => (prev > 0 ? prev - 1 : post.images.length - 1));
      }
      if (e.key === 'ArrowRight' && post?.images?.length > 1) {
        setActiveImageIdx(prev => (prev < post.images.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, post?.images?.length, onClose]);

  useEffect(() => {
    async function checkUserInteractions() {
      if (!user || !post?.db_id) return;
      const [{ data: lData }, { data: bData }, { data: sData }] = await Promise.all([
        supabase.from('community_likes').select('id').eq('post_id', post.db_id).eq('user_id', user.id).maybeSingle(),
        supabase.from('community_bookmarks').select('id').eq('post_id', post.db_id).eq('user_id', user.id).maybeSingle(),
        supabase.from('community_shares').select('id').eq('post_id', post.db_id).eq('user_id', user.id).maybeSingle()
      ]);
      if (lData) setLiked(true);
      if (bData) setSaved(true);
      if (sData) setShared(true);
    }
    if (isOpen) checkUserInteractions();
  }, [isOpen, post?.db_id, user, supabase]);

  if (!isOpen || !post) return null;

  const images = post.images || [];
  const currentImage = images[activeImageIdx] || post.image;

  const toggleLike = async () => {
    if (!user || !post.db_id) return;
    if (liked) {
      setLiked(false);
      setLikesCount((prev: number) => Math.max(0, prev - 1));
      await supabase.from('community_likes').delete().match({ post_id: post.db_id, user_id: user.id });
    } else {
      setLiked(true);
      setLikesCount((prev: number) => prev + 1);
      await supabase.from('community_likes').insert({ post_id: post.db_id, user_id: user.id });
    }
  };

  const toggleSave = async () => {
    if (!user || !post.db_id) return;
    if (saved) {
      setSaved(false);
      await supabase.from('community_bookmarks').delete().match({ post_id: post.db_id, user_id: user.id });
    } else {
      setSaved(true);
      await supabase.from('community_bookmarks').insert({ post_id: post.db_id, user_id: user.id });
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/home#post_${post.db_id || post.id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
    }
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2200);
    if (user && post.db_id && !shared) {
      setShared(true);
      setSharesCount((prev: number) => prev + 1);
      await supabase.from('community_shares').insert({ post_id: post.db_id, user_id: user.id });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-black/95 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {copiedShare && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in zoom-in duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Lien du post copié !</span>
        </div>
      )}

      {/* LEFT SECTION: Fullscreen Media Viewer */}
      <div className="w-full h-[40vh] md:h-full md:flex-1 relative flex items-center justify-center bg-black/90 p-4 select-none overflow-hidden">
        
        {/* Close Button Top-Left (Only on Mobile/Tablet) */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-30 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition-colors cursor-pointer border border-slate-800 md:hidden"
          title="Fermer (Échap)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Blurred Background Image */}
        {currentImage && (
          <img
            src={currentImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-35 scale-125 pointer-events-none select-none"
          />
        )}

        {/* Left Arrow Navigation */}
        {images.length > 1 && (
          <button
            onClick={() => setActiveImageIdx(prev => (prev > 0 ? prev - 1 : images.length - 1))}
            className="absolute left-4 z-30 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition-colors cursor-pointer border border-slate-800"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Main High-Res Image Display */}
        {currentImage ? (
          <img
            src={currentImage}
            alt="Media detail"
            className="relative z-10 max-h-[36vh] md:max-h-[92vh] max-w-[92vw] object-contain rounded-lg shadow-2xl transition-all duration-300"
          />
        ) : (
          <div className="text-slate-400 text-sm">Aucun média associé</div>
        )}

        {/* Right Arrow Navigation */}
        {images.length > 1 && (
          <button
            onClick={() => setActiveImageIdx(prev => (prev < images.length - 1 ? prev + 1 : 0))}
            className="absolute right-4 z-30 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition-colors cursor-pointer border border-slate-800"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Image Counter Badge if multi-images */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-800">
            {activeImageIdx + 1} / {images.length}
          </div>
        )}
      </div>

      {/* RIGHT SECTION: Post Details & Interactive Comments Sidebar */}
      <div className="w-full h-[60vh] md:h-full md:w-[380px] md:sm:w-[420px] md:lg:w-[460px] flex flex-col border-t md:border-t-0 md:border-l border-slate-800 bg-[#111827] dark:bg-[#1E293B] text-slate-100 shrink-0 overflow-hidden">
        
        {/* Author Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/profile/${post.user_id}`} onClick={onClose} className="shrink-0">
              <UserAvatar avatarUrl={post.author?.avatar} size={42} />
            </Link>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 text-[14px] font-bold leading-tight truncate">
                <Link href={`/profile/${post.user_id}`} onClick={onClose} className="no-underline text-white hover:underline flex items-center gap-1.5 min-w-0 truncate">
                  <span className="truncate">{post.author?.name || 'Membre'}</span>
                  {post.author?.verified && (
                    <svg viewBox="0 0 12 12" width="14" height="14" fill="none" className="text-[#1877F2] inline-block shrink-0" style={{ margin: '0 1px' }}>
                      <path d="M6 0L7.25 1.25L9 1.15L9.15 2.9L10.5 3.75L9.85 5.3L10.7 6.85L9.35 7.5L9 9.25L7.25 9.15L6 10.4L4.75 9.15L3 9.25L2.85 7.5L1.5 6.65L2.15 5.1L1.3 3.55L2.65 2.9L3 1.15L4.75 1.25L6 0Z" fill="currentColor"/>
                      <path d="M3.75 5L5 6.25L8.25 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </Link>
                
                {user?.id && user.id !== post.user_id && !isFollowing(post.user_id) && (
                  <span className="flex items-center shrink-0">
                    <span className="text-slate-400 font-normal text-[14px] select-none">·</span>
                    <button
                      type="button"
                      onClick={() => toggleFollow(post.user_id, post.author?.name)}
                      className="ml-1.5 text-[#1877F2] dark:text-[#4599FF] hover:underline text-[14px] font-bold bg-transparent border-none p-0 cursor-pointer transition-colors"
                    >
                      Suivre
                    </button>
                  </span>
                )}
              </div>
              <span className="text-[12px] font-medium text-slate-400 mt-0.5 flex items-center gap-1.5 select-none">
                {post.time}
                <span>·</span>
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" className="text-slate-400 inline-block shrink-0">
                  <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 1c1.61 0 3.09.57 4.25 1.51L9.67 5.1c-.24.1-.47.24-.67.4L7 4.2a1 1 0 00-1.4 0L3.33 6.47A6.97 6.97 0 018 1zm3.89 2.5a5.97 5.97 0 011.08 1.83l-1.39.46a3.02 3.02 0 00-.73-1.07l1.04-1.22zM2.08 7.5A6.02 6.02 0 012 8c0-1 .24-1.93.67-2.76l2 2a1 1 0 001.33 0l1.5-1.5c.2-.2.32-.47.33-.76l2.12 1.6A3 3 0 0011 9.5a3 3 0 001.66-.51l1.24 1.24A6.97 6.97 0 018 15c-3.1 0-5.75-2.02-6.72-4.83l1.83-.92c.22.42.54.77.93 1.02l-1.96-2.77z"/>
                </svg>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-none bg-transparent cursor-pointer">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-none bg-transparent cursor-pointer"
              title="Fermer (Échap)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Middle Content: Text + Stats Bar */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          
          {/* Post Text Description */}
          {post.content && (
            <p className="text-[14px] leading-relaxed text-slate-200 font-normal">
              {post.content}
            </p>
          )}

          {/* Action Stats Bar (Like, Comment, Share, Bookmark) */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[13px] text-slate-400">
            <div className="flex items-center gap-5">
              <button
                onClick={toggleLike}
                className={`flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer transition-colors ${
                  liked ? 'text-rose-500 font-bold' : 'hover:text-rose-400 text-slate-400'
                }`}
              >
                <Heart className={`w-4 h-4 transition-transform ${liked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
                <span>{likesCount}</span>
              </button>

              <div className="flex items-center gap-1.5 text-slate-400">
                <MessageCircle className="w-4 h-4" />
                <span>{commentsCount}</span>
              </div>

              <button
                onClick={handleShare}
                className={`flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer transition-colors ${
                  shared ? 'text-blue-500 font-bold' : 'hover:text-blue-400 text-slate-400'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{sharesCount}</span>
              </button>
            </div>

            <button
              onClick={toggleSave}
              className={`bg-transparent border-none p-0 cursor-pointer transition-colors ${
                saved ? 'text-amber-500' : 'hover:text-amber-400 text-slate-400'
              }`}
              title={saved ? "Enregistré" : "Enregistrer"}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>

          {/* Realtime Comments Thread Section */}
          <div className="pt-2">
            <CommentsThread
              postId={post.db_id || post.id}
              onCommentAdded={() => setCommentsCount((prev: number) => prev + 1)}
              darkMode={true}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-[100] flex h-screen w-screen overflow-hidden bg-black/95 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {copiedShare && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in zoom-in duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Lien du post copié !</span>
        </div>
      )}

      {/* LEFT SECTION: Fullscreen Media Viewer */}
      <div className="flex-1 h-full relative flex items-center justify-center bg-black/90 p-4 select-none overflow-hidden">
        
        {/* Close Button Top-Left */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-30 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition-colors cursor-pointer border border-slate-800"
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
            className="relative z-10 max-h-[92vh] max-w-[92vw] object-contain rounded-lg shadow-2xl transition-all duration-300"
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
      <div className="w-[380px] sm:w-[420px] lg:w-[460px] h-full flex flex-col border-l border-slate-800 bg-[#111827] dark:bg-[#1E293B] text-slate-100 shrink-0 overflow-hidden">
        
        {/* Author Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/profile/${post.user_id}`} onClick={onClose} className="shrink-0">
              <UserAvatar avatarUrl={post.author?.avatar} size={42} />
            </Link>
            <div className="flex flex-col min-w-0">
              <Link href={`/profile/${post.user_id}`} onClick={onClose} className="no-underline group">
                <span className="text-[14px] font-bold leading-tight flex items-center gap-1.5 truncate text-white group-hover:underline">
                  {post.author?.name || 'Membre'}
                  {post.author?.verified && <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                </span>
              </Link>
              <span className="text-[12px] font-medium text-slate-400 mt-0.5">
                {post.time}
              </span>
            </div>

            {user?.id && user.id !== post.user_id && (
              <button
                type="button"
                onClick={() => toggleFollow(post.user_id, post.author?.name)}
                className={`ml-2 px-3 py-1 rounded-full text-[12px] font-bold transition-all cursor-pointer border-none shrink-0 ${
                  isFollowing(post.user_id)
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-[#1677FF] hover:bg-[#1266DF] text-white'
                }`}
              >
                {isFollowing(post.user_id) ? 'Abonné' : '+ Suivre'}
              </button>
            )}
          </div>

          <button className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-none bg-transparent cursor-pointer">
            <MoreHorizontal className="w-5 h-5" />
          </button>
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

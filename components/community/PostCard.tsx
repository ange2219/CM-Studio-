'use client'

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Check, 
  MoreHorizontal, 
  Sparkles 
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useFollow } from '@/hooks/useFollow';
import { CommentsThread } from './CommentsThread';

const globalAspectCache = new Map<string, number>();

function useTwoImageAspects(images: string[] = []) {
  const [aspects, setAspects] = useState<{ r0: number; r1: number }>(() => ({
    r0: (images && images[0] && globalAspectCache.get(images[0])) || 1.0,
    r1: (images && images[1] && globalAspectCache.get(images[1])) || 1.0
  }));

  useEffect(() => {
    if (!images || images.length !== 2) return;
    let isMounted = true;
    images.forEach((url, i) => {
      if (globalAspectCache.has(url)) return;
      const img = new Image();
      img.src = url;
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          const r = img.naturalWidth / img.naturalHeight;
          globalAspectCache.set(url, r);
          if (isMounted) {
            setAspects(prev => ({
              ...prev,
              [i === 0 ? 'r0' : 'r1']: r
            }));
          }
        }
      };
    });
    return () => { isMounted = false; };
  }, [images]);

  return aspects;
}

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(500);

  useEffect(() => {
    if (!ref.current) return;
    const updateWidth = () => {
      if (ref.current) {
        const w = ref.current.getBoundingClientRect().width;
        if (w > 0) setWidth(w);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

export function PostCard({ 
  post, 
  darkMode: propDarkMode,
  showComments: propShowComments,
  onToggleComments,
  highlightCommentId,
  onHighlightHandled
}: { 
  post: any; 
  darkMode?: boolean;
  showComments?: boolean;
  onToggleComments?: (show: boolean) => void;
  highlightCommentId?: string | null;
  onHighlightHandled?: () => void;
}) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const { user } = useUser();
  const { isFollowing, toggleFollow } = useFollow();
  const supabase = createClient();

  const twoAspects = useTwoImageAspects(post.images);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useContainerWidth(mediaRef);

  if (highlightCommentId) {
    console.log('[STEP 5 POSTCARD] Received highlightCommentId:', highlightCommentId, 'for post:', post.id || post.db_id, 'showComments:', propShowComments);
  }

  const [liked, setLiked] = useState(post.initialLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [sharesCount, setSharesCount] = useState(post.sharesCount || 0);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [showComments, setShowComments] = useState(propShowComments || false);
  const [copiedShare, setCopiedShare] = useState(false);

  React.useEffect(() => {
    if (propShowComments !== undefined) {
      setShowComments(propShowComments);
    }
  }, [propShowComments]);

  const toggleCommentsVisibility = () => {
    const nextState = !showComments;
    setShowComments(nextState);
    if (onToggleComments) {
      onToggleComments(nextState);
    }
  };

  React.useEffect(() => {
    async function checkUserInteractions() {
      if (!user || !post.db_id) return;

      const { data: lData } = await supabase.from('community_likes').select('id').eq('post_id', post.db_id).eq('user_id', user.id).maybeSingle();
      if (lData) setLiked(true);

      const { data: bData } = await supabase.from('community_bookmarks').select('id').eq('post_id', post.db_id).eq('user_id', user.id).maybeSingle();
      if (bData) setSaved(true);

      const { data: sData } = await supabase.from('community_shares').select('id').eq('post_id', post.db_id).eq('user_id', user.id).maybeSingle();
      if (sData) setShared(true);
    }
    checkUserInteractions();
  }, [post.db_id, user, supabase]);

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
    <article
      id={`post-container-${post.id || post.db_id}`}
      className={`rounded-2xl p-4 md:p-5 shadow-card-subtle border shrink-0 transition-colors duration-300 relative select-none ${darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'}`}
    >
      {copiedShare && (
        <div className="absolute top-3 right-12 z-20 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Lien copié !</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={`/profile/${post.user_id}`}
            className="shrink-0 rounded-full cursor-pointer hover:opacity-90 transition-opacity"
          >
            <UserAvatar
              avatarUrl={post.author?.avatar}
              size={40}
            />
          </Link>
          <Link href={`/profile/${post.user_id}`} className="no-underline cursor-pointer group min-w-0">
            <div className="flex flex-col min-w-0">
              <span className={`text-[14px] font-bold leading-tight flex items-center gap-1.5 truncate group-hover:underline ${darkMode ? 'text-white' : 'text-[#1E293B]'}`}>
                {post.author?.name || 'Membre'}
                {post.author?.verified && <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline-block shrink-0" />}
              </span>
              <span className={`text-[12px] font-medium leading-tight mt-0.5 ${darkMode ? 'text-slate-400' : 'text-[#94A3B8]'}`}>
                {post.time}
              </span>
            </div>
          </Link>

          {user?.id && user.id !== post.user_id && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFollow(post.user_id, post.author?.name);
              }}
              className={`ml-2 px-3 py-1 rounded-full text-[12px] font-bold transition-all cursor-pointer border-none shrink-0 ${
                isFollowing(post.user_id)
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  : 'bg-[#1677FF] hover:bg-[#1266DF] text-white shadow-blue-glow'
              }`}
            >
              {isFollowing(post.user_id) ? 'Abonné' : '+ Suivre'}
            </button>
          )}
        </div>

        <button className={`transition-colors p-1.5 rounded-full cursor-pointer border-none bg-transparent ${darkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-[#CBD5E1] hover:text-slate-600 hover:bg-slate-100'}`}>
          <MoreHorizontal className="w-5.5 h-5.5" />
        </button>
      </div>

      <p className={`text-[13.5px] leading-relaxed my-3.5 font-normal ${darkMode ? 'text-slate-200' : 'text-[#334155]'}`}>
        {post.content}
      </p>

      {/* Media Content - Single Unified Gallery Block per Post */}
      {post.images && post.images.length > 0 && (
        <div ref={mediaRef} className="w-full rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-800/50">
          {/* 1 Image */}
          {post.images.length === 1 && (
            <div className="w-full flex items-center justify-center max-h-[500px]">
              <img
                src={post.images[0]}
                alt="Post media"
                className="w-full h-auto max-h-[500px] object-contain hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
              />
            </div>
          )}

          {/* 2 Images: Smart Orientation (2 Columns Side-by-Side vs 2 Superposed Horizontal Rows) */}
          {post.images.length === 2 && (() => {
            const { r0, r1 } = twoAspects;
            // Superposition condition: if both are landscape (r > 1.2) OR if one is landscape and one is square/landscape (r > 1.35)
            const isSuperposed = (r0 > 1.2 && r1 > 1.2) || (r0 > 1.35 || r1 > 1.35);

            if (isSuperposed) {
              // If Portrait + Landscape, place Portrait (r < r1) on top
              const topIdx = r0 < r1 ? 0 : 1;
              const bottomIdx = topIdx === 0 ? 1 : 0;
              return (
                <div className="flex flex-col gap-0.5 h-[340px] md:h-[380px] max-h-[500px] w-full">
                  <div className="w-full h-1/2 overflow-hidden">
                    <img
                      src={post.images[topIdx]}
                      alt="Media top"
                      className="w-full h-full object-cover object-top hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
                    />
                  </div>
                  <div className="w-full h-1/2 overflow-hidden">
                    <img
                      src={post.images[bottomIdx]}
                      alt="Media bottom"
                      className="w-full h-full object-cover object-top hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
                    />
                  </div>
                </div>
              );
            }

            // Side-by-side 50%/50% width: preserve smaller image height, capped at 500px max
            const colWidth = (containerWidth || 500) / 2;
            const h0 = colWidth / (r0 || 1.0);
            const h1 = colWidth / (r1 || 1.0);
            const targetHeight = Math.min(500, Math.max(200, Math.round(Math.min(h0, h1))));

            return (
              <div
                className="grid grid-cols-2 gap-0.5 w-full overflow-hidden"
                style={{ height: `${targetHeight}px` }}
              >
                {post.images.map((url: string, i: number) => (
                  <div key={i} className="w-full h-full overflow-hidden">
                    <img
                      src={url}
                      alt={`Media ${i + 1}`}
                      className="w-full h-full object-cover object-top hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            );
          })()}

          {/* 3 Images: 1 main left + 2 stacked right */}
          {post.images.length === 3 && (
            <div className="grid grid-cols-2 gap-0.5 h-[320px] md:h-[360px]">
              <img
                src={post.images[0]}
                alt="Media 1"
                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
              />
              <div className="flex flex-col gap-0.5 h-full">
                <img
                  src={post.images[1]}
                  alt="Media 2"
                  className="w-full h-1/2 object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                />
                <img
                  src={post.images[2]}
                  alt="Media 3"
                  className="w-full h-1/2 object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 4 Images: 2x2 grid */}
          {post.images.length === 4 && (
            <div className="grid grid-cols-2 gap-0.5 h-[320px] md:h-[360px]">
              {post.images.slice(0, 4).map((url: string, i: number) => (
                <img
                  key={i}
                  src={url}
                  alt={`Media ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                />
              ))}
            </div>
          )}

          {/* 5+ Images: 2 top + 3 bottom */}
          {post.images.length >= 5 && (
            <div className="flex flex-col gap-0.5 h-[360px] md:h-[400px]">
              <div className="grid grid-cols-2 gap-0.5 h-1/2">
                {post.images.slice(0, 2).map((url: string, i: number) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Media ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                  />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-0.5 h-1/2">
                {post.images.slice(2, 4).map((url: string, i: number) => (
                  <img
                    key={i + 2}
                    src={url}
                    alt={`Media ${i + 3}`}
                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                  />
                ))}
                <div className="relative w-full h-full">
                  <img
                    src={post.images[4]}
                    alt="Media 5"
                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                  />
                  {post.images.length > 5 && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white font-extrabold text-lg">
                      +{post.images.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`flex items-center justify-between pt-3.5 pb-2 text-[12.5px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        <div className="flex items-center gap-1.5">
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {likesCount} {likesCount > 1 ? "J'aime" : "J'aime"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleCommentsVisibility}
            className="hover:underline transition-all cursor-pointer bg-transparent border-none p-0 text-inherit font-medium"
          >
            {commentsCount} {commentsCount > 1 ? "commentaires" : "commentaire"}
          </button>
          <span>•</span>
          <button onClick={handleShare} className="hover:underline transition-all cursor-pointer bg-transparent border-none p-0 text-inherit font-medium">
            {sharesCount} {sharesCount > 1 ? "partages" : "partage"}
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
          onClick={toggleCommentsVisibility}
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
            shared
              ? 'text-blue-500 bg-blue-50 dark:bg-blue-500/10'
              : darkMode 
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 bg-transparent' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 bg-transparent'
          }`}
        >
          <Share2 className="w-4.5 h-4.5 stroke-[2]" />
          <span>Partager</span>
        </button>

        {/* Bookmark Button */}
        <button
          onClick={toggleSave}
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
          postId={post.db_id || post.id}
          onCommentAdded={() => setCommentsCount((prev: number) => prev + 1)}
          darkMode={darkMode}
          highlightCommentId={highlightCommentId}
          onHighlightHandled={onHighlightHandled}
        />
      )}

    </article>
  );
}

'use client'

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send,
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
import { PostDetailModal } from './PostDetailModal';

const globalAspectCache = new Map<string, number>();

function useFirstImageAspect(images: string[] = []) {
  const [aspect, setAspect] = useState<number>(() => {
    return (images && images[0] && globalAspectCache.get(images[0])) || 1.0;
  });

  useEffect(() => {
    if (!images || images.length === 0) return;
    const url = images[0];
    if (globalAspectCache.has(url)) {
      setAspect(globalAspectCache.get(url)!);
      return;
    }
    let isMounted = true;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        const r = img.naturalWidth / img.naturalHeight;
        globalAspectCache.set(url, r);
        if (isMounted) setAspect(r);
      }
    };
    return () => { isMounted = false; };
  }, [images]);

  return aspect;
}

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

  const firstAspect = useFirstImageAspect(post.images);
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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const openDetailModal = (imgIndex = 0) => {
    setSelectedImageIdx(imgIndex);
    setIsDetailModalOpen(true);
  };

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

      {/* 1. Header (Avatar + Author Name + Date + Follow + Options) */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
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

      {/* 2. Media Content (Images Block directly below Header) */}
      {post.images && post.images.length > 0 && (
        <div ref={mediaRef} className="w-full rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-800/50 p-1 mb-3">
          {/* 1 Image with Ambient Dynamic Blurred Color Background */}
          {post.images.length === 1 && (
            <div
              onClick={() => openDetailModal(0)}
              className="w-full flex items-center justify-center max-h-[500px] relative overflow-hidden rounded-xl bg-slate-950/20 cursor-pointer"
            >
              {/* Dynamic Ambient Blurred Background */}
              <img
                src={post.images[0]}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-45 scale-125 pointer-events-none select-none"
              />
              {/* Main Image */}
              <img
                src={post.images[0]}
                alt="Post media"
                className="w-full h-auto max-h-[500px] object-contain relative z-10 rounded-xl hover:scale-[1.01] transition-transform duration-300"
              />
            </div>
          )}

          {/* 2 Images */}
          {post.images.length === 2 && (() => {
            const { r0, r1 } = twoAspects;
            const isSuperposed = (r0 > 1.2 && r1 > 1.2) || (r0 > 1.35 || r1 > 1.35);

            if (isSuperposed) {
              const topIdx = r0 < r1 ? 0 : 1;
              const bottomIdx = topIdx === 0 ? 1 : 0;
              return (
                <div className="flex flex-col gap-1.5 h-[340px] md:h-[380px] max-h-[500px] w-full">
                  <div onClick={() => openDetailModal(topIdx)} className="w-full h-1/2 rounded-xl overflow-hidden cursor-pointer">
                    <img
                      src={post.images[topIdx]}
                      alt="Media top"
                      className="w-full h-full object-cover object-top hover:scale-[1.01] transition-transform duration-300"
                    />
                  </div>
                  <div onClick={() => openDetailModal(bottomIdx)} className="w-full h-1/2 rounded-xl overflow-hidden cursor-pointer">
                    <img
                      src={post.images[bottomIdx]}
                      alt="Media bottom"
                      className="w-full h-full object-cover object-top hover:scale-[1.01] transition-transform duration-300"
                    />
                  </div>
                </div>
              );
            }

            const colWidth = (containerWidth || 500) / 2;
            const h0 = colWidth / (r0 || 1.0);
            const h1 = colWidth / (r1 || 1.0);
            const targetHeight = Math.min(500, Math.max(200, Math.round(Math.min(h0, h1))));

            return (
              <div
                className="grid grid-cols-2 gap-1.5 w-full overflow-hidden"
                style={{ height: `${targetHeight}px` }}
              >
                {post.images.map((url: string, i: number) => (
                  <div key={i} onClick={() => openDetailModal(i)} className="w-full h-full rounded-xl overflow-hidden cursor-pointer">
                    <img
                      src={url}
                      alt={`Media ${i + 1}`}
                      className="w-full h-full object-cover object-top hover:scale-[1.01] transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            );
          })()}

          {/* 3 Images: Smart Orientation (Landscape: 1 Top + 2 Bottom vs Portrait: 66% Left Hero + 34% Right Stacked) */}
          {post.images.length === 3 && (() => {
            const isLandscape = firstAspect > 1.25;

            if (isLandscape) {
              // 3 Landscape: Top 100% width (50% height) + Bottom 2 columns 50%/50% width (50% height)
              return (
                <div className="flex flex-col gap-1.5 h-[380px] md:h-[440px] max-h-[500px] w-full">
                  <div className="w-full h-1/2 rounded-xl overflow-hidden cursor-pointer" onClick={() => openDetailModal(0)}>
                    <img
                      src={post.images[0]}
                      alt="Media 1"
                      className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 w-full h-1/2">
                    <div className="w-full h-full rounded-xl overflow-hidden cursor-pointer" onClick={() => openDetailModal(1)}>
                      <img
                        src={post.images[1]}
                        alt="Media 2"
                        className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                    <div className="w-full h-full rounded-xl overflow-hidden cursor-pointer" onClick={() => openDetailModal(2)}>
                      <img
                        src={post.images[2]}
                        alt="Media 3"
                        className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
              );
            }

            // 3 Portrait: Left Hero 66% width + Right 2 stacked images 34% width (50%/50% height)
            return (
              <div className="grid grid-cols-3 gap-1.5 h-[420px] md:h-[480px] max-h-[500px] w-full">
                <div className="col-span-2 w-full h-full rounded-xl overflow-hidden cursor-pointer" onClick={() => openDetailModal(0)}>
                  <img
                    src={post.images[0]}
                    alt="Media 1"
                    className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                <div className="col-span-1 flex flex-col gap-1.5 h-full">
                  <div className="w-full h-1/2 rounded-xl overflow-hidden cursor-pointer" onClick={() => openDetailModal(1)}>
                    <img
                      src={post.images[1]}
                      alt="Media 2"
                      className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                  <div className="w-full h-1/2 rounded-xl overflow-hidden cursor-pointer" onClick={() => openDetailModal(2)}>
                    <img
                      src={post.images[2]}
                      alt="Media 3"
                      className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 4 Images */}
          {post.images.length === 4 && (
            <div className="grid grid-cols-2 gap-1.5 h-[320px] md:h-[360px]">
              {post.images.slice(0, 4).map((url: string, i: number) => (
                <div key={i} className="w-full h-full rounded-xl overflow-hidden cursor-pointer" onClick={() => openDetailModal(i)}>
                  <img
                    src={url}
                    alt={`Media ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 5+ Images */}
          {post.images.length >= 5 && (
            <div className="flex flex-col gap-1.5 h-[360px] md:h-[400px]">
              <div className="grid grid-cols-2 gap-1.5 h-1/2">
                {post.images.slice(0, 2).map((url: string, i: number) => (
                  <div key={i} className="w-full h-full rounded-xl overflow-hidden cursor-pointer" onClick={() => openDetailModal(i)}>
                    <img
                      src={url}
                      alt={`Media ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1.5 h-1/2">
                {post.images.slice(2, 4).map((url: string, i: number) => (
                  <div key={i + 2} className="w-full h-full rounded-xl overflow-hidden cursor-pointer" onClick={() => openDetailModal(i + 2)}>
                    <img
                      src={url}
                      alt={`Media ${i + 3}`}
                      className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                ))}
                <div onClick={() => openDetailModal(4)} className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer">
                  <img
                    src={post.images[4]}
                    alt="Media 5"
                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
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

      {/* 3. Text Content (Below Media Block) */}
      <p className={`text-[13.5px] leading-relaxed mb-3.5 font-normal ${darkMode ? 'text-slate-200' : 'text-[#334155]'}`}>
        {post.content}
      </p>

      {/* 4. Action Buttons Bar (Bottom Footer with thin separator line & compact icons) */}
      <div className={`flex items-center justify-between pt-3 mt-3.5 text-[12px] border-t ${darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200/80 text-slate-500'}`}>
        <div className="flex items-center gap-4 md:gap-5">
          {/* Like */}
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer transition-colors ${
              liked ? 'text-rose-500 font-bold' : darkMode ? 'hover:text-rose-400 text-slate-400' : 'hover:text-rose-500 text-slate-600'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 transition-transform ${liked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
            <span className="font-semibold">{likesCount}</span>
          </button>

          {/* Comment */}
          <button
            onClick={toggleCommentsVisibility}
            className={`flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer transition-colors ${
              showComments ? 'text-[#1677FF] font-bold' : darkMode ? 'hover:text-blue-400 text-slate-400' : 'hover:text-slate-900 text-slate-600'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="font-semibold">{commentsCount}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer transition-colors ${
              shared ? 'text-blue-500 font-bold' : darkMode ? 'hover:text-blue-400 text-slate-400' : 'hover:text-slate-900 text-slate-600'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="font-semibold">{sharesCount}</span>
          </button>
        </div>

        {/* Bookmark */}
        <button
          onClick={toggleSave}
          className={`bg-transparent border-none p-0 cursor-pointer transition-colors ${
            saved ? 'text-amber-500' : darkMode ? 'hover:text-amber-400 text-slate-400' : 'hover:text-amber-500 text-slate-600'
          }`}
          title={saved ? "Enregistré" : "Enregistrer"}
        >
          <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Embedded Comments Thread */}
      {showComments && (
        <CommentsThread
          postId={post.db_id || post.id}
          onCommentAdded={() => setCommentsCount((prev: number) => prev + 1)}
          darkMode={darkMode}
          highlightCommentId={highlightCommentId}
          onHighlightHandled={onHighlightHandled}
        />
      )}

      {/* Fullscreen Facebook-Style Post Lightbox Modal */}
      <PostDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        post={post}
        initialImageIndex={selectedImageIdx}
        darkMode={darkMode}
      />
    </article>
  );
}

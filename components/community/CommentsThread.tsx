'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Send, Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface CommentItem {
  id: string;
  parent_id: string | null;
  user_id: string;
  content: string;
  created_at: string;
  full_name: string;
  avatar_url: string | null;
  username: string | null;
  likes_count: number;
}

interface CommentsThreadProps {
  postId: string;
  onCommentAdded?: () => void;
  darkMode?: boolean;
  highlightCommentId?: string | null;
  onHighlightHandled?: () => void;
}

export function CommentsThread({ 
  postId, 
  onCommentAdded, 
  darkMode = false,
  highlightCommentId,
  onHighlightHandled
}: CommentsThreadProps) {
  const { user: currentUser } = useUser();
  const supabase = createClient();
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [visibleReplies, setVisibleReplies] = useState<Record<string, number>>({});
  const [commentLikes, setCommentLikes] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments and current user likes from community_comments & community_comment_likes
  useEffect(() => {
    async function fetchComments() {
      if (!postId) return;
      setLoading(true);
      try {
        const { data: rawComments, error } = await supabase
          .from('community_comments')
          .select('*')
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        let usersMap: Record<string, any> = {};
        if (rawComments && rawComments.length > 0) {
          const userIds = Array.from(new Set(rawComments.map(c => c.user_id)));
          const { data: usersData } = await supabase
            .from('user_public_profiles')
            .select('id, full_name, avatar_url, username')
            .in('id', userIds);

          if (usersData) {
            usersMap = Object.fromEntries(usersData.map(u => [u.id, u]));
          }
        }

        // Fetch user comment likes for this post
        let userLikesSet = new Set<string>();
        if (currentUser) {
          const { data: likesData } = await supabase
            .from('community_comment_likes')
            .select('comment_id')
            .eq('user_id', currentUser.id);

          if (likesData) {
            userLikesSet = new Set(likesData.map(l => l.comment_id));
          }
        }
        setCommentLikes(userLikesSet);

        // Count likes per comment
        const commentIds = (rawComments || []).map(c => c.id);
        let commentLikesCounts: Record<string, number> = {};
        if (commentIds.length > 0) {
          const { data: countsData } = await supabase
            .from('community_comment_likes')
            .select('comment_id')
            .in('comment_id', commentIds);

          if (countsData) {
            countsData.forEach(l => {
              commentLikesCounts[l.comment_id] = (commentLikesCounts[l.comment_id] || 0) + 1;
            });
          }
        }

        const formatted: CommentItem[] = (rawComments || []).map(c => {
          const u = usersMap[c.user_id];
          return {
            id: c.id,
            parent_id: c.parent_id || null,
            user_id: c.user_id,
            content: c.content,
            created_at: c.created_at,
            full_name: u?.full_name || 'Utilisateur',
            avatar_url: u?.avatar_url || null,
            username: u?.username || null,
            likes_count: commentLikesCounts[c.id] || 0,
          };
        });

        setComments(formatted);

        // Initial visible replies per root comment = 0 (TikTok style default collapsed)
        const initialVisible: Record<string, number> = {};
        formatted.filter(c => !c.parent_id).forEach(c => {
          initialVisible[c.id] = 0;
        });

        // Auto-expand replies if highlightCommentId matches a reply
        if (highlightCommentId) {
          const target = formatted.find(c => c.id === highlightCommentId);
          if (target) {
            let rootId = target.parent_id || target.id;
            let curr = target;
            while (curr && curr.parent_id) {
              const parent = formatted.find(x => x.id === curr.parent_id);
              if (parent) {
                rootId = parent.id;
                curr = parent;
              } else {
                break;
              }
            }
            initialVisible[rootId] = 999; // Expand all replies under root
          }
        }

        setVisibleReplies(initialVisible);

      } catch (err) {
        console.error('Erreur lors de la récupération des commentaires:', err);
        setComments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [postId, supabase, currentUser?.id, highlightCommentId]);

  // Polling scroll effect when highlightCommentId is active (inner container + page scroll)
  useEffect(() => {
    if (loading || !highlightCommentId) return;

    let attempts = 0;
    const maxAttempts = 30; // 3 seconds max (30 * 100ms)

    const timer = setInterval(() => {
      attempts++;
      const targetEl = document.getElementById(`comment-container-${highlightCommentId}`);
      const container = commentsContainerRef.current;

      if (targetEl && container) {
        clearInterval(timer);

        // Calculate relative position within inner scroll container
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const relativeTop = targetRect.top - containerRect.top + container.scrollTop;
        const scrollTo = relativeTop - container.clientHeight / 2 + targetEl.clientHeight / 2;

        container.scrollTo({
          top: Math.max(0, scrollTo),
          behavior: 'smooth'
        });

        // Apply blue highlight
        const originalBg = targetEl.style.backgroundColor;
        targetEl.style.transition = 'background-color 0.5s ease';
        targetEl.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
        setTimeout(() => {
          targetEl.style.backgroundColor = originalBg;
        }, 2000);

        onHighlightHandled?.();
      } else if (attempts >= maxAttempts) {
        clearInterval(timer);
        onHighlightHandled?.();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [loading, highlightCommentId, onHighlightHandled]);

  // Handle submit comment / reply
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);
    const text = newCommentText.trim();
    const parentId = replyingTo ? replyingTo.id : null;

    const payload: any = {
      post_id: postId,
      user_id: currentUser.id,
      content: text,
    };
    if (parentId) payload.parent_id = parentId;

    const { data, error } = await supabase
      .from('community_comments')
      .insert(payload)
      .select('id, created_at')
      .single();

    if (!error && data) {
      const newCommentObj: CommentItem = {
        id: data.id,
        parent_id: parentId,
        user_id: currentUser.id,
        content: text,
        created_at: data.created_at || new Date().toISOString(),
        full_name: currentUser.full_name || 'Utilisateur',
        avatar_url: currentUser.avatar_url || null,
        username: currentUser.username || null,
        likes_count: 0,
      };

      setComments(prev => [...prev, newCommentObj]);
      setNewCommentText('');
      setReplyingTo(null);

      if (parentId) {
        let rootId = parentId;
        let curr = comments.find(x => x.id === rootId);
        while (curr && curr.parent_id) {
          rootId = curr.parent_id;
          curr = comments.find(x => x.id === rootId);
        }
        setVisibleReplies(prev => ({ ...prev, [rootId]: (prev[rootId] || 0) + 1 }));
      }

      if (onCommentAdded) onCommentAdded();
    } else if (error) {
      console.error("Erreur lors de l'insertion du commentaire :", error);
    }
    setIsSubmitting(false);
  };

  // Toggle comment like in Supabase community_comment_likes
  const toggleCommentLike = async (commentId: string) => {
    if (!currentUser) return;
    const isLiked = commentLikes.has(commentId);

    setCommentLikes(prev => {
      const next = new Set(prev);
      if (isLiked) next.delete(commentId);
      else next.add(commentId);
      return next;
    });

    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? { ...c, likes_count: Math.max(0, c.likes_count + (isLiked ? -1 : 1)) }
          : c
      )
    );

    if (isLiked) {
      await supabase
        .from('community_comment_likes')
        .delete()
        .match({ comment_id: commentId, user_id: currentUser.id });
    } else {
      await supabase
        .from('community_comment_likes')
        .insert({ comment_id: commentId, user_id: currentUser.id });
    }
  };

  // Flatten nested replies recursively for a root comment
  const getFlattenedReplies = (rootId: string, allComments: CommentItem[]) => {
    const descendants: CommentItem[] = [];
    const collect = (parentId: string) => {
      const children = allComments.filter(c => c.parent_id === parentId);
      for (const child of children) {
        descendants.push(child);
        collect(child.id);
      }
    };
    collect(rootId);
    return descendants.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const rootComments = comments.filter(c => !c.parent_id);

  return (
    <div className={`flex flex-col border-t ${darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100'}`}>
      
      {/* SCROLLABLE COMMENTS SECTION (Exact TikTok Style) */}
      <div ref={commentsContainerRef} className="flex-1 max-h-[220px] overflow-y-auto p-4 pb-0">
        {loading ? (
          <div className="text-[0.8rem] text-slate-400 text-center pb-4">Chargement...</div>
        ) : comments.length === 0 ? (
          <div className="text-[0.8rem] text-slate-400 text-center pb-4">Aucun commentaire.</div>
        ) : (
          rootComments.map(c => {
            const replies = getFlattenedReplies(c.id, comments);
            const showCount = visibleReplies[c.id] || 0;
            const isLiked = commentLikes.has(c.id);

            return (
              <div key={c.id} id={`comment-container-${c.id}`} className="mb-3">
                
                {/* Parent Comment */}
                <div className="flex gap-3">
                  <Link href={`/profile/${c.username || c.user_id}`}>
                    <UserAvatar
                      avatarUrl={c.avatar_url}
                      size={32}
                      className="shrink-0 mt-0.5"
                    />
                  </Link>
                  <div className="flex-1 flex justify-between items-start">
                    <div className="flex-1">
                      <Link href={`/profile/${c.username || c.user_id}`} className={`text-[0.85rem] font-semibold hover:underline no-underline ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {c.full_name}
                      </Link>
                      <div className={`text-[0.9rem] leading-relaxed my-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {c.content}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[0.75rem] text-slate-400">{getShortTimeAgo(c.created_at)}</span>
                        <button
                          type="button"
                          onClick={() => setReplyingTo({ id: c.id, name: c.full_name })}
                          className={`bg-transparent border-none text-[0.75rem] font-semibold cursor-pointer p-0 hover:underline ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
                        >
                          Répondre
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleCommentLike(c.id)}
                      className={`bg-transparent border-none cursor-pointer p-0 flex flex-col items-center ml-3 ${
                        isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      {c.likes_count > 0 && <span className="text-[0.65rem] mt-0.5 font-medium">{c.likes_count}</span>}
                    </button>
                  </div>
                </div>

                {/* Threaded Replies */}
                {showCount > 0 && replies.slice(0, showCount).map(r => {
                  const isReplyLiked = commentLikes.has(r.id);
                  const isDeepReply = r.parent_id !== c.id;
                  const parentComment = isDeepReply ? comments.find(p => p.id === r.parent_id) : null;
                  const showDeepReplyIndicator = isDeepReply && parentComment && r.user_id !== parentComment.user_id;

                  return (
                    <div key={r.id} id={`comment-container-${r.id}`} className="flex gap-2.5 mt-3 pl-11">
                      <Link href={`/profile/${r.username || r.user_id}`}>
                        <UserAvatar
                          avatarUrl={r.avatar_url}
                          size={24}
                          className="shrink-0 mt-0.5"
                        />
                      </Link>
                      <div className="flex-1 flex justify-between items-start">
                        <div className="flex-1">
                          <div className={`text-[0.8rem] font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            <Link href={`/profile/${r.username || r.user_id}`} className="text-inherit hover:underline no-underline">
                              {r.full_name}
                            </Link>
                            {showDeepReplyIndicator && (
                              <>
                                <span className="text-[0.65rem] text-slate-400">▸</span>
                                <Link href={`/profile/${parentComment.username || parentComment.user_id}`} className="text-inherit hover:underline no-underline">
                                  {parentComment.full_name}
                                </Link>
                              </>
                            )}
                          </div>
                          <div className={`text-[0.85rem] leading-relaxed my-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            {r.content}
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-[0.7rem] text-slate-400">{getShortTimeAgo(r.created_at)}</span>
                            <button
                              type="button"
                              onClick={() => setReplyingTo({ id: r.id, name: r.full_name })}
                              className={`bg-transparent border-none text-[0.7rem] font-semibold cursor-pointer p-0 hover:underline ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
                            >
                              Répondre
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleCommentLike(r.id)}
                          className={`bg-transparent border-none cursor-pointer p-0 flex flex-col items-center ml-3 ${
                            isReplyLiked ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isReplyLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          {r.likes_count > 0 && <span className="text-[0.65rem] mt-0.5 font-medium">{r.likes_count}</span>}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* View/Hide Replies Toggle - EXACT TIKTOK STYLE */}
                {replies.length > 0 && (
                  <div className="pl-11 mt-2">
                    <div className="flex items-center gap-4">
                      {showCount < replies.length && (
                        <button
                          type="button"
                          onClick={() => setVisibleReplies(prev => ({ ...prev, [c.id]: (prev[c.id] || 0) + 3 }))}
                          className={`flex items-center gap-2 bg-transparent border-none text-[0.75rem] font-semibold cursor-pointer p-0 ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          <div className={`w-6 h-[1px] ${darkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
                          Afficher {showCount === 0 ? (replies.length === 1 ? '1 réponse' : `${replies.length} de plus`) : `${replies.length - showCount} de plus`} ∨
                        </button>
                      )}
                      {showCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setVisibleReplies(prev => ({ ...prev, [c.id]: 0 }))}
                          className={`bg-transparent border-none text-[0.75rem] font-semibold cursor-pointer p-0 ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Masquer ∧
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* FIXED INPUT AT BOTTOM - TikTok Style */}
      <div className={`p-3 px-4 border-t ${darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100'}`}>
        {replyingTo && (
          <div className="flex items-center justify-between mb-2 text-[0.75rem] text-[#1677FF]">
            <span>En réponse à <b>{replyingTo.name}</b></span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="bg-transparent border-none text-[#1677FF] cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex gap-3 items-center">
          <UserAvatar
            avatarUrl={currentUser?.avatar_url}
            size={32}
            className="shrink-0"
          />
          <form
            onSubmit={handleCommentSubmit}
            className={`flex-1 flex items-center rounded-full px-4 py-1 border transition-colors ${
              darkMode 
                ? 'bg-[#0F172A] border-slate-700/80 focus-within:border-[#1677FF]' 
                : 'bg-slate-50 border-slate-200 focus-within:border-[#1677FF] focus-within:bg-white'
            }`}
          >
            <input
              type="text"
              placeholder={replyingTo ? `Répondre à ${replyingTo.name}...` : "Ajouter un commentaire..."}
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              className={`flex-1 bg-transparent border-none outline-none text-[0.9rem] ${
                darkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
              }`}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newCommentText.trim()}
              className={`ml-2 w-8 h-8 rounded-full border-none flex items-center justify-center transition-all ${
                newCommentText.trim() && !isSubmitting
                  ? 'bg-[#1677FF] text-white hover:bg-[#1266DF] cursor-pointer'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

function getShortTimeAgo(dateStr: string | null | undefined) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "à l'instant";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} h`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} j`;
}

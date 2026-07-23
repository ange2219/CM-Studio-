'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Send, Smile, Heart } from 'lucide-react';
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
}

export function CommentsThread({ postId, onCommentAdded, darkMode = false }: CommentsThreadProps) {
  const { user: currentUser } = useUser();
  const supabase = createClient();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [visibleReplies, setVisibleReplies] = useState<Record<string, number>>({});
  const [commentLikes, setCommentLikes] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments directly from community_comments and join user_public_profiles
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
            likes_count: 0,
          };
        });

        setComments(formatted);

        // Initialize visible replies map (default show 2 replies per thread)
        const initialVisible: Record<string, number> = {};
        formatted.filter(c => !c.parent_id).forEach(c => {
          initialVisible[c.id] = 2;
        });
        setVisibleReplies(initialVisible);

      } catch (err) {
        console.error('Erreur lors de la récupération des commentaires:', err);
        setComments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [postId, supabase]);

  // Handle new comment / reply submission
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
        username: null,
        likes_count: 0,
      };

      setComments(prev => [...prev, newCommentObj]);
      setNewCommentText('');
      setReplyingTo(null);

      // Expand visible replies counter for root thread
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

  // Toggle comment like
  const toggleCommentLike = async (commentId: string) => {
    if (!currentUser) return;
    const isLiked = commentLikes.has(commentId);
    setCommentLikes(prev => {
      const next = new Set(prev);
      if (isLiked) next.delete(commentId);
      else next.add(commentId);
      return next;
    });

    if (isLiked) {
      await supabase.from('community_comment_likes').delete().match({ comment_id: commentId, user_id: currentUser.id });
    } else {
      await supabase.from('community_comment_likes').insert({ comment_id: commentId, user_id: currentUser.id });
    }
  };

  // Collect descendants for a root comment
  const getFlattenedReplies = (rootId: string) => {
    const descendants: CommentItem[] = [];
    const collect = (pId: string) => {
      const children = comments.filter(c => c.parent_id === pId);
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
    <div className="flex flex-col gap-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
      
      {/* Reply Banner */}
      {replyingTo && (
        <div className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-lg transition-colors ${
          darkMode 
            ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50' 
            : 'bg-blue-50 text-[#1677FF] border border-blue-100'
        }`}>
          <span>Réponse à <strong className="font-semibold">{replyingTo.name}</strong></span>
          <button 
            type="button" 
            onClick={() => setReplyingTo(null)}
            className="hover:opacity-75 bg-transparent border-none cursor-pointer font-bold ml-2 text-inherit"
          >
            ✕ Annuler
          </button>
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleCommentSubmit} className="flex items-center gap-2.5">
        <UserAvatar
          avatarUrl={currentUser?.avatar_url}
          size={32}
          className="shrink-0"
        />
        <div className={`flex-1 flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all ${
          darkMode 
            ? 'bg-[#0F172A] border-slate-700/80 focus-within:border-[#1677FF]' 
            : 'bg-slate-50 border-slate-200 focus-within:border-[#1677FF] focus-within:bg-white'
        }`}>
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder={replyingTo ? `Répondre à ${replyingTo.name}...` : "Écrire un commentaire..."}
            className={`w-full text-[13px] bg-transparent outline-none ${
              darkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
            }`}
          />
          <button 
            type="button" 
            className={`p-1 transition-colors cursor-pointer bg-transparent border-none ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Smile className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={!newCommentText.trim() || isSubmitting}
            className={`p-1.5 rounded-full transition-all cursor-pointer border-none flex items-center justify-center ${
              newCommentText.trim() && !isSubmitting
                ? 'bg-[#1677FF] text-white hover:bg-[#1266DF]'
                : darkMode ? 'text-slate-600 cursor-not-allowed bg-transparent' : 'text-slate-300 cursor-not-allowed bg-transparent'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Comments & Threaded Replies List */}
      {loading ? (
        <div className="text-[12px] text-slate-400 py-2 text-center">Chargement des commentaires...</div>
      ) : comments.length === 0 ? (
        <div className="text-[12px] text-slate-400 py-2 text-center">Aucun commentaire pour le moment. Soyez le premier !</div>
      ) : (
        rootComments.map((c) => {
          const replies = getFlattenedReplies(c.id);
          const showCount = visibleReplies[c.id] ?? 2;
          const isLiked = commentLikes.has(c.id);

          return (
            <div key={c.id} className="flex flex-col gap-2">
              
              {/* Root Parent Comment */}
              <div className="flex gap-2.5 text-[13px]">
                <Link href={`/profile/${c.username || c.user_id}`}>
                  <UserAvatar
                    avatarUrl={c.avatar_url}
                    size={28}
                    className="shrink-0 mt-0.5"
                  />
                </Link>
                <div className="flex-1 flex flex-col">
                  <div className={`p-2.5 px-3 rounded-2xl ${
                    darkMode ? 'bg-[#0F172A]/80 text-slate-200' : 'bg-slate-100/80 text-slate-800'
                  }`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <Link href={`/profile/${c.username || c.user_id}`} className="font-bold text-[12px] hover:underline text-inherit no-underline">
                        {c.full_name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleCommentLike(c.id)}
                        className={`bg-transparent border-none cursor-pointer flex items-center gap-1 ${
                          isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                      </button>
                    </div>
                    <p className="text-[12.5px] leading-snug">{c.content}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 ml-2 text-[11px] text-slate-400">
                    <span className="text-[10px] text-slate-400">{getShortTimeAgo(c.created_at)}</span>
                    <button
                      type="button"
                      onClick={() => setReplyingTo({ id: c.id, name: c.full_name })}
                      className="font-bold hover:underline cursor-pointer bg-transparent border-none text-slate-500 dark:text-slate-400 p-0"
                    >
                      Répondre
                    </button>
                  </div>
                </div>
              </div>

              {/* Indented Threaded Replies */}
              {replies.length > 0 && (
                <div className="pl-9 flex flex-col gap-2 border-l-2 border-slate-100 dark:border-slate-800/60 ml-3.5 my-1">
                  {replies.slice(0, showCount).map((r) => {
                    const isReplyLiked = commentLikes.has(r.id);
                    const isDeepReply = r.parent_id !== c.id;
                    const parentComment = isDeepReply ? comments.find(item => item.id === r.parent_id) : null;
                    const showDeepIndicator = isDeepReply && parentComment && r.user_id !== parentComment.user_id;

                    return (
                      <div key={r.id} className="flex gap-2 text-[12.5px] pl-2">
                        <Link href={`/profile/${r.username || r.user_id}`}>
                          <UserAvatar
                            avatarUrl={r.avatar_url}
                            size={24}
                            className="shrink-0 mt-0.5"
                          />
                        </Link>
                        <div className="flex-1 flex flex-col">
                          <div className={`p-2 px-3 rounded-2xl ${
                            darkMode ? 'bg-[#0F172A]/60 text-slate-200' : 'bg-slate-100/60 text-slate-800'
                          }`}>
                            <div className="flex items-center justify-between mb-0.5">
                              <div className="flex items-center gap-1.5 text-[11.5px]">
                                <Link href={`/profile/${r.username || r.user_id}`} className="font-bold hover:underline text-inherit no-underline">
                                  {r.full_name}
                                </Link>
                                {showDeepIndicator && (
                                  <>
                                    <span className="text-slate-400 text-[10px]">▸</span>
                                    <span className="font-semibold text-slate-500 dark:text-slate-400">{parentComment.full_name}</span>
                                  </>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleCommentLike(r.id)}
                                className={`bg-transparent border-none cursor-pointer flex items-center gap-1 ${
                                  isReplyLiked ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                <Heart className={`w-3 h-3 ${isReplyLiked ? 'fill-rose-500' : ''}`} />
                              </button>
                            </div>
                            <p className="text-[12px] leading-snug">{r.content}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-1 ml-2 text-[10.5px] text-slate-400">
                            <span className="text-[10px] text-slate-400">{getShortTimeAgo(r.created_at)}</span>
                            <button
                              type="button"
                              onClick={() => setReplyingTo({ id: r.id, name: r.full_name })}
                              className="font-bold hover:underline cursor-pointer bg-transparent border-none text-slate-500 dark:text-slate-400 p-0"
                            >
                              Répondre
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Show more replies toggle */}
                  {replies.length > showCount && (
                    <button
                      type="button"
                      onClick={() => setVisibleReplies(prev => ({ ...prev, [c.id]: replies.length }))}
                      className="text-[11px] font-bold text-[#1677FF] hover:underline bg-transparent border-none cursor-pointer self-start pl-2 pt-1"
                    >
                      ── Voir {replies.length - showCount} réponse{replies.length - showCount > 1 ? 's' : ''} de plus
                    </button>
                  )}
                </div>
              )}

            </div>
          );
        })
      )}

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

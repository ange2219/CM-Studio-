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
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
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

  const loadComments = async () => {
    if (!post.db_id) return;
    setLoadingComments(true);
    
    // 1. Fetch raw comments directly from community_comments table
    const { data: commentsData } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', post.db_id)
      .order('created_at', { ascending: true });

    if (commentsData && commentsData.length > 0) {
      // 2. Fetch public profiles for user IDs in comments
      const userIds = Array.from(new Set(commentsData.map((c: any) => c.user_id)));
      const { data: usersData } = await supabase
        .from('user_public_profiles')
        .select('id, full_name, avatar_url, username')
        .in('id', userIds);

      const usersMap: Record<string, any> = {};
      if (usersData) {
        usersData.forEach((u: any) => { usersMap[u.id] = u; });
      }

      const formatted = commentsData.map((c: any) => {
        const u = usersMap[c.user_id];
        return {
          id: c.id,
          parent_id: c.parent_id || null,
          user_id: c.user_id,
          content: c.content,
          created_at: c.created_at,
          full_name: u?.full_name || 'Membre CM Studio',
          avatar_url: u?.avatar_url || null,
          username: u?.username || null,
        };
      });
      setComments(formatted);
    } else {
      setComments([]);
    }
    setLoadingComments(false);
  };

  const handleToggleComments = () => {
    const nextState = !showComments;
    setShowComments(nextState);
    if (nextState && comments.length === 0) {
      loadComments();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !user || !post.db_id) return;

    const commentText = newCommentText.trim();
    const parentId = replyingTo ? replyingTo.id : null;
    setNewCommentText('');
    setReplyingTo(null);

    const { data: inserted } = await supabase
      .from('community_comments')
      .insert({
        post_id: post.db_id,
        user_id: user.id,
        parent_id: parentId,
        content: commentText,
      })
      .select('*')
      .single();

    if (inserted) {
      const newCommentObj = {
        id: inserted.id,
        parent_id: parentId,
        user_id: user.id,
        content: commentText,
        created_at: inserted.created_at || new Date().toISOString(),
        full_name: user.full_name || 'Membre CM Studio',
        avatar_url: user.avatar_url || null,
        username: null,
      };
      setComments(prev => [...prev, newCommentObj]);
      setCommentsCount((prev: number) => prev + 1);
      if (!showComments) setShowComments(true);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/community#post-${post.id}`);
    }
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2200);
  };

  // Helpers for threaded comments
  const rootComments = comments.filter(c => !c.parent_id);

  const getFlattenedReplies = (rootId: string) => {
    const descendants: any[] = [];
    const collect = (parentId: string) => {
      const children = comments.filter(c => c.parent_id === parentId);
      for (const child of children) {
        descendants.push(child);
        collect(child.id);
      }
    };
    collect(rootId);
    return descendants.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
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
            onClick={handleToggleComments}
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
          onClick={handleToggleComments}
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

      {/* 3. Quick Comment Box & Threaded Comments List */}
      <div className="mt-2 flex flex-col gap-3">
        
        {/* Reply Indicator Banner */}
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

        {/* Comment Input Box */}
        <form onSubmit={handleAddComment} className="flex items-center gap-2.5 pt-1">
          <UserAvatar
            avatarUrl={user?.avatar_url}
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
              disabled={!newCommentText.trim()}
              className={`p-1.5 rounded-full transition-all cursor-pointer border-none flex items-center justify-center ${
                newCommentText.trim()
                  ? 'bg-[#1677FF] text-white hover:bg-[#1266DF]'
                  : darkMode ? 'text-slate-600 cursor-not-allowed bg-transparent' : 'text-slate-300 cursor-not-allowed bg-transparent'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Expandable Threaded Comments List */}
        {showComments && (
          <div className="flex flex-col gap-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
            {loadingComments ? (
              <div className="text-[12px] text-slate-400 py-2 text-center">Chargement des commentaires...</div>
            ) : comments.length === 0 ? (
              <div className="text-[12px] text-slate-400 py-2 text-center">Aucun commentaire pour le moment. Soyez le premier !</div>
            ) : (
              rootComments.map((c: any) => {
                const replies = getFlattenedReplies(c.id);

                return (
                  <div key={c.id} className="flex flex-col gap-2">
                    {/* Root Parent Comment */}
                    <div className="flex gap-2.5 text-[13px]">
                      <UserAvatar
                        avatarUrl={c.avatar_url}
                        size={28}
                        className="shrink-0 mt-0.5"
                      />
                      <div className="flex-1 flex flex-col">
                        <div className={`p-2.5 px-3 rounded-2xl ${
                          darkMode ? 'bg-[#0F172A]/80 text-slate-200' : 'bg-slate-100/80 text-slate-800'
                        }`}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-[12px]">{c.full_name}</span>
                          </div>
                          <p className="text-[12.5px] leading-snug">{c.content}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-1 ml-2 text-[11px] text-slate-400">
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

                    {/* Threaded Nested Replies */}
                    {replies.length > 0 && (
                      <div className="pl-9 flex flex-col gap-2 border-l-2 border-slate-100 dark:border-slate-800/60 ml-3.5 my-1">
                        {replies.map((r: any) => {
                          const isDeepReply = r.parent_id !== c.id;
                          const parentComment = isDeepReply ? comments.find((item: any) => item.id === r.parent_id) : null;
                          const showDeepIndicator = isDeepReply && parentComment && r.user_id !== parentComment.user_id;

                          return (
                            <div key={r.id} className="flex gap-2 text-[12.5px] pl-2">
                              <UserAvatar
                                avatarUrl={r.avatar_url}
                                size={24}
                                className="shrink-0 mt-0.5"
                              />
                              <div className="flex-1 flex flex-col">
                                <div className={`p-2 px-3 rounded-2xl ${
                                  darkMode ? 'bg-[#0F172A]/60 text-slate-200' : 'bg-slate-100/60 text-slate-800'
                                }`}>
                                  <div className="flex items-center gap-1.5 mb-0.5 text-[11.5px]">
                                    <span className="font-bold">{r.full_name}</span>
                                    {showDeepIndicator && (
                                      <>
                                        <span className="text-slate-400 text-[10px]">▸</span>
                                        <span className="font-semibold text-slate-500 dark:text-slate-400">{parentComment.full_name}</span>
                                      </>
                                    )}
                                  </div>
                                  <p className="text-[12px] leading-snug">{r.content}</p>
                                </div>
                                <div className="flex items-center gap-3 mt-1 ml-2 text-[10.5px] text-slate-400">
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
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

    </article>
  );
}

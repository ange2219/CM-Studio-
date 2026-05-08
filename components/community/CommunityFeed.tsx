'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, MessageCircle, Send, Sparkles } from 'lucide-react'

type Post = {
  id: string
  user_id: string
  content: string
  created_at: string
  full_name: string | null
  avatar_url: string | null
  plan: string | null
  likes_count: number
  comments_count: number
}

export function CommunityFeed({ 
  initialPosts, 
  currentUserId,
  initialLikedIds
}: { 
  initialPosts: Post[]
  currentUserId: string
  initialLikedIds: string[]
}) {
  const [posts, setPosts] = useState(initialPosts)
  const [likedIds, setLikedIds] = useState(new Set(initialLikedIds))
  const [newPostContent, setNewPostContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  
  // États pour les commentaires
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
  const [commentsByPost, setCommentsByPost] = useState<Record<string, any[]>>({})
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({})
  const [newCommentText, setNewCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  
  // Nouveaux états V2
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string, postId: string } | null>(null)
  const [commentLikes, setCommentLikes] = useState<Set<string>>(new Set()) // commentIds likés par l'user
  const [visibleReplies, setVisibleReplies] = useState<Record<string, number>>({}) // commentId -> count

  const supabase = createClient()

  // Charger les notifications (badge TopNav)
  async function createNotification(params: {
    userId: string, // destinataire
    type: 'post_like' | 'comment_like' | 'comment_reply',
    postId?: string,
    commentId?: string
  }) {
    if (params.userId === currentUserId) return 
    await supabase.from('notifications').insert({
      user_id: params.userId,
      actor_id: currentUserId,
      type: params.type,
      post_id: params.postId,
      comment_id: params.commentId
    })
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!newPostContent.trim() || isPosting) return

    setIsPosting(true)
    const { data, error } = await supabase
      .from('community_posts')
      .insert({ content: newPostContent.trim(), user_id: currentUserId })
      .select('id, created_at')
      .single()

    if (!error && data) {
      setPosts([{
        id: data.id,
        user_id: currentUserId,
        content: newPostContent.trim(),
        created_at: data.created_at,
        full_name: 'Moi',
        avatar_url: null,
        plan: null,
        likes_count: 0,
        comments_count: 0
      }, ...posts])
      setNewPostContent('')
    }
    setIsPosting(false)
  }

  async function toggleLike(post: any) {
    const isLiked = likedIds.has(post.id)
    const newLikedIds = new Set(likedIds)
    if (isLiked) newLikedIds.delete(post.id)
    else {
      newLikedIds.add(post.id)
      createNotification({ userId: post.user_id, type: 'post_like', postId: post.id })
    }
    setLikedIds(newLikedIds)

    setPosts(posts.map(p => {
      if (p.id === post.id) return { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) }
      return p
    }))

    if (isLiked) {
      await supabase.from('community_likes').delete().match({ post_id: post.id, user_id: currentUserId })
    } else {
      await supabase.from('community_likes').insert({ post_id: post.id, user_id: currentUserId })
    }
  }

  async function toggleComments(postId: string) {
    if (expandedPostId === postId) {
      // Réinitialiser l'affichage des réponses de ce post à la fermeture
      const commentsOfPost = commentsByPost[postId] || []
      const newVisible = { ...visibleReplies }
      commentsOfPost.forEach(c => { if (newVisible[c.id]) delete newVisible[c.id] })
      setVisibleReplies(newVisible)
      
      setExpandedPostId(null)
      setReplyingTo(null)
      return
    }

    setExpandedPostId(postId)
    if (!commentsByPost[postId]) {
      fetchComments(postId)
    }
  }

  async function fetchComments(postId: string) {
    setLoadingComments(prev => ({ ...prev, [postId]: true }))
    try {
      const { data: comments, error } = await supabase
        .from('community_comments')
        .select(`
          *,
          users (full_name, avatar_url, plan)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Likes globaux via RPC
      let countMap: Record<string, number> = {}
      try {
        const { data: counts } = await supabase.rpc('get_comment_likes_counts', { post_id_val: postId })
        if (counts) {
          countMap = counts.reduce((acc: any, curr: any) => ({ ...acc, [curr.comment_id]: curr.count }), {})
        }
      } catch (e) {}

      // Likes de l'user courant
      const { data: userLikes } = await supabase
        .from('community_comment_likes')
        .select('comment_id')
        .eq('user_id', currentUserId)

      const formatted = (comments || []).map(c => {
        const u = Array.isArray(c.users) ? c.users[0] : c.users
        return {
          id: c.id,
          content: c.content,
          created_at: c.created_at,
          user_id: c.user_id,
          parent_id: c.parent_id,
          full_name: u?.full_name || 'Utilisateur',
          avatar_url: u?.avatar_url,
          plan: u?.plan,
          likes_count: countMap[c.id] || 0
        }
      })

      setCommentsByPost(prev => ({ ...prev, [postId]: formatted }))
      const liked = new Set<string>()
      if (userLikes) userLikes.forEach(l => liked.add(l.comment_id))
      setCommentLikes(liked)
    } catch (err) {
      console.error("Fetch error:", err)
      setCommentsByPost(prev => ({ ...prev, [postId]: [] }))
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }))
    }
  }

  async function handleCommentSubmit(postId: string) {
    if (!newCommentText.trim() || isSubmittingComment) return
    setIsSubmittingComment(true)

    const payload: any = {
      post_id: postId,
      user_id: currentUserId,
      content: newCommentText.trim()
    }
    if (replyingTo && replyingTo.postId === postId) {
      payload.parent_id = replyingTo.id
    }

    const { data, error } = await supabase
      .from('community_comments')
      .insert(payload)
      .select('id, created_at')
      .single()

    if (!error && data) {
      const newComment = {
        id: data.id,
        content: newCommentText.trim(),
        created_at: data.created_at,
        user_id: currentUserId,
        parent_id: payload.parent_id || null,
        full_name: 'Moi',
        avatar_url: null,
        plan: null,
        likes_count: 0
      }
      
      setCommentsByPost(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }))
      
      // Notifications
      if (payload.parent_id) {
        const parentComment = (commentsByPost[postId] || []).find(c => c.id === payload.parent_id)
        if (parentComment) createNotification({ userId: parentComment.user_id, type: 'comment_reply', postId, commentId: data.id })
      } else {
        const post = posts.find(p => p.id === postId)
        if (post) createNotification({ userId: post.user_id, type: 'comment_reply', postId, commentId: data.id })
      }

      setPosts(posts.map(p => {
        if (p.id === postId) return { ...p, comments_count: p.comments_count + 1 }
        return p
      }))
      
      setNewCommentText('')
      setReplyingTo(null)
    }
    setIsSubmittingComment(false)
  }

  async function toggleCommentLike(comment: any) {
    const isLiked = commentLikes.has(comment.id)
    const newLiked = new Set(commentLikes)
    
    if (isLiked) {
      newLiked.delete(comment.id)
      await supabase.from('community_comment_likes').delete().match({ comment_id: comment.id, user_id: currentUserId })
    } else {
      newLiked.add(comment.id)
      createNotification({ userId: comment.user_id, type: 'comment_like', postId: expandedPostId!, commentId: comment.id })
      await supabase.from('community_comment_likes').insert({ comment_id: comment.id, user_id: currentUserId })
    }
    
    setCommentLikes(newLiked)
    setCommentsByPost(prev => ({
      ...prev,
      [expandedPostId!]: (prev[expandedPostId!] || []).map(c => 
        c.id === comment.id ? { ...c, likes_count: c.likes_count + (isLiked ? -1 : 1) } : c
      )
    }))
  }

  return (
    <div className="community-feed" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Create Post Form */}
      <div style={{ background: 'var(--card)', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--b1)', boxShadow: '0 4px 20px var(--shadow)' }}>
        <form onSubmit={handlePost}>
          <textarea 
            value={newPostContent}
            onChange={e => setNewPostContent(e.target.value)}
            placeholder="Partagez une astuce, posez une question à la communauté..."
            style={{ 
              width: '100%', minHeight: '60px', background: 'transparent', border: 'none', 
              color: 'var(--t1)', outline: 'none', resize: 'none', fontSize: '1rem',
              lineHeight: 1.5
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--b1)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '.8rem', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <Sparkles size={14} style={{ color: 'var(--accent)' }} /> Restez bienveillant.
            </span>
            <button 
              type="submit" 
              disabled={isPosting || !newPostContent.trim()}
              style={{ 
                background: 'var(--accent)', color: '#fff', padding: '.5rem 1.25rem', borderRadius: '25px', 
                border: 'none', fontWeight: 600, cursor: 'pointer', transition: '0.2s',
                opacity: (isPosting || !newPostContent.trim()) ? 0.5 : 1,
                display: 'flex', alignItems: 'center', gap: '.5rem'
              }}>
              <Send size={16} /> Publier
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {posts.map(post => {
          const isLiked = likedIds.has(post.id)
          const isExpanded = expandedPostId === post.id
          const allComments = commentsByPost[post.id] || []
          const isLoading = loadingComments[post.id]

          const rootComments = allComments.filter(c => !c.parent_id)
          const repliesMap = allComments.filter(c => c.parent_id).reduce((acc: any, c) => {
            if (!acc[c.parent_id]) acc[c.parent_id] = []
            acc[c.parent_id].push(c)
            return acc
          }, {})

          return (
            <div key={post.id} style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--b1)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', marginBottom: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {post.avatar_url ? <img src={post.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/> : <span style={{ color: 'var(--t2)', fontWeight: 600 }}>{post.full_name?.slice(0, 2).toUpperCase()}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.9rem' }}>
                      {post.full_name || 'Utilisateur'}
                      {post.plan && <span style={{ fontSize: '.6rem', background: 'var(--accent-light)', color: 'var(--accent)', padding: '.1rem .5rem', borderRadius: '10px', fontWeight: 700 }}>{post.plan.toUpperCase()}</span>}
                    </div>
                    <div style={{ fontSize: '.75rem', color: 'var(--t3)' }}>{new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                  </div>
                </div>

                <p style={{ color: 'var(--t1)', fontSize: '.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{post.content}</p>

                <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--b1)', paddingTop: '.75rem' }}>
                  <button onClick={() => toggleLike(post)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '.4rem', color: isLiked ? '#ef4444' : 'var(--t2)', cursor: 'pointer' }}>
                    <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} />
                    <span style={{ fontWeight: 600, fontSize: '.9rem' }}>{post.likes_count}</span>
                  </button>
                  <button onClick={() => toggleComments(post.id)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '.4rem', color: isExpanded ? 'var(--accent)' : 'var(--t2)', cursor: 'pointer' }}>
                    <MessageCircle size={18} fill={isExpanded ? 'var(--accent-light)' : 'none'} />
                    <span style={{ fontWeight: 600, fontSize: '.9rem' }}>{post.comments_count}</span>
                  </button>
                </div>
              </div>

              {/* Comment Section */}
              {isExpanded && (
                <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--b1)', display: 'flex', flexDirection: 'column', maxHeight: '450px' }}>
                  {/* List avec Scroll Interne */}
                  <div style={{ padding: '1rem 1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {isLoading ? (
                      <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--t3)', fontSize: '.85rem' }}>Chargement...</div>
                    ) : rootComments.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--t3)', fontSize: '.85rem' }}>Aucun commentaire.</div>
                    ) : (
                      rootComments.map(c => {
                        const replies = repliesMap[c.id] || []
                        const isCommentLiked = commentLikes.has(c.id)
                        const showCount = visibleReplies[c.id] || 0
                        const remaining = replies.length - showCount

                        return (
                          <div key={c.id}>
                            <div style={{ display: 'flex', gap: '.75rem' }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--s2)', flexShrink: 0, overflow: 'hidden' }}>
                                {c.avatar_url ? <img src={c.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/> : null}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--t1)' }}>{c.full_name}</div>
                                    <div style={{ fontSize: '.9rem', color: 'var(--t1)', margin: '2px 0', lineHeight: 1.4 }}>{c.content}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '4px' }}>
                                      <span style={{ fontSize: '.7rem', color: 'var(--t3)' }}>{new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                      <button onClick={() => setReplyingTo({ id: c.id, name: c.full_name, postId: post.id })} style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Répondre</button>
                                    </div>
                                  </div>
                                  <button onClick={() => toggleCommentLike(c)} style={{ background: 'none', border: 'none', color: isCommentLiked ? '#ef4444' : 'var(--t3)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 4px' }}>
                                    <Heart size={14} fill={isCommentLiked ? '#ef4444' : 'none'} />
                                    <span style={{ fontSize: '.65rem', fontWeight: 600 }}>{c.likes_count || ''}</span>
                                  </button>
                                </div>

                                {/* Réponses Progressives */}
                                {replies.length > 0 && (
                                  <div style={{ marginTop: '.75rem' }}>
                                    {replies.slice(0, showCount).map((r: any) => (
                                      <div key={r.id} style={{ display: 'flex', gap: '.75rem', marginTop: '.75rem' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--s2)', flexShrink: 0, overflow: 'hidden' }}>
                                          {r.avatar_url ? <img src={r.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/> : null}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div style={{ flex: 1 }}>
                                              <span style={{ fontWeight: 700, fontSize: '.8rem' }}>{r.full_name}</span>
                                              <p style={{ fontSize: '.85rem', margin: '2px 0' }}>{r.content}</p>
                                              <span style={{ fontSize: '.7rem', color: 'var(--t3)' }}>{new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                            <button onClick={() => toggleCommentLike(r)} style={{ background: 'none', border: 'none', color: commentLikes.has(r.id) ? '#ef4444' : 'var(--t3)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                              <Heart size={12} fill={commentLikes.has(r.id) ? '#ef4444' : 'none'} />
                                              <span style={{ fontSize: '.6rem', fontWeight: 600 }}>{r.likes_count || ''}</span>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    
                                    {showCount > 0 && (
                                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        {remaining > 0 && (
                                          <button 
                                            onClick={() => setVisibleReplies(prev => ({ ...prev, [c.id]: (prev[c.id] || 0) + 3 }))}
                                            style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', padding: '10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '30px', height: '1px', background: 'var(--b1)' }}></div>
                                            Afficher {remaining} réponse{remaining > 1 ? 's' : ''} ∨
                                          </button>
                                        )}
                                        <button 
                                          onClick={() => setVisibleReplies(prev => {
                                            const n = { ...prev }; delete n[c.id]; return n;
                                          })}
                                          style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', padding: '10px 0' }}>
                                          Masquer
                                        </button>
                                      </div>
                                    )}

                                    {showCount === 0 && remaining > 0 && (
                                      <button 
                                        onClick={() => setVisibleReplies(prev => ({ ...prev, [c.id]: 3 }))}
                                        style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', padding: '10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '30px', height: '1px', background: 'var(--b1)' }}></div>
                                        Afficher {remaining} réponse{remaining > 1 ? 's' : ''} ∨
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Input Fixe en bas */}
                  <div style={{ padding: '.75rem 1.25rem', borderTop: '1px solid var(--b1)', background: 'var(--card)' }}>
                    {replyingTo && replyingTo.postId === post.id && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem', fontSize: '.75rem', color: 'var(--accent)' }}>
                        <span>En réponse à <b>{replyingTo.name}</b></span>
                        <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>✕</button>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', background: 'var(--bg)', borderRadius: '20px', padding: '4px 8px 4px 16px', border: '1px solid var(--b1)' }}>
                      <input 
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                        placeholder="Votre commentaire..."
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(post.id) } }}
                        style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--t1)', outline: 'none', fontSize: '.9rem' }}
                      />
                      <button 
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={isSubmittingComment || !newCommentText.trim()}
                        style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: (isSubmittingComment || !newCommentText.trim()) ? 0.5 : 1 }}>
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}


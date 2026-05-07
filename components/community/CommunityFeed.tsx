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

  const supabase = createClient()

  // Charger les notifications (badge TopNav) si nécessaire, mais ici on gère surtout l'envoi
  async function createNotification(params: {
    userId: string, // destinataire
    type: 'post_like' | 'comment_like' | 'comment_reply',
    postId?: string,
    commentId?: string
  }) {
    if (params.userId === currentUserId) return // pas de notification pour soi-même
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
      // On récupère les commentaires et leurs likes
      const [commentsRes, likesRes] = await Promise.all([
        supabase
          .from('community_comments')
          .select(`
            id, content, created_at, user_id, parent_id,
            users:user_id (full_name, avatar_url, plan)
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true }),
        supabase
          .from('community_comment_likes')
          .select('comment_id')
          .eq('user_id', currentUserId)
      ])

      if (commentsRes.error) {
        console.error("Erreur chargement commentaires:", commentsRes.error)
        // Fallback si le RPC échoue ou n'existe pas encore
        setCommentsByPost(prev => ({ ...prev, [postId]: [] }))
        setLoadingComments(prev => ({ ...prev, [postId]: false }))
        return
      }

      // Tentative de récupération des comptes de likes via RPC
      let countMap: Record<string, number> = {}
      try {
        const { data: counts, error: rpcError } = await supabase.rpc('get_comment_likes_counts', { post_id_val: postId })
        if (!rpcError && counts) {
          countMap = counts.reduce((acc: any, curr: any) => ({ ...acc, [curr.comment_id]: curr.count }), {})
        }
      } catch (e) {
        console.warn("RPC get_comment_likes_counts non disponible, les likes seront à 0.")
      }

      const formatted = (commentsRes.data as any[]).map(c => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        user_id: c.user_id,
        parent_id: c.parent_id,
        full_name: c.users?.full_name || 'Utilisateur',
        avatar_url: c.users?.avatar_url,
        plan: c.users?.plan,
        likes_count: countMap[c.id] || 0
      }))

      setCommentsByPost(prev => ({ ...prev, [postId]: formatted }))
      
      const liked = new Set(commentLikes)
      if (likesRes.data) {
        likesRes.data.forEach(l => liked.add(l.comment_id))
      }
      setCommentLikes(liked)
    } catch (err) {
      console.error("Erreur critique fetchComments:", err)
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
        // Notifier l'auteur du commentaire parent
        const parentComment = commentsByPost[postId].find(c => c.id === payload.parent_id)
        if (parentComment) createNotification({ userId: parentComment.user_id, type: 'comment_reply', postId, commentId: data.id })
      } else {
        // Notifier l'auteur du post
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
      [expandedPostId!]: prev[expandedPostId!].map(c => 
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
              width: '100%', minHeight: '80px', background: 'transparent', border: 'none', 
              color: 'var(--t1)', outline: 'none', resize: 'none', fontSize: '1rem',
              lineHeight: 1.5
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--b1)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '.8rem', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <Sparkles size={14} style={{ color: 'var(--accent)' }} /> Restez bienveillant et constructif.
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
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--t3)', background: 'var(--card)', borderRadius: '16px', border: '1px dashed var(--b1)' }}>
            Soyez le premier à publier sur le mur d'entraide !
          </div>
        ) : (
          posts.map(post => {
            const isLiked = likedIds.has(post.id)
            const isExpanded = expandedPostId === post.id
            const allComments = commentsByPost[post.id] || []
            const isLoading = loadingComments[post.id]

            // Organiser les commentaires (parents en premier, puis leurs réponses)
            const rootComments = allComments.filter(c => !c.parent_id)
            const repliesMap = allComments.filter(c => c.parent_id).reduce((acc: any, c) => {
              if (!acc[c.parent_id]) acc[c.parent_id] = []
              acc[c.parent_id].push(c)
              return acc
            }, {})

            return (
              <div key={post.id} style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--b1)', overflow: 'hidden' }}>
                {/* Header & Content */}
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid var(--b1)' }}>
                      {post.avatar_url ? <img src={post.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/> : <span style={{ color: 'var(--t2)', fontWeight: 600 }}>{(post.full_name || 'U').slice(0, 2).toUpperCase()}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        {post.full_name || 'Utilisateur'}
                        {post.plan && <span style={{ fontSize: '.65rem', background: 'var(--accent-light)', color: 'var(--accent)', padding: '.2rem .6rem', borderRadius: '12px', fontWeight: 700 }}>{post.plan.toUpperCase()}</span>}
                      </div>
                      <div style={{ fontSize: '.8rem', color: 'var(--t3)' }}>
                        {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <p style={{ color: 'var(--t1)', fontSize: '1rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '1.25rem' }}>
                    {post.content}
                  </p>

                  <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid var(--b1)', paddingTop: '1rem' }}>
                    <button 
                      onClick={() => toggleLike(post)}
                      style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '.5rem', color: isLiked ? '#ef4444' : 'var(--t2)', cursor: 'pointer', transition: '0.2s' }}>
                      <Heart size={20} fill={isLiked ? '#ef4444' : 'none'} />
                      <span style={{ fontWeight: 600, fontSize: '.95rem' }}>{post.likes_count}</span>
                    </button>
                    <button 
                      onClick={() => toggleComments(post.id)}
                      style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '.5rem', color: isExpanded ? 'var(--accent)' : 'var(--t2)', cursor: 'pointer', transition: '0.2s' }}>
                      <MessageCircle size={20} fill={isExpanded ? 'var(--accent-light)' : 'none'} />
                      <span style={{ fontWeight: 600, fontSize: '.95rem' }}>{post.comments_count}</span>
                    </button>
                  </div>
                </div>

                {/* Comment Section */}
                {isExpanded && (
                  <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--b1)', padding: '1.25rem' }}>
                    {/* List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                      {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--t3)', fontSize: '.9rem' }}>Chargement des commentaires...</div>
                      ) : rootComments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--t3)', fontSize: '.9rem' }}>Aucun commentaire. Soyez le premier à répondre !</div>
                      ) : (
                        rootComments.map(c => {
                          const replies = repliesMap[c.id] || []
                          const isCommentLiked = commentLikes.has(c.id)
                          return (
                            <div key={c.id}>
                              {/* Parent Comment */}
                              <div style={{ display: 'flex', gap: '.75rem' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                  {c.avatar_url ? <img src={c.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/> : <span style={{ fontSize: '.75rem', fontWeight: 600 }}>{(c.full_name || 'U').slice(0, 1).toUpperCase()}</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                      <span style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--t1)', marginRight: '.5rem' }}>{c.full_name || 'Utilisateur'}</span>
                                      <p style={{ fontSize: '.9rem', color: 'var(--t1)', margin: '.25rem 0', lineHeight: 1.4 }}>{c.content}</p>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '.25rem' }}>
                                        <span style={{ fontSize: '.7rem', color: 'var(--t3)' }}>{new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                        <button 
                                          onClick={() => setReplyingTo({ id: c.id, name: c.full_name || 'Utilisateur', postId: post.id })}
                                          style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                                          Répondre
                                        </button>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => toggleCommentLike(c)}
                                      style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: isCommentLiked ? '#ef4444' : 'var(--t3)', cursor: 'pointer', padding: '0 4px' }}>
                                      <Heart size={14} fill={isCommentLiked ? '#ef4444' : 'none'} />
                                      <span style={{ fontSize: '.65rem', fontWeight: 600, marginTop: '2px' }}>{c.likes_count > 0 ? c.likes_count : ''}</span>
                                    </button>
                                  </div>

                                  {/* Replies */}
                                  {replies.length > 0 && (
                                    <div style={{ marginTop: '1rem', borderLeft: '2px solid var(--b1)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                      {replies.map((r: any) => {
                                        const isReplyLiked = commentLikes.has(r.id)
                                        return (
                                          <div key={r.id} style={{ display: 'flex', gap: '.75rem' }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                              {r.avatar_url ? <img src={r.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/> : <span style={{ fontSize: '.6rem', fontWeight: 600 }}>{(r.full_name || 'U').slice(0, 1).toUpperCase()}</span>}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                  <span style={{ fontWeight: 700, fontSize: '.8rem', color: 'var(--t1)', marginRight: '.5rem' }}>{r.full_name || 'Utilisateur'}</span>
                                                  <p style={{ fontSize: '.85rem', color: 'var(--t1)', margin: '.2rem 0', lineHeight: 1.4 }}>{r.content}</p>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '.2rem' }}>
                                                    <span style={{ fontSize: '.7rem', color: 'var(--t3)' }}>{new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                                    <button 
                                                      onClick={() => setReplyingTo({ id: c.id, name: r.full_name || 'Utilisateur', postId: post.id })}
                                                      style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                                                      Répondre
                                                    </button>
                                                  </div>
                                                </div>
                                                <button 
                                                  onClick={() => toggleCommentLike(r)}
                                                  style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: isReplyLiked ? '#ef4444' : 'var(--t3)', cursor: 'pointer', padding: '0 4px' }}>
                                                  <Heart size={12} fill={isReplyLiked ? '#ef4444' : 'none'} />
                                                  <span style={{ fontSize: '.6rem', fontWeight: 600, marginTop: '2px' }}>{r.likes_count > 0 ? r.likes_count : ''}</span>
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* Input Container */}
                    <div style={{ position: 'relative' }}>
                      {replyingTo && replyingTo.postId === post.id && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--accent-light)', padding: '.4rem 1rem', borderRadius: '10px 10px 0 0', marginBottom: '-1px', border: '1px solid var(--b1)', borderBottom: 'none' }}>
                          <span style={{ fontSize: '.75rem', color: 'var(--accent)', fontWeight: 600 }}>En réponse à {replyingTo.name}</span>
                          <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>✕</button>
                        </div>
                      )}
                      <div style={{ 
                        display: 'flex', gap: '.75rem', alignItems: 'center', 
                        background: 'var(--card)', border: '1px solid var(--b1)', 
                        borderRadius: replyingTo && replyingTo.postId === post.id ? '0 0 25px 25px' : '25px', 
                        padding: '.25rem .5rem .25rem 1.25rem' 
                      }}>
                        <input 
                          value={newCommentText}
                          onChange={e => setNewCommentText(e.target.value)}
                          placeholder={replyingTo ? "Ajouter une réponse..." : "Ajouter un commentaire..."}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(post.id) } }}
                          style={{ 
                            flex: 1, background: 'transparent', border: 'none', 
                            color: 'var(--t1)', outline: 'none', fontSize: '.95rem',
                            padding: '.5rem 0'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '.5rem', color: 'var(--t3)' }}>
                          <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>@</button>
                          <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>☺</button>
                        </div>
                        <button 
                          onClick={() => handleCommentSubmit(post.id)}
                          disabled={isSubmittingComment || !newCommentText.trim()}
                          style={{ 
                            background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '50%', 
                            width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', opacity: (isSubmittingComment || !newCommentText.trim()) ? 0.5 : 1
                          }}>
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}


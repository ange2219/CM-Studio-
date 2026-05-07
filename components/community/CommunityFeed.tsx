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

  const supabase = createClient()

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

  async function toggleLike(postId: string) {
    const isLiked = likedIds.has(postId)
    const newLikedIds = new Set(likedIds)
    if (isLiked) newLikedIds.delete(postId)
    else newLikedIds.add(postId)
    setLikedIds(newLikedIds)

    setPosts(posts.map(p => {
      if (p.id === postId) return { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) }
      return p
    }))

    if (isLiked) {
      await supabase.from('community_likes').delete().match({ post_id: postId, user_id: currentUserId })
    } else {
      await supabase.from('community_likes').insert({ post_id: postId, user_id: currentUserId })
    }
  }

  async function toggleComments(postId: string) {
    if (expandedPostId === postId) {
      setExpandedPostId(null)
      return
    }

    setExpandedPostId(postId)
    if (!commentsByPost[postId]) {
      fetchComments(postId)
    }
  }

  async function fetchComments(postId: string) {
    setLoadingComments(prev => ({ ...prev, [postId]: true }))
    
    // Jointure manuelle ou via vue si disponible, ici on simule la jointure avec users
    const { data, error } = await supabase
      .from('community_comments')
      .select(`
        id, content, created_at, user_id,
        users:user_id (full_name, avatar_url, plan)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      const formatted = (data as any[]).map(c => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        full_name: c.users?.full_name,
        avatar_url: c.users?.avatar_url,
        plan: c.users?.plan
      }))
      setCommentsByPost(prev => ({ ...prev, [postId]: formatted }))
    }
    setLoadingComments(prev => ({ ...prev, [postId]: false }))
  }

  async function handleCommentSubmit(postId: string) {
    if (!newCommentText.trim() || isSubmittingComment) return
    setIsSubmittingComment(true)

    const { data, error } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        user_id: currentUserId,
        content: newCommentText.trim()
      })
      .select('id, created_at')
      .single()

    if (!error && data) {
      // Update local comments
      const newComment = {
        id: data.id,
        content: newCommentText.trim(),
        created_at: data.created_at,
        full_name: 'Moi',
        avatar_url: null,
        plan: null
      }
      setCommentsByPost(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }))
      
      // Update post comment count
      setPosts(posts.map(p => {
        if (p.id === postId) return { ...p, comments_count: p.comments_count + 1 }
        return p
      }))
      
      setNewCommentText('')
    }
    setIsSubmittingComment(false)
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
            const comments = commentsByPost[post.id] || []
            const isLoading = loadingComments[post.id]

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
                      onClick={() => toggleLike(post.id)}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                      {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--t3)', fontSize: '.9rem' }}>Chargement des commentaires...</div>
                      ) : comments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--t3)', fontSize: '.9rem' }}>Aucun commentaire. Soyez le premier à répondre !</div>
                      ) : (
                        comments.map(c => (
                          <div key={c.id} style={{ display: 'flex', gap: '.75rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                              {c.avatar_url ? <img src={c.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/> : <span style={{ fontSize: '.75rem', fontWeight: 600 }}>{(c.full_name || 'U').slice(0, 1).toUpperCase()}</span>}
                            </div>
                            <div style={{ flex: 1, background: 'var(--card)', padding: '.75rem 1rem', borderRadius: '12px', border: '1px solid var(--b1)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.25rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--t1)' }}>{c.full_name || 'Utilisateur'}</span>
                                <span style={{ fontSize: '.7rem', color: 'var(--t3)' }}>{new Date(c.created_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p style={{ fontSize: '.9rem', color: 'var(--t1)', margin: 0, lineHeight: 1.4 }}>{c.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Input */}
                    <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
                      <input 
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                        placeholder="Votre réponse..."
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(post.id) } }}
                        style={{ 
                          flex: 1, background: 'var(--card)', border: '1px solid var(--b1)', 
                          borderRadius: '20px', padding: '.5rem 1.25rem', color: 'var(--t1)', outline: 'none',
                          fontSize: '.9rem'
                        }}
                      />
                      <button 
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={isSubmittingComment || !newCommentText.trim()}
                        style={{ 
                          background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '50%', 
                          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', opacity: (isSubmittingComment || !newCommentText.trim()) ? 0.5 : 1
                        }}>
                        <Send size={16} />
                      </button>
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


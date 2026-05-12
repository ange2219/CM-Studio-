'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, MessageCircle, Send, Sparkles, Share2, Bookmark, SlidersHorizontal, Image as ImageIcon } from 'lucide-react'

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
  image_url?: string
  group_name?: string
}

export function CommunityFeed({ 
  initialPosts, 
  currentUserId,
  initialLikedIds,
  userId,
  userRole
}: { 
  initialPosts: Post[]
  currentUserId: string
  initialLikedIds: string[]
  userId?: string
  userRole?: string
}) {
  const [posts, setPosts] = useState(initialPosts)
  const [likedIds, setLikedIds] = useState(new Set(initialLikedIds))
  const [activeTab, setActiveTab] = useState('pour-vous')
  const [newPostContent, setNewPostContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
  const [commentsByPost, setCommentsByPost] = useState<Record<string, any[]>>({})
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({})
  const [newCommentText, setNewCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string, postId: string } | null>(null)
  const [commentLikes, setCommentLikes] = useState<Set<string>>(new Set())
  const [visibleReplies, setVisibleReplies] = useState<Record<string, number>>({})

  const supabase = createClient()

  async function createNotification(params: {
    userId: string,
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
        full_name: 'Ulrich H.',
        avatar_url: null,
        plan: 'Premium',
        likes_count: 0,
        comments_count: 0,
        group_name: 'Général'
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
      const { data: comments, error } = await supabase
        .from('community_comments')
        .select(`*, users (full_name, avatar_url, plan)`)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error

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
          likes_count: 0
        }
      })
      setCommentsByPost(prev => ({ ...prev, [postId]: formatted }))
    } catch (err) {
      setCommentsByPost(prev => ({ ...prev, [postId]: [] }))
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }))
    }
  }

  async function handleCommentSubmit(postId: string) {
    if (!newCommentText.trim() || isSubmittingComment) return
    setIsSubmittingComment(true)
    const payload: any = { post_id: postId, user_id: currentUserId, content: newCommentText.trim() }
    if (replyingTo && replyingTo.postId === postId) payload.parent_id = replyingTo.id

    const { data, error } = await supabase.from('community_comments').insert(payload).select('id, created_at').single()
    if (!error && data) {
      const newComment = { id: data.id, content: newCommentText.trim(), created_at: data.created_at, user_id: currentUserId, parent_id: payload.parent_id || null, full_name: 'Ulrich H.', avatar_url: null, plan: 'Premium', likes_count: 0 }
      setCommentsByPost(prev => ({ ...prev, [postId]: [...(prev[postId] || []), newComment] }))
      setPosts(posts.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
      setNewCommentText('')
      setReplyingTo(null)
    }
    setIsSubmittingComment(false)
  }

  const tabs = [
    { id: 'pour-vous', label: 'Pour vous' },
    { id: 'communaute', label: 'Communauté' },
    { id: 'groupe', label: 'Groupe' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* TABS & FILTER (Mockup style) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '2px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none', padding: '12px 4px', fontSize: '0.9rem', fontWeight: activeTab === tab.id ? 700 : 500, color: activeTab === tab.id ? '#fff' : 'var(--text3)', cursor: 'pointer', position: 'relative', transition: 'all 0.2s'
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '2px', background: 'var(--accent)', borderRadius: '2px' }} />
              )}
            </button>
          ))}
        </div>
        <button style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: '8px' }}>
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* CREATE POST (Mockup inspired) */}
      <div style={{ background: 'var(--card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-light)', flexShrink: 0 }} />
          <textarea 
            value={newPostContent}
            onChange={e => setNewPostContent(e.target.value)}
            placeholder="Partagez quelque chose avec la communauté..."
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', resize: 'none', fontSize: '0.95rem', paddingTop: '8px' }}
            rows={1}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ImageIcon size={18} /> <span style={{ fontSize: '0.8rem' }}>Image</span>
            </button>
            <button style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={18} /> <span style={{ fontSize: '0.8rem' }}>IA Assist</span>
            </button>
          </div>
          <button 
            onClick={handlePost}
            disabled={!newPostContent.trim() || isPosting}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', opacity: !newPostContent.trim() ? 0.5 : 1 }}
          >
            Publier
          </button>
        </div>
      </div>

      {/* POSTS LIST (Exactly like mockup) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)', background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            Le flux est vide. Soyez le premier à publier !
          </div>
        )}
        
        {posts.map(post => {
          const isLiked = likedIds.has(post.id)
          return (
            <div key={post.id} style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              {/* Post Header */}
              <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-light)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {post.avatar_url ? <img src={post.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{post.full_name?.slice(0, 1)}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{post.full_name || 'Utilisateur'}</span>
                      {post.plan && <span style={{ fontSize: '0.65rem', background: '#F59E0B', color: '#000', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>{post.plan.toUpperCase()}</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>
                      Publication dans le groupe {post.group_name || 'Général'} • Il y a 2h
                    </div>
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>
                  <SlidersHorizontal size={16} />
                </button>
              </div>

              {/* Post Content */}
              <div style={{ padding: '0 16px 16px', fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.5 }}>
                {post.content}
              </div>


              {/* Stats Row */}
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart size={10} fill="#fff" color="#fff" /></div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{post.likes_count + (isLiked ? 1 : 0)}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)', display: 'flex', gap: '12px' }}>
                  <span>{post.comments_count} commentaires</span>
                  <span>32 partages</span>
                </div>
              </div>

              {/* Actions Row */}
              <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button 
                  onClick={() => toggleLike(post)}
                  style={{ background: 'none', border: 'none', color: isLiked ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, padding: '8px' }}
                >
                  <Heart size={18} fill={isLiked ? 'var(--accent)' : 'none'} /> J&apos;aime
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, padding: '8px' }}
                >
                  <MessageCircle size={18} /> Commenter
                </button>
                <button style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, padding: '8px' }}>
                  <Share2 size={18} /> Partager
                </button>
                <button style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, padding: '8px' }}>
                  <Bookmark size={18} /> Enregistrer
                </button>
              </div>

              {/* Comments Section */}
              {expandedPostId === post.id && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-light)', flexShrink: 0 }} />
                    <input 
                      type="text" 
                      placeholder="Votre commentaire..." 
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCommentSubmit(post.id)}
                      style={{ flex: 1, background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 12px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                  {/* ... Existing comment list logic could go here ... */}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

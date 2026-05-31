'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, MessageCircle, Send, Sparkles, Share2, Bookmark, SlidersHorizontal, Image as ImageIcon, Globe, Users } from 'lucide-react'

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
  is_community?: boolean
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
  if (diffInDays < 7) return `${diffInDays} j`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} sem`;
}

export function CommunityFeed({ 
  initialPosts, 
  currentUser,
  initialLikedIds,
}: { 
  initialPosts: Post[]
  currentUser: any
  initialLikedIds: string[]
}) {
  const [posts, setPosts] = useState(initialPosts)
  const [likedIds, setLikedIds] = useState(new Set(initialLikedIds))
  const [savedIds, setSavedIds] = useState(new Set<string>())
  const [newPostContent, setNewPostContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
  const [commentsByPost, setCommentsByPost] = useState<Record<string, any[]>>({})
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({})
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>({})
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string, postId: string } | null>(null)
  const [visibleReplies, setVisibleReplies] = useState<Record<string, number>>({})
  const [commentLikes, setCommentLikes] = useState<Set<string>>(new Set())

  const supabase = createClient()

  useEffect(() => {
    // Scroll and expand if coming from a notification URL hash (e.g. #post-123 or #comment-456-123)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash
      
      if (hash.startsWith('#post-')) {
        const id = hash.replace('#post-', '')
        setTimeout(() => {
          const el = document.getElementById(`post-container-${id}`)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            if (expandedPostId !== id) {
              setExpandedPostId(id)
              fetchComments(id)
            }
          }
          // Clear hash to prevent infinite reopening
          window.history.replaceState(null, '', window.location.pathname)
        }, 500)
      } else if (hash.startsWith('#comment-')) {
        const parts = hash.replace('#comment-', '').split('-')
        if (parts.length >= 2) {
          const commentId = parts[0]
          const postId = parts[1]
          setTimeout(() => {
            const el = document.getElementById(`post-container-${postId}`)
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' })
              if (expandedPostId !== postId) {
                setExpandedPostId(postId)
                fetchComments(postId).then(() => {
                  setTimeout(() => {
                    const cEl = document.getElementById(`comment-container-${commentId}`)
                    if (cEl) cEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }, 500)
                })
              } else {
                const cEl = document.getElementById(`comment-container-${commentId}`)
                if (cEl) cEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            }
            // Clear hash to prevent infinite reopening
            window.history.replaceState(null, '', window.location.pathname)
          }, 500)
        }
      }
    }
  }, [expandedPostId])

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!newPostContent.trim() && !uploadedImageUrl) return
    if (isPosting) return
    setIsPosting(true)
    const payload = { content: newPostContent.trim(), user_id: currentUser.id, image_url: uploadedImageUrl || null }
    const { data, error } = await supabase.from('community_posts').insert(payload).select('id, created_at').single()
    if (!error && data) {
      setPosts([{ 
        id: data.id, 
        user_id: currentUser.id, 
        content: newPostContent.trim(), 
        created_at: data.created_at, 
        full_name: currentUser.full_name || 'Utilisateur', 
        avatar_url: currentUser.avatar_url, 
        plan: currentUser.plan || 'Free', 
        likes_count: 0, 
        comments_count: 0, 
        image_url: uploadedImageUrl || undefined,
        group_name: 'Communauté',
        is_community: true
      }, ...posts])
      setNewPostContent('')
      setUploadedImageUrl(null)
    } else if (error) {
      console.error("Erreur lors de la publication:", error)
    }
    setIsPosting(false)
  }

  async function toggleLike(post: any) {
    const isLiked = likedIds.has(post.id)
    const newLikedIds = new Set(likedIds)
    if (isLiked) newLikedIds.delete(post.id)
    else newLikedIds.add(post.id)
    setLikedIds(newLikedIds)
    setPosts(posts.map(p => p.id === post.id ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) } : p))
    if (isLiked) await supabase.from('community_likes').delete().match({ post_id: post.id, user_id: currentUser.id })
    else await supabase.from('community_likes').insert({ post_id: post.id, user_id: currentUser.id })
  }

  async function toggleCommentLike(commentId: string, postId: string) {
    const isLiked = commentLikes.has(commentId)
    const newCommentLikes = new Set(commentLikes)
    if (isLiked) newCommentLikes.delete(commentId)
    else newCommentLikes.add(commentId)
    setCommentLikes(newCommentLikes)
    
    setCommentsByPost(prev => {
      const updated = { ...prev }
      if (updated[postId]) {
        updated[postId] = updated[postId].map(c => 
          c.id === commentId ? { ...c, likes_count: c.likes_count + (isLiked ? -1 : 1) } : c
        )
      }
      return updated
    })
  }

  async function toggleComments(postId: string) {
    if (expandedPostId === postId) {
      setExpandedPostId(null)
      setReplyingTo(null)
      return
    }
    setExpandedPostId(postId)
    if (!commentsByPost[postId]) fetchComments(postId)
  }

  async function fetchComments(postId: string) {
    setLoadingComments(prev => ({ ...prev, [postId]: true }))
    try {
      const { data: comments, error } = await supabase.from('community_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true })
      if (error) throw error
      
      let usersMap: Record<string, any> = {}
      if (comments && comments.length > 0) {
        const userIds = [...new Set(comments.map(c => c.user_id))]
        const { data: usersData } = await supabase.from('users').select('id, full_name, avatar_url, plan').in('id', userIds)
        if (usersData) {
          usersMap = Object.fromEntries(usersData.map(u => [u.id, u]))
        }
      }

      const formatted = (comments || []).map(c => {
        const u = usersMap[c.user_id]
        return { id: c.id, content: c.content, created_at: c.created_at, user_id: c.user_id, parent_id: c.parent_id, full_name: u?.full_name || 'Utilisateur', avatar_url: u?.avatar_url, plan: u?.plan, likes_count: 0 }
      })
      setCommentsByPost(prev => ({ ...prev, [postId]: formatted }))
      
      const initialVisible: Record<string, number> = {}
      formatted.filter(c => !c.parent_id).forEach(c => initialVisible[c.id] = 0)
      setVisibleReplies(prev => ({ ...prev, ...initialVisible }))
    } catch (err) {
      console.error("Erreur lors de la récupération des commentaires:", err)
      setCommentsByPost(prev => ({ ...prev, [postId]: [] }))
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }))
    }
  }

  async function handleCommentSubmit(postId: string) {
    const text = newCommentTexts[postId] || ''
    if (!text.trim() || isSubmittingComment) return
    setIsSubmittingComment(true)
    const payload: any = { post_id: postId, user_id: currentUser.id, content: text.trim() }
    if (replyingTo && replyingTo.postId === postId) payload.parent_id = replyingTo.id
    const { data, error } = await supabase.from('community_comments').insert(payload).select('id, created_at').single()
    if (!error && data) {
      const newComment = { id: data.id, content: text.trim(), created_at: data.created_at, user_id: currentUser.id, parent_id: payload.parent_id || null, full_name: currentUser.full_name || 'Utilisateur', avatar_url: currentUser.avatar_url, plan: currentUser.plan || 'Free', likes_count: 0 }
      setCommentsByPost(prev => ({ ...prev, [postId]: [...(prev[postId] || []), newComment] }))
      setPosts(posts.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
      setNewCommentTexts(prev => ({ ...prev, [postId]: '' }))
      setReplyingTo(null)
      
      if (payload.parent_id) {
        // Find the root parent ID to increment the correct visibleReplies counter
        let rootId = payload.parent_id
        const postComments = commentsByPost[postId] || []
        let curr = postComments.find(x => x.id === rootId)
        while (curr && curr.parent_id) {
          rootId = curr.parent_id
          curr = postComments.find(x => x.id === rootId)
        }
        setVisibleReplies(prev => ({ ...prev, [rootId]: (prev[rootId] || 0) + 1 }))
      }
    } else if (error) {
      console.error("Erreur lors de l'insertion du commentaire :", error)
      alert("Erreur: " + error.message)
    }
    setIsSubmittingComment(false)
  }

  const getFlattenedReplies = (rootId: string, allComments: any[]) => {
    const descendants: any[] = []
    const collect = (parentId: string) => {
      const children = allComments.filter(c => c.parent_id === parentId)
      for (const child of children) {
        descendants.push(child)
        collect(child.id)
      }
    }
    collect(rootId)
    return descendants.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  const filteredPosts = posts

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* CREATE POST */}
      <div style={{ background: 'var(--card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--b1)' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(var(--accent-rgb), 0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>U</div>
          <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder="Partagez quelque chose avec la communauté..." style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--t1)', outline: 'none', resize: 'none', fontSize: '0.95rem', paddingTop: '8px' }} rows={1} />
        </div>
        
        {uploadedImageUrl && (
          <div style={{ padding: '8px 12px 12px 52px', position: 'relative' }}>
            <img src={uploadedImageUrl} style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid var(--b1)' }} alt="Upload preview" />
            <button onClick={() => setUploadedImageUrl(null)} style={{ position: 'absolute', top: 0, left: '235px', background: 'var(--card)', border: '1px solid var(--b1)', color: 'var(--t1)', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✕</button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--b1)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="file" id="community-image-upload" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setUploadingImage(true)
              const formData = new FormData()
              formData.append('file', file)
              try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData })
                const data = await res.json()
                if (data.url) setUploadedImageUrl(data.url)
              } catch (err) {
                console.error(err)
              }
              setUploadingImage(false)
            }} />
            <button onClick={() => document.getElementById('community-image-upload')?.click()} disabled={uploadingImage} style={{ background: 'none', border: 'none', color: uploadedImageUrl ? 'var(--accent)' : 'var(--t3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><ImageIcon size={18} /> <span style={{ fontSize: '0.8rem' }}>{uploadingImage ? 'Upload...' : 'Image'}</span></button>
            <button style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={18} /> <span style={{ fontSize: '0.8rem' }}>IA Assist</span></button>
          </div>
          <button onClick={handlePost} disabled={(!newPostContent.trim() && !uploadedImageUrl) || isPosting} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', opacity: (!newPostContent.trim() && !uploadedImageUrl) ? 0.5 : 1 }}>Publier</button>
        </div>
      </div>

      {/* POSTS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredPosts.map(post => {
          const isLiked = likedIds.has(post.id)
          const isExpanded = expandedPostId === post.id
          const postComments = commentsByPost[post.id] || []
          const isLoading = loadingComments[post.id]

          return (
            <div key={post.id} id={`post-container-${post.id}`} style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--b1)', overflow: 'hidden' }}>
              {/* Post Header */}
              <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(var(--accent-rgb), 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {post.avatar_url ? <img src={post.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt=""/> : <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{post.full_name?.slice(0, 1)}</span>}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--t1)' }}>{post.full_name || 'Utilisateur'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {post.group_name && post.group_name !== 'Général' && post.group_name !== 'Communauté' ? (
                      <Users size={12} />
                    ) : (
                      <Globe size={12} />
                    )}
                    <span>•</span>
                    <span>{getShortTimeAgo(post.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div style={{ padding: '0 16px 16px', fontSize: '0.95rem', color: 'var(--t1)', lineHeight: 1.5 }} id={`post-${post.id}`}>
                {post.content}
                {post.image_url && (
                  <div style={{ marginTop: '12px' }}>
                    <img src={post.image_url} style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--b1)' }} alt="Post image" />
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--b1)' }}>
                <button onClick={() => toggleLike(post)} style={{ background: 'none', border: 'none', color: isLiked ? 'var(--accent)' : 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, padding: '8px 0' }}><Heart size={18} fill={isLiked ? 'var(--accent)' : 'none'} /> {post.likes_count + (isLiked ? 1 : 0)}</button>
                <button onClick={() => toggleComments(post.id)} style={{ background: 'none', border: 'none', color: isExpanded ? 'var(--accent)' : 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, padding: '8px 0' }}><MessageCircle size={18} /> {post.comments_count}</button>
                <button onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Post de la communauté CM Studio',
                      text: post.content.slice(0, 50) + '...',
                      url: `${window.location.origin}/community#post-${post.id}`
                    }).catch(() => {})
                  } else {
                    navigator.clipboard.writeText(`${window.location.origin}/community#post-${post.id}`)
                  }
                }} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, padding: '8px 0' }}><Share2 size={18} /></button>
                
                <button onClick={() => {
                  const newSaved = new Set(savedIds);
                  if (newSaved.has(post.id)) newSaved.delete(post.id);
                  else newSaved.add(post.id);
                  setSavedIds(newSaved);
                }} style={{ background: 'none', border: 'none', color: savedIds.has(post.id) ? 'var(--accent)' : 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, padding: '8px 0', marginLeft: 'auto' }}>
                  <Bookmark size={18} fill={savedIds.has(post.id) ? 'var(--accent)' : 'none'} />
                </button>
              </div>

              {/* SCROLLABLE COMMENTS SECTION (TikTok Style) */}
              {isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--card)', borderTop: '1px solid var(--b1)' }}>
                  <div className="sb-scroll" style={{ flex: 1, maxHeight: '220px', overflowY: 'auto', padding: '16px 16px 0 16px' }}>
                    {isLoading ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--t3)', textAlign: 'center', paddingBottom: '16px' }}>Chargement...</div>
                    ) : postComments.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--t3)', textAlign: 'center', paddingBottom: '16px' }}>Aucun commentaire.</div>
                    ) : (
                      postComments.filter(c => !c.parent_id).map(c => {
                        const replies = getFlattenedReplies(c.id, postComments)
                        const showCount = visibleReplies[c.id] || 0
                        const isLiked = commentLikes.has(c.id)

                        return (
                          <div key={c.id} id={`comment-container-${c.id}`} style={{ marginBottom: '16px' }}>
                            {/* Parent Comment */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(var(--accent-rgb), 0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)' }}>
                                {c.avatar_url ? <img src={c.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt=""/> : c.full_name?.slice(0, 1) || 'U'}
                              </div>
                              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--t2)' }}>{c.full_name}</div>
                                  <div style={{ fontSize: '0.9rem', color: 'var(--t1)', lineHeight: 1.4, margin: '2px 0' }}>{c.content}</div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--t3)' }}>{getShortTimeAgo(c.created_at)}</span>
                                    <button onClick={() => setReplyingTo({ id: c.id, name: c.full_name, postId: post.id })} style={{ background: 'none', border: 'none', color: 'var(--t2)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Répondre</button>
                                  </div>
                                </div>
                                <button onClick={() => toggleCommentLike(c.id, post.id)} style={{ background: 'none', border: 'none', color: isLiked ? '#ef4444' : 'var(--t3)', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '12px' }}>
                                  <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} />
                                  {c.likes_count > 0 && <span style={{ fontSize: '0.65rem', marginTop: '2px' }}>{c.likes_count}</span>}
                                </button>
                              </div>
                            </div>

                            {/* Threaded Replies */}
                            {showCount > 0 && replies.slice(0, showCount).map(r => {
                              const isReplyLiked = commentLikes.has(r.id)
                              const isDeepReply = r.parent_id !== c.id
                              const parentComment = isDeepReply ? postComments.find(p => p.id === r.parent_id) : null
                              const showDeepReplyIndicator = isDeepReply && parentComment && r.user_id !== parentComment.user_id
                              
                              return (
                                <div key={r.id} id={`comment-container-${r.id}`} style={{ display: 'flex', gap: '10px', marginTop: '12px', paddingLeft: '44px' }}>
                                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(var(--accent-rgb), 0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: 'var(--accent)' }}>
                                    {r.avatar_url ? <img src={r.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt=""/> : r.full_name?.slice(0, 1) || 'U'}
                                  </div>
                                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {r.full_name}
                                        {showDeepReplyIndicator && (
                                          <>
                                            <span style={{ fontSize: '0.65rem' }}>▸</span>
                                            <span>{parentComment.full_name}</span>
                                          </>
                                        )}
                                      </div>
                                      <div style={{ fontSize: '0.85rem', color: 'var(--t1)', lineHeight: 1.4, margin: '2px 0' }}>{r.content}</div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--t3)' }}>{getShortTimeAgo(r.created_at)}</span>
                                        <button onClick={() => setReplyingTo({ id: r.id, name: r.full_name, postId: post.id })} style={{ background: 'none', border: 'none', color: 'var(--t2)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Répondre</button>
                                      </div>
                                    </div>
                                    <button onClick={() => toggleCommentLike(r.id, post.id)} style={{ background: 'none', border: 'none', color: isReplyLiked ? '#ef4444' : 'var(--t3)', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '12px' }}>
                                      <Heart size={14} fill={isReplyLiked ? '#ef4444' : 'none'} />
                                      {r.likes_count > 0 && <span style={{ fontSize: '0.65rem', marginTop: '2px' }}>{r.likes_count}</span>}
                                    </button>
                                  </div>
                                </div>
                              )
                            })}

                            {/* View/Hide Replies Toggle - EXACT TIKTOK STYLE */}
                            {replies.length > 0 && (
                              <div style={{ paddingLeft: '44px', marginTop: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  {showCount < replies.length && (
                                    <button 
                                      onClick={() => setVisibleReplies(prev => ({ ...prev, [c.id]: (prev[c.id] || 0) + 3 }))}
                                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--t2)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                    >
                                      <div style={{ width: '24px', height: '1px', background: 'var(--b2)' }}></div>
                                      Afficher {showCount === 0 ? (replies.length === 1 ? '1 réponse' : `${replies.length} de plus`) : `${replies.length - showCount} de plus`} ∨
                                    </button>
                                  )}
                                  {showCount > 0 && (
                                    <button 
                                      onClick={() => setVisibleReplies(prev => ({ ...prev, [c.id]: 0 }))}
                                      style={{ background: 'none', border: 'none', color: 'var(--t2)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                    >
                                      Masquer ∧
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* FIXED INPUT AT BOTTOM - TikTok Style */}
                  <div style={{ padding: '12px 16px', borderTop: '1px solid var(--b1)', background: 'var(--card)' }}>
                    {replyingTo && replyingTo.postId === post.id && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--accent)' }}>
                        <span>En réponse à <b>{replyingTo.name}</b></span>
                        <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>✕</button>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(var(--accent-rgb), 0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)' }}>
                        {currentUser?.avatar_url ? <img src={currentUser.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt=""/> : currentUser?.full_name?.slice(0, 1) || 'U'}
                      </div>
                      <form 
                        onSubmit={e => { e.preventDefault(); handleCommentSubmit(post.id) }}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '4px 6px 4px 16px', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <input 
                          type="text" 
                          placeholder={replyingTo ? `Répondre à ${replyingTo.name}...` : "Ajouter un commentaire..."}
                          value={newCommentTexts[post.id] || ''}
                          onChange={e => setNewCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                          style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                        />
                        <button 
                          type="submit"
                          disabled={isSubmittingComment || !(newCommentTexts[post.id] || '').trim()}
                          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (isSubmittingComment || !(newCommentTexts[post.id] || '').trim()) ? 'not-allowed' : 'pointer', opacity: (isSubmittingComment || !(newCommentTexts[post.id] || '').trim()) ? 0.5 : 1, marginLeft: '8px' }}>
                          <Send size={16} />
                        </button>
                      </form>
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

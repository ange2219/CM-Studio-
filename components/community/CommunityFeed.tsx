'use client'

import { useState, useEffect } from 'react'
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
  is_community?: boolean // New field to support filtering
}

export function CommunityFeed({ 
  initialPosts, 
  currentUserId,
  initialLikedIds,
}: { 
  initialPosts: Post[]
  currentUserId: string
  initialLikedIds: string[]
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
  const [visibleReplies, setVisibleReplies] = useState<Record<string, number>>({})
  const [commentLikes, setCommentLikes] = useState<Set<string>>(new Set())

  const supabase = createClient()

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!newPostContent.trim() || isPosting) return
    setIsPosting(true)
    const { data, error } = await supabase.from('community_posts').insert({ content: newPostContent.trim(), user_id: currentUserId, is_community: activeTab === 'communaute' }).select('id, created_at').single()
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
        group_name: activeTab === 'communaute' ? 'Communauté' : 'Général',
        is_community: activeTab === 'communaute'
      }, ...posts])
      setNewPostContent('')
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
    if (isLiked) await supabase.from('community_likes').delete().match({ post_id: post.id, user_id: currentUserId })
    else await supabase.from('community_likes').insert({ post_id: post.id, user_id: currentUserId })
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
      const { data: comments, error } = await supabase.from('community_comments').select(`*, users (full_name, avatar_url, plan)`).eq('post_id', postId).order('created_at', { ascending: true })
      if (error) throw error
      const formatted = (comments || []).map(c => {
        const u = Array.isArray(c.users) ? c.users[0] : c.users
        return { id: c.id, content: c.content, created_at: c.created_at, user_id: c.user_id, parent_id: c.parent_id, full_name: u?.full_name || 'Utilisateur', avatar_url: u?.avatar_url, plan: u?.plan, likes_count: 0 }
      })
      setCommentsByPost(prev => ({ ...prev, [postId]: formatted }))
      // Initialize visible replies for each parent comment
      const initialVisible: Record<string, number> = {}
      formatted.filter(c => !c.parent_id).forEach(c => initialVisible[c.id] = 3)
      setVisibleReplies(prev => ({ ...prev, ...initialVisible }))
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

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'communaute') return post.is_community || post.group_name === 'Communauté'
    if (activeTab === 'groupe') return post.group_name && post.group_name !== 'Général' && post.group_name !== 'Communauté'
    return true // 'pour-vous' shows everything
  })

  const tabs = [
    { id: 'pour-vous', label: 'Pour vous' },
    { id: 'communaute', label: 'Communauté' },
    { id: 'groupe', label: 'Groupe' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* TABS & FILTER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '2px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: 'none', border: 'none', padding: '12px 4px', fontSize: '0.9rem', fontWeight: activeTab === tab.id ? 700 : 500, color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}>
              {tab.label}{activeTab === tab.id && <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '2px', background: '#6366f1', borderRadius: '2px' }} />}
            </button>
          ))}
        </div>
        <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '8px' }}><SlidersHorizontal size={18} /></button>
      </div>

      {/* CREATE POST */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#6366f1' }}>U</div>
          <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder="Partagez quelque chose avec la communauté..." style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', resize: 'none', fontSize: '0.95rem', paddingTop: '8px' }} rows={1} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><ImageIcon size={18} /> <span style={{ fontSize: '0.8rem' }}>Image</span></button>
            <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={18} /> <span style={{ fontSize: '0.8rem' }}>IA Assist</span></button>
          </div>
          <button onClick={handlePost} disabled={!newPostContent.trim() || isPosting} style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', opacity: !newPostContent.trim() ? 0.5 : 1 }}>Publier</button>
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
            <div key={post.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {post.avatar_url ? <img src={post.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/> : <span style={{ color: '#6366f1', fontWeight: 700 }}>{post.full_name?.slice(0, 1)}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{post.full_name || 'Utilisateur'}</span>
                      {post.plan && <span style={{ fontSize: '0.65rem', background: '#F59E0B', color: '#000', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>{post.plan.toUpperCase()}</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Publication dans le groupe {post.group_name || 'Général'} • Il y a 2h</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '0 16px 16px', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>{post.content}</div>

              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart size={10} fill="#fff" color="#fff" /></div><span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{post.likes_count + (isLiked ? 1 : 0)}</span></div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '12px' }}><span>{post.comments_count} commentaires</span><span>32 partages</span></div>
              </div>

              <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={() => toggleLike(post)} style={{ background: 'none', border: 'none', color: isLiked ? '#6366f1' : 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, padding: '8px' }}><Heart size={18} fill={isLiked ? '#6366f1' : 'none'} /> J&apos;aime</button>
                <button onClick={() => toggleComments(post.id)} style={{ background: 'none', border: 'none', color: isExpanded ? '#6366f1' : 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, padding: '8px' }}><MessageCircle size={18} /> Commentaire</button>
                <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, padding: '8px' }}><Share2 size={18} /> Partager</button>
                <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, padding: '8px' }}><Bookmark size={18} /> Enregistrer</button>
              </div>

              {isExpanded && (
                <div style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {/* Progressive Comments List */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {isLoading ? (
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Chargement...</div>
                    ) : postComments.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Aucun commentaire.</div>
                    ) : (
                      postComments.filter(c => !c.parent_id).map(c => {
                        const replies = postComments.filter(r => r.parent_id === c.id)
                        const showCount = visibleReplies[c.id] || 3
                        const remaining = replies.length - showCount

                        return (
                          <div key={c.id}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#6366f1' }}>
                                {c.avatar_url ? <img src={c.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt=""/> : c.full_name?.slice(0, 1)}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{c.full_name}</span>
                                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Il y a 1h</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>{c.content}</div>
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                                      <button onClick={() => setReplyingTo({ id: c.id, name: c.full_name, postId: post.id })} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Répondre</button>
                                    </div>
                                  </div>
                                  <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '0 4px' }}>
                                    <Heart size={14} />
                                    <span style={{ fontSize: '0.65rem', marginLeft: '2px' }}>{c.likes_count || ''}</span>
                                  </button>
                                </div>

                                {/* Progressive Replies */}
                                {replies.length > 0 && (
                                  <div style={{ marginTop: '12px' }}>
                                    {replies.slice(0, showCount).map(r => (
                                      <div key={r.id} style={{ display: 'flex', gap: '10px', marginTop: '12px', borderLeft: '2px solid rgba(255,255,255,0.06)', paddingLeft: '16px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#6366f1' }}>
                                          {r.avatar_url ? <img src={r.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt=""/> : r.full_name?.slice(0, 1)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{r.full_name}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Il y a 30m</span>
                                              </div>
                                              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>{r.content}</div>
                                            </div>
                                            <Heart size={12} color="rgba(255,255,255,0.4)" />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    
                                    {remaining > 0 && (
                                      <button 
                                        onClick={() => setVisibleReplies(prev => ({ ...prev, [c.id]: (prev[c.id] || 3) + 3 }))}
                                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: '10px 0', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                        <div style={{ width: '30px', height: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
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

                  {/* Input area */}
                  <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    {replyingTo && replyingTo.postId === post.id && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: '#6366f1' }}>
                        <span>En réponse à <b>{replyingTo.name}</b></span>
                        <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer' }}>✕</button>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '4px 6px 4px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <input 
                        type="text" 
                        placeholder={replyingTo ? "Ajouter une réponse..." : "Ajouter un commentaire..."}
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(post.id) } }}
                        style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                      />
                      <button 
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={isSubmittingComment || !newCommentText.trim()}
                        style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: (isSubmittingComment || !newCommentText.trim()) ? 0.5 : 1 }}>
                        <Send size={16} />
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

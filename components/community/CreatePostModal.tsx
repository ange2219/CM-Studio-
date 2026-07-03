'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Image as ImageIcon, Send, User } from 'lucide-react'

export function CreatePostModal({
  isOpen,
  onClose,
  currentUser,
  groupId,
  onPostCreated
}: {
  isOpen: boolean
  onClose: () => void
  currentUser: any
  groupId?: string
  onPostCreated: (post: any) => void
}) {
  const supabase = createClient()
  const [newPostContent, setNewPostContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

  if (!isOpen) return null

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!newPostContent.trim() && !uploadedImageUrl) return
    if (isPosting) return
    setIsPosting(true)
    const payload: any = { content: newPostContent.trim(), user_id: currentUser.id, image_url: uploadedImageUrl || null }
    if (groupId) {
      payload.group_id = groupId
    }
    const { data, error } = await supabase.from('community_posts').insert(payload).select('id, created_at').single()
    
    if (!error && data) {
      const newPost = {
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
        group_name: groupId ? 'Groupe' : 'Communauté',
        is_community: true
      }
      onPostCreated(newPost)
      setNewPostContent('')
      setUploadedImageUrl(null)
      onClose()
    } else if (error) {
      console.error("Erreur lors de la publication:", error)
    }
    setIsPosting(false)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--card)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        border: '1px solid var(--b1)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--b1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--t1)' }}>Créer un post</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '4px', borderRadius: '50%'
          }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(var(--accent-rgb), 0.2)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 700, color: 'var(--accent)',
              overflow: 'hidden'
            }}>
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              ) : (
                <User size={22} strokeWidth={1.5} color="var(--accent)" />
              )}
            </div>
            <textarea
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
              placeholder="Partagez quelque chose avec la communauté..."
              style={{
                flex: 1, background: 'transparent', border: 'none',
                color: 'var(--t1)', outline: 'none', resize: 'none',
                fontSize: '1rem', paddingTop: '8px', minHeight: '100px'
              }}
            />
          </div>

          {uploadedImageUrl && (
            <div style={{ position: 'relative', marginTop: '12px' }}>
              <img src={uploadedImageUrl} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--b1)' }} alt="Upload preview" />
              <button onClick={() => setUploadedImageUrl(null)} style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff',
                borderRadius: '50%', width: '28px', height: '28px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--b1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <input
              type="file"
              id="modal-image-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
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
              }}
            />
            <button onClick={() => document.getElementById('modal-image-upload')?.click()} disabled={uploadingImage} style={{
              background: 'none', border: 'none', color: uploadedImageUrl ? 'var(--accent)' : 'var(--t2)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600
            }}>
              <ImageIcon size={20} />
              <span style={{ fontSize: '0.9rem' }}>{uploadingImage ? 'Upload...' : 'Image'}</span>
            </button>

          </div>
          <button
            onClick={handlePost}
            disabled={(!newPostContent.trim() && !uploadedImageUrl) || isPosting}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              padding: '10px 24px', borderRadius: '20px', fontSize: '0.95rem',
              fontWeight: 700, cursor: 'pointer',
              opacity: (!newPostContent.trim() && !uploadedImageUrl) ? 0.5 : 1,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Send size={16} />
            Publier
          </button>
        </div>
      </div>
    </div>
  )
}

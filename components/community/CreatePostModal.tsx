'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Image as ImageIcon, Send } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'

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
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])

  if (!isOpen) return null

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!newPostContent.trim() && uploadedImageUrls.length === 0) return
    if (isPosting) return
    setIsPosting(true)

    try {
      const payload: any = {
        content: newPostContent.trim(),
        user_id: currentUser.id,
        image_url: uploadedImageUrls[0] || null
      }
      if (groupId) {
        payload.group_id = groupId
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert(payload)
        .select('id, created_at')
        .single()
      
      if (!error && data) {
        // Insert multi-images into community_post_images if any
        if (uploadedImageUrls.length > 0) {
          const imageRecords = uploadedImageUrls.map((url, position) => ({
            post_id: data.id,
            image_url: url,
            position
          }));

          const { error: imgErr } = await supabase
            .from('community_post_images')
            .insert(imageRecords);

          if (imgErr) {
            console.error("Erreur lors de l'enregistrement des images du post:", imgErr);
          }
        }

        const newPost = {
          id: data.id,
          db_id: data.id,
          user_id: currentUser.id,
          author: {
            name: currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Membre CM Studio',
            avatar: currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            verified: currentUser?.plan ? currentUser.plan.toLowerCase() !== 'free' : false,
          },
          time: "À l'instant",
          content: newPostContent.trim(),
          images: uploadedImageUrls,
          likesCount: 0,
          commentsCount: 0,
          sharesCount: 0,
        }

        onPostCreated(newPost)
        setNewPostContent('')
        setUploadedImageUrls([])
        onClose()
      } else if (error) {
        console.error("Erreur lors de la publication:", error)
      }
    } catch (err) {
      console.error("Erreur inattendue lors de la publication:", err)
    } finally {
      setIsPosting(false)
    }
  }

  const removeImage = (indexToRemove: number) => {
    setUploadedImageUrls(prev => prev.filter((_, idx) => idx !== indexToRemove))
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

        <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <UserAvatar
              avatarUrl={currentUser?.avatar_url}
              size={40}
              accentBg
              fallbackColor="var(--accent)"
              iconSize={22}
            />
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

          {/* Grid Multi-Images Preview */}
          {uploadedImageUrls.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: uploadedImageUrls.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '8px',
              marginTop: '16px'
            }}>
              {uploadedImageUrls.map((url, idx) => (
                <div key={idx} style={{ position: 'relative', height: uploadedImageUrls.length === 1 ? '220px' : '110px' }}>
                  <img
                    src={url}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--b1)' }}
                    alt={`Upload preview ${idx + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{
                      position: 'absolute', top: 6, right: 6,
                      background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff',
                      borderRadius: '50%', width: '24px', height: '24px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
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
              multiple
              style={{ display: 'none' }}
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                setUploadingImage(true);
                try {
                  const uploadPromises = Array.from(files).map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    const res = await fetch('/api/upload', { method: 'POST', body: formData });
                    const data = await res.json();
                    return data.url || null;
                  });

                  const urls = await Promise.all(uploadPromises);
                  const validUrls = urls.filter((url): url is string => Boolean(url));
                  if (validUrls.length > 0) {
                    setUploadedImageUrls(prev => [...prev, ...validUrls]);
                  }
                } catch (err) {
                  console.error("Erreur lors de l'upload multi-images:", err);
                } finally {
                  setUploadingImage(false);
                }
              }}
            />
            <button
              type="button"
              onClick={() => document.getElementById('modal-image-upload')?.click()}
              disabled={uploadingImage}
              style={{
                background: 'none', border: 'none', color: uploadedImageUrls.length > 0 ? 'var(--accent)' : 'var(--t2)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600
              }}
            >
              <ImageIcon size={20} />
              <span style={{ fontSize: '0.9rem' }}>
                {uploadingImage ? 'Upload...' : uploadedImageUrls.length > 0 ? `Photos (${uploadedImageUrls.length})` : 'Photos'}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={handlePost}
            disabled={(!newPostContent.trim() && uploadedImageUrls.length === 0) || isPosting || uploadingImage}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              padding: '10px 24px', borderRadius: '20px', fontSize: '0.95rem',
              fontWeight: 700, cursor: 'pointer',
              opacity: ((!newPostContent.trim() && uploadedImageUrls.length === 0) || isPosting || uploadingImage) ? 0.5 : 1,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Send size={16} />
            {isPosting ? 'Publication...' : 'Publier'}
          </button>
        </div>
      </div>
    </div>
  )
}

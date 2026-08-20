'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  FileText, 
  ExternalLink, 
  Eye, 
  RefreshCw, 
  X, 
  Download,
  AlertCircle,
  Plus
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/context/UserContext'
import { useToast } from '@/components/ui/Toast'

interface StorageFile {
  name: string
  id: string | null
  created_at: string | null
  updated_at: string | null
  last_accessed_at: string | null
  metadata?: {
    eTag?: string
    size?: number
    mimetype?: string
    cacheControl?: string
    lastModified?: string
    contentLength?: number
    httpStatusCode?: number
  } | Record<string, any> | null
  publicUrl: string
  isImage: boolean
  isVideo: boolean
}

function formatFileSize(bytes?: number): string {
  if (!bytes || isNaN(bytes)) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return '—'
  }
}

export default function MediaLibraryPage() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const supabase = createClient()

  const [files, setFiles] = useState<StorageFile[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ total: number; current: number }>({ total: 0, current: 0 })
  const [isDragOver, setIsDragOver] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'video'>('all')
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null)
  const [fileToDelete, setFileToDelete] = useState<StorageFile | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch files from Supabase Storage bucket 'media'
  async function fetchMedia(isSilent = false) {
    if (!user) return
    if (!isSilent) setLoading(true)
    else setRefreshing(true)

    try {
      const { data, error } = await supabase.storage
        .from('media')
        .list(user.id, {
          limit: 200,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) {
        console.error('Erreur lors du chargement des médias:', error)
        toast('Impossible de charger les fichiers de la médiathèque', 'error')
        return
      }

      // Filter out placeholders or directory markers if any (.emptyFolderPlaceholder)
      const validFiles: StorageFile[] = (data || [])
        .filter(f => f.name && !f.name.startsWith('.'))
        .map(f => {
          const { data: urlData } = supabase.storage
            .from('media')
            .getPublicUrl(`${user.id}/${f.name}`)

          const mime = f.metadata?.mimetype || ''
          const ext = f.name.split('.').pop()?.toLowerCase() || ''
          const isImg = mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)
          const isVid = mime.startsWith('video/') || ['mp4', 'mov', 'webm', 'ogg'].includes(ext)

          return {
            ...f,
            publicUrl: urlData.publicUrl,
            isImage: isImg,
            isVideo: isVid
          }
        })

      setFiles(validFiles)
    } catch (err) {
      console.error('Erreur inattendue:', err)
      toast('Erreur lors de la récupération des fichiers', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [user])

  // Handle multi-files upload
  async function handleUploadFiles(fileList: FileList | File[]) {
    if (!fileList || fileList.length === 0) return
    if (!user) {
      toast('Veuillez vous connecter pour ajouter des fichiers', 'error')
      return
    }

    const filesToUpload = Array.from(fileList)
    setUploading(true)
    setUploadProgress({ total: filesToUpload.length, current: 0 })

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]
      setUploadProgress({ total: filesToUpload.length, current: i + 1 })

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          console.error(`Échec upload ${file.name}:`, errData.error)
          failCount++
        } else {
          successCount++
        }
      } catch (err) {
        console.error(`Erreur upload ${file.name}:`, err)
        failCount++
      }
    }

    setUploading(false)
    if (successCount > 0) {
      toast(`${successCount} fichier${successCount > 1 ? 's' : ''} ajouté${successCount > 1 ? 's' : ''} avec succès !`, 'success')
      fetchMedia(true)
    }
    if (failCount > 0) {
      toast(`${failCount} fichier${failCount > 1 ? 's n\'ont' : ' n\'a'} pas pu être téléversé${failCount > 1 ? 's' : ''}.`, 'error')
    }
  }

  // Handle file deletion
  async function handleDeleteFile() {
    if (!fileToDelete || !user) return
    setIsDeleting(true)

    try {
      const filePath = `${user.id}/${fileToDelete.name}`
      const { error } = await supabase.storage
        .from('media')
        .remove([filePath])

      if (error) {
        console.error('Erreur lors de la suppression Storage:', error)
        toast('Impossible de supprimer ce fichier', 'error')
      } else {
        toast('Fichier supprimé avec succès', 'success')
        setFiles(prev => prev.filter(f => f.name !== fileToDelete.name))
        if (previewFile?.name === fileToDelete.name) {
          setPreviewFile(null)
        }
      }
    } catch (err) {
      console.error('Erreur inattendue suppression:', err)
      toast('Erreur lors de la suppression', 'error')
    } finally {
      setIsDeleting(false)
      setFileToDelete(null)
    }
  }

  // Handle copy URL
  function handleCopyUrl(url: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      toast('Lien copié dans le presse-papier !', 'success')
      setTimeout(() => setCopiedUrl(null), 2500)
    }
  }

  // Filtered files
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      if (activeFilter === 'image') return file.isImage
      if (activeFilter === 'video') return file.isVideo
      return true
    })
  }, [files, searchQuery, activeFilter])

  const counts = useMemo(() => {
    return {
      all: files.length,
      images: files.filter(f => f.isImage).length,
      videos: files.filter(f => f.isVideo).length
    }
  }, [files])

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      
      {/* ── HEADER & NAVIGATION ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <button
            onClick={() => router.push('/workspace')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              border: '1px solid var(--b1)',
              background: 'var(--card)',
              color: 'var(--t1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--s2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--card)' }}
            title="Retour au Workspace"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Médiathèque
              </h1>
              <span style={{ background: 'var(--s2)', padding: '.15rem .5rem', borderRadius: '8px', fontSize: '.75rem', color: 'var(--t3)', fontWeight: 700 }}>
                {files.length}
              </span>
            </div>
            <p style={{ fontSize: '.75rem', color: 'var(--t3)', margin: '2px 0 0 0' }}>
              Gérez, prévisualisez et réutilisez vos images et vidéos pour vos publications.
            </p>
          </div>
        </div>

        {/* Action Buttons in Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <button
            onClick={() => fetchMedia(true)}
            disabled={refreshing || loading}
            style={{
              padding: '.45rem .75rem',
              borderRadius: '12px',
              border: '1px solid var(--b1)',
              background: 'var(--card)',
              color: 'var(--t2)',
              cursor: refreshing || loading ? 'not-allowed' : 'pointer',
              fontSize: '.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '.4rem',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => { if (!refreshing && !loading) e.currentTarget.style.background = 'var(--s2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--card)' }}
            title="Actualiser la liste des fichiers"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '.45rem .9rem',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--accent)',
              color: '#fff',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: '.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '.4rem',
              boxShadow: '0 2px 8px rgba(22, 119, 255, 0.25)',
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={e => { if (!uploading) e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            <Upload size={14} />
            <span>{uploading ? `Upload (${uploadProgress.current}/${uploadProgress.total})...` : 'Téléverser'}</span>
          </button>
        </div>
      </div>

      {/* ── DRAG & DROP UPLOAD ZONE ── */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime"
        style={{ display: 'none' }}
        onChange={e => {
          if (e.target.files) handleUploadFiles(e.target.files)
          e.target.value = ''
        }}
      />

      <div
        onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={e => { e.preventDefault(); setIsDragOver(false) }}
        onDrop={e => {
          e.preventDefault()
          setIsDragOver(false)
          if (e.dataTransfer.files) handleUploadFiles(e.dataTransfer.files)
        }}
        onClick={() => { if (!uploading) fileInputRef.current?.click() }}
        style={{
          border: isDragOver ? '2px dashed var(--accent)' : '1px dashed var(--b1)',
          borderRadius: '12px',
          background: isDragOver ? 'rgba(var(--accent-rgb), 0.06)' : 'var(--card)',
          padding: '1.25rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '.4rem',
          cursor: uploading ? 'wait' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: 'var(--shadow)'
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'var(--accent-light)',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Upload size={20} className={uploading ? 'animate-bounce' : ''} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--t1)', margin: '0 0 .15rem 0' }}>
            {uploading
              ? `Téléversement en cours (${uploadProgress.current}/${uploadProgress.total})...`
              : isDragOver
              ? 'Déposez vos fichiers ici'
              : 'Glissez-déposez vos fichiers ici, ou cliquez pour parcourir'}
          </p>
          <p style={{ fontSize: '.7rem', color: 'var(--t3)', margin: 0 }}>
            Images (JPG, PNG, WebP, GIF) et vidéos (MP4, MOV) jusqu'à 50 Mo.
          </p>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.75rem', flexWrap: 'wrap' }}>
        
        {/* Type Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', background: 'var(--card)', padding: '.25rem', borderRadius: '12px', border: '1px solid var(--b1)' }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '.35rem .7rem',
              borderRadius: '8px',
              border: 'none',
              background: activeFilter === 'all' ? 'var(--accent)' : 'transparent',
              color: activeFilter === 'all' ? '#fff' : 'var(--t2)',
              fontSize: '.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Tous</span>
            <span style={{ fontSize: '.65rem', opacity: activeFilter === 'all' ? 1 : 0.6, background: activeFilter === 'all' ? 'rgba(255,255,255,0.25)' : 'var(--s2)', padding: '1px 5px', borderRadius: '6px' }}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('image')}
            style={{
              padding: '.35rem .7rem',
              borderRadius: '8px',
              border: 'none',
              background: activeFilter === 'image' ? 'var(--accent)' : 'transparent',
              color: activeFilter === 'image' ? '#fff' : 'var(--t2)',
              fontSize: '.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            <ImageIcon size={13} />
            <span>Images</span>
            <span style={{ fontSize: '.65rem', opacity: activeFilter === 'image' ? 1 : 0.6, background: activeFilter === 'image' ? 'rgba(255,255,255,0.25)' : 'var(--s2)', padding: '1px 5px', borderRadius: '6px' }}>
              {counts.images}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('video')}
            style={{
              padding: '.35rem .7rem',
              borderRadius: '8px',
              border: 'none',
              background: activeFilter === 'video' ? 'var(--accent)' : 'transparent',
              color: activeFilter === 'video' ? '#fff' : 'var(--t2)',
              fontSize: '.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            <VideoIcon size={13} />
            <span>Vidéos</span>
            <span style={{ fontSize: '.65rem', opacity: activeFilter === 'video' ? 1 : 0.6, background: activeFilter === 'video' ? 'rgba(255,255,255,0.25)' : 'var(--s2)', padding: '1px 5px', borderRadius: '6px' }}>
              {counts.videos}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 220px', maxWidth: '340px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }} />
          <input
            type="text"
            placeholder="Rechercher un fichier..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '.45rem .8rem .45rem 2.2rem',
              borderRadius: '12px',
              border: '1px solid var(--b1)',
              background: 'var(--card)',
              color: 'var(--t1)',
              fontSize: '.75rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', padding: 0, display: 'flex'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── MEDIA GRID ── */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                height: '210px',
                borderRadius: '12px',
                background: 'var(--card)',
                border: '1px solid var(--b1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'pulse 1.5s infinite'
              }}
            >
              <div style={{ flex: 1, background: 'var(--s2)' }} />
              <div style={{ padding: '.6rem', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
                <div style={{ height: '12px', width: '70%', background: 'var(--s2)', borderRadius: '4px' }} />
                <div style={{ height: '10px', width: '40%', background: 'var(--s2)', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--b1)',
          borderRadius: '12px',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '.75rem'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--s2)', color: 'var(--t3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageIcon size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--t1)', margin: '0 0 .25rem 0' }}>
              {searchQuery ? 'Aucun fichier ne correspond à votre recherche' : 'Aucun fichier dans votre médiathèque'}
            </h3>
            <p style={{ fontSize: '.75rem', color: 'var(--t3)', margin: 0, maxWidth: '360px' }}>
              {searchQuery
                ? 'Essayez de modifier votre mot-clé ou réinitialisez les filtres.'
                : 'Glissez-déposez des photos ou des vidéos ci-dessus pour alimenter votre espace médias.'}
            </p>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {filteredFiles.map(file => (
            <div
              key={file.name}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--b1)',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                position: 'relative'
              }}
              className="group"
            >
              {/* Media Thumbnail Container */}
              <div 
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '140px',
                  background: 'var(--s2)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => setPreviewFile(file)}
              >
                {file.isImage ? (
                  <img
                    src={file.publicUrl}
                    alt={file.name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.25s ease'
                    }}
                  />
                ) : file.isVideo ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090D16' }}>
                    <video
                      src={file.publicUrl}
                      preload="metadata"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                    />
                    <div style={{
                      position: 'absolute',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.65)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(4px)'
                    }}>
                      <VideoIcon size={18} />
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--t3)' }}>
                    <FileText size={32} />
                  </div>
                )}

                {/* Badge Type */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: '.6rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  backdropFilter: 'blur(4px)'
                }}>
                  {file.isImage ? 'IMG' : file.isVideo ? 'VID' : 'FICHIER'}
                </div>

                {/* Hover Quick Actions Overlay */}
                <div 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '.5rem',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    backdropFilter: 'blur(2px)'
                  }}
                  className="group-hover:opacity-100"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => setPreviewFile(file)}
                    title="Aperçu"
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: '#fff', border: 'none', color: '#0F172A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    onClick={() => handleCopyUrl(file.publicUrl)}
                    title="Copier le lien"
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: '#fff', border: 'none', color: copiedUrl === file.publicUrl ? '#10B981' : '#0F172A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                  >
                    {copiedUrl === file.publicUrl ? <Check size={15} /> : <Copy size={15} />}
                  </button>

                  <button
                    onClick={() => setFileToDelete(file)}
                    title="Supprimer"
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: '#EF4444', border: 'none', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Card Meta Footer */}
              <div style={{ padding: '.6rem .75rem', display: 'flex', flexDirection: 'column', gap: '.15rem' }}>
                <span
                  style={{
                    fontSize: '.75rem',
                    fontWeight: 700,
                    color: 'var(--t1)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={file.name}
                >
                  {file.name}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '.65rem', color: 'var(--t3)', marginTop: '2px' }}>
                  <span>{formatFileSize(file.metadata?.size || file.metadata?.contentLength)}</span>
                  <span>{formatDate(file.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL: PREVIEW FILE ── */}
      {previewFile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(6px)'
          }}
          onClick={() => setPreviewFile(null)}
        >
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--b1)',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '.8rem 1rem', borderBottom: '1px solid var(--b1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: 0 }}>
                {previewFile.isImage ? <ImageIcon size={16} className="text-accent" /> : <VideoIcon size={16} className="text-accent" />}
                <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {previewFile.name}
                </span>
              </div>

              <button
                onClick={() => setPreviewFile(null)}
                style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', padding: '4px', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Media Body */}
            <div style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05070B', overflow: 'hidden', minHeight: '300px', maxHeight: '55vh' }}>
              {previewFile.isImage ? (
                <img
                  src={previewFile.publicUrl}
                  alt={previewFile.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
                />
              ) : previewFile.isVideo ? (
                <video
                  src={previewFile.publicUrl}
                  controls
                  autoPlay
                  style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }}
                />
              ) : (
                <div style={{ color: '#fff', textAlign: 'center' }}>
                  <FileText size={48} />
                  <p style={{ marginTop: '.5rem', fontSize: '.85rem' }}>Aperçu non disponible pour ce type de fichier.</p>
                </div>
              )}
            </div>

            {/* Modal Details & Actions Footer */}
            <div style={{ padding: '.8rem 1rem', borderTop: '1px solid var(--b1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem' }}>
              <div style={{ fontSize: '.75rem', color: 'var(--t3)', display: 'flex', gap: '1rem' }}>
                <span><strong>Taille :</strong> {formatFileSize(previewFile.metadata?.size || previewFile.metadata?.contentLength)}</span>
                <span><strong>Type :</strong> {previewFile.metadata?.mimetype || 'Inconnu'}</span>
                <span><strong>Ajouté le :</strong> {formatDate(previewFile.created_at)}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <button
                  onClick={() => handleCopyUrl(previewFile.publicUrl)}
                  style={{
                    padding: '.4rem .75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--b1)',
                    background: 'var(--card)',
                    color: 'var(--t1)',
                    fontSize: '.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.4rem'
                  }}
                >
                  {copiedUrl === previewFile.publicUrl ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copiedUrl === previewFile.publicUrl ? 'Copié !' : 'Copier le lien'}</span>
                </button>

                <a
                  href={previewFile.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={previewFile.name}
                  style={{
                    padding: '.4rem .75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--b1)',
                    background: 'var(--card)',
                    color: 'var(--t1)',
                    fontSize: '.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.4rem',
                    textDecoration: 'none'
                  }}
                >
                  <Download size={14} />
                  <span>Télécharger</span>
                </a>

                <button
                  onClick={() => {
                    const toDel = previewFile
                    setPreviewFile(null)
                    setFileToDelete(toDel)
                  }}
                  style={{
                    padding: '.4rem .75rem',
                    borderRadius: '8px',
                    border: '1px solid #FECACA',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.4rem'
                  }}
                >
                  <Trash2 size={14} />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM DELETION ── */}
      {fileToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => { if (!isDeleting) setFileToDelete(null) }}
        >
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--b1)',
              borderRadius: '12px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 15px 40px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--t1)', margin: '0 0 2px 0' }}>
                  Supprimer ce fichier ?
                </h3>
                <p style={{ fontSize: '.75rem', color: 'var(--t3)', margin: 0 }}>
                  Cette action est irréversible et supprimera le média de votre stockage.
                </p>
              </div>
            </div>

            <div style={{
              background: 'var(--s2)',
              padding: '.6rem .8rem',
              borderRadius: '8px',
              fontSize: '.75rem',
              color: 'var(--t2)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              <strong>Fichier :</strong> {fileToDelete.name}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem' }}>
              <button
                disabled={isDeleting}
                onClick={() => setFileToDelete(null)}
                style={{
                  padding: '.45rem .85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--b1)',
                  background: 'var(--card)',
                  color: 'var(--t2)',
                  fontSize: '.75rem',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                Annuler
              </button>

              <button
                disabled={isDeleting}
                onClick={handleDeleteFile}
                style={{
                  padding: '.45rem .95rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#DC2626',
                  color: '#fff',
                  fontSize: '.75rem',
                  fontWeight: 700,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.4rem'
                }}
              >
                {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

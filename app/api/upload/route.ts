import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']
const MAX_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Type de fichier non autorisé. Types acceptés : ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Fichier trop lourd (max 50 MB)' }, { status: 400 })
    }

    const ext = file.type.split('/')[1].replace('quicktime', 'mov')
    const uniqueSuffix = Math.random().toString(36).substring(2, 9)
    const path = `${user.id}/${Date.now()}_${uniqueSuffix}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    // Vérification magic number pour les images (premiers bytes)
    if (file.type.startsWith('image/')) {
      const magic = buffer.subarray(0, 12)
      const isJpeg = magic[0] === 0xFF && magic[1] === 0xD8
      const isPng = magic[0] === 0x89 && magic[1] === 0x50 && magic[2] === 0x4E && magic[3] === 0x47
      const isGif = magic[0] === 0x47 && magic[1] === 0x49 && magic[2] === 0x46
      const isWebp = magic[0] === 0x52 && magic[1] === 0x49 && magic[2] === 0x46 && magic[3] === 0x46 &&
                     magic[8] === 0x57 && magic[9] === 0x45 && magic[10] === 0x42 && magic[11] === 0x50
      if (!isJpeg && !isPng && !isGif && !isWebp) {
        return NextResponse.json({ error: 'Contenu du fichier image non reconnu' }, { status: 400 })
      }
    }

    const storageAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      { auth: { persistSession: false } }
    )

    // S'assurer que le bucket 'media' existe et est PUBLIC
    await storageAdmin.storage.createBucket('media', {
      public: true,
      fileSizeLimit: MAX_SIZE_BYTES,
      allowedMimeTypes: ALLOWED_TYPES,
    }).catch(() => { /* bucket existe déjà — OK */ })

    // Mettre à jour pour garantir l'accès public même s'il a été créé en privé antérieurement
    await storageAdmin.storage.updateBucket('media', {
      public: true,
      fileSizeLimit: MAX_SIZE_BYTES,
      allowedMimeTypes: ALLOWED_TYPES,
    }).catch(() => { /* ignorer si non supporté */ })

    const { error } = await storageAdmin.storage
      .from('media')
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (error) {
      console.error('[upload] Supabase storage error:', JSON.stringify(error))
      return NextResponse.json({ error: `Upload échoué : ${error.message}` }, { status: 500 })
    }

    const { data: { publicUrl } } = storageAdmin.storage.from('media').getPublicUrl(path)
    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('[upload] Unhandled error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur inconnue' }, { status: 500 })
  }
}

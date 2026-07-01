'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CommunityRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Si c'est pour les groupes, on va vers /groups
    if (searchParams.get('tab') === 'groups') {
      router.replace('/groups' + window.location.hash)
      return
    }
    // Sinon on va vers /home en préservant le hash (ex: #comment_...)
    router.replace('/home' + window.location.hash)
  }, [router, searchParams])

  return null
}

'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CommunityRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('tab') === 'groups') {
      router.replace('/community/membres' + window.location.hash)
      return
    }
    router.replace('/community/general' + window.location.hash)
  }, [router, searchParams])

  return null
}

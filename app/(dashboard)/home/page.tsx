'use client'

import { Feed } from '@/components/community/Feed'
import { SidebarRight } from '@/components/layout/SidebarRight'

export default function HomePage() {
  return (
    <div className="flex-1 w-full h-full flex justify-between gap-6 overflow-hidden">
      <Feed />
      <SidebarRight />
    </div>
  )
}

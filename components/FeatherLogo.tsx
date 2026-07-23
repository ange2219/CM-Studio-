'use client'

import React from 'react'
import { Feather } from 'lucide-react'

export function FeatherLogo({ className = "w-6 h-6", darkMode = false }: { className?: string; darkMode?: boolean }) {
  return (
    <div className="relative flex flex-col items-center justify-center shrink-0">
      <Feather className={`${className} transform -rotate-12 ${
        darkMode ? 'text-[#38BDF8]' : 'text-[#1677FF]'
      } transition-colors`} />
    </div>
  )
}

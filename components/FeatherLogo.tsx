'use client'

import React from 'react'

export function FeatherLogo({ className = "w-6 h-6", darkMode = false }: { className?: string; darkMode?: boolean }) {
  return (
    <div className="relative flex flex-col items-center justify-center shrink-0">
      <img
        src="/logo-blue.png"
        alt="Logo CM Studio"
        className={className}
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}

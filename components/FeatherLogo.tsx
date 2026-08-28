'use client'

import React from 'react'

export interface FeatherLogoProps {
  className?: string
  containerClassName?: string
  darkMode?: boolean
  size?: number | string
}

export function FeatherLogo({
  className = "w-full h-full object-contain drop-shadow-xs",
  containerClassName,
  darkMode = false,
  size
}: FeatherLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 w-9 h-9 rounded-xl p-1.5 backdrop-blur-sm transition-all duration-200 ${
        containerClassName || (
          darkMode
            ? 'bg-slate-800/90 border border-slate-700/80 shadow-xs'
            : 'bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.06)]'
        )
      }`}
      style={size ? { width: size, height: size } : undefined}
    >
      <img
        src="/logo.png"
        alt="CM Studio Logo"
        className={className}
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}



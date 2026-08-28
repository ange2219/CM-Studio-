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
      className={`relative flex items-center justify-center shrink-0 w-9 h-9 rounded-xl p-1.5 transition-all duration-200 ${
        containerClassName || (
          darkMode
            ? 'bg-white border border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
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



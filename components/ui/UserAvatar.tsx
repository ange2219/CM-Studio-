'use client'

import Image from 'next/image'
import { User } from 'lucide-react'

interface UserAvatarProps {
  avatarUrl?: string | null
  size?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * Composant avatar universel :
 * - Affiche la photo si avatar_url existe
 * - Sinon affiche l'icône silhouette style Facebook
 */
export function UserAvatar({ avatarUrl, size = 36, className, style }: UserAvatarProps) {
  const iconSize = Math.round(size * 0.55)

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: avatarUrl ? 'transparent' : 'var(--s2, #e5e7eb)',
        border: '1px solid var(--b1, #e5e7eb)',
        ...style,
      }}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          width={size}
          height={size}
          alt="Avatar"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <User
          size={iconSize}
          strokeWidth={1.5}
          color="var(--t3, #9ca3af)"
        />
      )}
    </div>
  )
}

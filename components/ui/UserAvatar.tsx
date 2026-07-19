'use client'

import { useState, useEffect } from 'react'
import { User } from 'lucide-react'

interface UserAvatarProps {
  avatarUrl?: string | null
  size?: number
  className?: string
  style?: React.CSSProperties
  iconSize?: number
  fallbackColor?: string
  accentBg?: boolean
}

/**
 * Composant avatar universel premium :
 * - Affiche l'image de l'utilisateur si elle est valide
 * - Gère proprement les erreurs de chargement d'image (ex: URL expirée ou invalide)
 *   en basculant dynamiquement sur la silhouette grâce au state React (Virtual DOM friendly).
 * - Réinitialise son état d'erreur si la prop avatarUrl change.
 */
export function UserAvatar({
  avatarUrl,
  size = 36,
  className,
  style,
  iconSize,
  fallbackColor = 'var(--t3, #9ca3af)',
  accentBg = false,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false)

  // Réinitialiser le statut d'erreur si l'URL change (reconciliation React)
  useEffect(() => {
    setFailed(false)
  }, [avatarUrl])

  const calculatedIconSize = iconSize || Math.round(size * 0.55)
  const hasAvatar = avatarUrl && avatarUrl.trim() !== '' && !failed

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
        background: accentBg ? 'rgba(var(--accent-rgb), 0.18)' : 'var(--s2, #e5e7eb)',
        border: '1px solid var(--b1, #e5e7eb)',
        ...style,
      }}
    >
      {hasAvatar ? (
        <img
          src={avatarUrl!}
          alt="Avatar"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setFailed(true)}
        />
      ) : (
        <User
          size={calculatedIconSize}
          strokeWidth={1.5}
          color={fallbackColor}
        />
      )}
    </div>
  )
}

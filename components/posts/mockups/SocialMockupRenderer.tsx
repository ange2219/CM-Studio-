'use client'

import React from 'react'
import type { Platform } from '@/types'
import { LinkedInMockup } from './LinkedInMockup'
import { TwitterMockup } from './TwitterMockup'
import { InstagramMockup } from './InstagramMockup'
import { FacebookMockup } from './FacebookMockup'
import { TikTokMockup } from './TikTokMockup'

export interface SocialMockupRendererProps {
  platform: Platform
  content: string
  imageUrl: string | null
  imageLoading?: boolean
  userName?: string | null
  userHandle?: string | null
  userAvatar?: string | null
  userHeadline?: string | null
  onContentChange: (newContent: string) => void
  onImageChange?: (url: string | null) => void
  onOpenImagePicker?: () => void
  onGenerateAIImage?: () => void
  isPro?: boolean
  readOnly?: boolean
}

export function SocialMockupRenderer({
  platform,
  content,
  imageUrl,
  imageLoading,
  userName,
  userHandle,
  userAvatar,
  userHeadline,
  onContentChange,
  onImageChange,
  onOpenImagePicker,
  onGenerateAIImage,
  isPro = true,
  readOnly = false,
}: SocialMockupRendererProps) {
  switch (platform) {
    case 'linkedin':
      return (
        <LinkedInMockup
          content={content}
          imageUrl={imageUrl}
          imageLoading={imageLoading}
          userName={userName}
          userAvatar={userAvatar}
          userHeadline={userHeadline}
          onContentChange={onContentChange}
          onImageChange={onImageChange}
          onOpenImagePicker={onOpenImagePicker}
          onGenerateAIImage={onGenerateAIImage}
          isPro={isPro}
          readOnly={readOnly}
        />
      )

    case 'twitter':
      return (
        <TwitterMockup
          content={content}
          imageUrl={imageUrl}
          imageLoading={imageLoading}
          userName={userName}
          userHandle={userHandle}
          userAvatar={userAvatar}
          onContentChange={onContentChange}
          onImageChange={onImageChange}
          onOpenImagePicker={onOpenImagePicker}
          onGenerateAIImage={onGenerateAIImage}
          readOnly={readOnly}
        />
      )

    case 'instagram':
      return (
        <InstagramMockup
          content={content}
          imageUrl={imageUrl}
          imageLoading={imageLoading}
          userName={userName}
          userHandle={userHandle}
          userAvatar={userAvatar}
          onContentChange={onContentChange}
          onImageChange={onImageChange}
          onOpenImagePicker={onOpenImagePicker}
          onGenerateAIImage={onGenerateAIImage}
          readOnly={readOnly}
        />
      )

    case 'facebook':
      return (
        <FacebookMockup
          content={content}
          imageUrl={imageUrl}
          imageLoading={imageLoading}
          userName={userName}
          userAvatar={userAvatar}
          onContentChange={onContentChange}
          onImageChange={onImageChange}
          onOpenImagePicker={onOpenImagePicker}
          onGenerateAIImage={onGenerateAIImage}
          readOnly={readOnly}
        />
      )

    case 'tiktok':
      return (
        <TikTokMockup
          content={content}
          imageUrl={imageUrl}
          imageLoading={imageLoading}
          userName={userName}
          userHandle={userHandle}
          userAvatar={userAvatar}
          onContentChange={onContentChange}
          onImageChange={onImageChange}
          onOpenImagePicker={onOpenImagePicker}
          onGenerateAIImage={onGenerateAIImage}
          readOnly={readOnly}
        />
      )

    default:
      // Fallback vers LinkedInMockup pour les autres plateformes
      return (
        <LinkedInMockup
          content={content}
          imageUrl={imageUrl}
          imageLoading={imageLoading}
          userName={userName}
          userAvatar={userAvatar}
          userHeadline={userHeadline}
          onContentChange={onContentChange}
          onImageChange={onImageChange}
          onOpenImagePicker={onOpenImagePicker}
          onGenerateAIImage={onGenerateAIImage}
          isPro={isPro}
          readOnly={readOnly}
        />
      )
  }
}

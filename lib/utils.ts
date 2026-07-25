import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Plan, PlanLimits } from '@/types'
import { PLAN_LIMITS } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan]
}

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY! // 32 bytes hex → 64 chars

function getKey(): Buffer {
  const key = ENCRYPTION_KEY
  if (!key || key.length !== 64) {
    throw new Error('TOKEN_ENCRYPTION_KEY doit être une chaîne hex de 64 caractères (32 bytes)')
  }
  return Buffer.from(key, 'hex')
}

export function encryptToken(token: string): string {
  const { createCipheriv, randomBytes } = require('crypto') as typeof import('crypto')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  // Format : iv(12) + authTag(16) + ciphertext — encodé en base64
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

export function decryptToken(encryptedB64: string): string {
  // Rétrocompatibilité : si pas de séparateur AES, c'est un ancien token base64 simple
  try {
    const { createDecipheriv } = require('crypto') as typeof import('crypto')
    const buf = Buffer.from(encryptedB64, 'base64')
    if (buf.length < 28) throw new Error('too short')
    const iv = buf.subarray(0, 12)
    const authTag = buf.subarray(12, 28)
    const ciphertext = buf.subarray(28)
    const decipher = createDecipheriv('aes-256-gcm', getKey(), iv)
    decipher.setAuthTag(authTag)
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
  } catch {
    // Fallback pour les tokens stockés avant la migration (base64 simple)
    return Buffer.from(encryptedB64, 'base64').toString('utf-8')
  }
}

export function formatFacebookDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  
  // Calculer la différence en secondes
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Déterminer si c'est aujourd'hui, hier, ou plus vieux
  const isToday = date.getDate() === now.getDate() && 
                  date.getMonth() === now.getMonth() && 
                  date.getFullYear() === now.getFullYear();
                  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() && 
                      date.getMonth() === yesterday.getMonth() && 
                      date.getFullYear() === yesterday.getFullYear();
  
  // Formatage des heures/minutes
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (isToday) {
    if (diffInSeconds < 60) return "À l'instant";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours} h`;
  }
  
  if (isYesterday) {
    return `Hier à ${timeStr}`;
  }
  
  // Plus ancien
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const currentYear = now.getFullYear();
  
  if (year === currentYear) {
    return `Le ${day} ${month} à ${timeStr}`;
  } else {
    return `Le ${day} ${month} ${year} à ${timeStr}`;
  }
}


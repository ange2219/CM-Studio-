'use client'

import { useEffect, useState } from 'react'
import { BarChart2, Heart, MessageCircle, Share2, Eye, TrendingUp } from 'lucide-react'
import { AnalyticsSkeleton } from '@/components/ui/Skeleton'

interface PlatformStats {
  impressions: number
  reach:       number
  likes:       number
  comments:    number
  shares:      number
}

interface AnalyticsRow {
  platform:     string
  impressions:  number
  reach:        number
  likes:        number
  comments:     number
  shares:       number
  fetched_at:   string
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C', facebook: '#1877F2', tiktok: '#9333EA',
  twitter: '#1DA1F2', linkedin: '#0077B5', youtube: '#FF0000', pinterest: '#E60023',
}
const PLATFORM_NAMES: Record<string, string> = {
  instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok',
  twitter: 'X / Twitter', linkedin: 'LinkedIn', youtube: 'YouTube', pinterest: 'Pinterest',
}

function fmt(n: number): string {
  return n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M'
       : n >= 1_000     ? (n / 1_000).toFixed(1) + 'K'
       : String(n)
}

export default function AnalyticsTab() {
  const [data,    setData]    = useState<AnalyticsRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts?limit=200')
      .then(r => r.json())
      .then(d => {
        const posts: any[] = d.posts || []
        // Build analytics from post analytics field
        const rows: AnalyticsRow[] = posts
          .filter((p: any) => p.analytics)
          .flatMap((p: any) =>
            (p.platforms || []).map((platform: string) => ({
              platform,
              impressions: p.analytics?.impressions ?? 0,
              reach:       p.analytics?.reach       ?? 0,
              likes:       p.analytics?.likes       ?? 0,
              comments:    p.analytics?.comments    ?? 0,
              shares:      p.analytics?.shares      ?? 0,
              fetched_at:  p.created_at,
            }))
          )
        setData(rows)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totals = {
    impressions: data.reduce((s, a) => s + a.impressions, 0),
    reach:       data.reduce((s, a) => s + a.reach,       0),
    likes:       data.reduce((s, a) => s + a.likes,       0),
    comments:    data.reduce((s, a) => s + a.comments,    0),
    shares:      data.reduce((s, a) => s + a.shares,      0),
  }

  const byPlatform = data.reduce<Record<string, PlatformStats>>((acc, a) => {
    if (!acc[a.platform]) acc[a.platform] = { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0 }
    acc[a.platform].impressions += a.impressions
    acc[a.platform].reach       += a.reach
    acc[a.platform].likes       += a.likes
    acc[a.platform].comments    += a.comments
    acc[a.platform].shares      += a.shares
    return acc
  }, {})

  const STATS = [
    { label: 'Impressions',  value: totals.impressions, icon: Eye,           color: '#7B5CF5' },
    { label: 'Portée',       value: totals.reach,       icon: TrendingUp,    color: '#F59E0B' },
    { label: "J'aime",       value: totals.likes,       icon: Heart,         color: '#EF4444' },
    { label: 'Commentaires', value: totals.comments,    icon: MessageCircle, color: '#22C55E' },
    { label: 'Partages',     value: totals.shares,      icon: Share2,        color: '#7B5CF5' },
  ]

  if (loading) return <AnalyticsSkeleton />

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', margin: 0 }}>
          Analytiques
        </h2>
        <p style={{ color: 'var(--t3)', fontSize: '.82rem', margin: '.25rem 0 0' }}>Performance de vos publications</p>
      </div>

      {/* Global stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {STATS.map(stat => (
          <div key={stat.label} style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ color: stat.color, marginBottom: '.5rem' }}><stat.icon size={18} /></div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--t1)', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              {fmt(stat.value)}
            </div>
            <div style={{ fontSize: '.75rem', color: 'var(--t3)', marginTop: '.15rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* By platform */}
      {Object.keys(byPlatform).length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--t1)', margin: '0 0 1rem' }}>Par plateforme</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {Object.entries(byPlatform).map(([platform, stats]) => {
              const color      = PLATFORM_COLORS[platform] || '#666'
              const engagement = stats.likes + stats.comments + stats.shares
              const engRate    = stats.reach > 0 ? ((engagement / stats.reach) * 100).toFixed(1) : '0'
              return (
                <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', width: '130px', flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: '.82rem', color: 'var(--t2)' }}>{PLATFORM_NAMES[platform] || platform}</span>
                  </div>
                  <div style={{ flex: 1, background: 'var(--s2)', borderRadius: '100px', height: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((stats.impressions / (totals.impressions || 1)) * 100, 100)}%`, height: '100%', background: color, borderRadius: '100px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '.75rem', color: 'var(--t3)', width: '150px', flexShrink: 0, justifyContent: 'flex-end' }}>
                    <span>{fmt(stats.impressions)} imp.</span>
                    <span style={{ color: '#22C55E' }}>{engRate}% eng.</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {data.length === 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '14px', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <BarChart2 size={24} color="var(--t3)" />
          </div>
          <p style={{ color: 'var(--t2)', fontWeight: 600, margin: '0 0 .25rem' }}>Pas encore de données</p>
          <p style={{ color: 'var(--t3)', fontSize: '.82rem', margin: 0 }}>Publiez des posts pour voir vos statistiques ici</p>
        </div>
      )}
    </div>
  )
}

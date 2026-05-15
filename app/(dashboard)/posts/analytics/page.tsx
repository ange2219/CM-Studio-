import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatNumber } from '@/lib/utils'
import { BarChart2, Heart, MessageCircle, Share2, Eye, TrendingUp } from 'lucide-react'
import { PLATFORM_NAMES, PLATFORM_COLORS } from '@/types'
import type { Platform } from '@/types'

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const postIds = (await admin.from('posts').select('id').eq('user_id', user.id)).data?.map(p => p.id) || []

  const { data: analytics } = await admin
    .from('analytics')
    .select('*, posts(content, platforms, published_at)')
    .in('post_id', postIds)
    .order('fetched_at', { ascending: false })
    .limit(100)

  const data = analytics || []

  const totals = {
    impressions: data.reduce((s, a) => s + a.impressions, 0),
    reach:       data.reduce((s, a) => s + a.reach, 0),
    likes:       data.reduce((s, a) => s + a.likes, 0),
    comments:    data.reduce((s, a) => s + a.comments, 0),
    shares:      data.reduce((s, a) => s + a.shares, 0),
  }

  // Agréger par plateforme
  const byPlatform = data.reduce<Record<string, typeof totals>>((acc, a) => {
    const p = a.platform
    if (!acc[p]) acc[p] = { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0 }
    acc[p].impressions += a.impressions
    acc[p].reach       += a.reach
    acc[p].likes       += a.likes
    acc[p].comments    += a.comments
    acc[p].shares      += a.shares
    return acc
  }, {})

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-t1">Analytiques</h1>
        <p className="text-t3 text-sm mt-0.5">Performance de vos publications</p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Impressions', value: totals.impressions, icon: Eye, color: 'text-accent' },
          { label: 'Portée',      value: totals.reach,       icon: TrendingUp, color: 'text-yellow' },
          { label: 'J\'aime',    value: totals.likes,       icon: Heart, color: 'text-red' },
          { label: 'Commentaires', value: totals.comments,  icon: MessageCircle, color: 'text-green' },
          { label: 'Partages',   value: totals.shares,      icon: Share2, color: 'text-accent' },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <div className={`${stat.color} mb-2`}><stat.icon size={18} /></div>
            <div className="text-2xl font-display font-bold text-t1">{formatNumber(stat.value)}</div>
            <div className="text-t3 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* By platform */}
      {Object.keys(byPlatform).length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-medium text-t1 mb-4">Par plateforme</h2>
          <div className="space-y-3">
            {Object.entries(byPlatform).map(([platform, stats]) => {
              const color = PLATFORM_COLORS[platform as Platform] || '#666'
              const engagement = stats.likes + stats.comments + stats.shares
              const engRate = stats.reach > 0 ? ((engagement / stats.reach) * 100).toFixed(1) : '0'
              return (
                <div key={platform} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-32 shrink-0">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-t2 text-sm">{PLATFORM_NAMES[platform as Platform] || platform}</span>
                  </div>
                  <div className="flex-1 bg-s2 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min((stats.impressions / (totals.impressions || 1)) * 100, 100)}%`, background: color }}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-t3 w-40 shrink-0 justify-end">
                    <span>{formatNumber(stats.impressions)} imp.</span>
                    <span className="text-green">{engRate}% eng.</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {data.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-xl bg-s2 flex items-center justify-center mb-4">
            <BarChart2 size={24} className="text-t3" />
          </div>
          <p className="text-t2 font-medium mb-1">Pas encore de données</p>
          <p className="text-t3 text-sm">Publiez des posts pour voir vos statistiques ici</p>
        </div>
      )}
    </div>
  )
}

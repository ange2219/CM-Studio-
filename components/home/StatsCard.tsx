import { cn, formatNumber } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  up?: boolean
  icon: LucideIcon
  color?: string
}

export function StatsCard({ title, value, change, up, icon: Icon, color = 'text-accent' }: StatsCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-t3 text-sm">{title}</span>
        <div className={cn('w-8 h-8 rounded-lg bg-s2 flex items-center justify-center', color)}>
          <Icon size={16} />
        </div>
      </div>
      <div className="text-2xl font-display font-bold text-t1 mb-1">
        {typeof value === 'number' ? formatNumber(value) : value}
      </div>
      {change && (
        <div className={cn('text-xs font-medium', up ? 'text-green' : 'text-red')}>
          {up ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'

interface Stat {
  l: string
  v: string
  d: string
  dc: 'up' | 'dn' | 'neu'
  ic: string
}

function AnimatedValue({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const raw = value.trim()
    const num = parseFloat(raw.replace(/[^0-9.]/g, ''))
    if (isNaN(num) || num === 0) return

    const suffix = raw.replace(/[0-9.]/g, '')
    const isFloat = raw.includes('.')
    const dur = 700
    const start = performance.now()

    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      el.textContent = (isFloat
        ? (num * ease).toFixed(1)
        : Math.round(num * ease)
      ) + suffix
      if (p < 1) requestAnimationFrame(tick)
    }

    setTimeout(() => requestAnimationFrame(tick), 80)
  }, [value])

  return <div className="sc-v" ref={ref}>{value}</div>
}

export function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="stats-row">
      {stats.map((c, i) => (
        <div key={i} className="sc">
          <div className="sc-top">
            <span className="sc-l">{c.l}</span>
            <div className="sc-ico">{c.ic}</div>
          </div>
          <AnimatedValue value={c.v} />
          <div className={`sc-d ${c.dc}`}>{c.d}</div>
        </div>
      ))}
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import {
  Eye, Users, MousePointer2, Target, Percent,
  Calendar, ChevronDown, ArrowRight,
  Globe, X, Check
} from 'lucide-react'
import { IconLinkedIn, IconInstagram, IconFacebook, IconTwitterX } from '@/components/icons/BrandIcons'
import { useTheme } from '@/components/context/ThemeContext'

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = '7d' | '30d' | '90d' | 'custom'
type Granularity = 'day' | 'week' | 'month'

interface PostItem {
  id: string
  title: string
  date: string
  platform: 'linkedin' | 'instagram' | 'facebook' | 'twitter'
  views: number
  engagements: number
  engagementRate: number
  imageUrl: string
}

// ─── Sparkline Wave SVG Helper avec Effet Néon Lumineux ───────────────────────

function GlowingSparkline({ data, color, isDark }: { data: number[]; color: string; isDark: boolean }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 180
  const height = 48

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width
    const y = height - ((val - min) / range) * (height - 14) - 7
    return { x, y }
  })

  // Smooth Bezier Curve Path
  const makeSmoothPath = (pts: { x: number; y: number }[]) => {
    return pts.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x},${pt.y}`
      const prev = arr[i - 1]
      const cp1x = prev.x + (pt.x - prev.x) / 2
      const cp1y = prev.y
      const cp2x = prev.x + (pt.x - prev.x) / 2
      const cp2y = pt.y
      return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`
    }, '')
  }

  const pathD = makeSmoothPath(points)
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`
  const gradientId = `glow-spark-grad-${color.replace('#', '')}-${isDark ? 'dark' : 'light'}`

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible select-none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={isDark ? 0.25 : 0.18} />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
        <filter id={`glow-${color.replace('#', '')}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={color} floodOpacity={isDark ? 0.6 : 0.3} />
        </filter>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#glow-${color.replace('#', '')})`}
      />
    </svg>
  )
}

// ─── Composant Principal AnalyticsTab ─────────────────────────────────────────

export default function AnalyticsTab() {
  const { darkMode } = useTheme()
  const [period, setPeriod] = useState<Period>('7d')
  const [granularity, setGranularity] = useState<Granularity>('day')
  const [granularityOpen, setGranularityOpen] = useState(false)
  const [dateRangeOpen, setDateRangeOpen] = useState(false)
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null)
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null)
  const [showAllPostsModal, setShowAllPostsModal] = useState(false)
  const [showAudienceModal, setShowAudienceModal] = useState(false)

  // Label de la plage de date
  const dateRangeLabel = useMemo(() => {
    switch (period) {
      case '7d': return '12 mai – 18 mai 2024'
      case '30d': return '19 avr. – 18 mai 2024'
      case '90d': return '18 févr. – 18 mai 2024'
      case 'custom': return '1 mai – 18 mai 2024'
    }
  }, [period])

  // 5 KPIs du haut avec effets de lumière dédiés
  const kpis = useMemo(() => {
    return [
      {
        id: 'views',
        label: 'Vues',
        value: period === '7d' ? '24,5K' : period === '30d' ? '98,2K' : '312K',
        change: '18,6%',
        comparison: 'vs 5 mai – 11 mai',
        changeColor: '#10B981', // Vert
        color: '#A855F7', // Violet
        icon: Eye,
        sparkline: [10, 14, 18, 15, 23, 27, 24.5],
      },
      {
        id: 'engagements',
        label: 'Engagements',
        value: period === '7d' ? '3,8K' : period === '30d' ? '15,4K' : '48,1K',
        change: '22,4%',
        comparison: 'vs 5 mai – 11 mai',
        changeColor: '#10B981', // Vert
        color: '#3B82F6', // Bleu
        icon: Users,
        sparkline: [2.0, 2.6, 3.2, 2.7, 3.7, 4.2, 3.8],
      },
      {
        id: 'clicks',
        label: 'Clics',
        value: period === '7d' ? '1,2K' : period === '30d' ? '4,9K' : '15,8K',
        change: '15,7%',
        comparison: 'vs 5 mai – 11 mai',
        changeColor: '#10B981', // Vert
        color: '#10B981', // Vert émeraude
        icon: MousePointer2,
        sparkline: [0.7, 1.1, 1.4, 1.0, 1.6, 1.4, 1.2],
      },
      {
        id: 'conversions',
        label: 'Conversions',
        value: period === '7d' ? '156' : period === '30d' ? '612' : '1 890',
        change: '12,1%',
        comparison: 'vs 5 mai – 11 mai',
        changeColor: '#F97316', // Orange / Ambre
        color: '#F97316', // Orange
        icon: Target,
        sparkline: [90, 115, 135, 110, 152, 168, 156],
      },
      {
        id: 'engRate',
        label: "Taux d'engagement",
        value: '6,42%',
        change: '8,3%',
        comparison: 'vs 5 mai – 11 mai',
        changeColor: '#10B981', // Vert
        color: '#06B6D4', // Cyan
        icon: Percent,
        sparkline: [5.0, 5.6, 6.2, 5.7, 6.7, 6.9, 6.42],
      },
    ]
  }, [period])

  // Données du graphique multi-lignes central
  const chartData = useMemo(() => {
    return [
      { date: '12 mai', vues: 6200, engagements: 2800, clics: 1200 },
      { date: '13 mai', vues: 10400, engagements: 4900, clics: 2100 },
      { date: '14 mai', vues: 12800, engagements: 6200, clics: 3100 },
      { date: '15 mai', vues: 11200, engagements: 5100, clics: 2400 },
      { date: '16 mai', vues: 18200, engagements: 8900, clics: 4300 },
      { date: '17 mai', vues: 14600, engagements: 6800, clics: 3200 },
      { date: '18 mai', vues: 13200, engagements: 6100, clics: 2800 },
    ]
  }, [])

  // Données plateformes pour le donut
  const platformStats = [
    { name: 'LinkedIn', pct: 45, count: '11K', color: '#0A66C2', icon: IconLinkedIn },
    { name: 'Instagram', pct: 25, count: '6,1K', color: '#E1306C', icon: IconInstagram },
    { name: 'Facebook', pct: 15, count: '3,7K', color: '#1877F2', icon: IconFacebook },
    { name: 'Twitter', pct: 10, count: '2,4K', color: '#06B6D4', icon: IconTwitterX },
    { name: 'Autres', pct: 5, count: '1,3K', color: '#64748B', icon: Globe },
  ]

  // Meilleurs contenus
  const topPosts: PostItem[] = [
    {
      id: '1',
      title: 'Infographie - Tendances 2024',
      date: '12 mai 2024',
      platform: 'linkedin',
      views: 8200,
      engagements: 1200,
      engagementRate: 14.6,
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      title: 'Nouvelle Collection',
      date: '10 mai 2024',
      platform: 'linkedin',
      views: 6100,
      engagements: 872,
      engagementRate: 14.3,
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      title: 'Équipe en action',
      date: '8 mai 2024',
      platform: 'instagram',
      views: 4300,
      engagements: 623,
      engagementRate: 14.5,
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: '4',
      title: 'Brouillon - Campagne été',
      date: '6 mai 2024',
      platform: 'linkedin',
      views: 2100,
      engagements: 312,
      engagementRate: 14.9,
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=120&auto=format&fit=crop&q=80',
    },
  ]

  // Âge et genre
  const ageData = [
    { age: '18-24', male: 18, female: 12 },
    { age: '25-34', male: 38, female: 28 },
    { age: '35-44', male: 24, female: 16 },
    { age: '45-54', male: 12, female: 8 },
    { age: '55+', male: 6, female: 4 },
  ]

  // Top pays
  const topCountries = [
    { flag: '🇫🇷', name: 'France', pct: 32 },
    { flag: '🇨🇮', name: "Côte d'Ivoire", pct: 18 },
    { flag: '🇺🇸', name: 'USA', pct: 14 },
    { flag: '🇨🇦', name: 'Canada', pct: 8 },
    { flag: '🇸🇳', name: 'Sénégal', pct: 6 },
  ]

  // Calcul segments Donut
  const donutSlices = useMemo(() => {
    let accPct = 0
    const radius = 64
    const circumference = 2 * Math.PI * radius

    return platformStats.map(item => {
      const strokeDasharray = `${(item.pct / 100) * circumference} ${circumference}`
      const strokeDashoffset = -(accPct / 100) * circumference
      accPct += item.pct
      return {
        ...item,
        strokeDasharray,
        strokeDashoffset,
      }
    })
  }, [platformStats])

  return (
    <div className="w-full min-h-full bg-transparent space-y-4 max-w-[1600px] mx-auto pb-8">
      
      {/* ─── 1. Header Conforme à la Maquette ───────────────────────────────── */}
      <div className="space-y-3">
        {/* Première ligne : Titre à Gauche | Plage de Date à Droite */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Analytics
          </h1>

          {/* Bouton Plage de Date (Positionné en haut à droite) */}
          <button
            onClick={() => setDateRangeOpen(!dateRangeOpen)}
            className="inline-flex items-center gap-2 bg-white dark:bg-[#0D1424] hover:bg-slate-50 dark:hover:bg-[#152036] border border-slate-200 dark:border-[#1E293B] px-3.5 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-white transition-all shadow-xs flex-shrink-0"
          >
            <Calendar size={14} className="text-slate-500 dark:text-[#8E9BB0]" />
            <span>{dateRangeLabel}</span>
            <ChevronDown size={14} className="text-slate-500 dark:text-[#8E9BB0]" />
          </button>
        </div>

        {/* Deuxième ligne : Sous-titre */}
        <p className="text-sm text-slate-500 dark:text-[#8E9BB0] -mt-1">
          Suivez vos performances et mesurez votre impact.
        </p>

        {/* Troisième ligne : Groupe de Pilules de Période (Positionné sous le sous-titre) */}
        <div className="pt-1">
          <div className="inline-flex items-center bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-[#1E293B] rounded-xl p-1 gap-1 shadow-xs">
            <button
              onClick={() => setPeriod('7d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === '7d'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]/50'
              }`}
            >
              7 derniers jours
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === '30d'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]/50'
              }`}
            >
              30 jours
            </button>
            <button
              onClick={() => setPeriod('90d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === '90d'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]/50'
              }`}
            >
              90 jours
            </button>
            <button
              onClick={() => {
                setPeriod('custom')
                setDateRangeOpen(true)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                period === 'custom'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]/50'
              }`}
            >
              <Calendar size={13} />
              <span>Personnalisé</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. Top 5 Metric Cards avec Adaptation Mode Clair & Sombre ──────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
        {kpis.map(kpi => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.id}
              className="rounded-xl p-4 flex flex-col justify-between transition-all duration-200 shadow-xs dark:shadow-md relative overflow-hidden group bg-white dark:bg-[#0B1120]"
              style={{
                background: darkMode
                  ? `radial-gradient(circle at 85% 15%, ${kpi.color}1E 0%, transparent 65%), #0B1120`
                  : `radial-gradient(circle at 85% 15%, ${kpi.color}12 0%, transparent 65%), #FFFFFF`,
                border: darkMode ? `1px solid ${kpi.color}33` : `1px solid ${kpi.color}30`,
                boxShadow: darkMode
                  ? `0 4px 20px -2px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 ${kpi.color}40`
                  : `0 2px 10px -1px rgba(0, 0, 0, 0.04), inset 0 1px 0 0 ${kpi.color}25`,
              }}
            >
              {/* Header: Label + Badge Icon Circulaire Lumineux */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-[#94A3B8]">{kpi.label}</span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: darkMode ? `${kpi.color}20` : `${kpi.color}15`,
                    color: kpi.color,
                    border: darkMode ? `1px solid ${kpi.color}50` : `1px solid ${kpi.color}35`,
                    boxShadow: darkMode ? `0 0 12px 0px ${kpi.color}35` : `0 0 8px 0px ${kpi.color}20`,
                  }}
                >
                  <Icon size={15} />
                </div>
              </div>

              {/* Metric Value */}
              <div className="my-2.5">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {kpi.value}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                  <span className="font-semibold flex items-center" style={{ color: kpi.changeColor }}>
                    ↑ {kpi.change}
                  </span>
                  <span className="text-slate-400 dark:text-[#64748B]">{kpi.comparison}</span>
                </div>
              </div>

              {/* Sparkline Graphic avec effet néon */}
              <div className="w-full pt-1">
                <GlowingSparkline data={kpi.sparkline} color={kpi.color} isDark={darkMode} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── 3. Ligne Centrale : Spline Graphique & Donut ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* Left Card (7 cols) : Évolution des performances */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-[#1E293B]/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs dark:shadow-none">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Évolution des performances
              </h2>
              {/* Legend Dots */}
              <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-600 dark:text-[#94A3B8]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
                  <span>Vues</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                  <span>Engagements</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span>Clics</span>
                </div>
              </div>
            </div>

            {/* Granularity dropdown */}
            <div className="relative">
              <button
                onClick={() => setGranularityOpen(!granularityOpen)}
                className="bg-slate-50 dark:bg-[#0D1424] hover:bg-slate-100 dark:hover:bg-[#152036] border border-slate-200 dark:border-[#1E293B] px-3 py-1.5 rounded-lg text-xs text-slate-800 dark:text-white font-medium flex items-center gap-2"
              >
                <span>{granularity === 'day' ? 'Par jour' : granularity === 'week' ? 'Par semaine' : 'Par mois'}</span>
                <ChevronDown size={14} className="text-slate-500 dark:text-[#8E9BB0]" />
              </button>
              {granularityOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-[#1E293B] rounded-lg shadow-xl z-20 overflow-hidden text-xs py-1">
                  <button
                    onClick={() => { setGranularity('day'); setGranularityOpen(false) }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#1E293B] text-slate-800 dark:text-white flex items-center justify-between"
                  >
                    <span>Par jour</span>
                    {granularity === 'day' && <Check size={12} className="text-[#3B82F6]" />}
                  </button>
                  <button
                    onClick={() => { setGranularity('week'); setGranularityOpen(false) }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#1E293B] text-slate-800 dark:text-white flex items-center justify-between"
                  >
                    <span>Par semaine</span>
                    {granularity === 'week' && <Check size={12} className="text-[#3B82F6]" />}
                  </button>
                  <button
                    onClick={() => { setGranularity('month'); setGranularityOpen(false) }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#1E293B] text-slate-800 dark:text-white flex items-center justify-between"
                  >
                    <span>Par mois</span>
                    {granularity === 'month' && <Check size={12} className="text-[#3B82F6]" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SVG Smooth Multi-Line Chart */}
          <div className="relative w-full h-[260px] select-none pt-2">
            <svg viewBox="0 0 650 220" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gradVuesBig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity={darkMode ? 0.22 : 0.15} />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradEngBig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={darkMode ? 0.18 : 0.12} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradClicsBig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={darkMode ? 0.15 : 0.10} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              {[
                { val: '20K', y: 20 },
                { val: '15K', y: 65 },
                { val: '10K', y: 110 },
                { val: '5K',  y: 155 },
                { val: '0',   y: 195 },
              ].map(grid => (
                <g key={grid.val}>
                  <text x="0" y={grid.y + 4} fill={darkMode ? '#64748B' : '#94A3B8'} fontSize="10" fontWeight="500">
                    {grid.val}
                  </text>
                  <line
                    x1="30"
                    y1={grid.y}
                    x2="650"
                    y2={grid.y}
                    stroke={darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                    strokeDasharray="3 3"
                  />
                </g>
              ))}

              {(() => {
                const getX = (i: number) => 45 + i * (585 / (chartData.length - 1))
                const getY = (v: number) => 195 - (v / 20000) * 175

                const ptsVues = chartData.map((d, i) => ({ x: getX(i), y: getY(d.vues) }))
                const ptsEng  = chartData.map((d, i) => ({ x: getX(i), y: getY(d.engagements) }))
                const ptsClics = chartData.map((d, i) => ({ x: getX(i), y: getY(d.clics) }))

                const makeSmoothPath = (pts: { x: number; y: number }[]) => {
                  return pts.reduce((acc, pt, i, arr) => {
                    if (i === 0) return `M ${pt.x},${pt.y}`
                    const prev = arr[i - 1]
                    const cp1x = prev.x + (pt.x - prev.x) / 2
                    const cp1y = prev.y
                    const cp2x = prev.x + (pt.x - prev.x) / 2
                    const cp2y = pt.y
                    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`
                  }, '')
                }

                const pathVues = makeSmoothPath(ptsVues)
                const pathEng  = makeSmoothPath(ptsEng)
                const pathClics = makeSmoothPath(ptsClics)

                const areaVues = `${pathVues} L ${getX(chartData.length - 1)},195 L ${getX(0)},195 Z`
                const areaEng  = `${pathEng} L ${getX(chartData.length - 1)},195 L ${getX(0)},195 Z`
                const areaClics = `${pathClics} L ${getX(chartData.length - 1)},195 L ${getX(0)},195 Z`

                return (
                  <>
                    <path d={areaVues} fill="url(#gradVuesBig)" />
                    <path d={areaEng} fill="url(#gradEngBig)" />
                    <path d={areaClics} fill="url(#gradClicsBig)" />

                    <path d={pathVues} fill="none" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" />
                    <path d={pathEng} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
                    <path d={pathClics} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

                    {chartData.map((d, i) => {
                      const isHovered = hoveredPointIdx === i
                      const x = getX(i)

                      return (
                        <g key={d.date} onMouseEnter={() => setHoveredPointIdx(i)} onMouseLeave={() => setHoveredPointIdx(null)}>
                          <rect
                            x={x - 25}
                            y="10"
                            width="50"
                            height="190"
                            fill="transparent"
                            className="cursor-pointer"
                          />

                          {isHovered && (
                            <line
                              x1={x}
                              y1="20"
                              x2={x}
                              y2="195"
                              stroke={darkMode ? '#475569' : '#CBD5E1'}
                              strokeWidth="1"
                              strokeDasharray="3 3"
                            />
                          )}

                          <circle
                            cx={x}
                            cy={getY(d.vues)}
                            r={isHovered ? 5 : 3.5}
                            fill={darkMode ? '#0B1120' : '#FFFFFF'}
                            stroke="#A855F7"
                            strokeWidth="2"
                          />
                          <circle
                            cx={x}
                            cy={getY(d.engagements)}
                            r={isHovered ? 5 : 3.5}
                            fill={darkMode ? '#0B1120' : '#FFFFFF'}
                            stroke="#3B82F6"
                            strokeWidth="2"
                          />
                          <circle
                            cx={x}
                            cy={getY(d.clics)}
                            r={isHovered ? 5 : 3.5}
                            fill={darkMode ? '#0B1120' : '#FFFFFF'}
                            stroke="#10B981"
                            strokeWidth="2"
                          />

                          <text
                            x={x}
                            y="212"
                            textAnchor="middle"
                            fill={isHovered ? (darkMode ? '#FFFFFF' : '#0F172A') : (darkMode ? '#64748B' : '#94A3B8')}
                            fontSize="10"
                            fontWeight={isHovered ? '600' : '400'}
                          >
                            {d.date}
                          </text>
                        </g>
                      )
                    })}
                  </>
                )
              })()}
            </svg>

            {hoveredPointIdx !== null && (
              <div
                className="absolute top-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl p-3 shadow-xl pointer-events-none text-xs z-30 space-y-1.5 transition-all"
                style={{
                  left: `${(hoveredPointIdx / (chartData.length - 1)) * 75 + 10}%`,
                }}
              >
                <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-[#1E293B] pb-1">
                  {chartData[hoveredPointIdx].date}
                </div>
                <div className="flex items-center justify-between gap-4 text-[#A855F7]">
                  <span>Vues :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{chartData[hoveredPointIdx].vues.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-[#3B82F6]">
                  <span>Engagements :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{chartData[hoveredPointIdx].engagements.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-[#10B981]">
                  <span>Clics :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{chartData[hoveredPointIdx].clics.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Card (5 cols) : Répartition par plateforme */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-[#1E293B]/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs dark:shadow-none">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-4">
              Répartition par plateforme
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 my-2">
              
              {/* Donut SVG with central count */}
              <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                  {donutSlices.map(slice => (
                    <circle
                      key={slice.name}
                      cx="80"
                      cy="80"
                      r="60"
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={hoveredPlatform === slice.name ? '24' : '20'}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredPlatform(slice.name)}
                      onMouseLeave={() => setHoveredPlatform(null)}
                    />
                  ))}
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">24,5K</span>
                  <span className="text-[10px] text-slate-500 dark:text-[#8E9BB0] font-medium">Vues totales</span>
                </div>
              </div>

              {/* Platform breakdown list */}
              <div className="flex-1 w-full space-y-2.5">
                {platformStats.map(item => {
                  const isHovered = hoveredPlatform === item.name
                  return (
                    <div
                      key={item.name}
                      className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-all cursor-pointer ${
                        isHovered
                          ? 'bg-slate-100 dark:bg-[#1E293B]/60'
                          : 'hover:bg-slate-50 dark:hover:bg-[#1E293B]/30'
                      }`}
                      onMouseEnter={() => setHoveredPlatform(item.name)}
                      onMouseLeave={() => setHoveredPlatform(null)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-medium text-slate-700 dark:text-[#CBD5E1]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 dark:text-white">{item.pct}%</span>
                        <span className="text-slate-400 dark:text-[#64748B] w-8 text-right font-medium">{item.count}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B]/60 flex justify-end">
            <button
              onClick={() => setShowAllPostsModal(true)}
              className="text-xs font-semibold text-[#1877F2] hover:text-[#3B82F6] flex items-center gap-1 group transition-colors"
            >
              <span>Voir le détail</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 4. Bottom Row : Meilleurs contenus & Audience ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        
        {/* Left Card : Meilleurs contenus */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-[#1E293B]/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs dark:shadow-none">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Meilleurs contenus
              </h2>
              <button
                onClick={() => setShowAllPostsModal(true)}
                className="bg-slate-50 dark:bg-[#0D1424] hover:bg-slate-100 dark:hover:bg-[#152036] border border-slate-200 dark:border-[#1E293B] px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white transition-all"
              >
                Voir tout
              </button>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 dark:text-[#64748B] border-b border-slate-100 dark:border-[#1E293B]/80 font-medium">
                    <th className="pb-2.5 pl-1">Contenu</th>
                    <th className="pb-2.5 text-right font-medium">Vues</th>
                    <th className="pb-2.5 text-right font-medium">Engagements</th>
                    <th className="pb-2.5 text-right pr-1 font-medium">Taux d&apos;eng.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/40">
                  {topPosts.map(post => (
                    <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/20 transition-colors group">
                      <td className="py-2.5 pl-1">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: post.platform === 'linkedin' ? '#0A66C2' : '#E1306C',
                              color: '#fff',
                            }}
                          >
                            {post.platform === 'linkedin' ? <IconLinkedIn size={13} /> : <IconInstagram size={13} />}
                          </div>

                          <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-[#1E293B] overflow-hidden flex-shrink-0 border border-slate-200 dark:border-[#334155]/40">
                            {post.imageUrl ? (
                              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-[#64748B]">📄</div>
                            )}
                          </div>

                          <div className="min-w-0 max-w-[170px] sm:max-w-[220px]">
                            <p className="font-semibold text-slate-900 dark:text-white truncate text-xs group-hover:text-[#3B82F6] transition-colors">
                              {post.title}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-[#64748B] mt-0.5">{post.date}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                        {(post.views / 1000).toFixed(1).replace('.', ',')}K
                      </td>

                      <td className="py-2.5 text-right font-medium text-slate-600 dark:text-[#CBD5E1]">
                        {post.engagements >= 1000 ? `${(post.engagements / 1000).toFixed(1).replace('.', ',')}K` : post.engagements}
                      </td>

                      <td className="py-2.5 text-right pr-1">
                        <span className="font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md">
                          {post.engagementRate.toFixed(1).replace('.', ',')}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Card : Audience */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-[#1E293B]/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs dark:shadow-none">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Audience
              </h2>
              <button
                onClick={() => setShowAudienceModal(true)}
                className="text-xs font-semibold text-[#1877F2] hover:text-[#3B82F6] flex items-center gap-1 group transition-colors"
              >
                <span>Voir le détail</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
              
              {/* Left column (7 cols) : Âge et genre */}
              <div className="sm:col-span-7 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Âge et genre</span>
                  <div className="flex items-center gap-2.5 text-[10px] font-medium">
                    <span className="flex items-center gap-1 text-[#3B82F6]">
                      <span className="w-2 h-2 rounded-xs bg-[#3B82F6]" /> Hommes 58%
                    </span>
                    <span className="flex items-center gap-1 text-[#A855F7]">
                      <span className="w-2 h-2 rounded-xs bg-[#A855F7]" /> Femmes 42%
                    </span>
                  </div>
                </div>

                {/* Age bar chart */}
                <div className="relative h-[160px] w-full pt-2">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                    {[40, 30, 20, 10, 0].map(val => (
                      <div key={val} className="flex items-center gap-1.5 w-full">
                        <span className="text-[9px] text-slate-400 dark:text-[#64748B] w-5 text-right">{val}%</span>
                        <div className="flex-1 border-b border-slate-100 dark:border-[#1E293B]/40" />
                      </div>
                    ))}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between pl-7 pr-1 h-full pb-6">
                    {ageData.map(group => (
                      <div key={group.age} className="flex flex-col items-center gap-1 h-full justify-end">
                        <div className="flex items-end gap-1">
                          <div
                            className="w-3 sm:w-3.5 bg-[#3B82F6] hover:brightness-110 rounded-t-sm transition-all shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                            style={{ height: `${(group.male / 40) * 115}px` }}
                            title={`Hommes: ${group.male}%`}
                          />
                          <div
                            className="w-3 sm:w-3.5 bg-[#A855F7] hover:brightness-110 rounded-t-sm transition-all shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                            style={{ height: `${(group.female / 40) * 115}px` }}
                            title={`Femmes: ${group.female}%`}
                          />
                        </div>
                        <span className="text-[9px] font-medium text-slate-400 dark:text-[#64748B] mt-1">{group.age}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column (5 cols) : Top pays */}
              <div className="sm:col-span-5 space-y-2 border-t sm:border-t-0 sm:border-l border-slate-200/80 dark:border-[#1E293B]/60 pt-3 sm:pt-0 sm:pl-4">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Top pays</span>
                <div className="space-y-2">
                  {topCountries.map(country => (
                    <div key={country.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{country.flag}</span>
                        <span className="text-slate-700 dark:text-[#CBD5E1] font-medium text-[11px] truncate max-w-[80px]">
                          {country.name}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-[11px]">{country.pct}%</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowAudienceModal(true)}
                    className="text-[11px] font-semibold text-[#1877F2] hover:underline"
                  >
                    Voir plus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modals (Interactions) ────────────────────────────────────────── */}

      {/* Modal: Voir tous les posts */}
      {showAllPostsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B] rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tous les contenus</h3>
              <button
                onClick={() => setShowAllPostsModal(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1E293B]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {topPosts.map(post => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0D1424] border border-slate-200 dark:border-[#1E293B]/70 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-[#1E293B]">
                      {post.imageUrl && <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{post.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-[#64748B]">{post.date} • {post.platform.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{(post.views / 1000).toFixed(1)}K vues</span>
                    <span className="block text-xs text-[#10B981] font-semibold">{post.engagementRate}% eng.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Détail Audience */}
      {showAudienceModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-[#1E293B] rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Détails de l&apos;Audience</h3>
              <button
                onClick={() => setShowAudienceModal(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1E293B]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-[#0D1424] rounded-xl border border-slate-200 dark:border-[#1E293B]">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Répartition Globale</h4>
                <p className="text-slate-600 dark:text-[#94A3B8]">Votre audience est majoritairement composée de professionnels âgés de 25 à 34 ans situés en France et en Afrique de l&apos;Ouest.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-[#0D1424] rounded-xl border border-slate-200 dark:border-[#1E293B]">
                  <span className="text-slate-500 dark:text-[#64748B] font-medium">Pic d&apos;activité</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">Mardi & Jeudi • 18h - 20h</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#0D1424] rounded-xl border border-slate-200 dark:border-[#1E293B]">
                  <span className="text-slate-500 dark:text-[#64748B] font-medium">Fidélité de l&apos;audience</span>
                  <p className="text-base font-bold text-[#10B981] mt-1">+64% récurrents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

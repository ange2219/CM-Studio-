'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

// ─── WheelColumn ─────────────────────────────────────────────────────────────

export function WheelColumn({
  items,
  selectedIndex,
  onChange,
}: {
  items: string[]
  selectedIndex: number
  onChange: (index: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ITEM_H = 42
  const lastFiredIdx = useRef(selectedIndex)
  const didMount = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (!didMount.current) {
      didMount.current = true
      el.scrollTop = selectedIndex * ITEM_H
    } else {
      el.scrollTo({ top: selectedIndex * ITEM_H, behavior: 'smooth' })
    }
  }, [selectedIndex])

  function handleScroll() {
    const el = containerRef.current
    if (!el) return
    const idx = Math.max(0, Math.min(Math.round(el.scrollTop / ITEM_H), items.length - 1))
    if (idx !== lastFiredIdx.current) {
      lastFiredIdx.current = idx
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate(8)
      }
      onChange(idx)
    }
  }

  return (
    <div style={{ position: 'relative', height: ITEM_H * 5, overflow: 'hidden' }}>
      {/* Gradient top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: ITEM_H * 2,
          background: 'linear-gradient(to bottom, var(--card, #fff) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      {/* Gradient bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: ITEM_H * 2,
          background: 'linear-gradient(to top, var(--card, #fff) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      {/* Highlight bar */}
      <div
        style={{
          position: 'absolute',
          top: ITEM_H * 2,
          left: 6,
          right: 6,
          height: ITEM_H,
          background: 'rgba(22, 119, 255, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(22, 119, 255, 0.25)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {/* Scrollable */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          paddingTop: ITEM_H * 2,
          paddingBottom: ITEM_H * 2,
          scrollbarWidth: 'none',
        } as React.CSSProperties}
      >
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => {
              containerRef.current?.scrollTo({ top: i * ITEM_H, behavior: 'smooth' })
              onChange(i)
            }}
            style={{
              height: ITEM_H,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scrollSnapAlign: 'center',
              fontSize: i === selectedIndex ? '.95rem' : '.85rem',
              fontWeight: i === selectedIndex ? 600 : 400,
              color: i === selectedIndex ? 'var(--t1, #0f172a)' : 'var(--t3, #94a3b8)',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'color .12s, font-size .12s',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SchedulerSheet ───────────────────────────────────────────────────────────

export interface SchedulerSheetProps {
  onConfirm: (scheduledAt: string) => void
  onClose: () => void
  alreadyScheduled?: boolean
  onDeactivate?: () => void
}

export function SchedulerSheet({
  onConfirm,
  onClose,
  alreadyScheduled,
  onDeactivate,
}: SchedulerSheetProps) {
  // Build day list: today + 89 days
  const dayItems: string[] = []
  const dayDates: Date[] = []
  for (let i = 0; i < 90; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    d.setHours(0, 0, 0, 0)
    const label =
      i === 0
        ? "Aujourd'hui"
        : i === 1
        ? 'Demain'
        : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
    dayItems.push(label)
    dayDates.push(d)
  }
  const hourItems = Array.from({ length: 24 }, (_, i) => `${i}h`)
  const minuteItems = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

  const initDate = new Date(Date.now() + 45 * 60 * 1000)
  const [dayIdx, setDayIdx] = useState(0)
  const [hourIdx, setHourIdx] = useState(initDate.getHours())
  const [minuteIdx, setMinuteIdx] = useState(Math.min(Math.ceil(initDate.getMinutes() / 5), 11))

  function getMinToday() {
    const m = new Date(Date.now() + 45 * 60 * 1000)
    return { hour: m.getHours(), minIdx: Math.min(Math.ceil(m.getMinutes() / 5), 11) }
  }

  function handleDayChange(idx: number) {
    setDayIdx(idx)
    if (idx === 0) {
      const min = getMinToday()
      if (hourIdx < min.hour || (hourIdx === min.hour && minuteIdx < min.minIdx)) {
        setHourIdx(min.hour)
        setMinuteIdx(min.minIdx)
      }
    }
  }

  function handleHourChange(idx: number) {
    if (dayIdx === 0) {
      const min = getMinToday()
      if (idx < min.hour) {
        setHourIdx(min.hour)
        return
      }
      if (idx === min.hour && minuteIdx < min.minIdx) setMinuteIdx(min.minIdx)
    }
    setHourIdx(idx)
  }

  function handleMinuteChange(idx: number) {
    if (dayIdx === 0) {
      const min = getMinToday()
      if (hourIdx <= min.hour && idx < min.minIdx) {
        setMinuteIdx(min.minIdx)
        return
      }
    }
    setMinuteIdx(idx)
  }

  const scheduled = new Date(dayDates[dayIdx])
  scheduled.setHours(hourIdx, parseInt(minuteItems[minuteIdx]), 0, 0)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="anim-fade-scale"
        style={{
          background: 'var(--card, #ffffff)',
          border: '1px solid var(--b1, #e2e8f0)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '380px',
          padding: '0 1.5rem 1.5rem',
          boxShadow: '0 24px 64px rgba(0,0,0,.35)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 0 .5rem',
          }}
        >
          <span
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--t1, #0f172a)',
            }}
          >
            Date et heure de publication
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--t3, #94a3b8)',
              display: 'flex',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Wheel grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '6px',
            marginBottom: '1.1rem',
            background: 'var(--s2, #f8fafc)',
            borderRadius: '12px',
            padding: '.25rem',
            border: '1px solid var(--b1, #e2e8f0)',
          }}
        >
          <WheelColumn items={dayItems} selectedIndex={dayIdx} onChange={handleDayChange} />
          <WheelColumn items={hourItems} selectedIndex={hourIdx} onChange={handleHourChange} />
          <WheelColumn items={minuteItems} selectedIndex={minuteIdx} onChange={handleMinuteChange} />
        </div>

        {/* Note */}
        <p
          style={{
            fontSize: '.72rem',
            color: 'var(--t3, #94a3b8)',
            textAlign: 'center',
            lineHeight: 1.55,
            margin: '0 0 1.1rem',
          }}
        >
          Votre publication sera programmée et automatiquement postée à l&apos;horaire choisi.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '.6rem' }}>
          {alreadyScheduled && onDeactivate && (
            <button
              onClick={onDeactivate}
              style={{
                flex: 1,
                padding: '.7rem',
                borderRadius: '10px',
                border: '1px solid var(--b1, #e2e8f0)',
                background: 'var(--s2, #f8fafc)',
                color: 'var(--t2, #64748b)',
                cursor: 'pointer',
                fontSize: '.88rem',
                fontWeight: 600,
              }}
            >
              Désactiver
            </button>
          )}
          <button
            onClick={() => onConfirm(scheduled.toISOString())}
            className="btn-primary"
            style={{
              flex: 2,
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '.4rem',
              padding: '.7rem',
              borderRadius: '10px',
              fontSize: '.88rem',
            }}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

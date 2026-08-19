'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Attache une animation scroll-reveal GSAP sur un container ref.
 * Les éléments `.reveal` enfants s'animent en entrant dans le viewport.
 */
export function useScrollReveal(options?: {
  y?: number
  stagger?: number
  duration?: number
  start?: string
}) {
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const items = el.querySelectorAll<HTMLElement>('.reveal')
    if (!items.length) return

    gsap.set(items, { opacity: 0, y: options?.y ?? 40 })

    const ctx = gsap.context(() => {
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: options?.duration ?? 0.7,
        stagger: options?.stagger ?? 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: options?.start ?? 'top 82%',
          once: true,
        },
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return containerRef
}

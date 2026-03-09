'use client'

import React, {
  useEffect,
  useState,
  type CSSProperties,
  type ElementType,
} from 'react'
import { lerp, easeOutQuart } from '@/lib/motion'

// ---------------------------------------------------------------------------
// Core rAF-driven hook
// ---------------------------------------------------------------------------

function useMotion(duration: number, delay: number): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Honour prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(1)
      return
    }

    let rafId: number
    let startTime: number | null = null

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime

      if (elapsed < delay) {
        rafId = requestAnimationFrame(tick)
        return
      }

      const raw = Math.min((elapsed - delay) / duration, 1)
      setProgress(easeOutQuart(raw))
      if (raw < 1) rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [duration, delay])

  return progress
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MotionFrom {
  opacity?: number
  translateY?: number
  scale?: number
}

interface MotionProps {
  children: React.ReactNode
  from?: MotionFrom
  duration?: number
  delay?: number
  className?: string
  style?: CSSProperties
  // biome-ignore lint/suspicious/noExplicitAny: generic element type
  as?: ElementType<any>
}

// ---------------------------------------------------------------------------
// <Motion> — single element with frame-driven enter
// ---------------------------------------------------------------------------

export function Motion({
  children,
  from = {},
  duration = 420,
  delay = 0,
  className,
  style,
  as: Tag = 'div',
}: MotionProps) {
  const p = useMotion(duration, delay)

  const fromOpacity = from.opacity ?? 0
  const fromY = from.translateY ?? 0
  const fromScale = from.scale ?? 1

  const motionStyle: CSSProperties = {
    opacity: lerp(fromOpacity, 1, p),
    transform: `translateY(${lerp(fromY, 0, p)}px) scale(${lerp(fromScale, 1, p)})`,
    willChange: p < 1 ? 'transform, opacity' : 'auto',
    ...style,
  }

  return (
    <Tag className={className} style={motionStyle}>
      {children}
    </Tag>
  )
}

// ---------------------------------------------------------------------------
// <MotionList> — staggered children
// ---------------------------------------------------------------------------

interface MotionListProps {
  children: React.ReactNode
  from?: MotionFrom
  stagger?: number
  duration?: number
  baseDelay?: number
  className?: string
  itemClassName?: string
}

export function MotionList({
  children,
  from = { opacity: 0, translateY: 12 },
  stagger = 55,
  duration = 360,
  baseDelay = 0,
  className,
  itemClassName,
}: MotionListProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, i) =>
        child ? (
          <Motion
            from={from}
            duration={duration}
            delay={baseDelay + i * stagger}
            className={itemClassName}
          >
            {child}
          </Motion>
        ) : null,
      )}
    </div>
  )
}

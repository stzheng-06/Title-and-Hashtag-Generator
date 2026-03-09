'use client'

import React, { useEffect, useRef, useState } from 'react'

interface MouseTrackerProps {
  children: React.ReactNode
}

export function MouseTracker({ children }: MouseTrackerProps) {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [isVisible])

  useEffect(() => {
    if (cursorRef.current && isVisible) {
      cursorRef.current.style.transform = `translate(${position.x - 16}px, ${position.y - 16}px)`
    }
  }, [position, isVisible])

  return (
    <>
      {children}
      {/* 鼠标追踪光效 */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
        style={{
          opacity: isVisible ? 1 : 0,
        }}
      >
        <div className="relative">
          {/* 外圈 */}
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 bg-primary/5" />
          {/* 内核 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/80" />
          {/* 光晕 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary/20 animate-ping" />
        </div>
      </div>
    </>
  )
}

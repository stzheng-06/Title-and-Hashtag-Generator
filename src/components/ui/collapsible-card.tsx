'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CollapsibleCardProps {
  title: string
  icon?: React.ReactNode
  defaultExpanded?: boolean
  children: React.ReactNode
  actions?: React.ReactNode
}

export function CollapsibleCard({
  title,
  icon,
  defaultExpanded = false,
  children,
  actions,
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <CardTitle className="text-base">{title}</CardTitle>
          </button>
          {actions && (
            <div onClick={(e) => e.stopPropagation()}>
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <CardContent className="pt-0 pb-4">
          {children}
        </CardContent>
      </div>
    </Card>
  )
}

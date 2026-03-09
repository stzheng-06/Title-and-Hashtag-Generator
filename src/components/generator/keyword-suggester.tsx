'use client'

import React, { useState, useCallback } from 'react'
import { Lightbulb, Loader2 } from 'lucide-react'
import { useAPIConfigStore } from '@/store/api-config-store'

interface KeywordSuggesterProps {
  onSelectSuggestion: (keyword: string) => void
}

export function KeywordSuggester({ onSelectSuggestion }: KeywordSuggesterProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { config: apiConfig, isConfigured } = useAPIConfigStore()

  const fetchSuggestions = useCallback(async (keyword: string) => {
    if (!keyword.trim() || !isConfigured()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keyword.trim(),
          apiKey: apiConfig.apiKey,
          model: apiConfig.selectedModel,
        }),
      })
      const data = await response.json()
      if (data.success && data.data?.suggestions) {
        setSuggestions(data.data.suggestions)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [apiConfig.apiKey, apiConfig.selectedModel, isConfigured])

  const handleChange = (value: string) => {
    setInputValue(value)
    if (value.length >= 2) {
      // 防抖
      const timeoutId = setTimeout(() => {
        fetchSuggestions(value)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSelect = (suggestion: string) => {
    onSelectSuggestion(suggestion)
    setInputValue('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleBlur = () => {
    // 延迟隐藏以便点击建议
    setTimeout(() => setShowSuggestions(false), 200)
  }

  if (!isConfigured()) return null

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="输入关键词获取联想推荐..."
            className="w-full px-3 py-2 text-sm bg-input border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lightbulb className="h-3 w-3" />
          <span>联想</span>
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

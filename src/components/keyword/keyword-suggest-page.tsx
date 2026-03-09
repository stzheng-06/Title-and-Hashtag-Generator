'use client'

import React, { useState, useCallback } from 'react'
import { Lightbulb, Loader2, Copy, CheckCircle } from 'lucide-react'
import { useAPIConfigStore } from '@/store/api-config-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Motion } from '@/components/ui/motion'
import { toast } from 'sonner'

export function KeywordSuggestPage() {
  const [keyword, setKeyword] = useState('')
  const [count, setCount] = useState(5)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const { config: apiConfig, isConfigured } = useAPIConfigStore()

  const fetchSuggestions = useCallback(async (value: string, suggestionCount: number) => {
    if (!value.trim() || !isConfigured()) return

    setIsLoading(true)
    setHasSearched(true)
    setSuggestions([])
    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: value.trim(),
          apiKey: apiConfig.apiKey,
          model: apiConfig.selectedModel,
          count: suggestionCount,
        }),
      })
      const data = await response.json()
      if (data.success && data.data?.suggestions) {
        setSuggestions(data.data.suggestions)
      } else {
        toast.error(data.error || '获取联想词失败')
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      toast.error('请求失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }, [apiConfig.apiKey, apiConfig.selectedModel, isConfigured])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (keyword.trim()) {
      fetchSuggestions(keyword, count)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const copySuggestion = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      toast.success('已复制', { duration: 500 })
      setTimeout(() => setCopiedIndex(null), 500)
    } catch (error) {
      toast.error('复制失败', { duration: 500 })
    }
  }

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(suggestions.join(', '))
      toast.success('已全部复制', { duration: 500 })
    } catch (error) {
      toast.error('复制失败', { duration: 500 })
    }
  }

  if (!isConfigured()) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Lightbulb className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">请先配置API</h3>
            <p className="text-muted-foreground max-w-sm">
              在使用关键词联想功能之前，你需要先配置API Key
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="text-center space-y-2">
        <Motion from={{ opacity: 0, translateY: 10 }} duration={300}>
          <h2 className="text-2xl font-bold">关键词联想</h2>
        </Motion>
        <Motion from={{ opacity: 0, translateY: 10 }} duration={300} delay={100}>
          <p className="text-muted-foreground">
            输入一个关键词，AI为你联想相关的关键词
          </p>
        </Motion>
      </div>

      {/* 搜索框 */}
      <Motion from={{ opacity: 0, translateY: 10 }} duration={300} delay={200}>
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入一个关键词，例如：人工智能"
                  className="pr-10"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              {/* 联想词数量控制 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">数量:</span>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={count}
                  onChange={(e) => setCount(Math.min(30, Math.max(1, parseInt(e.target.value) || 5)))}
                  className="w-16 text-center"
                />
              </div>
              <Button type="submit" disabled={!keyword.trim() || isLoading}>
                <Lightbulb className="h-4 w-4 mr-2" />
                联想
              </Button>
            </form>
          </CardContent>
        </Card>
      </Motion>

      {/* 搜索结果 */}
      {hasSearched && (
        <Motion from={{ opacity: 0, translateY: 10 }} duration={300}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  联想结果 {suggestions.length > 0 && `(${suggestions.length} 个)`}
                </CardTitle>
                {suggestions.length > 0 && (
                  <Button variant="outline" size="sm" onClick={copyAll}>
                    <Copy className="h-4 w-4 mr-2" />
                    复制全部
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {suggestions.length === 0 && !isLoading ? (
                <p className="text-center text-muted-foreground py-8">
                  未找到相关联想词
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => copySuggestion(suggestion, index)}
                      className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    >
                      <span className="text-sm">{suggestion}</span>
                      {copiedIndex === index ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Motion>
      )}

      {/* 使用提示 */}
      <Motion from={{ opacity: 0, translateY: 10 }} duration={300} delay={300}>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              提示：点击任意联想词可以复制到剪贴板，点击"复制全部"可复制所有联想词
            </p>
          </CardContent>
        </Card>
      </Motion>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { Copy, Download, RefreshCw, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { GenerationResult } from '@/types'

interface OptimizedResultDisplayProps {
  results: GenerationResult
  onRegenerate: () => void
  isLoading: boolean
}

export function OptimizedResultDisplay({ results, onRegenerate, isLoading }: OptimizedResultDisplayProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())

  const copyToClipboard = async (text: string, type: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text)
      const itemKey = `${type}-${index !== undefined ? index : 'all'}`
      setCopiedItems(prev => new Set([...prev, itemKey]))
      
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(itemKey)
          return newSet
        })
      }, 2000)
      
      toast.success(`已复制${type === 'combo' ? '内容' : type === 'title' ? '标题' : '标签'}`)
    } catch (error) {
      toast.error('复制失败')
    }
  }

  const copyAllCombos = () => {
    const allCombos = results.titles.map(title => {
      const hashtags = results.tags.map(tag => `#${tag}`).join(' ')
      return `${title}\n\n${hashtags}`
    }).join('\n\n---\n\n')
    copyToClipboard(allCombos, 'combo')
  }

  const copyCombo = (titleIndex: number) => {
    const title = results.titles[titleIndex]
    const hashtags = results.tags.map(tag => `#${tag}`).join(' ')
    const combo = `${title}\n\n${hashtags}`
    copyToClipboard(combo, 'combo', titleIndex)
  }

  const downloadResults = () => {
    const content = `AI 生成结果 - ${new Date().toLocaleString()}

${results.titles.map((title, index) => {
  const hashtags = results.tags.map(tag => `#${tag}`).join(' ')
  return `=== 组合 ${index + 1} ===\n${title}\n\n${hashtags}`
}).join('\n\n')}

=== 所有标题 ===
${results.titles.map((title, index) => `${index + 1}. ${title}`).join('\n')}

=== 所有标签 ===
${results.tags.map(tag => `#${tag}`).join(' ')}

=== 统计信息 ===
标题数量: ${results.titles.length}
标签数量: ${results.tags.length}
${results.tokensUsed ? `使用 Token: ${results.tokensUsed}` : ''}
${results.requestId ? `请求 ID: ${results.requestId}` : ''}
`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-generated-content-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('结果已下载')
  }

  const isCopied = (type: string, index?: number) => {
    const itemKey = `${type}-${index !== undefined ? index : 'all'}`
    return copiedItems.has(itemKey)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            生成结果
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              重新生成
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadResults}
            >
              <Download className="h-4 w-4 mr-2" />
              下载结果
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{results.titles.length} 个标题</span>
            <span>{results.tags.length} 个标签</span>
            {results.tokensUsed && (
              <span>{results.tokensUsed} tokens</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyAllCombos}
          >
            {isCopied('combo') ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            复制全部组合
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 标题+标签组合 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">标题 + 标签组合</h3>
          <div className="space-y-4">
            {results.titles.map((title, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors">
                {/* 标题 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-muted-foreground">标题 {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCombo(index)}
                    >
                      {isCopied('combo', index) ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-lg font-medium leading-relaxed">{title}</p>
                </div>
                
                <Separator />
                
                {/* 标签 */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">标签</h4>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {results.tags.map(tag => `#${tag}`).join(' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* 所有标签预览 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">所有标签</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(results.tags.map(tag => `#${tag}`).join(' '), 'tag')}
            >
              {isCopied('tag') ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              复制所有标签
            </Button>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-mono leading-relaxed break-all">
              {results.tags.map(tag => `#${tag}`).join(' ')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

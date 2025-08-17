'use client'

import React, { useState } from 'react'
import { Copy, Download, RefreshCw, CheckCircle, Hash, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import type { GenerationResult } from '@/types'

interface ResultDisplayProps {
  results: GenerationResult
  onRegenerate: () => void
  isLoading: boolean
}

export function ResultDisplay({ results, onRegenerate, isLoading }: ResultDisplayProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())

  const copyToClipboard = async (text: string, type: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text)
      const itemKey = `${type}-${index !== undefined ? index : 'all'}`
      setCopiedItems(prev => new Set([...prev, itemKey]))
      
      // 2秒后移除复制状态
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(itemKey)
          return newSet
        })
      }, 2000)
      
      toast.success(`已复制${type === 'title' ? '标题' : '标签'}`)
    } catch (error) {
      toast.error('复制失败')
    }
  }

  const copyAllTitles = () => {
    const allTitles = results.titles.join('\n')
    copyToClipboard(allTitles, 'title')
  }

  const copyAllTags = () => {
    const allTags = results.tags.join(' ')
    copyToClipboard(allTags, 'tag')
  }

  const downloadResults = () => {
    const content = `AI 生成结果 - ${new Date().toLocaleString()}

=== 标题 ===
${results.titles.map((title, index) => `${index + 1}. ${title}`).join('\n')}

=== 标签 ===
${results.tags.join(' ')}

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
        
        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{results.titles.length} 个标题</span>
          <span>{results.tags.length} 个标签</span>
          {results.tokensUsed && (
            <span>{results.tokensUsed} tokens</span>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="titles" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="titles" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              标题 ({results.titles.length})
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              标签 ({results.tags.length})
            </TabsTrigger>
          </TabsList>

          {/* 标题页面 */}
          <TabsContent value="titles" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">生成的标题</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={copyAllTitles}
              >
                {isCopied('title') ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                复制全部
              </Button>
            </div>
            
            <div className="space-y-3">
              {results.titles.map((title, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Badge variant="outline" className="mt-0.5">
                      {index + 1}
                    </Badge>
                    <p className="flex-1 leading-relaxed">{title}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(title, 'title', index)}
                  >
                    {isCopied('title', index) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 标签页面 */}
          <TabsContent value="tags" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">生成的标签</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={copyAllTags}
              >
                {isCopied('tag') ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                复制全部
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {results.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => copyToClipboard(tag, 'tag', index)}
                >
                  {tag}
                  {isCopied('tag', index) && (
                    <CheckCircle className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
            
            {/* 标签预览 */}
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">复制预览</p>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-mono break-all">
                  {results.tags.join(' ')}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

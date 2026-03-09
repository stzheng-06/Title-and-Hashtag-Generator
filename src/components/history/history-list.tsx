'use client'

import React, { useState } from 'react'
import { Trash2, Copy, ExternalLink, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react'
import { useHistoryStore } from '@/store/history-store'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Motion } from '@/components/ui/motion'
import { toast } from 'sonner'

export function HistoryList() {
  const { history, deleteHistory, clearHistory } = useHistoryStore()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [copiedType, setCopiedType] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const copySingleTitle = async (title: string, id: string) => {
    await navigator.clipboard.writeText(title)
    setCopiedType(`title-${id}`)
    toast.success('已复制标题', { duration: 500 })
    setTimeout(() => setCopiedType(null), 500)
  }

  const copyAllTitles = async (titles: string[], id: string) => {
    await navigator.clipboard.writeText(titles.join('\n'))
    setCopiedType(`titles-${id}`)
    toast.success('已复制全部标题', { duration: 500 })
    setTimeout(() => setCopiedType(null), 500)
  }

  const copyAllTags = async (tags: string[], id: string) => {
    const tagsWithHash = tags.map(tag => `#${tag}`).join(' ')
    await navigator.clipboard.writeText(tagsWithHash)
    setCopiedType(`tags-${id}`)
    toast.success('已复制全部标签', { duration: 500 })
    setTimeout(() => setCopiedType(null), 500)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <ExternalLink className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">暂无历史记录</h3>
            <p className="text-muted-foreground max-w-sm">
              生成的标题和标签将自动保存到这里
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          共 {history.length} 条记录
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={clearHistory}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          清空全部
        </Button>
      </div>

      <div className="space-y-3 max-w-2xl mx-auto">
        {history.map((item, index) => (
          <Motion
            key={item.id}
            from={{ opacity: 0, translateY: 10 }}
            duration={300}
            delay={index * 30}
          >
            <Card>
              <CardHeader className="py-2 px-3 cursor-pointer" onClick={() => toggleExpand(item.id)}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {expandedIds.has(item.id) ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                    <span className="text-sm font-medium truncate">
                      {item.keywords.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                      {item.model}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteHistory(item.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expandedIds.has(item.id) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <CardContent className="pt-1 pb-3 space-y-3">
                  {/* 标题部分 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs text-muted-foreground">标题 ({item.titles.length})</p>
                      {item.titles.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyAllTitles(item.titles, item.id)}
                          className="h-6 text-xs"
                        >
                          {copiedType === `titles-${item.id}` ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          复制全部
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {item.titles.map((title, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 text-sm px-2 py-1.5 bg-secondary rounded group"
                        >
                          <span className="truncate">{title}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copySingleTitle(title, `${item.id}-${i}`)}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          >
                            {copiedType === `title-${item.id}-${i}` ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 标签部分 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs text-muted-foreground">标签 ({item.tags.length})</p>
                      {item.tags.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyAllTags(item.tags, item.id)}
                          className="h-6 text-xs"
                        >
                          {copiedType === `tags-${item.id}` ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          复制全部
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 bg-accent rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </Motion>
        ))}
      </div>
    </div>
  )
}

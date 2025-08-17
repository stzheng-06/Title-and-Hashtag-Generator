'use client'

import React from 'react'
import { MoreHorizontal, Edit, Copy, Trash2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { Config } from '@/types'
import { useConfigStore } from '@/store/config-store'
import { toast } from 'sonner'

interface ConfigCardProps {
  config: Config
  isActive: boolean
  onEdit: (config: Config) => void
}

export function ConfigCard({ config, isActive, onEdit }: ConfigCardProps) {
  const { setActiveConfig, deleteConfig, duplicateConfig } = useConfigStore()

  const handleActivate = () => {
    setActiveConfig(config.id)
    toast.success(`已切换到配置：${config.name}`)
  }

  const handleDuplicate = () => {
    duplicateConfig(config.id)
    toast.success(`已复制配置：${config.name}`)
  }

  const handleDelete = () => {
    if (confirm(`确定要删除配置"${config.name}"吗？此操作不可撤销。`)) {
      deleteConfig(config.id)
      toast.success(`已删除配置：${config.name}`)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getLanguageLabel = (languageValue: string) => {
    const languageMap = {
      chinese: '中文',
      english: 'English',
      spanish: 'Español',
      french: 'Français',
      german: 'Deutsch',
      japanese: '日本語',
      korean: '한국어',
    }
    return languageMap[languageValue as keyof typeof languageMap] || languageValue
  }

  return (
    <Card 
      className={`relative transition-all duration-200 cursor-pointer ${
        isActive 
          ? 'ring-2 ring-primary shadow-lg bg-primary/5' 
          : 'hover:shadow-md hover:scale-[1.01]'
      }`}
      onClick={!isActive ? handleActivate : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* 左侧：主要信息 */}
          <div className="flex-1 min-w-0 pr-6">
            {/* 第一行：标题和状态 */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-bold truncate">{config.name}</h3>
              {isActive && (
                <Badge variant="default" className="text-sm px-2 py-1">
                  当前使用
                </Badge>
              )}
            </div>

            {/* 第二行：基本信息 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* 语言和规则统计 */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">配置信息</p>
                <p className="text-sm font-medium">
                  {getLanguageLabel(config.outputLanguage)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {config.baseTags.split(' ').filter(tag => tag.trim()).length} 个标签 · {
                    config.generationRules.filter(rule => rule.enabled).length + (config.customRules?.length || 0)
                  } 个规则
                </p>
              </div>

              {/* 背景信息 */}
              <div className="lg:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">背景信息</p>
                <p className="text-sm line-clamp-2 leading-relaxed">
                  {config.backgroundInfo}
                </p>
              </div>
            </div>

            {/* 第三行：标签和时间 */}
            <div className="flex items-center justify-between">
              {/* 基础标签 */}
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs text-muted-foreground mb-2">基础标签</p>
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    const tags = config.baseTags.split(' ').filter(tag => tag.trim())
                    
                    if (tags.length === 0) {
                      return <span className="text-xs text-muted-foreground">无标签</span>
                    }
                    
                    return (
                      <>
                        {tags.slice(0, 4).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                        {tags.length > 4 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            +{tags.length - 4}
                          </Badge>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* 更新时间 */}
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">更新时间</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(config.updatedAt)}
                </p>
              </div>
            </div>
          </div>
          
          {/* 右侧：操作菜单 */}
          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isActive && (
                  <DropdownMenuItem onClick={handleActivate}>
                    <Play className="h-4 w-4 mr-2" />
                    设为当前配置
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onEdit(config)}>
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  复制
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

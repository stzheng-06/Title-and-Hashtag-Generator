'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Settings, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { SimpleKeywordInput } from './simple-keyword-input'
import { OptimizedResultDisplay } from './optimized-result-display'
import { useConfigStore } from '@/store/config-store'
import { useGenerationStore, validateConfig } from '@/store/generation-store'
import { useAPIConfigStore } from '@/store/api-config-store'

interface GenerationPanelProps {
  onOpenConfigDialog: () => void
}

export function GenerationPanel({ onOpenConfigDialog }: GenerationPanelProps) {
  const { getActiveConfig } = useConfigStore()
  const { generateContent, results, isLoading, error, clearResults } = useGenerationStore()
  const { config: apiConfig, isConfigured } = useAPIConfigStore()
  
  const [mounted, setMounted] = useState(false)
  const activeConfig = getActiveConfig()

  // 确保组件只在客户端挂载后才渲染状态相关的内容
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGenerate = async (keywords: string[]) => {
    if (!activeConfig || !isConfigured()) return
    
    const configErrors = validateConfig(activeConfig)
    if (configErrors.length > 0) {
      return
    }

    // 合并内容配置和API配置
    const fullConfig = {
      ...activeConfig,
      apiKey: apiConfig.apiKey,
      selectedModel: apiConfig.selectedModel,
    }

    await generateContent(keywords, fullConfig)
  }

  const handleRegenerate = () => {
    // 这里可以存储上次的关键词以便重新生成
    // 目前先清空结果，让用户重新输入
    clearResults()
  }

  // 在服务器端或组件未挂载时显示加载状态
  if (!mounted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-muted-foreground animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">加载中...</h3>
              <p className="text-muted-foreground max-w-sm">
                正在初始化配置
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // API未配置的情况
  if (!isConfigured()) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">请先配置API</h3>
              <p className="text-muted-foreground max-w-sm">
                在开始生成之前，你需要先配置API Key和选择AI模型
              </p>
            </div>
            <Button onClick={onOpenConfigDialog}>
              <Settings className="h-4 w-4 mr-2" />
              配置API
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 没有激活配置的情况
  if (!activeConfig) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">请先选择配置</h3>
              <p className="text-muted-foreground max-w-sm">
                在开始生成之前，你需要创建并选择一个配置方案
              </p>
            </div>
            <Button onClick={onOpenConfigDialog}>
              <Settings className="h-4 w-4 mr-2" />
              管理配置
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 配置验证错误
  const configErrors = validateConfig(activeConfig)
  if (configErrors.length > 0) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            当前配置存在问题：
            <ul className="mt-2 space-y-1">
              {configErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <Button onClick={onOpenConfigDialog}>
              <Settings className="h-4 w-4 mr-2" />
              修复配置
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 当前配置信息 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div>
                <p className="font-medium">{activeConfig.name}</p>
                <p className="text-sm text-muted-foreground">
                  {activeConfig.outputLanguage === 'chinese' ? '中文' : activeConfig.outputLanguage} · 
                  {activeConfig.baseTags.split(' ').filter(tag => tag.trim()).length} 个基础标签 · 
                  {activeConfig.generationRules.filter(rule => rule.enabled).length + (activeConfig.customRules?.length || 0)} 个规则
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onOpenConfigDialog}>
              <Settings className="h-4 w-4 mr-2" />
              配置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* 关键词输入 */}
      <SimpleKeywordInput
        onGenerate={handleGenerate}
        isLoading={isLoading}
        disabled={!activeConfig}
      />

      {/* 生成结果 */}
      {results && (
        <OptimizedResultDisplay
          results={results}
          onRegenerate={handleRegenerate}
          isLoading={isLoading}
        />
      )}

      {/* 加载状态的占位 */}
      {isLoading && !results && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">AI 正在生成中...</h3>
              <p className="text-muted-foreground">
                请稍等，正在为你生成精彩的标题和标签
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

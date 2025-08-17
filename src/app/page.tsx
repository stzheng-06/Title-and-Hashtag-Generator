'use client'

import React, { useState } from 'react'
import { Settings, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EnhancedConfigList } from '@/components/config/enhanced-config-list'
import { GenerationPanel } from '@/components/generator/generation-panel'

export default function HomePage() {
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI 标题和标签生成器
              </h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <span>智能内容创作助手</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfigDialogOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                配置管理
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 欢迎信息 */}
          <div className="mb-8 text-center space-y-4">
            <h2 className="text-3xl font-bold">
              让 AI 为你的内容注入创意
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              输入关键词，配置你的需求，让人工智能为你生成吸引人的标题和相关标签。
              支持多语言输出和自定义生成规则。
            </p>
          </div>

          {/* 生成面板 */}
          <GenerationPanel onOpenConfigDialog={() => setIsConfigDialogOpen(true)} />
        </div>

        {/* 功能特色 */}
        <div className="max-w-6xl mx-auto mt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">强大的功能特色</h3>
            <p className="text-muted-foreground">
              专为内容创作者和营销人员设计的智能工具
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">灵活配置</h4>
              <p className="text-sm text-muted-foreground">
                支持多种配置方案，自定义背景信息、输出语言和生成规则
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <ExternalLink className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">多语言支持</h4>
              <p className="text-sm text-muted-foreground">
                支持中文、英文、西班牙文等多种语言的内容生成
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <ExternalLink className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">智能优化</h4>
              <p className="text-sm text-muted-foreground">
                基于先进的 AI 技术，生成高质量且相关性强的内容
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 AI 标题和标签生成器. 使用 Next.js 和 AI 技术构建</p>
          </div>
        </div>
      </footer>

      {/* 配置管理弹窗 */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-[98vw] w-[98vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>配置管理</DialogTitle>
          </DialogHeader>
          <EnhancedConfigList />
        </DialogContent>
      </Dialog>
    </div>
  )
}
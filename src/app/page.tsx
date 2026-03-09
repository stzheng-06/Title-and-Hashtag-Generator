'use client'

import React, { useState } from 'react'
import { Settings, ExternalLink, Sparkles, History, Download, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EnhancedConfigList } from '@/components/config/enhanced-config-list'
import { GenerationPanel } from '@/components/generator/generation-panel'
import { HistoryList } from '@/components/history/history-list'
import { ExportPanel } from '@/components/export/export-panel'
import { KeywordSuggestPage } from '@/components/keyword/keyword-suggest-page'
import { Motion, MotionList } from '@/components/ui/motion'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { MouseTracker } from '@/components/ui/mouse-tracker'

type PageType = 'home' | 'keyword' | 'history' | 'export'

export default function HomePage() {
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<PageType>('home')

  const navItems = [
    { id: 'home' as const, label: '首页', icon: Sparkles },
    { id: 'keyword' as const, label: '联想', icon: Lightbulb },
    { id: 'history' as const, label: '历史', icon: History },
    { id: 'export' as const, label: '导出', icon: Download },
  ]

  const renderPage = () => {
    switch (currentPage) {
      case 'keyword':
        return <KeywordSuggestPage />
      case 'history':
        return <HistoryList />
      case 'export':
        return <ExportPanel />
      default:
        return (
          <>
            {/* 欢迎信息 */}
            <div className="mb-8 text-center space-y-4">
              <Motion
                as="h2"
                className="text-3xl font-bold"
                from={{ opacity: 0, translateY: 24 }}
                duration={560}
                delay={80}
              >
                让 AI 为你的内容注入创意
              </Motion>
              <Motion
                as="p"
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
                from={{ opacity: 0, translateY: 16 }}
                duration={500}
                delay={180}
              >
                输入关键词，配置你的需求，让人工智能为你生成吸引人的标题和相关标签。
                支持多语言输出和自定义生成规则。
              </Motion>
            </div>

            {/* 生成面板 */}
            <Motion from={{ opacity: 0, translateY: 20, scale: 0.98 }} duration={520} delay={260}>
              <GenerationPanel onOpenConfigDialog={() => setIsConfigDialogOpen(true)} />
            </Motion>

            {/* 功能特色 */}
            <div className="max-w-6xl mx-auto mt-16">
              <Motion from={{ opacity: 0, translateY: 16 }} duration={480} delay={340}>
                <div className="text-center mb-12">
                  <h3 className="text-2xl font-bold mb-4">强大的功能特色</h3>
                  <p className="text-muted-foreground">
                    专为内容创作者和营销人员设计的智能工具
                  </p>
                </div>
              </Motion>

              <MotionList
                className="grid md:grid-cols-3 gap-8"
                from={{ opacity: 0, translateY: 28, scale: 0.96 }}
                stagger={80}
                duration={480}
                baseDelay={400}
              >
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
              </MotionList>
            </div>
          </>
        )
    }
  }

  return (
    <MouseTracker>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* 浮动背景装饰 */}
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />

        {/* 顶部导航 */}
        <header className="border-b bg-background/80 backdrop-blur-md relative z-10">
          <div className="container mx-auto px-4 py-3">
            <Motion from={{ opacity: 0, translateY: -12 }} duration={460}>
              {/* 桌面端：第一行标题 + 第二行导航 | 手机端：两行布局 */}
              <div className="flex flex-col gap-2">
                {/* 第一行：标题 + 配置/主题 */}
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                    AI 标题生成器
                  </h1>
                  <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsConfigDialogOpen(true)}
                      className="hidden sm:flex"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      配置
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsConfigDialogOpen(true)}
                      className="sm:hidden h-8 w-8"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 第二行：导航标签 */}
                <nav className="flex items-center gap-1 overflow-x-auto">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = currentPage === item.id
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentPage(item.id)}
                        className={`${isActive ? 'bg-secondary' : ''} shrink-0`}
                      >
                        <Icon className="h-4 w-4 mr-1.5" />
                        <span className="text-xs">{item.label}</span>
                      </Button>
                    )
                  })}
                </nav>
              </div>
            </Motion>
          </div>
        </header>

        {/* 主要内容 */}
        <main className="container mx-auto px-4 py-8 relative z-10">
          {currentPage === 'home' ? (
            <div className="max-w-4xl mx-auto">
              {renderPage()}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <Motion
                key={currentPage}
                from={{ opacity: 0, translateY: 10 }}
                duration={300}
              >
                {renderPage()}
              </Motion>
            </div>
          )}
        </main>

        {/* 页脚 */}
        <footer className="border-t mt-16 relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-sm text-muted-foreground">
              <p>© 2024 AI 标题和标签生成器. 使用 Next.js 和 AI 技术构建</p>
            </div>
          </div>
        </footer>

        {/* 配置管理弹窗 - 全屏 */}
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] overflow-hidden p-0">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle className="text-xl">配置管理</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto h-[calc(95vh-80px)]">
              <EnhancedConfigList />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MouseTracker>
  )
}

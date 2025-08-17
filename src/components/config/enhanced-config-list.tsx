'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Settings, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigCard } from './config-card'
import { ConfigForm } from './config-form'
import { APIConfig } from './api-config'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useConfigStore, createEmptyConfig } from '@/store/config-store'
import { useAPIConfigStore } from '@/store/api-config-store'
import type { Config } from '@/types'

export function EnhancedConfigList() {
  const { configs, activeConfigId } = useConfigStore()
  const { isConfigured } = useAPIConfigStore()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<Config | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCreateConfig = () => {
    setEditingConfig(null)
    setIsFormOpen(true)
  }

  const handleEditConfig = (config: Config) => {
    setEditingConfig(config)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingConfig(null)
  }

  // 在服务器端或组件未挂载时显示加载状态
  if (!mounted) {
    return (
      <div className="space-y-10 p-6 max-w-none">
        <div className="max-w-4xl mx-auto">
          <APIConfig />
        </div>
      </div>
    )
  }

  // API未配置警告
  if (!isConfigured()) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            请先配置API Key和模型，然后再创建内容配置方案。
          </AlertDescription>
        </Alert>
        
        <div className="max-w-2xl">
          <APIConfig />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 p-6 max-w-none">
      {/* 全局API配置 */}
      <div className="max-w-4xl mx-auto">
        <APIConfig />
      </div>

      {/* 内容配置管理 */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">内容配置方案</h2>
            <p className="text-lg text-muted-foreground mt-2">
              {configs.length > 0 
                ? `${configs.length} 个配置方案，${activeConfigId ? '1' : '0'} 个激活`
                : '创建你的第一个内容配置方案'
              }
            </p>
            {configs.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                点击配置卡片可快速切换配置方案
              </p>
            )}
          </div>
          <Button onClick={handleCreateConfig} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            新建配置
          </Button>
        </div>

        {/* 空状态 */}
        {configs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center space-y-6 border-2 border-dashed border-muted-foreground/25 rounded-xl">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <Settings className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-medium">还没有内容配置</h3>
              <p className="text-muted-foreground max-w-md text-lg">
                创建你的第一个内容配置方案，定义你的创作风格和需求
              </p>
            </div>
            <Button onClick={handleCreateConfig} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              创建第一个配置
            </Button>
          </div>
        ) : (
          /* 配置列表 - 一行一个 */
          <div className="space-y-6">
            {configs.map((config) => (
              <ConfigCard
                key={config.id}
                config={config}
                isActive={config.id === activeConfigId}
                onEdit={handleEditConfig}
              />
            ))}
          </div>
        )}
      </div>

      {/* 配置表单弹窗 */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingConfig ? '编辑配置' : '新建配置'}</DialogTitle>
          </DialogHeader>
          <ConfigForm config={editingConfig} onClose={handleCloseForm} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

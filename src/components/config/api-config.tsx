'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Save, Key, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAPIConfigStore } from '@/store/api-config-store'
import { AI_MODELS } from '@/types'
import { toast } from 'sonner'

const apiConfigSchema = z.object({
  apiKey: z.string().min(1, 'API Key 不能为空'),
  selectedModel: z.string().min(1, '请选择AI模型'),
})

type APIConfigFormData = z.infer<typeof apiConfigSchema>

export function APIConfig() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { config, updateAPIConfig } = useAPIConfigStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<APIConfigFormData>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      apiKey: '',
      selectedModel: AI_MODELS[0].value,
    },
  })

  // 客户端挂载后同步store的值到表单
  useEffect(() => {
    setMounted(true)
    reset({
      apiKey: config.apiKey,
      selectedModel: config.selectedModel,
    })
  }, [config.apiKey, config.selectedModel, reset])

  const onSubmit = async (data: APIConfigFormData) => {
    try {
      updateAPIConfig(data)
      toast.success('API配置保存成功')
    } catch (error) {
      toast.error('保存API配置失败')
    }
  }

  const isConfigured = mounted && config.apiKey.trim().length > 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          全局API配置
          {isConfigured && (
            <Badge variant="default" className="text-xs">
              已配置
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          API配置将应用于所有内容配置方案
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key *</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                {...register('apiKey')}
                placeholder="输入你的 aihubmix API Key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.apiKey && (
              <p className="text-sm text-destructive">{errors.apiKey.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              API Key 将安全存储在本地，不会上传到服务器
            </p>
          </div>

          {/* AI模型选择 */}
          <div className="space-y-2">
            <Label htmlFor="selectedModel">AI模型 *</Label>
            <Select
              onValueChange={(value) => setValue('selectedModel', value)}
              defaultValue={watch('selectedModel')}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择AI模型" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.label}</span>
                      <span className="text-xs text-muted-foreground">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.selectedModel && (
              <p className="text-sm text-destructive">{errors.selectedModel.message}</p>
            )}
          </div>

          {/* 当前配置状态 */}
          {isConfigured && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Bot className="h-4 w-4" />
                <span className="font-medium">当前配置</span>
              </div>
              <div className="mt-2 text-sm text-green-600">
                <p>模型: {AI_MODELS.find(m => m.value === config.selectedModel)?.label}</p>
                <p>API Key: ****{config.apiKey.slice(-4)}</p>
              </div>
            </div>
          )}

          {/* 提交按钮 */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? '保存中...' : '保存API配置'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TagInput } from '@/components/ui/tag-input'
import { useConfigStore } from '@/store/config-store'
import { OUTPUT_LANGUAGES, DEFAULT_GENERATION_RULES, type Config } from '@/types'
import { toast } from 'sonner'

const configSchema = z.object({
  name: z.string().min(1, '配置名称不能为空'),
  backgroundInfo: z.string().min(1, '背景信息不能为空'),
  outputLanguage: z.string().min(1, '请选择输出语言'),
  baseTags: z.string().optional(),
})

type ConfigFormData = z.infer<typeof configSchema>

interface ConfigFormProps {
  config?: Config | null
  onClose: () => void
}

export function ConfigForm({ config, onClose }: ConfigFormProps) {
  const [generationRules, setGenerationRules] = useState(DEFAULT_GENERATION_RULES)
  const [customRules, setCustomRules] = useState<string[]>([])
  const [newCustomRule, setNewCustomRule] = useState('')
  const { addConfig, updateConfig } = useConfigStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      name: config?.name || '',
      backgroundInfo: config?.backgroundInfo || '',
      outputLanguage: config?.outputLanguage || 'chinese',
      baseTags: config?.baseTags || '',
    },
  })

  const baseTags = watch('baseTags')

  useEffect(() => {
    if (config) {
      setGenerationRules(config.generationRules)
      setCustomRules(config.customRules || [])
    }
  }, [config])

  const onSubmit = async (data: ConfigFormData) => {
    try {
      const configData = {
        ...data,
        baseTags: data.baseTags || '',
        generationRules,
        customRules,
      }

      if (config) {
        updateConfig(config.id, configData)
        toast.success('配置更新成功')
      } else {
        addConfig(configData)
        toast.success('配置创建成功')
      }

      onClose()
    } catch (error) {
      toast.error('保存配置失败')
    }
  }

  const toggleRule = (ruleId: string) => {
    setGenerationRules(rules =>
      rules.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    )
  }

  const addCustomRule = () => {
    if (newCustomRule.trim() && !customRules.includes(newCustomRule.trim())) {
      setCustomRules([...customRules, newCustomRule.trim()])
      setNewCustomRule('')
    }
  }

  const removeCustomRule = (index: number) => {
    setCustomRules(customRules.filter((_, i) => i !== index))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{config ? '编辑配置' : '创建新配置'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 配置名称 */}
          <div className="space-y-2">
            <Label htmlFor="name">配置名称 *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="例如：电商产品描述"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* 背景信息 */}
          <div className="space-y-2">
            <Label htmlFor="backgroundInfo">背景信息 *</Label>
            <Textarea
              id="backgroundInfo"
              {...register('backgroundInfo')}
              placeholder="描述你的身份和内容创作需求，例如：我是一个电商卖家，主要销售数码产品..."
              rows={4}
            />
            {errors.backgroundInfo && (
              <p className="text-sm text-destructive">{errors.backgroundInfo.message}</p>
            )}
          </div>

          {/* 输出语言 */}
          <div className="space-y-2">
            <Label htmlFor="outputLanguage">输出语言 *</Label>
            <Select
              onValueChange={(value) => setValue('outputLanguage', value)}
              defaultValue={watch('outputLanguage')}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择输出语言" />
              </SelectTrigger>
              <SelectContent>
                {OUTPUT_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.outputLanguage && (
              <p className="text-sm text-destructive">{errors.outputLanguage.message}</p>
            )}
          </div>

          {/* 基础标签 */}
          <div className="space-y-2">
            <Label htmlFor="baseTags">基础主题标签</Label>
            <Input
              id="baseTags"
              {...register('baseTags')}
              placeholder="输入基础标签，用空格分隔，如：电商 数码 科技（可选）"
            />
            <p className="text-xs text-muted-foreground">
              用空格分隔多个标签，此项为可选填写
            </p>
            {errors.baseTags && (
              <p className="text-sm text-destructive">{errors.baseTags.message}</p>
            )}
          </div>



          {/* 生成规则 */}
          <div className="space-y-3">
            <Label>预设生成规则</Label>
            <div className="space-y-3">
              {generationRules.map((rule) => (
                <div key={rule.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={rule.id}
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={rule.id} className="text-sm font-medium">
                      {rule.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {rule.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 自定义规则 */}
          <div className="space-y-3">
            <Label>自定义生成规则</Label>
            
            {/* 添加自定义规则 */}
            <div className="flex gap-2">
              <Input
                value={newCustomRule}
                onChange={(e) => setNewCustomRule(e.target.value)}
                placeholder="输入自定义规则，如：每个标题必须包含品牌名称"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomRule()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCustomRule}
                disabled={!newCustomRule.trim()}
              >
                添加
              </Button>
            </div>

            {/* 自定义规则列表 */}
            {customRules.length > 0 && (
              <div className="space-y-2">
                {customRules.map((rule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <span className="text-sm">{rule}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomRule(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              自定义规则将与预设规则一起应用于内容生成
            </p>
          </div>



          {/* 提交按钮 */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? '保存中...' : '保存配置'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

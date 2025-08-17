'use client'

import { useState } from 'react'
import { Sparkles, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatKeywords } from '@/store/generation-store'

interface KeywordInputProps {
  onGenerate: (keywords: string[]) => void
  isLoading: boolean
  disabled?: boolean
}

export function KeywordInput({ onGenerate, isLoading, disabled }: KeywordInputProps) {
  const [input, setInput] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])

  const handleInputChange = (value: string) => {
    setInput(value)
    // 实时更新关键词预览
    const newKeywords = formatKeywords(value)
    setKeywords(newKeywords)
  }

  const handleGenerate = () => {
    if (keywords.length > 0) {
      onGenerate(keywords)
    }
  }

  const removeKeyword = (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index)
    setKeywords(newKeywords)
    // 更新输入框内容
    setInput(newKeywords.join(', '))
  }

  const clearAll = () => {
    setInput('')
    setKeywords([])
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (content) {
          // 处理不同格式的文件内容
          const text = content
            .replace(/[，；。！？]/g, ',') // 替换中文标点
            .replace(/[;.!?]/g, ',') // 替换英文标点
            .replace(/\n/g, ',') // 替换换行
            .replace(/\s+/g, ' ') // 合并多个空格
          
          setInput(text)
          handleInputChange(text)
        }
      }
      reader.readAsText(file)
    }
    // 重置文件输入
    event.target.value = ''
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          关键词输入
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 输入区域 */}
        <div className="space-y-2">
          <Label htmlFor="keywords">
            输入关键词（用逗号分隔）
          </Label>
          <Textarea
            id="keywords"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="输入关键词，例如：人工智能, 机器学习, 深度学习, 神经网络..."
            rows={4}
            disabled={disabled}
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{keywords.length} 个关键词</span>
            <div className="flex items-center gap-2">
              <label htmlFor="file-upload" className="cursor-pointer hover:text-foreground">
                <Upload className="h-4 w-4 inline mr-1" />
                从文件导入
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
                disabled={disabled}
              />
              {keywords.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="hover:text-foreground"
                  disabled={disabled}
                >
                  <X className="h-4 w-4 inline mr-1" />
                  清空
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 关键词预览 */}
        {keywords.length > 0 && (
          <div className="space-y-2">
            <Label>关键词预览</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/50 min-h-[60px]">
              {keywords.map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="px-2 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => !disabled && removeKeyword(index)}
                >
                  {keyword}
                  {!disabled && <X className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 生成按钮 */}
        <Button
          onClick={handleGenerate}
          disabled={keywords.length === 0 || isLoading || disabled}
          className="w-full"
          size="lg"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isLoading ? '生成中...' : `生成标题和标签 (${keywords.length} 个关键词)`}
        </Button>

        {/* 使用提示 */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium">使用提示：</p>
          <ul className="space-y-1 ml-4">
            <li>• 用逗号分隔多个关键词</li>
            <li>• 支持中英文关键词混合输入</li>
            <li>• 可上传 .txt 或 .csv 文件批量导入</li>
            <li>• 建议输入 3-10 个相关关键词以获得最佳效果</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SimpleKeywordInputProps {
  onGenerate: (keywords: string[]) => void
  isLoading: boolean
  disabled?: boolean
}

export function SimpleKeywordInput({ onGenerate, isLoading, disabled }: SimpleKeywordInputProps) {
  const [keyword, setKeyword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (keyword.trim()) {
      onGenerate([keyword.trim()])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e)
    }
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 关键词输入 */}
          <div className="space-y-2">
            <Label htmlFor="keyword">
              输入关键词
            </Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入一个关键词，例如：人工智能"
              disabled={disabled}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              输入单个关键词，AI将基于它生成相关的标题和标签
            </p>
          </div>

          {/* 生成按钮 */}
          <Button
            type="submit"
            disabled={!keyword.trim() || isLoading || disabled}
            className="w-full"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isLoading ? '生成中...' : `生成标题和标签`}
          </Button>
        </form>

        {/* 使用提示 */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium">使用提示：</p>
          <ul className="space-y-1 ml-4">
            <li>• 输入一个核心关键词即可</li>
            <li>• 关键词越具体，生成效果越好</li>
            <li>• 按回车键快速生成</li>
            <li>• 支持中英文关键词</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

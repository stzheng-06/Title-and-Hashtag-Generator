import { create } from 'zustand'
import type { GenerationResult, Config } from '@/types'

interface GenerationStore {
  isLoading: boolean
  results: GenerationResult | null
  error: string | null
  
  // Actions
  generateContent: (keywords: string[], config: Config) => Promise<void>
  clearResults: () => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useGenerationStore = create<GenerationStore>((set, get) => ({
  isLoading: false,
  results: null,
  error: null,

  generateContent: async (keywords, config) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords,
          config,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '生成失败')
      }

      if (data.success) {
        set({ 
          results: data.data,
          isLoading: false,
          error: null 
        })
      } else {
        throw new Error(data.error || '生成失败')
      }
    } catch (error) {
      console.error('Generation error:', error)
      set({ 
        error: error instanceof Error ? error.message : '未知错误',
        isLoading: false,
        results: null 
      })
    }
  },

  clearResults: () => {
    set({ results: null, error: null })
  },

  setError: (error) => {
    set({ error })
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },
}))

// 格式化关键词的辅助函数
export const formatKeywords = (input: string): string[] => {
  return input
    .split(',')
    .map(keyword => keyword.trim())
    .filter(keyword => keyword.length > 0)
    .filter((keyword, index, array) => array.indexOf(keyword) === index) // 去重
}

// 验证配置的辅助函数
export const validateConfig = (config: Config): string[] => {
  const errors: string[] = []
  
  if (!config.name.trim()) {
    errors.push('配置名称不能为空')
  }
  
  if (!config.backgroundInfo.trim()) {
    errors.push('背景信息不能为空')
  }
  
  // 基础标签现在是可选的，不需要验证
  
  return errors
}

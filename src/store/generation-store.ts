import { create } from 'zustand'
import type { GenerationResult, Config } from '@/types'
import { analyzeAPIError, fetchWithRetry } from '@/lib/api-utils'

interface GenerationStore {
  isLoading: boolean
  results: GenerationResult | null
  error: string | null
  
  // Actions
  generateContent: (keywords: string[], config: Config) => Promise<void>
  clearResults: () => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  checkAPIHealth: () => Promise<boolean>
}

export const useGenerationStore = create<GenerationStore>((set, get) => ({
  isLoading: false,
  results: null,
  error: null,

  generateContent: async (keywords, config) => {
    set({ isLoading: true, error: null })
    
    const maxRetries = 3

    try {
      const response = await fetchWithRetry('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords,
          config,
        }),
      }, maxRetries)

      let data: any
      try {
        data = await response.json()
      } catch (parseError) {
        throw new Error('服务器响应格式错误')
      }

      if (!response.ok) {
        throw new Error(data.error || `请求失败 (${response.status})`)
      }

      if (!data.success) {
        throw new Error(data.error || '生成失败')
      }

      if (!data.data || (!data.data.titles && !data.data.tags)) {
        throw new Error('生成结果为空')
      }

      set({ 
        results: data.data,
        isLoading: false,
        error: null 
      })
    } catch (error) {
      const errorInfo = analyzeAPIError(error)
      
      console.error('Generation error:', {
        message: errorInfo.message,
        code: errorInfo.code,
        retryable: errorInfo.retryable,
        timestamp: new Date().toISOString(),
        keywords: keywords.slice(0, 5), // 只记录前5个关键词，避免日志过长
      })
      
      set({ 
        error: errorInfo.userFriendly,
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

  checkAPIHealth: async () => {
    try {
      const response = await fetch('/api/generate', {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5秒超时
      })
      return response.ok
    } catch (error) {
      console.warn('API health check failed:', error)
      return false
    }
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

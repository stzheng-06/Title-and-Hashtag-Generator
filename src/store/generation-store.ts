import { create } from 'zustand'
import type { GenerationResult, Config } from '@/types'

interface GenerationStore {
  isTitlesLoading: boolean
  isTagsLoading: boolean
  results: GenerationResult | null
  error: string | null
  _lastKeywords: string[]
  _lastConfig: Config | null

  // Actions
  generateContent: (keywords: string[], config: Config) => Promise<void>
  regenerateTitles: () => Promise<void>
  regenerateTags: () => Promise<void>
  clearResults: () => void
  setError: (error: string | null) => void
}

const callGenerateAPI = async (
  keywords: string[],
  config: Config,
  generationType: 'titles' | 'tags',
): Promise<GenerationResult> => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords, config, generationType }),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.error || '生成失败')
  }
  return data.data as GenerationResult
}

export const useGenerationStore = create<GenerationStore>((set, get) => ({
  isTitlesLoading: false,
  isTagsLoading: false,
  results: null,
  error: null,
  _lastKeywords: [],
  _lastConfig: null,

  generateContent: async (keywords, config) => {
    set({ isTitlesLoading: true, isTagsLoading: true, error: null, _lastKeywords: keywords, _lastConfig: config })

    // 自定义提示词：单次调用（不拆分）
    if ((config as any).customPrompt?.trim()) {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords, config }),
        })
        const data = await response.json()
        if (!response.ok || !data.success) throw new Error(data.error || '生成失败')
        set({ results: data.data, isTitlesLoading: false, isTagsLoading: false, error: null })
      } catch (error) {
        set({
          isTitlesLoading: false,
          isTagsLoading: false,
          error: error instanceof Error ? error.message : '未知错误',
          results: null,
        })
      }
      return
    }

    // 默认：标题和标签并行独立生成
    const [titlesResult, tagsResult] = await Promise.allSettled([
      callGenerateAPI(keywords, config, 'titles'),
      callGenerateAPI(keywords, config, 'tags'),
    ])

    const titles = titlesResult.status === 'fulfilled' ? titlesResult.value.titles : []
    const tags = tagsResult.status === 'fulfilled' ? tagsResult.value.tags : []
    const firstError =
      titlesResult.status === 'rejected'
        ? (titlesResult.reason as Error)?.message
        : tagsResult.status === 'rejected'
          ? (tagsResult.reason as Error)?.message
          : null

    set({
      isTitlesLoading: false,
      isTagsLoading: false,
      results: { titles, tags },
      error: firstError,
    })
  },

  regenerateTitles: async () => {
    const { _lastKeywords, _lastConfig, results } = get()
    if (!_lastKeywords.length || !_lastConfig) return
    set({ isTitlesLoading: true, error: null })
    try {
      const data = await callGenerateAPI(_lastKeywords, _lastConfig, 'titles')
      set(state => ({
        isTitlesLoading: false,
        results: state.results ? { ...state.results, titles: data.titles } : data,
      }))
    } catch (error) {
      set({
        isTitlesLoading: false,
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  },

  regenerateTags: async () => {
    const { _lastKeywords, _lastConfig, results } = get()
    if (!_lastKeywords.length || !_lastConfig) return
    set({ isTagsLoading: true, error: null })
    try {
      const data = await callGenerateAPI(_lastKeywords, _lastConfig, 'tags')
      set(state => ({
        isTagsLoading: false,
        results: state.results ? { ...state.results, tags: data.tags } : data,
      }))
    } catch (error) {
      set({
        isTagsLoading: false,
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  },

  clearResults: () => {
    set({ results: null, error: null })
  },

  setError: (error) => {
    set({ error })
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

  return errors
}

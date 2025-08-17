import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Config, GenerationRule, DEFAULT_GENERATION_RULES } from '@/types'
import { DEFAULT_GENERATION_RULES as defaultRules } from '@/types'

interface ConfigStore {
  configs: Config[]
  activeConfigId: string | null
  
  // Actions
  addConfig: (config: Omit<Config, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateConfig: (id: string, config: Partial<Omit<Config, 'id' | 'createdAt' | 'updatedAt'>>) => void
  deleteConfig: (id: string) => void
  setActiveConfig: (id: string | null) => void
  getActiveConfig: () => Config | null
  duplicateConfig: (id: string) => void
  
  // Getters
  getConfigById: (id: string) => Config | null
}

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      configs: [],
      activeConfigId: null,

      addConfig: (configData) => {
        const newConfig: Config = {
          ...configData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        set((state) => ({
          configs: [...state.configs, newConfig],
          activeConfigId: newConfig.id,
        }))
      },

      updateConfig: (id, configData) => {
        set((state) => ({
          configs: state.configs.map((config) =>
            config.id === id
              ? { ...config, ...configData, updatedAt: new Date() }
              : config
          ),
        }))
      },

      deleteConfig: (id) => {
        set((state) => ({
          configs: state.configs.filter((config) => config.id !== id),
          activeConfigId: state.activeConfigId === id ? null : state.activeConfigId,
        }))
      },

      setActiveConfig: (id) => {
        set({ activeConfigId: id })
      },

      getActiveConfig: () => {
        const { configs, activeConfigId } = get()
        return configs.find((config) => config.id === activeConfigId) || null
      },

      duplicateConfig: (id) => {
        const { configs, addConfig } = get()
        const configToDuplicate = configs.find((config) => config.id === id)
        if (configToDuplicate) {
          addConfig({
            ...configToDuplicate,
            name: `${configToDuplicate.name} (副本)`,
          })
        }
      },

      getConfigById: (id) => {
        const { configs } = get()
        return configs.find((config) => config.id === id) || null
      },
    }),
    {
      name: 'ai-generator-configs',
      partialize: (state) => ({
        configs: state.configs,
        activeConfigId: state.activeConfigId,
      }),
    }
  )
)

// 创建空配置的辅助函数
export const createEmptyConfig = (): Omit<Config, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: '',
  backgroundInfo: '',
  outputLanguage: 'chinese',
  baseTags: '',
  generationRules: defaultRules.map(rule => ({ ...rule })),
  customRules: [],
})

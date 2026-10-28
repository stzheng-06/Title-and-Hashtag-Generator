import { DEFAULT_AI_MODEL, resolveAIModel } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface APIConfig {
  apiKey: string
  selectedModel: string
}

interface APIConfigStore {
  config: APIConfig
  
  // Actions
  updateAPIConfig: (config: Partial<APIConfig>) => void
  setAPIKey: (apiKey: string) => void
  setSelectedModel: (model: string) => void
  isConfigured: () => boolean
}

export const useAPIConfigStore = create<APIConfigStore>()(
  persist(
    (set, get) => ({
      config: {
        apiKey: '',
        selectedModel: DEFAULT_AI_MODEL,
      },

      updateAPIConfig: (newConfig) => {
        set((state) => ({
          config: { ...state.config, ...newConfig, selectedModel: resolveAIModel(newConfig.selectedModel ?? state.config.selectedModel) }
        }))
      },

      setAPIKey: (apiKey) => {
        set((state) => ({
          config: { ...state.config, apiKey }
        }))
      },

      setSelectedModel: (selectedModel) => {
        set((state) => ({
          config: { ...state.config, selectedModel: resolveAIModel(selectedModel) }
        }))
      },

      isConfigured: () => {
        const { config } = get()
        return config.apiKey.trim().length > 0
      },
    }),
    {
      name: 'ai-generator-api-config',
      version: 1,
      // Normalize both old and current storage versions, including malformed data.
      migrate: (persistedState) => persistedState as APIConfigStore,
      merge: (persistedState, currentState) => {
        const saved = (persistedState as { config?: Partial<APIConfig> } | null)?.config
        return {
          ...currentState,
          config: {
            apiKey: typeof saved?.apiKey === 'string' ? saved.apiKey : '',
            selectedModel: resolveAIModel(saved?.selectedModel),
          },
        }
      },
      partialize: (state) => ({ config: state.config }),
    }
  )
)

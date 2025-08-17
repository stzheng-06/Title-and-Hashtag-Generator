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
        selectedModel: 'gemini-2.0-flash-lite',
      },

      updateAPIConfig: (newConfig) => {
        set((state) => ({
          config: { ...state.config, ...newConfig }
        }))
      },

      setAPIKey: (apiKey) => {
        set((state) => ({
          config: { ...state.config, apiKey }
        }))
      },

      setSelectedModel: (selectedModel) => {
        set((state) => ({
          config: { ...state.config, selectedModel }
        }))
      },

      isConfigured: () => {
        const { config } = get()
        return config.apiKey.trim().length > 0
      },
    }),
    {
      name: 'ai-generator-api-config',
      partialize: (state) => ({ config: state.config }),
    }
  )
)

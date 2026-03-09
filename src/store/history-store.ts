import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HistoryItem } from '@/types'

interface HistoryStore {
  history: HistoryItem[]

  // Actions
  addHistory: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => void
  deleteHistory: (id: string) => void
  clearHistory: () => void
  getHistory: () => HistoryItem[]
}

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      history: [],

      addHistory: (item) => {
        const newItem: HistoryItem = {
          ...item,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          history: [newItem, ...state.history].slice(0, 100), // 最多保存100条
        }))
      },

      deleteHistory: (id) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        }))
      },

      clearHistory: () => {
        set({ history: [] })
      },

      getHistory: () => {
        return get().history
      },
    }),
    {
      name: 'ai-generator-history',
    }
  )
)

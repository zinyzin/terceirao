import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: prefersDark ? 'dark' : 'light',
      
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.setAttribute('data-theme', theme)
      },
      
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: newTheme })
        document.documentElement.setAttribute('data-theme', newTheme)
      },
      
      initTheme: () => {
        const theme = get().theme
        document.documentElement.setAttribute('data-theme', theme)
      }
    }),
    { 
      name: 'pantera-theme',
      partialize: (state) => ({ theme: state.theme })
    }
  )
)

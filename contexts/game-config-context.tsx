'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'

interface GameConfig {
  startLife: number
  historyDelay: number
  closeRadialOnDialog: boolean
  showTime: boolean
  darkMode: boolean
  showFloatingNumbers: boolean
  holdIncrement: number
}

interface GameConfigContextType extends GameConfig {
  update: (config: Partial<GameConfig>) => void
}

const GameConfigContext = createContext<GameConfigContextType | undefined>(undefined)

const STORAGE_KEY = 'mana-counter-v1'

const defaultConfig: GameConfig = {
  startLife: 20,
  historyDelay: 2,
  closeRadialOnDialog: true,
  showTime: false,
  darkMode: false,
  showFloatingNumbers: true,
  holdIncrement: 10,
}

export function GameConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<GameConfig>(defaultConfig)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const value = JSON.parse(stored)
        setConfig((prev) => ({
          ...prev,
          startLife: value.startLife ?? prev.startLife,
          historyDelay: value.historyDelay ?? prev.historyDelay,
          closeRadialOnDialog: value.closeRadialOnDialog ?? prev.closeRadialOnDialog,
          showTime: value.showTime ?? prev.showTime,
          darkMode: value.darkMode ?? prev.darkMode,
          showFloatingNumbers: value.showFloatingNumbers ?? prev.showFloatingNumbers,
          holdIncrement: value.holdIncrement ?? prev.holdIncrement,
        }))
      } catch { /* use defaults */ }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    }, 500)
    return () => window.clearTimeout(timeout)
  }, [config, hydrated])

  useEffect(() => {
    if (config.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [config.darkMode])

  const update = useCallback((newConfig: Partial<GameConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }))
  }, [])

  return (
    <GameConfigContext.Provider value={{ ...config, update }}>
      {children}
    </GameConfigContext.Provider>
  )
}

export function useGameConfig() {
  const context = useContext(GameConfigContext)
  if (!context) {
    throw new Error('useGameConfig must be used within GameConfigProvider')
  }
  return context
}

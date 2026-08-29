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

interface PlayerData {
  id: number
  name: string
  color: string
  life: number
  history: { value: number; at: string; isRollback?: boolean }[]
  inverted: boolean
  skulls: number
  energy: number
  showCounters: boolean
}

interface AppStateType {
  players: PlayerData[]
  globalConfig: GameConfig
  hydrated: boolean
  updatePlayer: (id: number, data: Partial<PlayerData>) => void
  updateConfig: (data: Partial<GameConfig>) => void
}

const AppStateContext = createContext<AppStateType | undefined>(undefined)

const STORAGE_KEY = 'mirror-counter-v0'

const defaultConfig: GameConfig = {
  startLife: 20,
  historyDelay: 2,
  closeRadialOnDialog: true,
  showTime: false,
  darkMode: false,
  showFloatingNumbers: true,
  holdIncrement: 10,
}

const defaultPlayers: PlayerData[] = [
  { id: 1, name: 'PLAYER 1', color: '#ffffff', life: 20, history: [], inverted: true, skulls: 0, energy: 0, showCounters: true },
  { id: 2, name: 'PLAYER 2', color: '#000000', life: 20, history: [], inverted: false, skulls: 0, energy: 0, showCounters: true },
]

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<PlayerData[]>(defaultPlayers)
  const [globalConfig, setGlobalConfig] = useState<GameConfig>(defaultConfig)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.players) setPlayers(data.players)
        if (data.globalConfig) setGlobalConfig((prev) => ({ ...prev, ...data.globalConfig }))
      } catch { /* use defaults */ }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ players, globalConfig }))
    }, 500)
    return () => window.clearTimeout(timeout)
  }, [players, globalConfig, hydrated])

  useEffect(() => {
    if (globalConfig.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [globalConfig.darkMode])

  const updatePlayer = useCallback((id: number, data: Partial<PlayerData>) => {
    setPlayers((prev) => prev.map((player) => (player.id === id ? { ...player, ...data } : player)))
  }, [])

  const updateConfig = useCallback((data: Partial<GameConfig>) => {
    setGlobalConfig((prev) => ({ ...prev, ...data }))
  }, [])

  return (
    <AppStateContext.Provider value={{ players, globalConfig, hydrated, updatePlayer, updateConfig }}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context
}

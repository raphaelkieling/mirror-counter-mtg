'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAppState } from './app-state-context'

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

export function GameConfigProvider({ children }: { children: ReactNode }) {
  const appState = useAppState()

  return (
    <GameConfigContext.Provider value={{ ...appState.globalConfig, update: appState.updateConfig }}>
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

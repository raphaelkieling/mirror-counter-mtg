'use client'

import { createContext, useContext, useCallback } from 'react'
import { useAppState } from './app-state-context'

interface PlayerData {
  name: string
  color: string
  inverted: boolean
  skulls: number
  energy: number
  showCounters: boolean
}

interface PlayerDataContextType {
  getPlayerData: (playerId: number, defaults?: Partial<PlayerData>) => PlayerData
  updatePlayerData: (playerId: number, data: Partial<PlayerData>) => void
}

const PlayerDataContext = createContext<PlayerDataContextType | undefined>(undefined)

export function PlayerDataProvider({ children }: any) {
  const appState = useAppState()

  const getPlayerData = useCallback((playerId: number, defaults?: Partial<PlayerData>): PlayerData => {
    const player = appState.players.find((p) => p.id === playerId)
    return {
      name: player?.name || `PLAYER ${playerId}`,
      color: player?.color || '#ffffff',
      inverted: player?.inverted ?? (playerId === 1),
      skulls: player?.skulls || 0,
      energy: player?.energy || 0,
      showCounters: player?.showCounters ?? true,
      ...defaults,
    }
  }, [appState.players])

  const updatePlayerData = useCallback((playerId: number, data: Partial<PlayerData>) => {
    appState.updatePlayer(playerId, data as any)
  }, [appState])

  return (
    <PlayerDataContext.Provider value={{ getPlayerData, updatePlayerData }}>
      {children}
    </PlayerDataContext.Provider>
  )
}

export function usePlayerData(playerId: number, defaults?: Partial<PlayerData>) {
  const context = useContext(PlayerDataContext)
  if (!context) {
    throw new Error('usePlayerData must be used within PlayerDataProvider')
  }
  const data = context.getPlayerData(playerId, defaults)
  return {
    ...data,
    update: (newData: Partial<PlayerData>) => context.updatePlayerData(playerId, newData),
  }
}

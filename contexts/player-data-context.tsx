'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'

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

const STORAGE_KEY = 'player-data-v1'

export function PlayerDataProvider({ children }: { children: ReactNode }) {
  const [playerData, setPlayerData] = useState<Record<number, PlayerData>>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setPlayerData(JSON.parse(stored))
      } catch { /* use defaults */ }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(playerData))
  }, [playerData, hydrated])

  const getPlayerData = useCallback((playerId: number, defaults?: Partial<PlayerData>): PlayerData => {
    return playerData[playerId] || {
      name: `PLAYER ${playerId}`,
      color: '#ffffff',
      inverted: playerId === 1,
      skulls: 0,
      energy: 0,
      showCounters: true,
      ...defaults,
    }
  }, [playerData])

  const updatePlayerData = useCallback((playerId: number, data: Partial<PlayerData>) => {
    setPlayerData((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        ...data,
      },
    }))
  }, [])

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

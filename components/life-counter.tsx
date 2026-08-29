'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock3, Settings2, Info, GitBranch } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { GameSettings } from './game-settings'
import { PlayerSettings } from './player-settings'
import { HistoryContent } from './history-content'
import { Dialog } from './dialog'
import { PlayerPanel } from './player-panel'
import { RadialMenu } from './radial-menu'
import { usePlayerData } from '@/contexts/player-data-context'
import { useGameConfig } from '@/contexts/game-config-context'

type HistoryEntry = { value: number; at: string; isRollback?: boolean }
type Player = { id: number; name: string; color: string; life: number; history: HistoryEntry[]; inverted?: boolean }

const STORAGE_KEY = 'mana-counter-v1'
const defaultPlayers: Player[] = [
  { id: 1, name: 'PLAYER 1', color: '#ffffff', life: 20, history: [], inverted: true },
  { id: 2, name: 'PLAYER 2', color: '#000000', life: 20, history: [], inverted: false },
]

function contrast(color: string) {
  const hex = color.replace('#', '')
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#111111' : '#ffffff'
}

export default function LifeCounter() {
  const posthog = usePostHog()
  const gameConfig = useGameConfig()
  const [players, setPlayers] = useState(defaultPlayers)
  const [currentTime, setCurrentTime] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingHistoryIds, setPendingHistoryIds] = useState<Set<number>>(new Set())
  const historyTimers = useRef<Record<number, number>>({})
  const [settingsId, setSettingsId] = useState<number | null>(null)
  const [historyId, setHistoryId] = useState<number | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [rollbackConfirmation, setRollbackConfirmation] = useState<{ playerId: number; value: number } | null>(null)
  const holdIntervalRef = useRef<number | null>(null)
  const holdStateRef = useRef<{ playerId: number; direction: number } | null>(null)
  const holdTimeoutRef = useRef<number | null>(null)
  const isHoldingRef = useRef(false)
  const player1Data = usePlayerData(1)
  const player2Data = usePlayerData(2)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const value = JSON.parse(stored)
        const loadedPlayers = (value.players ?? defaultPlayers).map((p: any) => ({ ...p, history: p.history ?? [] }))
        setPlayers(loadedPlayers)
      } catch { /* use defaults */ }
    }

    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    setPlayers((current) =>
      current.map((p) => {
        const playerData = p.id === 1 ? player1Data : player2Data
        return {
          ...p,
          color: playerData.color || p.color,
          inverted: playerData.inverted,
          name: playerData.name,
        }
      })
    )
  }, [hydrated])

  useEffect(() => {
    if (!hydrated) return
    const timeout = window.setTimeout(() => {
      const playersToSave = players.map(({ id, name, color, life, inverted, history }) => ({ id, name, color, life, inverted, history }))
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ players: playersToSave }))
    }, 500)
    return () => window.clearTimeout(timeout)
  }, [players, hydrated])

  useEffect(() => {
    if (!gameConfig.showTime) return
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }))
    }
    updateTime()
    const interval = window.setInterval(updateTime, 1000)
    return () => window.clearInterval(interval)
  }, [gameConfig.showTime])

  useEffect(() => {
    if (historyId !== null) {
      posthog.capture('history_opened', { player_id: historyId })
    }
  }, [historyId, posthog])

  useEffect(() => {
    posthog.capture('dark_mode_toggled', { dark_mode: gameConfig.darkMode })
  }, [gameConfig.darkMode, posthog])

  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    let wakeLockSentinel: any = null
    const requestWakeLock = async () => {
      try {
        wakeLockSentinel = await navigator.wakeLock.request('screen')
      } catch (err) {
        console.error('Wake Lock failed:', err)
      }
    }
    requestWakeLock()
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        if (wakeLockSentinel) wakeLockSentinel.release()
      } else {
        await requestWakeLock()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeLockSentinel) wakeLockSentinel.release()
    }
  }, [])

  const activePlayer = useMemo(() => players.find((player) => player.id === settingsId), [players, settingsId])

  function changeLife(id: number, delta: number) {
    if (navigator.vibrate) {
      navigator.vibrate([20, 10, 20])
    }
    setPlayers((current) => current.map((player) => player.id === id ? { ...player, life: Math.max(0, Math.min(99, player.life + delta)) } : player))
    window.clearTimeout(historyTimers.current[id])
    setPendingHistoryIds((prev) => new Set([...prev, id]))
    historyTimers.current[id] = window.setTimeout(() => {
      setPlayers((current) => current.map((player) => player.id === id ? { ...player, history: [...player.history, { value: player.life, at: new Date().toISOString() }] } : player))
      setPendingHistoryIds((prev) => { const newSet = new Set(prev); newSet.delete(id); return newSet })
    }, gameConfig.historyDelay * 1000)
  }
  function startHold(playerId: number, direction: number) {
    isHoldingRef.current = false
    holdStateRef.current = { playerId, direction }
    if (holdIntervalRef.current) window.clearInterval(holdIntervalRef.current)
    if (holdTimeoutRef.current) window.clearTimeout(holdTimeoutRef.current)
    holdTimeoutRef.current = window.setTimeout(() => {
      isHoldingRef.current = true
      changeLife(holdStateRef.current!.playerId, holdStateRef.current!.direction * gameConfig.holdIncrement)
      holdIntervalRef.current = window.setInterval(() => {
        if (holdStateRef.current) {
          changeLife(holdStateRef.current.playerId, holdStateRef.current.direction * gameConfig.holdIncrement)
        }
      }, 1000)
    }, 500)
  }
  function endHold() {
    if (holdTimeoutRef.current) window.clearTimeout(holdTimeoutRef.current)
    if (holdIntervalRef.current) window.clearInterval(holdIntervalRef.current)
    if (!isHoldingRef.current && holdStateRef.current) {
      changeLife(holdStateRef.current.playerId, holdStateRef.current.direction)
    }
    holdStateRef.current = null
    isHoldingRef.current = false
  }
  function saveHistory(id: number) {
    window.clearTimeout(historyTimers.current[id])
    setPlayers((current) => current.map((player) => player.id === id ? { ...player, history: [...player.history, { value: player.life, at: new Date().toISOString() }] } : player))
    setPendingHistoryIds((prev) => { const newSet = new Set(prev); newSet.delete(id); return newSet })
  }
  function restart() {
    Object.values(historyTimers.current).forEach(window.clearTimeout)
    historyTimers.current = {}
    setPlayers((current) => current.map((player) => ({ ...player, life: gameConfig.startLife, history: [] })))
    player1Data.update({ skulls: 0, energy: 0 })
    player2Data.update({ skulls: 0, energy: 0 })
    setMenuOpen(false)
  }
  function updateColor(color: string) {
    posthog.capture('color_changed', { player_id: settingsId, color })
    setPlayers((current) => current.map((player) => player.id === settingsId ? { ...player, color } : player))
  }
  function toggleInverted() { setPlayers((current) => current.map((player) => player.id === settingsId ? { ...player, inverted: !player.inverted } : player)) }
  function applyRollback(playerId: number, value: number) {
    posthog.capture('rollback_applied', { player_id: playerId, new_life: value })
    setPlayers((current) => current.map((player) => player.id === playerId ? { ...player, life: value, history: [...player.history, { value, at: new Date().toISOString(), isRollback: true }] } : player))
    setRollbackConfirmation(null)
  }
  function fillDemoData() {
    const now = new Date()
    const generateHistory = (startLife: number, finalLife: number, count: number) => {
      const history: HistoryEntry[] = []
      const step = (startLife - finalLife) / Math.max(1, count - 1)
      for (let i = 0; i < count; i++) {
        const value = Math.round(startLife - step * i)
        const time = new Date(now.getTime() - (count - i) * 30000)
        history.push({ value, at: time.toISOString(), isRollback: false })
      }
      return history
    }
    setPlayers([
      { id: 1, name: 'PLAYER 1', color: '#ff174e', life: 13, history: generateHistory(20, 13, 32), inverted: true },
      { id: 2, name: 'PLAYER 2', color: '#4652f5', life: 21, history: generateHistory(20, 21, 32), inverted: false }
    ])
    setAboutOpen(false)
  }

  if (!hydrated) return null

  return (
    <main className="counter-shell">
      <div className="counter-frame">
        <div className="players-stack">
          {players.map((player) => <PlayerPanel key={player.id} player={player} showFloatingNumbers={gameConfig.showFloatingNumbers} historyDelay={gameConfig.historyDelay} onChange={(delta) => changeLife(player.id, delta)} onSettings={() => setSettingsId(player.id)} onHistory={() => setHistoryId(player.id)} hasPendingHistory={pendingHistoryIds.has(player.id)} onSaveHistory={() => saveHistory(player.id)} onHoldStart={(direction) => startHold(player.id, direction)} onHoldEnd={endHold} />)}
        </div>
        <RadialMenu isOpen={menuOpen} onToggle={() => setMenuOpen((open) => !open)} onRestart={restart} onConfig={() => { setSettingsId(-1); if (gameConfig.closeRadialOnDialog) setMenuOpen(false); }} onAbout={() => { setAboutOpen(true); if (gameConfig.closeRadialOnDialog) setMenuOpen(false); }} />
        {gameConfig.showTime && <div className="current-time">{currentTime}</div>}
      </div>

      <Dialog isOpen={settingsId !== null} onClose={() => setSettingsId(null)} icon={Settings2} eyebrow="SETTINGS" title={settingsId === -1 ? 'Game configuration' : activePlayer?.name ?? ''} isInverted={settingsId !== -1 ? activePlayer?.inverted : undefined}>
        {settingsId === -1 ? (
          <GameSettings startLife={gameConfig.startLife} historyDelay={gameConfig.historyDelay} closeRadialOnDialog={gameConfig.closeRadialOnDialog} showTime={gameConfig.showTime} darkMode={gameConfig.darkMode} showFloatingNumbers={gameConfig.showFloatingNumbers} holdIncrement={gameConfig.holdIncrement} onStartLifeChange={(v) => gameConfig.update({ startLife: v })} onHistoryDelayChange={(v) => gameConfig.update({ historyDelay: v })} onCloseRadialOnDialogChange={(v) => gameConfig.update({ closeRadialOnDialog: v })} onShowTimeChange={(v) => gameConfig.update({ showTime: v })} onDarkModeChange={(v) => gameConfig.update({ darkMode: v })} onShowFloatingNumbersChange={(v) => gameConfig.update({ showFloatingNumbers: v })} onHoldIncrementChange={(v) => gameConfig.update({ holdIncrement: v })} />
        ) : (
          <PlayerSettings player={activePlayer} onColorChange={updateColor} onInvertedChange={toggleInverted} />
        )}
      </Dialog>
      <Dialog isOpen={historyId !== null} onClose={() => setHistoryId(null)} icon={Clock3} eyebrow="HISTORY" title={players.find(p => p.id === historyId)?.name ?? ''} isInverted={players.find(p => p.id === historyId)?.inverted}>
        <HistoryContent history={players.find(p => p.id === historyId)?.history ?? []} onSelectRollback={historyId !== null ? (value) => setRollbackConfirmation({ playerId: historyId, value }) : undefined} />
      </Dialog>

      <Dialog isOpen={rollbackConfirmation !== null} onClose={() => setRollbackConfirmation(null)} eyebrow="CONFIRM" title="Rollback life?">
        <div className="settings-content">
          <p style={{ marginBottom: '24px' }}>Set life to <strong>{rollbackConfirmation?.value}</strong>?</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setRollbackConfirmation(null)} style={{ flex: 1, padding: '12px', border: '1px solid var(--line)', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => rollbackConfirmation && applyRollback(rollbackConfirmation.playerId, rollbackConfirmation.value)} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', background: '#4652f5', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Confirm</button>
          </div>
        </div>
      </Dialog>
      <Dialog isOpen={aboutOpen} onClose={() => setAboutOpen(false)} icon={Info} eyebrow="ABOUT" title="Mirror Counter">
        <div className="settings-content">
          <p>A fast, simple life counter for Magic: The Gathering 1x1 format.</p>
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>Created by <strong>Raphael Kieling</strong></p>
          <p style={{ fontSize: '14px', color: '#666' }}>© 2026</p>
          <p style={{ marginTop: '24px', fontSize: '12px', color: '#999', fontFamily: 'monospace' }}>
            Deployment: {process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_ID}<br />
            Environment: {process.env.NEXT_PUBLIC_VERCEL_ENV}
          </p>
        </div>
      </Dialog>
    </main>
  )
}

export { PlayerPanel }
export type { Player, HistoryEntry }

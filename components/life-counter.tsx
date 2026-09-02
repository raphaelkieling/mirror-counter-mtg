'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Clock3, Settings2, Info, GitBranch } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { GameSettings } from './game-settings'
import { PlayerSettings } from './player-settings'
import { HistoryContent } from './history-content'
import { Dialog } from './dialog'
import { PlayerPanel } from './player-panel'
import { RadialMenu } from './radial-menu'
import { useGameConfig } from '@/contexts/game-config-context'
import { useAppState } from '@/contexts/app-state-context'
import { useScreenWakeLock, type WakeLockStatus } from '@/lib/use-screen-wake-lock'

type HistoryEntry = { value: number; at: string; isRollback?: boolean }
type Player = { id: number; name: string; color: string; life: number; history: HistoryEntry[]; inverted?: boolean }

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
  const appState = useAppState()
  const [currentTime, setCurrentTime] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingHistoryIds, setPendingHistoryIds] = useState<Set<number>>(new Set())
  const historyTimers = useRef<Record<number, number>>({})
  const [settingsId, setSettingsId] = useState<number | null>(null)
  const [historyId, setHistoryId] = useState<number | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [rollbackConfirmation, setRollbackConfirmation] = useState<{ playerId: number; value: number } | null>(null)
  const [createdByClicks, setCreatedByClicks] = useState(0)
  const [advancedPanelOpen, setAdvancedPanelOpen] = useState(false)
  const [wakeLockStatus, setWakeLockStatus] = useState<WakeLockStatus>('idle')
  const clickTimeoutRef = useRef<number | null>(null)
  const holdIntervalRef = useRef<number | null>(null)
  const holdStateRef = useRef<{ playerId: number; direction: number } | null>(null)
  const holdTimeoutRef = useRef<number | null>(null)
  const isHoldingRef = useRef(false)
  const lifeValueRef = useRef<Record<number, number>>({ 1: 20, 2: 20 })

  useScreenWakeLock(gameConfig.keepAliveScreen, setWakeLockStatus)

  useEffect(() => {
    appState.players.forEach(player => {
      lifeValueRef.current[player.id] = player.life
    })
  }, [appState.players])

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


  const activePlayer = useMemo(() => appState.players.find((player) => player.id === settingsId), [appState.players, settingsId])

  const changeLife = useCallback((id: number, delta: number) => {
    if (navigator.vibrate) {
      navigator.vibrate([20, 10, 20])
    }

    const currentLife = lifeValueRef.current[id] || 20
    const newLife = Math.max(0, Math.min(99, currentLife + delta))
    lifeValueRef.current[id] = newLife
    appState.updatePlayer(id, { life: newLife })

    window.clearTimeout(historyTimers.current[id])
    setPendingHistoryIds((prev) => new Set([...prev, id]))
    historyTimers.current[id] = window.setTimeout(() => {
      const player = appState.players.find(p => p.id === id)
      if (player) {
        appState.updatePlayer(id, {
          history: [...player.history, { value: newLife, at: new Date().toISOString() }]
        })
      }
      setPendingHistoryIds((prev) => { const newSet = new Set(prev); newSet.delete(id); return newSet })
    }, gameConfig.historyDelay * 1000)
  }, [appState, gameConfig.historyDelay])
  function startHold(playerId: number, direction: number) {
    isHoldingRef.current = false
    holdStateRef.current = { playerId, direction }
    if (holdIntervalRef.current) {
      window.clearInterval(holdIntervalRef.current)
      holdIntervalRef.current = null
    }
    if (holdTimeoutRef.current) {
      window.clearTimeout(holdTimeoutRef.current)
      holdTimeoutRef.current = null
    }

    const increment = gameConfig.holdIncrement
    holdTimeoutRef.current = window.setTimeout(() => {
      isHoldingRef.current = true
      changeLife(playerId, direction * increment)
      holdIntervalRef.current = window.setInterval(() => {
        if (isHoldingRef.current) {
          changeLife(playerId, direction * increment)
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
    const player = appState.players.find(p => p.id === id)
    if (player) {
      appState.updatePlayer(id, { history: [...player.history, { value: player.life, at: new Date().toISOString() }] })
    }
    setPendingHistoryIds((prev) => { const newSet = new Set(prev); newSet.delete(id); return newSet })
  }
  function restart() {
    Object.values(historyTimers.current).forEach(window.clearTimeout)
    historyTimers.current = {}
    appState.players.forEach((player) => {
      appState.updatePlayer(player.id, { life: gameConfig.startLife, history: [], skulls: 0, energy: 0 })
    })
    setMenuOpen(false)
  }
  function updateColor(color: string) {
    posthog.capture('color_changed', { player_id: settingsId, color })
    if (settingsId !== null && settingsId !== -1) {
      appState.updatePlayer(settingsId, { color })
    }
  }
  function toggleInverted() {
    if (settingsId !== null && settingsId !== -1) {
      const player = appState.players.find(p => p.id === settingsId)
      if (player) {
        appState.updatePlayer(settingsId, { inverted: !player.inverted })
      }
    }
  }
  function applyRollback(playerId: number, value: number) {
    posthog.capture('rollback_applied', { player_id: playerId, new_life: value })
    const player = appState.players.find(p => p.id === playerId)
    if (player) {
      appState.updatePlayer(playerId, { life: value, history: [...player.history, { value, at: new Date().toISOString(), isRollback: true }] })
    }
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
    appState.updatePlayer(1, { name: 'PLAYER 1', color: '#ff174e', life: 13, history: generateHistory(20, 13, 32), inverted: true })
    appState.updatePlayer(2, { name: 'PLAYER 2', color: '#4652f5', life: 21, history: generateHistory(20, 21, 32), inverted: false })
    setAboutOpen(false)
  }

  function handleCreatedByClick() {
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)

    const newClicks = createdByClicks + 1
    setCreatedByClicks(newClicks)

    if (newClicks >= 3) {
      setAdvancedPanelOpen(true)
      setCreatedByClicks(0)
    } else {
      clickTimeoutRef.current = window.setTimeout(() => {
        setCreatedByClicks(0)
      }, 500)
    }
  }

  const isPwaSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator
  const isWakeLockSupported = typeof window !== 'undefined' && 'wakeLock' in navigator

  return (
    <main className="counter-shell">
      <div className="counter-frame">
        <div className="players-stack">
          {appState.players.map((player) => <PlayerPanel key={player.id} player={player} showFloatingNumbers={gameConfig.showFloatingNumbers} historyDelay={gameConfig.historyDelay} onChange={(delta) => changeLife(player.id, delta)} onSettings={() => setSettingsId(player.id)} onHistory={() => setHistoryId(player.id)} hasPendingHistory={pendingHistoryIds.has(player.id)} onSaveHistory={() => saveHistory(player.id)} onHoldStart={(direction) => startHold(player.id, direction)} onHoldEnd={endHold} />)}
        </div>
        <RadialMenu isOpen={menuOpen} onToggle={() => setMenuOpen((open) => !open)} onRestart={restart} onConfig={() => { setSettingsId(-1); if (gameConfig.closeRadialOnDialog) setMenuOpen(false); }} onAbout={() => { setAboutOpen(true); if (gameConfig.closeRadialOnDialog) setMenuOpen(false); }} />
        {gameConfig.showTime && <div className="current-time">{currentTime}</div>}
      </div>

      <Dialog isOpen={settingsId !== null} onClose={() => setSettingsId(null)} icon={Settings2} eyebrow="SETTINGS" title={settingsId === -1 ? 'Game configuration' : activePlayer?.name ?? ''} isInverted={settingsId !== -1 ? activePlayer?.inverted : undefined}>
        {settingsId === -1 ? (
          <GameSettings startLife={gameConfig.startLife} historyDelay={gameConfig.historyDelay} closeRadialOnDialog={gameConfig.closeRadialOnDialog} showTime={gameConfig.showTime} darkMode={gameConfig.darkMode} showFloatingNumbers={gameConfig.showFloatingNumbers} holdIncrement={gameConfig.holdIncrement} keepAliveScreen={gameConfig.keepAliveScreen} onStartLifeChange={(v) => gameConfig.update({ startLife: v })} onHistoryDelayChange={(v) => gameConfig.update({ historyDelay: v })} onCloseRadialOnDialogChange={(v) => gameConfig.update({ closeRadialOnDialog: v })} onShowTimeChange={(v) => gameConfig.update({ showTime: v })} onDarkModeChange={(v) => gameConfig.update({ darkMode: v })} onShowFloatingNumbersChange={(v) => gameConfig.update({ showFloatingNumbers: v })} onHoldIncrementChange={(v) => gameConfig.update({ holdIncrement: v })} onKeepAliveScreenChange={(v) => gameConfig.update({ keepAliveScreen: v })} />
        ) : (
          <PlayerSettings player={activePlayer} onColorChange={updateColor} onInvertedChange={toggleInverted} />
        )}
      </Dialog>
      <Dialog isOpen={historyId !== null} onClose={() => setHistoryId(null)} icon={Clock3} eyebrow="HISTORY" title={appState.players.find(p => p.id === historyId)?.name ?? ''} isInverted={appState.players.find(p => p.id === historyId)?.inverted}>
        <HistoryContent history={appState.players.find(p => p.id === historyId)?.history ?? []} onSelectRollback={historyId !== null ? (value) => setRollbackConfirmation({ playerId: historyId, value }) : undefined} />
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
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#666', cursor: 'pointer', userSelect: 'none' }} onClick={handleCreatedByClick}>
            Created by <strong>Raphael Kieling</strong>
          </p>
          <p style={{ fontSize: '14px', color: '#666' }}>© 2026</p>
          {advancedPanelOpen && (
            <div style={{ marginTop: '24px', padding: '12px', border: '1px solid var(--line)', borderRadius: '8px', backgroundColor: 'rgba(70, 82, 245, 0.05)' }}>
              <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0', fontWeight: 'bold' }}>Advanced Info</p>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0', fontFamily: 'monospace' }}>PWA: {isPwaSupported ? '✓ Supported' : '✗ Not supported'}</p>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0', fontFamily: 'monospace' }}>
                Wake Lock: {isWakeLockSupported ? '✓ Supported' : '✗ Not supported'}
              </p>
              {isWakeLockSupported && (
                <p style={{ fontSize: '12px', color: '#666', margin: '4px 0', fontFamily: 'monospace' }}>
                  Wake Lock Status: {wakeLockStatus === 'acquired' && '✓ Acquired'} {wakeLockStatus === 'released' && '↻ Released'} {wakeLockStatus === 'error' && '✗ Error'} {wakeLockStatus === 'idle' && '○ Idle'}
                </p>
              )}
              <p style={{ fontSize: '12px', color: '#666', margin: '12px 0 4px 0', fontFamily: 'monospace', borderTop: '1px solid rgba(70, 82, 245, 0.1)', paddingTop: '8px' }}>
                Deployment: {process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_ID}
              </p>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0', fontFamily: 'monospace' }}>
                Environment: {process.env.NEXT_PUBLIC_VERCEL_ENV}
              </p>
            </div>
          )}
        </div>
      </Dialog>
    </main>
  )
}

export { PlayerPanel }
export type { Player, HistoryEntry }

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock3, Settings2, Info } from 'lucide-react'
import { GameSettings } from './game-settings'
import { PlayerSettings } from './player-settings'
import { HistoryContent } from './history-content'
import { Dialog } from './dialog'
import { PlayerPanel } from './player-panel'
import { RadialMenu } from './radial-menu'

type HistoryEntry = { value: number; at: string }
type Player = { id: number; name: string; color: string; life: number; history: HistoryEntry[]; inverted?: boolean }

const STORAGE_KEY = 'mana-counter-v1'
const defaultPlayers: Player[] = [
  { id: 1, name: 'PLAYER 1', color: '#ff174e', life: 20, history: [], inverted: true },
  { id: 2, name: 'PLAYER 2', color: '#4652f5', life: 20, history: [], inverted: false },
]

function contrast(color: string) {
  const hex = color.replace('#', '')
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#111111' : '#ffffff'
}

export default function LifeCounter() {
  const [players, setPlayers] = useState(defaultPlayers)
  const [startLife, setStartLife] = useState(20)
  const [historyDelay, setHistoryDelay] = useState(2)
  const [closeRadialOnDialog, setCloseRadialOnDialog] = useState(true)
  const [showTime, setShowTime] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingHistoryIds, setPendingHistoryIds] = useState<Set<number>>(new Set())
  const historyTimers = useRef<Record<number, number>>({})
  const [settingsId, setSettingsId] = useState<number | null>(null)
  const [historyId, setHistoryId] = useState<number | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const value = JSON.parse(stored)
        const loadedPlayers = (value.players ?? defaultPlayers).map((p: any) => ({ ...p, history: p.history ?? [] }))
        setPlayers(loadedPlayers)
        setStartLife(value.startLife ?? 20)
        setHistoryDelay(value.historyDelay ?? 2)
        setCloseRadialOnDialog(value.closeRadialOnDialog ?? true)
        setShowTime(value.showTime ?? false)
      } catch { /* use defaults */ }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const timeout = window.setTimeout(() => {
      const playersToSave = players.map(({ id, name, color, life, inverted, history }) => ({ id, name, color, life, inverted, history }))
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ players: playersToSave, startLife, historyDelay, closeRadialOnDialog, showTime }))
    }, 500)
    return () => window.clearTimeout(timeout)
  }, [players, startLife, historyDelay, closeRadialOnDialog, showTime, hydrated])

  useEffect(() => {
    if (!showTime) return
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }))
    }
    updateTime()
    const interval = window.setInterval(updateTime, 1000)
    return () => window.clearInterval(interval)
  }, [showTime])

  const activePlayer = useMemo(() => players.find((player) => player.id === settingsId), [players, settingsId])

  function changeLife(id: number, delta: number) {
    setPlayers((current) => current.map((player) => player.id === id ? { ...player, life: Math.max(0, player.life + delta) } : player))
    window.clearTimeout(historyTimers.current[id])
    setPendingHistoryIds((prev) => new Set([...prev, id]))
    historyTimers.current[id] = window.setTimeout(() => {
      setPlayers((current) => current.map((player) => player.id === id ? { ...player, history: [...player.history, { value: player.life, at: new Date().toISOString() }] } : player))
      setPendingHistoryIds((prev) => { const newSet = new Set(prev); newSet.delete(id); return newSet })
    }, historyDelay * 1000)
  }
  function saveHistory(id: number) {
    window.clearTimeout(historyTimers.current[id])
    setPlayers((current) => current.map((player) => player.id === id ? { ...player, history: [...player.history, { value: player.life, at: new Date().toISOString() }] } : player))
    setPendingHistoryIds((prev) => { const newSet = new Set(prev); newSet.delete(id); return newSet })
  }
  function restart() {
    Object.values(historyTimers.current).forEach(window.clearTimeout)
    historyTimers.current = {}
    setPlayers((current) => current.map((player) => ({ ...player, life: startLife, history: [] })))
    setMenuOpen(false)
  }
  function updateColor(color: string) { setPlayers((current) => current.map((player) => player.id === settingsId ? { ...player, color } : player)) }
  function toggleInverted() { setPlayers((current) => current.map((player) => player.id === settingsId ? { ...player, inverted: !player.inverted } : player)) }
  function fillDemoData() {
    const now = new Date()
    const generateHistory = (startLife: number, finalLife: number, count: number) => {
      const history: HistoryEntry[] = []
      const step = (startLife - finalLife) / Math.max(1, count - 1)
      for (let i = 0; i < count; i++) {
        const value = Math.round(startLife - step * i)
        const time = new Date(now.getTime() - (count - i) * 30000)
        history.push({ value, at: time.toISOString() })
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
          {players.map((player) => <PlayerPanel key={player.id} player={player} onChange={(delta) => changeLife(player.id, delta)} onSettings={() => setSettingsId(player.id)} onHistory={() => setHistoryId(player.id)} hasPendingHistory={pendingHistoryIds.has(player.id)} onSaveHistory={() => saveHistory(player.id)} />)}
        </div>
        <RadialMenu isOpen={menuOpen} onToggle={() => setMenuOpen((open) => !open)} onRestart={restart} onConfig={() => { setSettingsId(-1); if (closeRadialOnDialog) setMenuOpen(false); }} onAbout={() => { setAboutOpen(true); if (closeRadialOnDialog) setMenuOpen(false); }} />
        {showTime && <div className="current-time">{currentTime}</div>}
      </div>

      <Dialog isOpen={settingsId !== null} onClose={() => setSettingsId(null)} icon={Settings2} eyebrow="SETTINGS" title={settingsId === -1 ? 'Game configuration' : activePlayer?.name ?? ''}>
        {settingsId === -1 ? (
          <GameSettings startLife={startLife} historyDelay={historyDelay} closeRadialOnDialog={closeRadialOnDialog} showTime={showTime} onStartLifeChange={setStartLife} onHistoryDelayChange={setHistoryDelay} onCloseRadialOnDialogChange={setCloseRadialOnDialog} onShowTimeChange={setShowTime} />
        ) : (
          <PlayerSettings player={activePlayer} onColorChange={updateColor} onInvertedChange={toggleInverted} />
        )}
      </Dialog>
      <Dialog isOpen={historyId !== null} onClose={() => setHistoryId(null)} icon={Clock3} eyebrow="HISTORY" title={players.find(p => p.id === historyId)?.name ?? ''}>
        <HistoryContent history={players.find(p => p.id === historyId)?.history ?? []} />
      </Dialog>
      <Dialog isOpen={aboutOpen} onClose={() => setAboutOpen(false)} icon={Info} eyebrow="ABOUT" title="Counters">
        <div className="dialog-content">
          <p>A fast, simple life counter for tabletop games.</p>
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>Created by <strong>Raphael Kieling</strong></p>
          <p style={{ fontSize: '14px', color: '#666' }}>© 2026</p>
          <button onClick={fillDemoData} style={{ marginTop: '24px', width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#d9d7df', color: '#111116', fontWeight: '700', cursor: 'pointer' }}>Fill out with demo content</button>
        </div>
      </Dialog>
    </main>
  )
}

export { PlayerPanel }
export type { Player, HistoryEntry }

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Clock3, Minus, Plus, RotateCcw, Settings2, SlidersHorizontal, X } from 'lucide-react'
import { GameSettings } from './game-settings'
import { PlayerSettings } from './player-settings'
import { HistoryContent } from './history-content'

type HistoryEntry = { value: number; at: string }
type Player = { id: number; name: string; color: string; life: number; history: HistoryEntry[]; inverted?: boolean }

const PALETTE = ['#ff174e', '#4652f5', '#18b887', '#f59e0b', '#d946ef', '#0ea5e9']
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

function Dialog({ isOpen, onClose, icon: Icon, eyebrow, title, children }: { isOpen: boolean; onClose: () => void; icon?: React.ElementType; eyebrow: string; title: string; children: React.ReactNode }) {
  if (!isOpen) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <aside className="settings-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-heading">
          <div>
            <p className="eyebrow">{Icon && <Icon size={14} style={{ display: 'inline', marginRight: '4px' }} />}{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </aside>
    </div>
  )
}

function RadialMenu({ isOpen, onToggle, onRestart, onConfig }: { isOpen: boolean; onToggle: () => void; onRestart: () => void; onConfig: () => void }) {
  return (
    <>
      {isOpen && <div className="radial-backdrop" onClick={onToggle} />}
      <div className="radial-container">
        {isOpen && <div className="radial-menu" role="menu" aria-label="Game options"><button className="radial-action radial-action-restart" onClick={onRestart} role="menuitem" aria-label="Restart"><RotateCcw size={20} /></button><button className="radial-action radial-action-config" onClick={onConfig} role="menuitem" aria-label="Configuration"><Settings2 size={20} /></button></div>}
        <button className={`option-button ${isOpen ? 'is-open' : ''}`} onClick={onToggle} aria-expanded={isOpen} aria-label={isOpen ? 'Close options' : 'Open options'}><SlidersHorizontal size={18} /></button>
      </div>
    </>
  )
}

function PlayerPanel({ player, onChange, onSettings, onHistory, hasPendingHistory, onSaveHistory }: { player: Player; onChange: (delta: number) => void; onSettings: () => void; onHistory: () => void; hasPendingHistory: boolean; onSaveHistory: () => void }) {
  const text = contrast(player.color)
  const hasHistory = player.history.length > 0
  return (
    <section className="player-panel" style={{ backgroundColor: player.color, color: text, transform: player.inverted ? 'rotate(180deg)' : undefined }} aria-label={`${player.name} life counter`}>
      <div className="player-topline">
        <span className="player-name">{player.name}</span>
        <div className="player-icons">
          <button className="icon-button" style={{ color: text, opacity: hasHistory ? 1 : 0.4 }} onClick={onHistory} disabled={!hasHistory} aria-label={`View ${player.name} history`}><Clock3 size={18} strokeWidth={2.2} /></button>
          <button className="icon-button" style={{ color: text }} onClick={onSettings} aria-label={`Configure ${player.name}`}><Settings2 size={18} strokeWidth={2.2} /></button>
        </div>
      </div>
      <div className="life-row">
        <button className="life-adjust" style={{ color: text }} onClick={() => onChange(-1)} aria-label={`Subtract life from ${player.name}`}><Minus size={18} /></button>
        <output className="life-value" aria-label={`${player.life} life`}>{player.life}</output>
        <button className="life-adjust" style={{ color: text }} onClick={() => onChange(1)} aria-label={`Add life to ${player.name}`}><Plus size={18} /></button>
      </div>
      <div className="player-footer">
        {hasPendingHistory && <button className="save-history-btn" onClick={onSaveHistory} style={{ color: text }} aria-label="Save history now"><Check size={16} strokeWidth={2.5} /></button>}
      </div>
    </section>
  )
}

export default function LifeCounter() {
  const [players, setPlayers] = useState(defaultPlayers)
  const [startLife, setStartLife] = useState(20)
  const [historyDelay, setHistoryDelay] = useState(2)
  const [closeRadialOnDialog, setCloseRadialOnDialog] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingHistoryIds, setPendingHistoryIds] = useState<Set<number>>(new Set())
  const historyTimers = useRef<Record<number, number>>({})
  const [settingsId, setSettingsId] = useState<number | null>(null)
  const [historyId, setHistoryId] = useState<number | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { const value = JSON.parse(stored); setPlayers(value.players ?? defaultPlayers); setStartLife(value.startLife ?? 20); setHistoryDelay(value.historyDelay ?? 2); setCloseRadialOnDialog(value.closeRadialOnDialog ?? true) } catch { /* use defaults */ }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const timeout = window.setTimeout(() => window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ players, startLife, historyDelay, closeRadialOnDialog })), 3000)
    return () => window.clearTimeout(timeout)
  }, [players, startLife, historyDelay, closeRadialOnDialog, hydrated])

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

  return (
    <main className="counter-shell">
      <div className="counter-frame">
        <div className="players-stack">
          {players.map((player) => <PlayerPanel key={player.id} player={player} onChange={(delta) => changeLife(player.id, delta)} onSettings={() => setSettingsId(player.id)} onHistory={() => setHistoryId(player.id)} hasPendingHistory={pendingHistoryIds.has(player.id)} onSaveHistory={() => saveHistory(player.id)} />)}
        </div>
        <RadialMenu isOpen={menuOpen} onToggle={() => setMenuOpen((open) => !open)} onRestart={restart} onConfig={() => { setSettingsId(-1); if (closeRadialOnDialog) setMenuOpen(false); }} />
      </div>

      <Dialog isOpen={settingsId !== null} onClose={() => setSettingsId(null)} icon={Settings2} eyebrow="SETTINGS" title={settingsId === -1 ? 'Game configuration' : activePlayer?.name ?? ''}>
        {settingsId === -1 ? (
          <GameSettings startLife={startLife} historyDelay={historyDelay} closeRadialOnDialog={closeRadialOnDialog} onStartLifeChange={setStartLife} onHistoryDelayChange={setHistoryDelay} onCloseRadialOnDialogChange={setCloseRadialOnDialog} />
        ) : (
          <PlayerSettings player={activePlayer} onColorChange={updateColor} onInvertedChange={toggleInverted} />
        )}
      </Dialog>
      <Dialog isOpen={historyId !== null} onClose={() => setHistoryId(null)} icon={Clock3} eyebrow="HISTORY" title={players.find(p => p.id === historyId)?.name ?? ''}>
        <HistoryContent history={players.find(p => p.id === historyId)?.history ?? []} />
      </Dialog>
    </main>
  )
}

export { PlayerPanel }
export type { Player, HistoryEntry }

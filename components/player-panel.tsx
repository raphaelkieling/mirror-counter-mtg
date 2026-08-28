'use client'

import { useEffect, useState, useRef } from 'react'
import React from 'react'
import { Clock3, Minus, Plus, Settings2, Check } from 'lucide-react'
import type { Player } from './life-counter'

function contrast(color: string) {
  const hex = color.replace('#', '')
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#111111' : '#ffffff'
}

export function PlayerPanel({ player, showPlayerName, showFloatingNumbers, onChange, onSettings, onHistory, hasPendingHistory, onSaveHistory, historyDelay }: { player: Player; showPlayerName: boolean; showFloatingNumbers: boolean; onChange: (delta: number) => void; onSettings: () => void; onHistory: () => void; hasPendingHistory: boolean; onSaveHistory: () => void; historyDelay: number }) {
  const [floatingText, setFloatingText] = useState<string | null>(null)
  const [isHiding, setIsHiding] = useState(false)
  const startLifeRef = React.useRef(player.life)
  const hideTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const delta = player.life - startLifeRef.current
    if (delta !== 0) {
      const sign = delta > 0 ? '+' : ''
      setFloatingText(`${sign}${delta}`)
      setIsHiding(false)
    } else if (floatingText) {
      setFloatingText(null)
      startLifeRef.current = player.life
    }
  }, [player.life, floatingText])

  useEffect(() => {
    if (floatingText && !hasPendingHistory) {
      setIsHiding(true)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => {
        setFloatingText(null)
        startLifeRef.current = player.life
      }, 300)
    }
  }, [hasPendingHistory, floatingText, player.life])

  const text = contrast(player.color)
  const hasHistory = player.history.length > 0
  return (
    <section className="player-panel" style={{ backgroundColor: player.color, color: text, transform: player.inverted ? 'rotate(180deg)' : undefined }} aria-label={`${player.name} life counter`}>
      <div className="player-topline">
        <span className="player-name" style={{ visibility: showPlayerName ? 'visible' : 'hidden' }}>{player.name}</span>
        <div className="player-icons">
          <button className="icon-button" style={{ color: text, opacity: hasHistory ? 1 : 0.4 }} onClick={onHistory} disabled={!hasHistory} aria-label={`View ${player.name} history`}><Clock3 size={18} strokeWidth={2.2} /></button>
          <button className="icon-button" style={{ color: text }} onClick={onSettings} aria-label={`Configure ${player.name}`}><Settings2 size={18} strokeWidth={2.2} /></button>
        </div>
      </div>
      <div className="life-row">
        <button className="life-adjust" style={{ color: text }} onClick={() => onChange(-1)} aria-label={`Subtract life from ${player.name}`}><Minus size={56} /></button>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <output className="life-value" aria-label={`${player.life} life`}>{player.life}</output>
          {showFloatingNumbers && floatingText && (
            <div style={{
              position: 'absolute',
              top: '-80px',
              fontSize: '48px',
              fontWeight: 'bold',
              fontFamily: 'mtg',
              color: text,
              opacity: isHiding ? 0 : 0.5,
              transition: 'opacity 0.3s ease-in-out',
              pointerEvents: 'none',
              letterSpacing: '0.15em',
            }}>
              {floatingText}
            </div>
          )}
        </div>
        <button className="life-adjust" style={{ color: text }} onClick={() => onChange(1)} aria-label={`Add life to ${player.name}`}><Plus size={56} /></button>
      </div>
      <div className="player-footer">
        {hasPendingHistory && <button className="save-history-btn" onClick={onSaveHistory} style={{ color: text, animation: 'subtle-fade-in 0.3s ease-out' }} aria-label="Save history now"><Check size={16} strokeWidth={2.5} /></button>}
      </div>
    </section>
  )
}

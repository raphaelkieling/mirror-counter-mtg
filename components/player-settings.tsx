'use client'

import { Check } from 'lucide-react'
import type { Player } from './life-counter'
import { usePlayerData } from '@/contexts/player-data-context'

const PALETTE = ['#FF174E', '#4652F5', '#18B887', '#FDCB6E', '#D946EF', '#F5F5F5', '#FF6348', '#6C5CE7', '#FF1493', '#111111']

export function PlayerSettings({ player, onColorChange, onInvertedChange }: { player: Player | undefined; onColorChange: (color: string) => void; onInvertedChange: () => void }) {
  const playerData = usePlayerData(player?.id || 0)

  const handleColorChange = (color: string) => {
    onColorChange(color)
    playerData.update({ color })
  }

  const handleInvertedChange = () => {
    onInvertedChange()
    playerData.update({ inverted: !player?.inverted })
  }

  return (
    <div className="settings-content">
      <p className="section-label">PLAYER COLOR</p>
      <div className="swatches">{PALETTE.map((color) => <button key={color} className={`swatch ${player?.color === color ? 'selected' : ''}`} style={{ backgroundColor: color }} onClick={() => handleColorChange(color)} aria-label={`Set color ${color}`} />)}</div>
      <div className="toggle-row" style={{ justifyContent: 'space-between' }}><span className="toggle-label">Rotate display 180°</span><button className="checkbox-toggle" onClick={handleInvertedChange} aria-label="Toggle rotation" style={{ borderColor: player?.inverted ? '#4652f5' : '#d9d7df', backgroundColor: player?.inverted ? '#4652f5' : 'transparent' }}>{player?.inverted && <Check size={16} color="#fff" strokeWidth={3} />}</button></div>
      <div className="toggle-row" style={{ justifyContent: 'space-between' }}><span className="toggle-label">Show counters</span><button className="checkbox-toggle" onClick={() => playerData.update({ showCounters: !playerData.showCounters })} aria-label="Toggle show counters" style={{ borderColor: playerData.showCounters ? '#4652f5' : '#d9d7df', backgroundColor: playerData.showCounters ? '#4652f5' : 'transparent' }}>{playerData.showCounters && <Check size={16} color="#fff" strokeWidth={3} />}</button></div>
    </div>
  )
}

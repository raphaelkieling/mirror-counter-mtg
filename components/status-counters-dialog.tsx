'use client'

import { Dialog } from './dialog'
import { Skull, Zap } from 'lucide-react'

interface StatusCountersDialogProps {
  isOpen: boolean
  onClose: () => void
  skulls: number
  energy: number
  onUpdate: (skulls: number, energy: number) => void
}

export function StatusCountersDialog({ isOpen, onClose, skulls, energy, onUpdate }: StatusCountersDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} icon={Skull} eyebrow="STATUS" title="Status Counters">
      <div className="settings-content">
        <div className="number-row">
          <label className="number-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Skull size={14} /> Poison</label>
          <div className="number-controls">
            <button className="number-btn" onClick={() => onUpdate(Math.max(0, skulls - 1), energy)}>−</button>
            <span className="number-value">{skulls}</span>
            <button className="number-btn" onClick={() => onUpdate(Math.min(99, skulls + 1), energy)}>+</button>
          </div>
        </div>
        <div className="number-row">
          <label className="number-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14} /> Energy</label>
          <div className="number-controls">
            <button className="number-btn" onClick={() => onUpdate(skulls, Math.max(0, energy - 1))}>−</button>
            <span className="number-value">{energy}</span>
            <button className="number-btn" onClick={() => onUpdate(skulls, Math.min(99, energy + 1))}>+</button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

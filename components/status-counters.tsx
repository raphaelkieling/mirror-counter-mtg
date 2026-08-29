'use client'

import { Skull, Zap } from 'lucide-react'

interface StatusCountersProps {
  skulls: number
  energy: number
  onOpenDialog: () => void
}

export function StatusCounters({ skulls, energy, onOpenDialog }: StatusCountersProps) {
  return (
    <div className="status-counter-badge" onClick={onOpenDialog}>
      <div className="counter-item">
        <Skull size={16} />
        <span className="counter-value">{skulls}</span>
      </div>
      <div className="counter-item">
        <Zap size={16} />
        <span className="counter-value">{energy}</span>
      </div>
    </div>
  )
}

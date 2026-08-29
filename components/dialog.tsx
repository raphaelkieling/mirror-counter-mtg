'use client'

import { X } from 'lucide-react'

export function Dialog({ isOpen, onClose, icon: Icon, eyebrow, title, children, isInverted }: { isOpen: boolean; onClose: () => void; icon?: React.ElementType; eyebrow: string; title: string; children: React.ReactNode; isInverted?: boolean }) {
  if (!isOpen) return null
  return (
    <div className="modal-backdrop" style={{ alignItems: isInverted ? 'flex-start' : 'flex-end' }} onClick={onClose}>
      <aside className="settings-sheet" style={{ transform: isInverted ? 'rotate(180deg)' : undefined, animation: isInverted ? 'sheet-slide-down 0.08s ease-out' : 'sheet-slide-up 0.08s ease-out' }} onClick={(event) => event.stopPropagation()}>
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

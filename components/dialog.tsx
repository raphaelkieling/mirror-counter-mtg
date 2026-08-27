'use client'

import { X } from 'lucide-react'

export function Dialog({ isOpen, onClose, icon: Icon, eyebrow, title, children }: { isOpen: boolean; onClose: () => void; icon?: React.ElementType; eyebrow: string; title: string; children: React.ReactNode }) {
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

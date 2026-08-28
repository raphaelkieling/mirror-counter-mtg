'use client'

import { RotateCcw, Settings2, SlidersHorizontal, Info } from 'lucide-react'

export function RadialMenu({ isOpen, onToggle, onRestart, onConfig, onAbout }: { isOpen: boolean; onToggle: () => void; onRestart: () => void; onConfig: () => void; onAbout: () => void }) {
  return (
    <>
      {isOpen && <div className="radial-backdrop" onClick={onToggle} />}
      <div className="radial-container">
        {isOpen && <div className="radial-menu" role="menu" aria-label="Game options"><button className="radial-action radial-action-restart" onClick={onRestart} role="menuitem" aria-label="Restart"><RotateCcw size={26} /></button><button className="radial-action radial-action-config" onClick={onConfig} role="menuitem" aria-label="Configuration"><Settings2 size={26} /></button><button className="radial-action radial-action-about" onClick={onAbout} role="menuitem" aria-label="About"><Info size={26} /></button></div>}
        <button className={`option-button ${isOpen ? 'is-open' : ''}`} onClick={onToggle} aria-expanded={isOpen} aria-label={isOpen ? 'Close options' : 'Open options'}><SlidersHorizontal size={24} /></button>
      </div>
    </>
  )
}

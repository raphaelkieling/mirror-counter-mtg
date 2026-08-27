'use client'

import { Check } from 'lucide-react'

export function GameSettings({ startLife, historyDelay, closeRadialOnDialog, showTime, onStartLifeChange, onHistoryDelayChange, onCloseRadialOnDialogChange, onShowTimeChange }: { startLife: number; historyDelay: number; closeRadialOnDialog: boolean; showTime: boolean; onStartLifeChange: (value: number) => void; onHistoryDelayChange: (value: number) => void; onCloseRadialOnDialogChange: (value: boolean) => void; onShowTimeChange: (value: boolean) => void }) {
  return (
    <>
      <div className="number-row"><span className="number-label">Start life counter</span><div className="number-controls"><button className="number-btn" onClick={() => onStartLifeChange(Math.max(1, startLife - 1))} aria-label="Decrease">−</button><span className="number-value">{startLife}</span><button className="number-btn" onClick={() => onStartLifeChange(Math.min(999, startLife + 1))} aria-label="Increase">+</button></div></div>
      <div className="number-row"><span className="number-label">History save delay (s)</span><div className="number-controls"><button className="number-btn" onClick={() => onHistoryDelayChange(Math.max(1, historyDelay - 1))} aria-label="Decrease">−</button><span className="number-value">{historyDelay}</span><button className="number-btn" onClick={() => onHistoryDelayChange(Math.min(30, historyDelay + 1))} aria-label="Increase">+</button></div></div>
      <div className="toggle-row" style={{ justifyContent: 'space-between' }}><span className="toggle-label">Close menu when opening dialogs</span><button className="checkbox-toggle" onClick={() => onCloseRadialOnDialogChange(!closeRadialOnDialog)} aria-label="Toggle close radial on dialog" style={{ borderColor: closeRadialOnDialog ? '#4652f5' : '#d9d7df', backgroundColor: closeRadialOnDialog ? '#4652f5' : 'transparent' }}>{closeRadialOnDialog && <Check size={16} color="#fff" strokeWidth={3} />}</button></div>
      <div className="toggle-row" style={{ justifyContent: 'space-between' }}><span className="toggle-label">Show current time</span><button className="checkbox-toggle" onClick={() => onShowTimeChange(!showTime)} aria-label="Toggle show time" style={{ borderColor: showTime ? '#4652f5' : '#d9d7df', backgroundColor: showTime ? '#4652f5' : 'transparent' }}>{showTime && <Check size={16} color="#fff" strokeWidth={3} />}</button></div>
    </>
  )
}

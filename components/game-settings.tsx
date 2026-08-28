'use client'

import { useEffect, useState } from 'react'
import { Check, Maximize, Download } from 'lucide-react'

export function GameSettings({ startLife, historyDelay, closeRadialOnDialog, showTime, darkMode, onStartLifeChange, onHistoryDelayChange, onCloseRadialOnDialogChange, onShowTimeChange, onDarkModeChange }: { startLife: number; historyDelay: number; closeRadialOnDialog: boolean; showTime: boolean; darkMode: boolean; onStartLifeChange: (value: number) => void; onHistoryDelayChange: (value: number) => void; onCloseRadialOnDialogChange: (value: boolean) => void; onShowTimeChange: (value: boolean) => void; onDarkModeChange: (value: boolean) => void }) {
  const [canInstallPWA, setCanInstallPWA] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const handlePWAInstallable = () => setCanInstallPWA(true)
    const handlePWAInstalled = () => setCanInstallPWA(false)

    window.addEventListener('pwa-installable', handlePWAInstallable)
    window.addEventListener('pwa-installed', handlePWAInstalled)

    const iosCheck = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iosCheck)

    const standalone = (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)

    return () => {
      window.removeEventListener('pwa-installable', handlePWAInstallable)
      window.removeEventListener('pwa-installed', handlePWAInstalled)
    }
  }, [])

  const handleFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        alert('Could not enter fullscreen mode')
      })
    }
  }

  const handleInstallPWA = () => {
    if (isIOS) {
      alert('To install Mirror Counter on iOS:\n\n1. Tap the Share button (box with arrow)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the top right corner\n\nThe app will appear on your home screen!')
    } else if (window.installPWA) {
      window.installPWA()
    }
  }

  return (
    <div className="settings-content">
      <div className="number-row"><span className="number-label">Start life counter</span><div className="number-controls"><button className="number-btn" onClick={() => onStartLifeChange(Math.max(1, startLife - 1))} aria-label="Decrease">−</button><span className="number-value">{startLife}</span><button className="number-btn" onClick={() => onStartLifeChange(Math.min(999, startLife + 1))} aria-label="Increase">+</button></div></div>
      <div className="number-row"><span className="number-label">History save delay (s)</span><div className="number-controls"><button className="number-btn" onClick={() => onHistoryDelayChange(Math.max(1, historyDelay - 1))} aria-label="Decrease">−</button><span className="number-value">{historyDelay}</span><button className="number-btn" onClick={() => onHistoryDelayChange(Math.min(30, historyDelay + 1))} aria-label="Increase">+</button></div></div>
      <div className="toggle-row" style={{ justifyContent: 'space-between' }}><span className="toggle-label">Close menu when opening dialogs</span><button className="checkbox-toggle" onClick={() => onCloseRadialOnDialogChange(!closeRadialOnDialog)} aria-label="Toggle close radial on dialog" style={{ borderColor: closeRadialOnDialog ? '#4652f5' : '#d9d7df', backgroundColor: closeRadialOnDialog ? '#4652f5' : 'transparent' }}>{closeRadialOnDialog && <Check size={16} color="#fff" strokeWidth={3} />}</button></div>
      <div className="toggle-row" style={{ justifyContent: 'space-between' }}><span className="toggle-label">Show current time</span><button className="checkbox-toggle" onClick={() => onShowTimeChange(!showTime)} aria-label="Toggle show time" style={{ borderColor: showTime ? '#4652f5' : '#d9d7df', backgroundColor: showTime ? '#4652f5' : 'transparent' }}>{showTime && <Check size={16} color="#fff" strokeWidth={3} />}</button></div>
      <div className="toggle-row" style={{ justifyContent: 'space-between' }}><span className="toggle-label">Dark mode</span><button className="checkbox-toggle" onClick={() => onDarkModeChange(!darkMode)} aria-label="Toggle dark mode" style={{ borderColor: darkMode ? '#4652f5' : '#d9d7df', backgroundColor: darkMode ? '#4652f5' : 'transparent' }}>{darkMode && <Check size={16} color="#fff" strokeWidth={3} />}</button></div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '26px', flexDirection: 'column' }}>
        {!isStandalone && (isIOS || canInstallPWA) && <button onClick={handleInstallPWA} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: 'none', background: '#4652f5', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}><Download size={18} />Install PWA</button>}
        {!isIOS && <button onClick={handleFullscreen} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: 'none', background: '#4652f5', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}><Maximize size={18} />Fullscreen mode</button>}
      </div>
    </div>
  )
}

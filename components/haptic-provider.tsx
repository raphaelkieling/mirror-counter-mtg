'use client'

import { useEffect } from 'react'

export function HapticProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    if (isIOS) {
      const input = document.createElement('input')
      input.type = 'checkbox'
      input.setAttribute('switch', '')
      input.id = 'haptic-trigger'
      input.style.display = 'none'
      document.body.appendChild(input)

      const label = document.createElement('label')
      label.htmlFor = 'haptic-trigger'
      label.id = 'haptic-label'
      label.style.display = 'none'
      document.body.appendChild(label)

      window.triggerHaptic = () => {
        const checkbox = document.getElementById('haptic-trigger') as HTMLInputElement
        const label = document.getElementById('haptic-label') as HTMLLabelElement
        if (checkbox && label) {
          checkbox.checked = !checkbox.checked
          label.click()
        }
      }
    } else {
      window.triggerHaptic = () => {
        try {
          if (navigator.vibrate) {
            navigator.vibrate([20, 10, 20])
          }
        } catch (e) {
          // fallback
        }
      }
    }
  }, [])

  return children
}

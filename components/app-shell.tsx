'use client'

import { useState, useEffect } from 'react'
import { useAppState } from '@/contexts/app-state-context'
import { useGameConfig } from '@/contexts/game-config-context'
import { useScreenWakeLock } from '@/lib/use-screen-wake-lock'
import LifeCounter from './life-counter'

export function AppShell() {
  const { hydrated } = useAppState()
  const { keepAliveScreen } = useGameConfig()
  useScreenWakeLock(keepAliveScreen)
  const [showLoading, setShowLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (!hydrated) return

    const timer = setTimeout(() => {
      setFadeOut(true)
      const hideTimer = setTimeout(() => {
        setShowLoading(false)
      }, 300)
      return () => clearTimeout(hideTimer)
    }, 500)

    return () => clearTimeout(timer)
  }, [hydrated])

  return (
    <>
      <LifeCounter />
      {showLoading && (
        <div
          className={`fixed inset-0 z-[999] flex items-center justify-center bg-black pointer-events-none transition-opacity duration-300 ${
            fadeOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="text-center">
            <img src="/1024.png" alt="Mirror Counter" className="w-32 h-32 mx-auto animate-pulse" />
          </div>
        </div>
      )}
    </>
  )
}

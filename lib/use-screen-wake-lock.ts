import { useEffect, useRef } from 'react'

export function useScreenWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!enabled) {
      wakeLockRef.current?.release().catch(() => {})
      return
    }

    const acquire = async () => {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      } catch {
        // API not supported or already released
      }
    }

    acquire()

    const handleVisibilityChange = async () => {
      if (!document.hidden && enabled) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        } catch {
          // ignore
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      wakeLockRef.current?.release().catch(() => {})
    }
  }, [enabled])
}

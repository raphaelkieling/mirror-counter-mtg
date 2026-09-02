import { useEffect } from 'react'
import { useWakeLock } from 'react-screen-wake-lock'

export type WakeLockStatus = 'idle' | 'acquired' | 'released' | 'error'

export function useScreenWakeLock(enabled: boolean, onStatusChange?: (status: WakeLockStatus) => void) {
  const { request, release } = useWakeLock()

  useEffect(() => {
    if (enabled) {
      request()
        .then(() => onStatusChange?.('acquired'))
        .catch(() => onStatusChange?.('error'))
    } else {
      release()
      onStatusChange?.('released')
    }
  }, [enabled, request, release, onStatusChange])
}

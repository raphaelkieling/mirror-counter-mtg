import { useEffect, useRef } from 'react'

// Minimal transparent 1px MP4 video (base64 encoded)
// Used as fallback on iOS/Safari where Screen Wake Lock API is not supported
const BLANK_VIDEO = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAA4bW9vdgAAADBtdmhkAAAAANj//wAA5OAAAOgwYXV0bwAAAAAAAAAAAAAA'

export function useScreenWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!enabled) {
      wakeLockRef.current?.release().catch(() => {})
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.srcObject = null
      }
      return
    }

    const ensureVideoFallback = () => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {})
        return
      }

      const video = document.createElement('video')
      video.src = BLANK_VIDEO
      video.loop = true
      video.muted = true
      video.playsInline = true
      video.style.display = 'none'

      document.body.appendChild(video)
      videoRef.current = video
      video.play().catch(() => {})
    }

    const tryWakeLock = async () => {
      try {
        // Try modern Screen Wake Lock API (Chrome, Firefox, Edge on Android)
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      } catch {
        // Fallback for iOS/Safari: play silent video to prevent screen lock
        // iOS restricts the Screen Wake Lock API for battery/privacy reasons,
        // so we use a looping muted video as a workaround
        ensureVideoFallback()
      }
    }

    tryWakeLock()

    const handleVisibilityChange = async () => {
      if (!document.hidden && enabled) {
        await tryWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      wakeLockRef.current?.release().catch(() => {})
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [enabled])
}

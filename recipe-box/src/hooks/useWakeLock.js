import { useEffect, useRef } from 'react'

export function useWakeLock() {
  const wakeLockRef = useRef(null)

  useEffect(() => {
    async function acquire() {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        } catch {
          // silently degrade — some browsers/contexts block wake lock
        }
      }
    }
    acquire()
    return () => {
      wakeLockRef.current?.release()
      wakeLockRef.current = null
    }
  }, [])
}

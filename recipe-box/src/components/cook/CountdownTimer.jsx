import { useState, useEffect, useRef } from 'react'

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

export default function CountdownTimer({ seconds: initialSeconds }) {
  const [remaining, setRemaining] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) { setRunning(false); return 0 }
          return r - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  function toggle() {
    if (remaining === 0) return
    setRunning(r => !r)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-sans font-medium border transition-colors ${
        running
          ? 'bg-terracotta text-white border-terracotta'
          : 'bg-cream-dark text-terracotta border-terracotta/50 hover:bg-terracotta/10'
      }`}
    >
      <span>{running ? '⏸' : '⏱'}</span>
      <span>{formatTime(remaining)}</span>
    </button>
  )
}

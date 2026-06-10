import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

const KEY_MAP = {
  ArrowUp:    { x: 0, y: -1 },
  ArrowDown:  { x: 0, y:  1 },
  ArrowLeft:  { x: -1, y: 0 },
  ArrowRight: { x:  1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y:  1 },
  a: { x: -1, y: 0 },
  d: { x:  1, y: 0 },
}

export function useKeyboard() {
  const setDirection = useGameStore(s => s.setDirection)
  const pauseGame    = useGameStore(s => s.pauseGame)
  const phase        = useGameStore(s => s.phase)

  useEffect(() => {
    const onKey = (e) => {
      if (KEY_MAP[e.key]) {
        e.preventDefault()
        if (phase === 'playing' || phase === 'paused') {
          setDirection(KEY_MAP[e.key])
        }
      }
      if (e.key === 'Escape' || e.key === 'p') {
        if (phase === 'playing' || phase === 'paused') pauseGame()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, setDirection, pauseGame])
}

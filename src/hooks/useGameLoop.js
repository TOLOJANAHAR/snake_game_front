import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useGameStore } from '../store/gameStore'

export function useGameLoop() {
  const tick           = useGameStore(s => s.tick)
  const phase          = useGameStore(s => s.phase)
  const activePowerUp  = useGameStore(s => s.activePowerUp)
  const levelConfig    = useGameStore(s => s.levelConfig)

  const intervalRef = useRef(null)
  const baseSpeed   = levelConfig?.base_speed_ms ?? 200

  // Calcule la vitesse réelle selon le power-up actif
  const getSpeed = () => {
    if (!activePowerUp) return baseSpeed
    if (activePowerUp.type === 'golden') return Math.round(baseSpeed / 1.6)
    if (activePowerUp.type === 'blue')   return Math.round(baseSpeed / 0.4)
    return baseSpeed
  }

  // Slow-mo GSAP pour la pomme bleue
  useEffect(() => {
    if (activePowerUp?.type === 'blue') {
      gsap.to(gsap.globalTimeline, { timeScale: 0.4, duration: 0.3, ease: 'power2.out' })
      return () => {
        gsap.to(gsap.globalTimeline, { timeScale: 1, duration: 0.5, ease: 'power2.in' })
      }
    }
    gsap.to(gsap.globalTimeline, { timeScale: 1, duration: 0.3 })
  }, [activePowerUp?.type])

  // Boucle de jeu principale
  useEffect(() => {
    if (phase !== 'playing') {
      clearInterval(intervalRef.current)
      return
    }
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(tick, getSpeed())
    return () => clearInterval(intervalRef.current)
  }, [phase, activePowerUp, baseSpeed])

  return null
}

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useGameStore } from '../store/gameStore'

const STAGE_LABELS = { larve: 'LARVE', serpent: 'SERPENT', dragon: 'DRAGON' }
const STAGE_COLORS = { larve: '#3ddc84', serpent: '#5efa8a', dragon: '#ffd700' }

const POWERUP_LABELS = {
  golden: 'SPEED',
  blue:   'SLOW-MO',
  red:    'WALL PASS',
}

export default function HUD() {
  const score         = useGameStore(s => s.score)
  const level         = useGameStore(s => s.level)
  const lives         = useGameStore(s => s.lives)
  const evolutionStage = useGameStore(s => s.evolutionStage)
  const activePowerUp = useGameStore(s => s.activePowerUp)
  const snakeLen      = useGameStore(s => s.snake.length)

  const scoreRef  = useRef(null)
  const prevScore = useRef(score)

  // Animation score quand il change
  useEffect(() => {
    if (score !== prevScore.current && scoreRef.current) {
      gsap.fromTo(scoreRef.current,
        { scale: 1.3, color: '#fff' },
        { scale: 1,   color: '#3ddc84', duration: 0.25, ease: 'back.out(2)' }
      )
    }
    prevScore.current = score
  }, [score])

  // Calcul du timer power-up
  const powerUpRemaining = activePowerUp
    ? Math.max(0, Math.ceil((activePowerUp.expiresAt - Date.now()) / 1000))
    : 0

  return (
    <div style={styles.hud}>
      {/* Score */}
      <div style={styles.hudBlock}>
        <span style={styles.label}>SCORE</span>
        <span ref={scoreRef} style={styles.scoreVal}>
          {String(score).padStart(6, '0')}
        </span>
      </div>

      {/* Level + évolution */}
      <div style={styles.hudCenter}>
        <span style={styles.label}>LEVEL</span>
        <span style={styles.levelVal}>{String(level).padStart(2, '0')}</span>
        <span style={{ ...styles.stageBadge, color: STAGE_COLORS[evolutionStage] }}>
          {STAGE_LABELS[evolutionStage]}
        </span>
        <span style={styles.lenVal}>×{snakeLen}</span>
      </div>

      {/* Vies + power-up */}
      <div style={styles.hudRight}>
        {activePowerUp && (
          <div style={styles.powerUpBar}>
            <span style={styles.powerUpLabel}>{POWERUP_LABELS[activePowerUp.type]}</span>
            <span style={styles.powerUpTimer}>{powerUpRemaining}s</span>
          </div>
        )}
        <div style={styles.hearts}>
          {[1, 2, 3].map(i => (
            <span key={i} style={{ ...styles.heart, opacity: i <= lives ? 1 : 0.2 }}>♥</span>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  hud: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: '#0d1525',
    borderBottom: '2px solid #2a3a55',
    fontFamily: "'Press Start 2P', monospace",
    minHeight: 56,
    flexShrink: 0,
  },
  hudBlock: {
    display: 'flex', flexDirection: 'column', gap: 4, minWidth: 120,
  },
  hudCenter: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
  },
  hudRight: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, minWidth: 120,
  },
  label: {
    fontSize: 7, color: '#6b8aa0', letterSpacing: 2,
  },
  scoreVal: {
    fontSize: 13, color: '#3ddc84', letterSpacing: 1,
  },
  levelVal: {
    fontSize: 13, color: '#ffd700',
  },
  stageBadge: {
    fontSize: 7, letterSpacing: 1,
  },
  lenVal: {
    fontSize: 7, color: '#6b8aa0',
  },
  hearts: {
    display: 'flex', gap: 6,
  },
  heart: {
    fontSize: 16, color: '#ff4757',
  },
  powerUpBar: {
    display: 'flex', gap: 8, alignItems: 'center',
    background: '#1a2640', border: '1px solid #2a3a55',
    padding: '3px 8px', borderRadius: 2,
  },
  powerUpLabel: {
    fontSize: 6, color: '#ffd700', letterSpacing: 1,
  },
  powerUpTimer: {
    fontSize: 6, color: '#4fc3f7',
  },
}

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useGameStore } from '../store/gameStore'
import { useApi } from '../hooks/useApi'

import appleImg  from '../assets/apple.svg'
import goldenImg from '../assets/gold.svg'
import blueImg   from '../assets/blue.svg'
import redImg    from '../assets/red.svg'
import skullImg  from '../assets/skull.svg'

const DEATH_MSG = {
  wall:  'COLLISION MUR',
  self:  'COLLISION CORPS',
  skull: 'TROP DE CRÂNES',
}

const STAGE_COLORS = { larve:'#3ddc84', serpent:'#5efa8a', dragon:'#ffd700' }

export default function GameOverScreen() {
  const score          = useGameStore(s => s.score)
  const level          = useGameStore(s => s.level)
  const evolutionStage = useGameStore(s => s.evolutionStage)
  const deathCause     = useGameStore(s => s.deathCause)
  const snake          = useGameStore(s => s.snake)
  const stats          = useGameStore(s => s.stats)
  const startTime      = useGameStore(s => s.startTime)
  const player         = useGameStore(s => s.player)
  const startGame      = useGameStore(s => s.startGame)
  const goToMenu       = useGameStore(s => s.goToMenu)

  const { submitScore, fetchLevel } = useApi()
  const rootRef  = useRef(null)
  const submitted = useRef(false)

  const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0

  // Soumet le score une seule fois
  useEffect(() => {
    if (submitted.current || !player) return
    submitted.current = true
    submitScore({
      playerId:        player.id,
      points:          score,
      levelReached:    level,
      snakeLength:     snake.length,
      durationSeconds: duration,
      evolutionStage,
      deathCause,
    })
  }, [])

  // Animation d'entrée
  useEffect(() => {
    gsap.fromTo(rootRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1,   opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
    )
  }, [])

  const handleRestart = async () => {
    submitted.current = false
    await fetchLevel(1)
    startGame()
  }

  return (
    <div style={styles.backdrop}>
      <div ref={rootRef} style={styles.card}>
        {/* Titre */}
        <div style={styles.title}>GAME OVER</div>
        <div style={styles.deathMsg}>{DEATH_MSG[deathCause] || 'MORT'}</div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <StatRow label="SCORE"     value={String(score).padStart(6,'0')} color="#3ddc84" big />
          <StatRow label="NIVEAU"    value={`${level}`}  color="#ffd700" />
          <StatRow label="ÉVOLUTION" value={evolutionStage.toUpperCase()} color={STAGE_COLORS[evolutionStage]} />
          <StatRow label="LONGUEUR"  value={`${snake.length} segs`} />
          <StatRow label="DURÉE"     value={`${duration}s`} />
          <div style={styles.divider} />
            <StatRow label="POMMES" img={appleImg}  value={stats.apples} />
            <StatRow label="GOLDEN" img={goldenImg} value={stats.golden} color="#ffd700" />
            <StatRow label="BLEU"   img={blueImg}   value={stats.blue}   color="#4fc3f7" />
            <StatRow label="ROUGE"  img={redImg}    value={stats.red}    color="#ff6b6b" />
            <StatRow label="CRÂNES" img={skullImg}  value={stats.skulls} color="#9e9e9e" />
        </div>

        {/* Boutons */}
        <div style={styles.btnRow}>
          <button className="btn-pixel btn-pixel--green" style={styles.btn} onClick={handleRestart}>
            ▶ REJOUER
          </button>
          <button className="btn-pixel btn-pixel--dim" style={styles.btn} onClick={goToMenu}>
            ⌂ MENU
          </button>
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, img, value, color = '#e8f4f8', big = false }) {
  return (
    <div style={styles.statRow}>
      <div style={styles.statLabelBlock}>
        {img && <img src={img} alt={label} style={styles.statImg} />}
        <span style={styles.statLabel}>{label}</span>
      </div>
      <span style={{ ...styles.statValue, color, fontSize: big ? 16 : 10 }}>{value}</span>
    </div>
  )
}
const styles = {
  backdrop: {
    position: 'fixed', inset: 0,
    background: '#000c',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 50,
  },
  card: {
    background: '#111827', border: '2px solid #3ddc84',
    borderRadius: 4, padding: 32, minWidth: 360, maxWidth: 440,
    display: 'flex', flexDirection: 'column', gap: 20,
    boxShadow: '0 0 40px #3ddc8433',
  },
  title: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 22, color: '#ff4757', textAlign: 'center',
    textShadow: '0 0 20px #ff475788, 2px 2px 0 #7a0000',
    letterSpacing: 3,
  },
  deathMsg: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 9, color: '#6b8aa0', textAlign: 'center',
  },
  statsGrid: {
    background: '#0d1525', border: '1px solid #2a3a55',
    borderRadius: 2, padding: '16px 20px',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  statRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabelBlock: {
    display: 'flex', alignItems: 'center', gap: 8,
  },
  statImg: {
    width: 16, height: 16,
    objectFit: 'contain',
    imageRendering: 'pixelated',
  },
  statLabel: {
    fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#6b8aa0',
  },
  statValue: {
    fontFamily: "'Press Start 2P', monospace",
  },
  divider: {
    height: 1, background: '#2a3a55', margin: '4px 0',
  },
  btnRow: {
    display: 'flex', gap: 12,
  },
  btn: {
    flex: 1, padding: '12px 0', fontSize: 9,
  },
}

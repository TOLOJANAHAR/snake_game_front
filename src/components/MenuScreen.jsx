import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useGameStore } from '../store/gameStore'
import { useApi } from '../hooks/useApi'

import appleImg  from '../assets/apple.svg'
import goldenImg from '../assets/gold.svg'
import redImg    from '../assets/red.svg'
import skullImg  from '../assets/skull.svg'
import blueImg  from '../assets/blue.svg'

export default function MenuScreen() {
  const [username, setUsername]   = useState('')
  const [loading,  setLoading]    = useState(false)
  const [error,    setError]      = useState('')
  const startGame      = useGameStore(s => s.startGame)
  const leaderboard    = useGameStore(s => s.leaderboard)
  const { loginOrCreate, fetchLevel, fetchLeaderboard } = useApi()

  const titleRef = useRef(null)
  const cardRef  = useRef(null)

  useEffect(() => {
    fetchLeaderboard(5)

    // Animation d'entrée
    gsap.fromTo(titleRef.current,
      { y: -30, opacity: 0 },
      { y: 0,   opacity: 1, duration: 0.6, ease: 'back.out(2)' }
    )
    gsap.fromTo(cardRef.current,
      { y: 20, opacity: 0 },
      { y: 0,  opacity: 1, duration: 0.5, delay: 0.2, ease: 'power2.out' }
    )
  }, [])

  const handleStart = async () => {
    if (!username.trim()) { setError('Entre ton pseudo !'); return }
    setLoading(true); setError('')
    try {
      await loginOrCreate(username.trim())
      await fetchLevel(1)
      startGame()
    } catch (e) {
      setError('Erreur de connexion — mode hors-ligne activé')
      await fetchLevel(1)
      startGame()
    } finally {
      setLoading(false)
    }
  }

  const STAGE_COLORS = { larve:'#3ddc84', serpent:'#5efa8a', dragon:'#ffd700' }

  return (
    <div style={styles.root}>
      {/* Titre */}
      <div ref={titleRef} style={styles.titleBlock}>
        <div style={styles.titleTop}>SNAKE</div>
        <div style={styles.titleBottom}>ÉVOLUTION</div>
        <div style={styles.titleSub}>MODE LABYRINTHE</div>
      </div>

      {/* Carte centrale */}
      <div ref={cardRef} style={styles.card}>
        <div style={styles.legend}>
          {[
            { img: appleImg,  label: 'Pomme', sub: '+10 pts' },
            { img: goldenImg, label: 'Or',    sub: '+30 / speed' },
            { img: blueImg,   label: 'Bleu',  sub: '+20 / slow' },
            { img: redImg,    label: 'Rouge', sub: '+25 / mur' },
            { img: skullImg,  label: 'Crâne', sub: '−3 segs' },
          ].map(p => (
            <div key={p.label} style={styles.legendItem}>
              <img src={p.img} alt={p.label} style={styles.legendImg} />
              <span style={styles.legendLabel}>{p.label}</span>
              <span style={styles.legendSub}>{p.sub}</span>
            </div>
          ))}
        </div>

        {/* Input username */}
        <div style={styles.inputBlock}>
          <label style={styles.inputLabel}>TON PSEUDO</label>
          <input
            style={styles.input}
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            maxLength={20}
            placeholder="player1"
            autoFocus
          />
          {error && <span style={styles.error}>{error}</span>}
        </div>

        <button
          className="btn-pixel btn-pixel--green"
          style={styles.startBtn}
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? 'CHARGEMENT...' : '▶ JOUER'}
        </button>

        {/* Touches */}
        <div style={styles.controls}>
          <span style={styles.controlsLabel}>CONTRÔLES :</span>
          <span style={styles.controlsKeys}>↑ ↓ ← →  ou  W A S D</span>
          <span style={styles.controlsKeys}>ESC = pause</span>
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div style={styles.lb}>
          <div style={styles.lbTitle}>TOP SCORES</div>
          {leaderboard.map((e, i) => (
            <div key={i} style={styles.lbRow}>
              <span style={{ ...styles.lbRank, color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32' }}>
                #{e.rank}
              </span>
              <span style={styles.lbName}>{e.username}</span>
              <span style={{ ...styles.lbStage, color: STAGE_COLORS[e.evolution_stage] }}>
                {e.evolution_stage.toUpperCase()}
              </span>
              <span style={styles.lbScore}>{String(e.points).padStart(6,'0')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  root: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 24, padding: 32, maxWidth: 600, width: '100%',
    overflowY: 'auto',
  },
  titleBlock: {
    textAlign: 'center', lineHeight: 1.6,
  },
  titleTop: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 36, color: '#3ddc84',
    textShadow: '0 0 20px #3ddc8488, 3px 3px 0 #1a5c3a',
    letterSpacing: 6,
  },
  titleBottom: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 18, color: '#ffd700',
    textShadow: '0 0 12px #ffd70066, 2px 2px 0 #7a5c00',
    letterSpacing: 3,
  },
  titleSub: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 8, color: '#6b8aa0', letterSpacing: 3, marginTop: 8,
  },
  card: {
    background: '#111827', border: '2px solid #2a3a55',
    borderRadius: 4, padding: 24, width: '100%',
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  legend: {
    display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
  },
  legendItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1,
  },
  legendImg: {
    width: 24,
    height: 24,
    objectFit: 'contain',
    imageRendering: 'pixelated',
  },
  legendLabel: { fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: '#e8f4f8' },
  legendSub:   { fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: '#6b8aa0' },
  inputBlock: {
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  inputLabel: {
    fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#6b8aa0', letterSpacing: 2,
  },
  input: {
    fontFamily: "'Press Start 2P', monospace", fontSize: 12,
    background: '#0d1525', border: '2px solid #2a3a55', color: '#e8f4f8',
    padding: '10px 14px', borderRadius: 2, outline: 'none', width: '100%',
    letterSpacing: 1,
  },
  error: {
    fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#ff4757',
  },
  startBtn: {
    width: '100%', padding: '14px 0', fontSize: 12, letterSpacing: 2,
  },
  controls: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
  },
  controlsLabel: { fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#6b8aa0' },
  controlsKeys:  { fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#3ddc84' },
  lb: {
    width: '100%', background: '#0d1525', border: '2px solid #2a3a55',
    borderRadius: 4, padding: '16px 20px',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  lbTitle: {
    fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#ffd700',
    textAlign: 'center', marginBottom: 4,
  },
  lbRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    borderBottom: '1px solid #1a2640', paddingBottom: 8,
  },
  lbRank:  { fontFamily: "'Press Start 2P', monospace", fontSize: 8, minWidth: 28 },
  lbName:  { fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#e8f4f8', flex: 1 },
  lbStage: { fontFamily: "'Press Start 2P', monospace", fontSize: 6 },
  lbScore: { fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#3ddc84' },
}

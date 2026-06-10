import React from 'react'
import { useGameStore } from './store/gameStore'
import { useGameLoop } from './hooks/useGameLoop'
import { useKeyboard } from './hooks/useKeyboard'
import HUD from './components/HUD'
import GameBoard from './components/GameBoard'
import MenuScreen from './components/MenuScreen'
import GameOverScreen from './components/GameOverScreen'

export default function App() {
  const phase = useGameStore(s => s.phase)

  useGameLoop()
  useKeyboard()

  if (phase === 'menu') {
    return (
      <div style={styles.root}>
        <MenuScreen />
      </div>
    )
  }

  return (
    <div style={styles.root}>
      <div style={styles.gameShell}>
        <HUD />
        <GameBoard />
      </div>
      {phase === 'gameover' && <GameOverScreen />}
    </div>
  )
}

const styles = {
  root: {
    width: '100vw', height: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#0a0e1a',
    overflow: 'hidden',
  },
  gameShell: {
    display: 'flex', flexDirection: 'column',
    border: '3px solid #2a3a55',
    borderRadius: 6,
    overflow: 'hidden',
    boxShadow: '0 0 60px #0008, 0 0 120px #3ddc8422',
    background: '#111827',
  },
}

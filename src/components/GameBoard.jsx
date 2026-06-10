import React, { useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import {
  animateGrow, animateHeadMove, animateFoodEat,
  animateScoreFloat, animateEvolution, animateScreenShake,
} from '../animations/gsapEffects'
import appleImg  from '../assets/apple.svg'
import goldenImg from '../assets/gold.svg'
import redImg    from '../assets/red.svg'
import skullImg  from '../assets/skull.svg'
import blueImg  from '../assets/blue.svg'


const CELL = 28
const W    = 20
const H    = 20

// Couleur du segment selon stade + position
const segColor = (idx, stage) => {
  if (stage === 'dragon') {
    const t = idx / 15
    return idx === 0 ? '#ff6b00' : `hsl(${45 - t * 20}, ${90 - t * 20}%, ${55 - t * 10}%)`
  }
  if (stage === 'serpent') {
    return idx === 0 ? '#5efa8a' : `hsl(${140}, ${70 - idx * 1.5}%, ${45 + idx * 0.5}%)`
  }
  // larve
  return idx === 0 ? '#5efa8a' : '#3ddc84'
}

const FOOD_IMG = { apple: appleImg, golden: goldenImg, blue: blueImg, red: redImg, skull: skullImg }
const FOOD_COLOR = { apple: '#ff4757', golden: '#ffd700', blue: '#4fc3f7', red: '#ff6b6b', skull: '#9e9e9e' }

export default function GameBoard() {
  const snake          = useGameStore(s => s.snake)
  const foods          = useGameStore(s => s.foods)
  const obstacles      = useGameStore(s => s.obstacles)
  const evolutionStage = useGameStore(s => s.evolutionStage)
  const score          = useGameStore(s => s.score)
  const phase          = useGameStore(s => s.phase)

  const boardRef    = useRef(null)
  const overlayRef  = useRef(null)
  const segRefs     = useRef({})
  const prevLen     = useRef(snake.length)
  const prevStage   = useRef(evolutionStage)
  const prevScore   = useRef(score)

  // Anime la tête à chaque tick
  useEffect(() => {
    const headKey = `${snake[0]?.x},${snake[0]?.y}`
    animateHeadMove(segRefs.current[headKey])
  }, [snake])

  // Détecte gain de longueur
  useEffect(() => {
    if (snake.length > prevLen.current) {
      const tail = snake[snake.length - 1]
      const key  = `${tail.x},${tail.y}`
      animateGrow(segRefs.current[key])

      // Float score
      if (boardRef.current) {
        const diff = score - prevScore.current
        animateScoreFloat(
          boardRef.current,
          snake[0].x * CELL + CELL / 2,
          snake[0].y * CELL - 5,
          diff
        )
        // Burst nourriture mangée
        const eaten = foods.find(f => f.x === snake[0].x && f.y === snake[0].y)
        if (eaten) {
          animateFoodEat(boardRef.current, snake[0].x * CELL + CELL/2, snake[0].y * CELL + CELL/2, eaten.type)
        }
      }
    }

    // Skull : shake si rétréci
    if (snake.length < prevLen.current && boardRef.current) {
      animateScreenShake(boardRef.current)
    }

    prevLen.current = snake.length
    prevScore.current = score
  }, [snake.length])

  // Évolution : flash d'écran
  useEffect(() => {
    if (evolutionStage !== prevStage.current) {
      animateEvolution(overlayRef.current, evolutionStage)
      prevStage.current = evolutionStage
    }
  }, [evolutionStage])

  // Shake sur game over
  useEffect(() => {
    if (phase === 'gameover' && boardRef.current) {
      animateScreenShake(boardRef.current)
    }
  }, [phase])

  // Clé lookup pour obstacles
  const obstacleSet = new Set(obstacles.map(o => `${o.x},${o.y}`))
  const snakeSet    = new Map(snake.map((s, i) => [`${s.x},${s.y}`, i]))
  const foodMap     = new Map(foods.map(f => [`${f.x},${f.y}`, f]))

  return (
    <div style={styles.wrapper}>
      <div
        ref={boardRef}
        style={{ ...styles.board, width: W * CELL, height: H * CELL, position: 'relative' }}
      >
        <div ref={overlayRef} style={styles.overlay} />

        {Array.from({ length: H }, (_, row) =>
          Array.from({ length: W }, (_, col) => {
            const key      = `${col},${row}`
            const isSnake  = snakeSet.has(key)
            const segIdx   = snakeSet.get(key)
            const isHead   = segIdx === 0
            const food     = foodMap.get(key)
            const isObs    = obstacleSet.has(key)
            const isDark   = (col + row) % 2 === 0

            return (
              <div
                key={key}
                ref={el => { if (isSnake) segRefs.current[key] = el }}
                style={{
                  position: 'absolute',
                  left:   col * CELL,
                  top:    row * CELL,
                  width:  CELL,
                  height: CELL,
                  ...cellStyle(isSnake, segIdx, evolutionStage, isHead, food, isObs, isDark),
                }}
              >
                {food && !isSnake && (
                  <img
                    src={FOOD_IMG[food.type]}
                    alt={food.type}
                    style={styles.foodImg}
                  />
                )}
                {isObs && <div style={styles.obsInner} />}
              </div>
            )
          })
        )}

        {phase === 'paused' && (
          <div style={styles.pauseOverlay}>
            <span style={styles.pauseText} className="blink">PAUSE</span>
            <span style={styles.pauseSub}>ESC pour reprendre</span>
          </div>
        )}
      </div>
    </div>
  )
}

function cellStyle(isSnake, segIdx, stage, isHead, food, isObs, isDark) {
  if (isObs) return {
    background: '#1e2d47',
    border: '2px solid #2a3a55',
    borderRadius: 2,
    boxSizing: 'border-box',
  }

  if (isSnake) {
    const color = segColor(segIdx, stage)
    return {
      background: color,
      borderRadius: isHead ? 4 : 2,
      border: `1px solid ${isHead ? '#fff3' : '#0003'}`,
      zIndex: 2,
      boxShadow: isHead
        ? `0 0 8px ${color}88`
        : stage === 'dragon' ? `0 0 4px ${color}44` : 'none',
    }
  }

  if (food) return {
    background: isDark ? '#141d2e' : '#1a2640',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  return {
    background: isDark ? '#141d2e' : '#1a2640',
  }
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 16,
  },
  board: {
    border: '3px solid #2a3a55',
    borderRadius: 4,
    overflow: 'hidden',
    boxShadow: '0 0 40px #0008, 0 0 80px #3ddc8411',
    imageRendering: 'pixelated',
  },
  overlay: {
    position: 'absolute', inset: 0,
    opacity: 0, pointerEvents: 'none', zIndex: 10,
  },
  foodImg: {
    width: '80%',
    height: '80%',
    objectFit: 'contain',
    imageRendering: 'pixelated',
    userSelect: 'none',
    display: 'block',
    margin: 'auto',
    position: 'absolute',
    inset: 0,
  },
  obsInner: {
    width: '80%', height: '80%',
    background: '#2a3a55',
    borderRadius: 1,
    position: 'absolute', inset: 0, margin: 'auto',
  },
  pauseOverlay: {
    position: 'absolute', inset: 0,
    background: '#000b',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 16, zIndex: 20,
  },
  pauseText: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 28, color: '#3ddc84',
    textShadow: '0 0 20px #3ddc84',
  },
  pauseSub: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 8, color: '#6b8aa0',
  },
}

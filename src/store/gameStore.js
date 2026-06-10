import { create } from 'zustand'

const GRID_W = 20
const GRID_H = 20
const CELL   = 28
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9,  y: 10 },
  { x: 8,  y: 10 },
]
const FOOD_TYPES = ['apple', 'golden', 'blue', 'red', 'skull']

// Utilitaires
const randCell = (obstacles = [], snake = []) => {
  const blocked = new Set([
    ...obstacles.map(o => `${o.x},${o.y}`),
    ...snake.map(s => `${s.x},${s.y}`),
  ])
  let cell
  do {
    cell = { x: Math.floor(Math.random() * GRID_W), y: Math.floor(Math.random() * GRID_H) }
  } while (blocked.has(`${cell.x},${cell.y}`))
  return cell
}

const pickFoodType = (weights = {}) => {
  const entries = Object.entries(weights)
  const rand = Math.random()
  let cum = 0
  for (const [type, w] of entries) {
    cum += w
    if (rand < cum) return type
  }
  return 'apple'
}

const FOOD_POINTS = { apple: 10, golden: 30, blue: 20, red: 25, skull: -15 }

//Store Zustand 
export const useGameStore = create((set, get) => ({
  // State
  phase: 'menu',        
  snake: INITIAL_SNAKE,
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
  foods: [],
  obstacles: [],
  score: 0,
  lives: 3,
  level: 1,
  levelConfig: null,
  evolutionStage: 'larve',  
  activePowerUp: null,     
  wallPass: false,
  stats: { apples:0, golden:0, blue:0, red:0, skulls:0 },
  startTime: null,
  deathCause: null,
  player: null,             
  leaderboard: [],
  gridW: GRID_W,
  gridH: GRID_H,
  cellSize: CELL,

  // Actions 

  setPlayer: (player) => set({ player }),

  setLeaderboard: (leaderboard) => set({ leaderboard }),

  setLevelConfig: (config) => {
    const { obstacles = [], food_weights, food_count = 1 } = config
    const snake = get().snake
    const foods = Array.from({ length: food_count }, () => ({
      ...randCell(obstacles, snake),
      type: pickFoodType(food_weights),
    }))
    set({ levelConfig: config, obstacles, foods })
  },

  startGame: () => {
    const snake = INITIAL_SNAKE
    set({
      phase: 'playing',
      snake,
      direction:     { x: 1, y: 0 },
      nextDirection: { x: 1, y: 0 },
      score: 0,
      lives: 3,
      evolutionStage: 'larve',
      activePowerUp: null,
      wallPass: false,
      deathCause: null,
      startTime: Date.now(),
      stats: { apples:0, golden:0, blue:0, red:0, skulls:0 },
    })
    // spawn food initiale
    const { obstacles, levelConfig } = get()
    const fw = levelConfig?.food_weights || { apple:0.7, golden:0.15, blue:0.1, red:0.04, skull:0.01 }
    const fc = levelConfig?.food_count || 1
    const foods = Array.from({ length: fc }, () => ({
      ...randCell(obstacles, snake),
      type: pickFoodType(fw),
    }))
    set({ foods })
  },

  pauseGame: () => set((s) => ({
    phase: s.phase === 'playing' ? 'paused' : 'playing'
  })),

  setDirection: (dir) => {
    const { direction } = get()
    if (dir.x === -direction.x && dir.y === -direction.y) return
    set({ nextDirection: dir })
  },

  tick: () => {
    const state = get()
    if (state.phase !== 'playing') return

    const dir = state.nextDirection
    const head = state.snake[0]
    let nx = head.x + dir.x
    let ny = head.y + dir.y

    if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) {
      if (state.wallPass) {
        nx = (nx + GRID_W) % GRID_W
        ny = (ny + GRID_H) % GRID_H
        set({ wallPass: false })
      } else {
        get()._die('wall')
        return
      }
    }

    // Collision obstacle
    const hitObstacle = state.obstacles.some(o => o.x === nx && o.y === ny)
    if (hitObstacle) { get()._die('wall'); return }

    const hitSelf = state.snake.slice(0, -1).some(s => s.x === nx && s.y === ny)
    if (hitSelf) { get()._die('self'); return }

    const newHead = { x: nx, y: ny }
    let newSnake = [newHead, ...state.snake]

    const foodIdx = state.foods.findIndex(f => f.x === nx && f.y === ny)
    let newFoods = [...state.foods]
    let newScore = state.score
    let newStats = { ...state.stats }
    let newActivePowerUp = state.activePowerUp
    let newWallPass = state.wallPass
    let newLives = state.lives

    if (foodIdx !== -1) {
      const food = state.foods[foodIdx]
      newScore = Math.max(0, newScore + (FOOD_POINTS[food.type] || 10))

      if (food.type === 'apple')  newStats.apples++
      if (food.type === 'golden') newStats.golden++
      if (food.type === 'blue')   newStats.blue++
      if (food.type === 'red')    newStats.red++
      if (food.type === 'skull')  newStats.skulls++

      // Effets
      if (food.type === 'skull') {
        const newLen = newSnake.length - 3
        if (newLen < 1) { get()._die('skull'); return }
        newSnake = newSnake.slice(0, newLen)
      }

      if (food.type === 'golden') {
        newActivePowerUp = { type: 'golden', expiresAt: Date.now() + 5000, speedFactor: 1.6 }
      }
      if (food.type === 'blue') {
        newActivePowerUp = { type: 'blue', expiresAt: Date.now() + 5000, speedFactor: 0.4 }
      }
      if (food.type === 'red') {
        newWallPass = true
      }

      const fw = state.levelConfig?.food_weights || { apple:0.7, golden:0.15, blue:0.1, red:0.04, skull:0.01 }
      newFoods[foodIdx] = {
        ...randCell(state.obstacles, newSnake),
        type: pickFoodType(fw),
      }
    } else {
      newSnake = newSnake.slice(0, -1)
    }

    if (newActivePowerUp && Date.now() > newActivePowerUp.expiresAt) {
      newActivePowerUp = null
    }

    const len = newSnake.length
    const stage = len >= 15 ? 'dragon' : len >= 8 ? 'serpent' : 'larve'

    set({
      snake: newSnake,
      direction: dir,
      foods: newFoods,
      score: newScore,
      stats: newStats,
      activePowerUp: newActivePowerUp,
      wallPass: newWallPass,
      lives: newLives,
      evolutionStage: stage,
    })
  },

  _die: (cause) => {
    const { lives } = get()
    const newLives = lives - 1
    if (newLives <= 0) {
      set({ phase: 'gameover', deathCause: cause, lives: 0 })
    } else {
      const snake = INITIAL_SNAKE
      set({
        lives: newLives,
        snake,
        direction:     { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        deathCause: cause,
      })
    }
  },

  goToMenu: () => set({
    phase: 'menu',
    snake: INITIAL_SNAKE,
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    score: 0, lives: 3, level: 1,
    foods: [], obstacles: [],
    activePowerUp: null, wallPass: false,
    deathCause: null, evolutionStage: 'larve',
  }),
}))

import { useCallback } from 'react'
import axios from 'axios'
import { useGameStore } from '../store/gameStore'

const api = axios.create({ baseURL: '/api' })

export function useApi() {
  const setPlayer      = useGameStore(s => s.setPlayer)
  const setLevelConfig = useGameStore(s => s.setLevelConfig)
  const setLeaderboard = useGameStore(s => s.setLeaderboard)

  // Crée ou récupère un joueur
  const loginOrCreate = useCallback(async (username) => {
    try {
      const res = await api.get(`/players/username/${username}`)
      setPlayer(res.data)
      return res.data
    } catch {
      const res = await api.post('/players/', { username })
      setPlayer(res.data)
      return res.data
    }
  }, [setPlayer])

  // Charge la config d'un niveau
  const fetchLevel = useCallback(async (levelNumber) => {
    try {
      const res = await api.get(`/levels/${levelNumber}`)
      setLevelConfig(res.data)
      return res.data
    } catch {
      // Config de fallback si le backend n'est pas disponible
      const fallback = {
        number: levelNumber,
        grid_width: 20, grid_height: 20,
        obstacles: [],
        base_speed_ms: 200,
        food_count: 1,
        food_weights: { apple:0.7, golden:0.15, blue:0.1, red:0.04, skull:0.01 },
      }
      setLevelConfig(fallback)
      return fallback
    }
  }, [setLevelConfig])

  // Soumet le score de fin de partie
  const submitScore = useCallback(async ({ playerId, points, levelReached, snakeLength, durationSeconds, evolutionStage, deathCause, stats }) => {
    try {
      await api.post('/scores/', {
        player_id:        playerId,
        points,
        level_reached:    levelReached,
        snake_length:     snakeLength,
        duration_seconds: durationSeconds,
        evolution_stage:  evolutionStage,
        death_cause:      deathCause,
      })
    } catch (e) {
      console.warn('Score non sauvegardé :', e.message)
    }
  }, [])

  // Charge le leaderboard
  const fetchLeaderboard = useCallback(async (limit = 10) => {
    try {
      const res = await api.get(`/scores/leaderboard?limit=${limit}`)
      setLeaderboard(res.data)
      return res.data
    } catch {
      return []
    }
  }, [setLeaderboard])

  return { loginOrCreate, fetchLevel, submitScore, fetchLeaderboard }
}

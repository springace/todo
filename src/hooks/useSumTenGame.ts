import { useCallback, useEffect, useReducer, useState } from 'react'
import {
  advanceResolve,
  clearComboPopup,
  createInitialState,
  hardDrop,
  moveHorizontal,
  tick,
  type GameState,
} from '../game/sumTen'

const BEST_SCORE_KEY = 'sumten-best-score'
const INITIAL_INTERVAL_MS = 800
const MIN_INTERVAL_MS = 150
const SPEEDUP_PER_POINTS = 50
const SPEEDUP_STEP_MS = 30
const FLASH_DURATION_MS = 350
const HOLD_DURATION_MS = 600
const COMBO_POPUP_DURATION_MS = 850

type Action =
  | { type: 'LEFT' }
  | { type: 'RIGHT' }
  | { type: 'TICK' }
  | { type: 'DROP' }
  | { type: 'RESTART' }
  | { type: 'ADVANCE_RESOLVE' }
  | { type: 'CLEAR_COMBO_POPUP' }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'LEFT':
      return moveHorizontal(state, -1)
    case 'RIGHT':
      return moveHorizontal(state, 1)
    case 'TICK':
      return tick(state)
    case 'DROP':
      return hardDrop(state)
    case 'RESTART':
      return createInitialState(state.best)
    case 'ADVANCE_RESOLVE':
      return advanceResolve(state)
    case 'CLEAR_COMBO_POPUP':
      return clearComboPopup(state)
  }
}

function loadBest(): number {
  const raw = localStorage.getItem(BEST_SCORE_KEY)
  const parsed = raw ? Number(raw) : 0
  return Number.isFinite(parsed) ? parsed : 0
}

export function useSumTenGame() {
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialState(loadBest()))
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    localStorage.setItem(BEST_SCORE_KEY, String(state.best))
  }, [state.best])

  useEffect(() => {
    if (state.gameOver || paused || state.resolve) return
    const level = Math.floor(state.score / SPEEDUP_PER_POINTS)
    const interval = Math.max(MIN_INTERVAL_MS, INITIAL_INTERVAL_MS - level * SPEEDUP_STEP_MS)
    const id = window.setInterval(() => dispatch({ type: 'TICK' }), interval)
    return () => window.clearInterval(id)
  }, [state.score, state.gameOver, paused, state.resolve])

  useEffect(() => {
    if (!state.resolve) return
    const delay = state.resolve.phase === 'flash' ? FLASH_DURATION_MS : HOLD_DURATION_MS
    const id = window.setTimeout(() => dispatch({ type: 'ADVANCE_RESOLVE' }), delay)
    return () => window.clearTimeout(id)
  }, [state.resolve])

  useEffect(() => {
    if (!state.comboPopup) return
    const id = window.setTimeout(() => dispatch({ type: 'CLEAR_COMBO_POPUP' }), COMBO_POPUP_DURATION_MS)
    return () => window.clearTimeout(id)
  }, [state.comboPopup])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (state.gameOver) {
        if (e.key === 'r' || e.key === 'R') dispatch({ type: 'RESTART' })
        return
      }
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          e.preventDefault()
          dispatch({ type: 'LEFT' })
          break
        case 'ArrowRight':
        case 'd':
          e.preventDefault()
          dispatch({ type: 'RIGHT' })
          break
        case 'ArrowDown':
        case 's':
          e.preventDefault()
          dispatch({ type: 'TICK' })
          break
        case 'ArrowUp':
        case 'w':
        case ' ':
          e.preventDefault()
          dispatch({ type: 'DROP' })
          break
        case 'p':
        case 'P':
          setPaused((p) => !p)
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [state.gameOver])

  const moveLeft = useCallback(() => dispatch({ type: 'LEFT' }), [])
  const moveRight = useCallback(() => dispatch({ type: 'RIGHT' }), [])
  const softDrop = useCallback(() => dispatch({ type: 'TICK' }), [])
  const drop = useCallback(() => dispatch({ type: 'DROP' }), [])
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), [])
  const togglePause = useCallback(() => setPaused((p) => !p), [])

  return {
    state,
    paused,
    moveLeft,
    moveRight,
    softDrop,
    drop,
    restart,
    togglePause,
  }
}

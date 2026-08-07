export const COLS = 6
export const ROWS = 12
export const TARGET_SUM = 10

export type Cell = number | null
export type Grid = Cell[][]

export interface FallingBlock {
  col: number
  row: number
  value: number
}

export interface ResolveStep {
  matched: [number, number][]
  gridAfterClear: Grid
  comboIndex: number
  points: number
}

export type ResolvePhase = 'flash' | 'hold'

export interface ResolveState {
  steps: ResolveStep[]
  stepIndex: number
  phase: ResolvePhase
}

export interface ComboPopup {
  combo: number
  points: number
  id: number
}

export interface GameState {
  grid: Grid
  current: FallingBlock | null
  next: number
  score: number
  best: number
  gameOver: boolean
  resolve: ResolveState | null
  comboPopup: ComboPopup | null
}

let popupIdCounter = 0

export function randomValue(): number {
  return 1 + Math.floor(Math.random() * 9)
}

export function createEmptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null))
}

function spawnCol(): number {
  return Math.floor(COLS / 2)
}

export function spawnBlock(value: number): FallingBlock {
  return { col: spawnCol(), row: 0, value }
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS
}

function isFree(grid: Grid, row: number, col: number): boolean {
  return inBounds(row, col) && grid[row][col] === null
}

type LineCell = { pos: [number, number]; value: number }

function collectLineMatches(line: LineCell[], matched: Set<string>) {
  for (let start = 0; start < line.length; start++) {
    let sum = 0
    for (let end = start; end < line.length; end++) {
      sum += line[end].value
      if (sum === TARGET_SUM && end > start) {
        for (let i = start; i <= end; i++) {
          const [r, c] = line[i].pos
          matched.add(`${r},${c}`)
        }
      }
      if (sum >= TARGET_SUM) break
    }
  }
}

// Finds every contiguous run of 2+ blocks (no gaps) in a row or column whose
// values sum to exactly 10 - not just adjacent pairs.
function findMatches(grid: Grid): Set<string> {
  const matched = new Set<string>()

  for (let r = 0; r < ROWS; r++) {
    let segment: LineCell[] = []
    for (let c = 0; c <= COLS; c++) {
      const v = c < COLS ? grid[r][c] : null
      if (v !== null) {
        segment.push({ pos: [r, c], value: v })
      } else {
        if (segment.length >= 2) collectLineMatches(segment, matched)
        segment = []
      }
    }
  }

  for (let c = 0; c < COLS; c++) {
    let segment: LineCell[] = []
    for (let r = 0; r <= ROWS; r++) {
      const v = r < ROWS ? grid[r][c] : null
      if (v !== null) {
        segment.push({ pos: [r, c], value: v })
      } else {
        if (segment.length >= 2) collectLineMatches(segment, matched)
        segment = []
      }
    }
  }

  return matched
}

function applyGravity(grid: Grid): Grid {
  const next = createEmptyGrid()
  for (let c = 0; c < COLS; c++) {
    const values: number[] = []
    for (let r = 0; r < ROWS; r++) {
      const v = grid[r][c]
      if (v !== null) values.push(v)
    }
    const start = ROWS - values.length
    for (let i = 0; i < values.length; i++) {
      next[start + i][c] = values[i]
    }
  }
  return next
}

function resolveLock(grid: Grid, block: FallingBlock): ResolveStep[] {
  let working = grid.map((row) => [...row])
  working[block.row][block.col] = block.value

  const steps: ResolveStep[] = []
  let comboIndex = 0

  while (true) {
    const matched = findMatches(working)
    if (matched.size === 0) break
    comboIndex++
    const matchedPositions: [number, number][] = [...matched].map((key) => {
      const [r, c] = key.split(',').map(Number)
      return [r, c]
    })
    for (const [r, c] of matchedPositions) working[r][c] = null
    const points = matchedPositions.length * 10 * comboIndex
    working = applyGravity(working)
    steps.push({ matched: matchedPositions, gridAfterClear: working, comboIndex, points })
  }

  return steps
}

export function createInitialState(best = 0): GameState {
  return {
    grid: createEmptyGrid(),
    current: spawnBlock(randomValue()),
    next: randomValue(),
    score: 0,
    best,
    gameOver: false,
    resolve: null,
    comboPopup: null,
  }
}

export function moveHorizontal(state: GameState, dCol: number): GameState {
  if (state.gameOver || !state.current) return state
  const target = state.current.col + dCol
  if (!isFree(state.grid, state.current.row, target)) return state
  return { ...state, current: { ...state.current, col: target } }
}

function canFall(grid: Grid, block: FallingBlock): boolean {
  return isFree(grid, block.row + 1, block.col)
}

function spawnAfterLock(state: GameState): GameState {
  const col = spawnCol()
  if (state.grid[0][col] !== null) {
    return { ...state, current: null, gameOver: true, resolve: null }
  }
  return { ...state, current: spawnBlock(state.next), next: randomValue(), resolve: null }
}

function lockCurrent(state: GameState): GameState {
  if (!state.current) return state
  const lockedGrid = state.grid.map((row) => [...row])
  lockedGrid[state.current.row][state.current.col] = state.current.value

  const steps = resolveLock(state.grid, state.current)

  if (steps.length === 0) {
    return spawnAfterLock({ ...state, grid: lockedGrid, current: null })
  }

  return {
    ...state,
    grid: lockedGrid,
    current: null,
    resolve: { steps, stepIndex: 0, phase: 'flash' },
  }
}

export function tick(state: GameState): GameState {
  if (state.gameOver || state.resolve || !state.current) return state
  if (canFall(state.grid, state.current)) {
    return { ...state, current: { ...state.current, row: state.current.row + 1 } }
  }
  return lockCurrent(state)
}

export function hardDrop(state: GameState): GameState {
  if (state.gameOver || state.resolve || !state.current) return state
  let block = state.current
  while (canFall(state.grid, block)) {
    block = { ...block, row: block.row + 1 }
  }
  return lockCurrent({ ...state, current: block })
}

// Each cascade pass is revealed in two beats: 'flash' highlights the
// matched cells in place, then 'hold' applies the clear (grid update,
// score, combo popup) and pauses before the next pass starts flashing.
export function advanceResolve(state: GameState): GameState {
  if (!state.resolve) return state
  const { steps, stepIndex, phase } = state.resolve

  if (phase === 'flash') {
    const step = steps[stepIndex]
    const score = state.score + step.points
    const best = Math.max(state.best, score)
    return {
      ...state,
      grid: step.gridAfterClear,
      score,
      best,
      comboPopup: { combo: step.comboIndex, points: step.points, id: ++popupIdCounter },
      resolve: { steps, stepIndex, phase: 'hold' },
    }
  }

  const nextIndex = stepIndex + 1
  if (nextIndex < steps.length) {
    return { ...state, resolve: { steps, stepIndex: nextIndex, phase: 'flash' } }
  }
  return spawnAfterLock({ ...state, resolve: null })
}

export function clearComboPopup(state: GameState): GameState {
  if (!state.comboPopup) return state
  return { ...state, comboPopup: null }
}

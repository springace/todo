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

export interface GameState {
  grid: Grid
  current: FallingBlock | null
  next: number
  score: number
  best: number
  gameOver: boolean
}

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

function findMatches(grid: Grid): Set<string> {
  const matched = new Set<string>()
  const neighbors = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = grid[r][c]
      if (v === null) continue
      for (const [dr, dc] of neighbors) {
        const nr = r + dr
        const nc = c + dc
        if (!inBounds(nr, nc)) continue
        const nv = grid[nr][nc]
        if (nv !== null && v + nv === TARGET_SUM) {
          matched.add(`${r},${c}`)
          matched.add(`${nr},${nc}`)
        }
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

export interface ResolveResult {
  grid: Grid
  scoreGained: number
  maxCombo: number
}

export function lockAndResolve(grid: Grid, block: FallingBlock): ResolveResult {
  let working = grid.map((row) => [...row])
  working[block.row][block.col] = block.value

  let scoreGained = 0
  let combo = 0

  while (true) {
    const matched = findMatches(working)
    if (matched.size === 0) break
    combo++
    for (const key of matched) {
      const [r, c] = key.split(',').map(Number)
      working[r][c] = null
    }
    scoreGained += (matched.size / 2) * 10 * combo
    working = applyGravity(working)
  }

  return { grid: working, scoreGained, maxCombo: combo }
}

export function createInitialState(best = 0): GameState {
  return {
    grid: createEmptyGrid(),
    current: spawnBlock(randomValue()),
    next: randomValue(),
    score: 0,
    best,
    gameOver: false,
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

function lockCurrentAndSpawn(state: GameState): GameState {
  if (!state.current) return state
  const { grid, scoreGained } = lockAndResolve(state.grid, state.current)
  const col = spawnCol()
  const score = state.score + scoreGained
  const best = Math.max(state.best, score)

  if (grid[0][col] !== null) {
    return { ...state, grid, score, best, current: null, gameOver: true }
  }

  return {
    ...state,
    grid,
    score,
    best,
    current: spawnBlock(state.next),
    next: randomValue(),
  }
}

export function tick(state: GameState): GameState {
  if (state.gameOver || !state.current) return state
  if (canFall(state.grid, state.current)) {
    return { ...state, current: { ...state.current, row: state.current.row + 1 } }
  }
  return lockCurrentAndSpawn(state)
}

export function hardDrop(state: GameState): GameState {
  if (state.gameOver || !state.current) return state
  let block = state.current
  while (canFall(state.grid, block)) {
    block = { ...block, row: block.row + 1 }
  }
  return lockCurrentAndSpawn({ ...state, current: block })
}

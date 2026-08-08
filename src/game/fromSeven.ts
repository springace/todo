export const COLS = 6
export const ROWS = 12
export const FIRST_TARGET = 7
export const BLOCKS_PER_LEVEL = 20

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
  target: number
  isLevelUp: boolean
  blocksClearedAfter: number
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
  target: number
  isLevelUp: boolean
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
  blocksCleared: number
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

function isPrime(n: number): boolean {
  if (n < 2) return false
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false
  }
  return true
}

const primeCache: number[] = []

// The Nth prime at or after FIRST_TARGET: level 0 -> 7, 1 -> 11, 2 -> 13, 3 -> 17, ...
function primeAtLevel(level: number): number {
  while (primeCache.length <= level) {
    const n = primeCache.length === 0 ? FIRST_TARGET : primeCache[primeCache.length - 1] + 1
    let candidate = n
    while (!isPrime(candidate)) candidate++
    primeCache.push(candidate)
  }
  return primeCache[level]
}

export function levelForBlocksCleared(blocksCleared: number): number {
  return Math.floor(blocksCleared / BLOCKS_PER_LEVEL)
}

export function currentTarget(state: GameState): number {
  return primeAtLevel(levelForBlocksCleared(state.blocksCleared))
}

type LineCell = { pos: [number, number]; value: number }

function collectLineMatches(line: LineCell[], matched: Set<string>, target: number) {
  for (let start = 0; start < line.length; start++) {
    let sum = 0
    for (let end = start; end < line.length; end++) {
      sum += line[end].value
      if (sum % target === 0 && end > start) {
        for (let i = start; i <= end; i++) {
          const [r, c] = line[i].pos
          matched.add(`${r},${c}`)
        }
      }
    }
  }
}

// Finds every contiguous run of 2+ blocks (no gaps) in a row or column whose
// values sum to a multiple of the current target prime.
function findMatches(grid: Grid, target: number): Set<string> {
  const matched = new Set<string>()

  for (let r = 0; r < ROWS; r++) {
    let segment: LineCell[] = []
    for (let c = 0; c <= COLS; c++) {
      const v = c < COLS ? grid[r][c] : null
      if (v !== null) {
        segment.push({ pos: [r, c], value: v })
      } else {
        if (segment.length >= 2) collectLineMatches(segment, matched, target)
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
        if (segment.length >= 2) collectLineMatches(segment, matched, target)
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

// Each pass re-derives the target prime from the running cleared-block count,
// so the moment enough blocks have been cleared to level up, the very next
// pass re-scans the whole board under the new target and clears anything
// that now matches - even mid-cascade, before the piece has finished settling.
function resolveLock(grid: Grid, block: FallingBlock, startingBlocksCleared: number): ResolveStep[] {
  let working = grid.map((row) => [...row])
  working[block.row][block.col] = block.value

  const steps: ResolveStep[] = []
  let comboIndex = 0
  let blocksCleared = startingBlocksCleared
  let activeTarget = primeAtLevel(levelForBlocksCleared(blocksCleared))

  while (true) {
    const target = primeAtLevel(levelForBlocksCleared(blocksCleared))
    const isLevelUp = target !== activeTarget
    activeTarget = target

    const matched = findMatches(working, target)
    if (matched.size === 0) break

    comboIndex++
    const matchedPositions: [number, number][] = [...matched].map((key) => {
      const [r, c] = key.split(',').map(Number)
      return [r, c]
    })
    for (const [r, c] of matchedPositions) working[r][c] = null
    blocksCleared += matchedPositions.length
    const points = matchedPositions.length * target * comboIndex
    working = applyGravity(working)
    steps.push({
      matched: matchedPositions,
      gridAfterClear: working,
      comboIndex,
      points,
      target,
      isLevelUp,
      blocksClearedAfter: blocksCleared,
    })
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
    blocksCleared: 0,
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

  const steps = resolveLock(state.grid, state.current, state.blocksCleared)

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
      blocksCleared: step.blocksClearedAfter,
      comboPopup: {
        combo: step.comboIndex,
        points: step.points,
        target: step.target,
        isLevelUp: step.isLevelUp,
        id: ++popupIdCounter,
      },
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

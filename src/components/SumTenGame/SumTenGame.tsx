import { useSumTenGame } from '../../hooks/useSumTenGame'
import { COLS, ROWS, type Cell } from '../../game/sumTen'

const VALUE_STYLES: Record<number, string> = {
  1: 'bg-red-400',
  2: 'bg-orange-400',
  3: 'bg-amber-400',
  4: 'bg-yellow-400',
  5: 'bg-lime-400',
  6: 'bg-green-400',
  7: 'bg-teal-400',
  8: 'bg-cyan-400',
  9: 'bg-blue-400',
}

function Block({ value }: { value: number }) {
  return (
    <div
      className={`w-full h-full rounded-md flex items-center justify-center text-white font-bold shadow-sm ${VALUE_STYLES[value]}`}
    >
      {value}
    </div>
  )
}

export function SumTenGame() {
  const { state, paused, moveLeft, moveRight, softDrop, drop, restart, togglePause } =
    useSumTenGame()

  const displayGrid: Cell[][] = state.grid.map((row) => [...row])
  if (state.current) {
    displayGrid[state.current.row][state.current.col] = state.current.value
  }

  const flashSet = state.resolve
    ? new Set(state.resolve.steps[state.resolve.stepIndex].matched.map(([r, c]) => `${r},${c}`))
    : null

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-xs">
        <div>
          <p className="text-xs text-gray-500">スコア</p>
          <p className="text-xl font-bold text-gray-900">{state.score}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">ベスト</p>
          <p className="text-xl font-bold text-gray-900">{state.best}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full max-w-xs">
        <span className="text-xs text-gray-500">つぎ</span>
        <div className="w-8 h-8">
          <Block value={state.next} />
        </div>
        <button
          type="button"
          onClick={togglePause}
          disabled={state.gameOver}
          className="ml-auto text-xs px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        >
          {paused ? '再開' : '一時停止'}
        </button>
      </div>

      <div
        className="relative w-full max-w-xs bg-gray-200 rounded-lg p-1.5 grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          aspectRatio: `${COLS} / ${ROWS}`,
        }}
      >
        {displayGrid.map((row, r) =>
          row.map((value, c) => {
            const isFlashing = flashSet?.has(`${r},${c}`) ?? false
            return (
              <div
                key={`${r}-${c}`}
                className={`bg-gray-100 rounded-md ${isFlashing ? 'sumten-cell-clearing' : ''}`}
              >
                {value !== null && <Block value={value} />}
              </div>
            )
          })
        )}

        {state.comboPopup && (
          <div
            key={state.comboPopup.id}
            className="sumten-combo-popup pointer-events-none absolute left-1/2 top-1/2 z-20 whitespace-nowrap text-center"
          >
            <p className="text-2xl font-extrabold text-orange-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
              COMBO ×{state.comboPopup.combo}
            </p>
            <p className="text-sm font-bold text-orange-400">+{state.comboPopup.points}</p>
          </div>
        )}

        {(paused || state.gameOver) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/85 rounded-lg">
            {state.gameOver ? (
              <>
                <p className="text-lg font-bold text-gray-900">ゲームオーバー</p>
                <p className="text-sm text-gray-600">スコア: {state.score}</p>
                <button
                  type="button"
                  onClick={restart}
                  className="px-4 py-2 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
                >
                  もう一度あそぶ
                </button>
              </>
            ) : (
              <p className="text-lg font-bold text-gray-900">一時停止中</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        <button
          type="button"
          onClick={moveLeft}
          disabled={state.gameOver}
          className="py-3 rounded-md bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 disabled:opacity-40"
        >
          ◀
        </button>
        <button
          type="button"
          onClick={softDrop}
          disabled={state.gameOver}
          className="py-3 rounded-md bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 disabled:opacity-40"
        >
          ▼
        </button>
        <button
          type="button"
          onClick={moveRight}
          disabled={state.gameOver}
          className="py-3 rounded-md bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 disabled:opacity-40"
        >
          ▶
        </button>
        <button
          type="button"
          onClick={drop}
          disabled={state.gameOver}
          className="col-span-3 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-40"
        >
          一気に落とす
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center leading-relaxed">
        隣り合うブロックの数字の合計が10になると消えます。
        <br />
        矢印キー / A・D・S・Wでも操作できます。
      </p>
    </div>
  )
}

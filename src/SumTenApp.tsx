import { SumTenGame } from './components/SumTenGame/SumTenGame'

export default function SumTenApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">足して10パズル</h1>
          <p className="text-sm text-gray-500 mt-1">隣り合うブロックの合計が10になると消えるパズルゲーム</p>
        </header>

        <SumTenGame />

        <p className="mt-8 text-center">
          <a href="../" className="text-xs text-gray-400 hover:text-gray-600 underline">
            ← Todoアプリへ戻る
          </a>
        </p>
      </div>
    </div>
  )
}

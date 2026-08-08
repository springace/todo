import { FromSevenGame } from './components/FromSevenGame/FromSevenGame'

export default function FromSevenApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">From Seven</h1>
          <p className="text-sm text-gray-500 mt-1">
            合計が目標の倍数になると消えるパズルゲーム。目標は7からスタートし、消すほど7→11→13→17…と難しくなる。
          </p>
        </header>

        <FromSevenGame />

        <p className="mt-8 text-center">
          <a href="../" className="text-xs text-gray-400 hover:text-gray-600 underline">
            ← Todoアプリへ戻る
          </a>
        </p>
      </div>
    </div>
  )
}

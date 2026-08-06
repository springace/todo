import { useState } from 'react'
import { whenWords, whereWords, whoWords, whatWords, howWords } from '../data/sentenceGameWords'

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

interface Sentence {
  id: string
  when: string
  where: string
  who: string
  what: string
  how: string
}

function generateSentence(): Sentence {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    when: pickRandom(whenWords),
    where: pickRandom(whereWords),
    who: pickRandom(whoWords),
    what: pickRandom(whatWords),
    how: pickRandom(howWords),
  }
}

const parts: { key: keyof Omit<Sentence, 'id'>; label: string; color: string }[] = [
  { key: 'when', label: 'いつ', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { key: 'where', label: 'どこで', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'who', label: '誰が', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'what', label: '何を', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { key: 'how', label: 'どうした', color: 'bg-violet-50 text-violet-700 border-violet-200' },
]

export function SentenceGame() {
  const [current, setCurrent] = useState<Sentence>(() => generateSentence())
  const [history, setHistory] = useState<Sentence[]>([])

  const handleShuffle = () => {
    setHistory((h) => [current, ...h].slice(0, 10))
    setCurrent(generateSentence())
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">ランダム文章メーカー</h2>
        <p className="text-xs text-gray-500">いつ・どこで・誰が・何を・どうした</p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {parts.map((p) => (
          <span
            key={p.key}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${p.color}`}
          >
            {p.label}: {current[p.key]}
          </span>
        ))}
      </div>

      <p className="text-xl font-semibold text-gray-900 leading-relaxed bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-4 mb-4">
        {current.when}{current.where}{current.who}{current.what}{current.how}。
      </p>

      <button
        onClick={handleShuffle}
        className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        🎲 もう一度シャッフル
      </button>

      {history.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-medium text-gray-500 mb-2">これまでの文章</h3>
          <ul className="space-y-1.5 max-h-48 overflow-y-auto">
            {history.map((s) => (
              <li key={s.id} className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                {s.when}{s.where}{s.who}{s.what}{s.how}。
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useTodos } from './hooks/useTodos'
import { useFilters } from './hooks/useFilters'
import { AddTodoForm } from './components/AddTodoForm'
import { TodoList } from './components/TodoList'
import { FilterBar } from './components/FilterBar'
import { SentenceGame } from './components/SentenceGame'

type Tab = 'todo' | 'sentence'

export default function App() {
  const { todos, addTodo, deleteTodo, toggleTodo, reorderTodos, allCategories, allTags } = useTodos()
  const { filters, filtered, setStatus, setCategory, setPriority, setTag } = useFilters(todos)
  const [tab, setTab] = useState<Tab>('todo')

  const activeCount = todos.filter((t) => !t.completed).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Todo</h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeCount} 件の未完了タスク
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTab('todo')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === 'todo' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            タスク
          </button>
          <button
            onClick={() => setTab('sentence')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === 'sentence' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎲 文章ゲーム
          </button>
        </div>

        {tab === 'todo' && (
          <>
            {/* Add form */}
            <AddTodoForm allCategories={allCategories} onAdd={addTodo} />

            {/* Filters */}
            <FilterBar
              filters={filters}
              allCategories={allCategories}
              allTags={allTags}
              onStatusChange={setStatus}
              onCategoryChange={setCategory}
              onPriorityChange={setPriority}
              onTagChange={setTag}
            />

            {/* Task list */}
            <TodoList
              todos={filtered}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onReorder={reorderTodos}
              onTagClick={(tag) => setTag(filters.tag === tag ? '' : tag)}
              activeTag={filters.tag}
            />
          </>
        )}

        {tab === 'sentence' && <SentenceGame />}

        <p className="mt-8 text-center">
          <a href="sumten/" className="text-xs text-gray-400 hover:text-gray-600 underline">
            🎮 足して10パズルで遊ぶ
          </a>
        </p>
      </div>
    </div>
  )
}

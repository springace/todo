import { useState } from 'react'
import { useTodos } from './hooks/useTodos'
import { useFilters } from './hooks/useFilters'
import { AddTodoForm } from './components/AddTodoForm'
import { TodoList } from './components/TodoList'
import { FilterBar } from './components/FilterBar'
import { SumTenGame } from './components/SumTenGame/SumTenGame'

type View = 'todo' | 'game'

export default function App() {
  const [view, setView] = useState<View>('game')
  const { todos, addTodo, deleteTodo, toggleTodo, reorderTodos, allCategories, allTags } = useTodos()
  const { filters, filtered, setStatus, setCategory, setPriority, setTag } = useFilters(todos)

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

          <nav className="mt-4 inline-flex rounded-lg bg-gray-200 p-1">
            <button
              type="button"
              onClick={() => setView('todo')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === 'todo' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Todo
            </button>
            <button
              type="button"
              onClick={() => setView('game')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === 'game' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              足して10パズル
            </button>
          </nav>
        </header>

        {view === 'todo' ? (
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
        ) : (
          <SumTenGame />
        )}
      </div>
    </div>
  )
}

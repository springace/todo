import { useTodos } from './hooks/useTodos'
import { useFilters } from './hooks/useFilters'
import { AddTodoForm } from './components/AddTodoForm'
import { TodoList } from './components/TodoList'
import { FilterBar } from './components/FilterBar'

export default function App() {
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
        </header>

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
      </div>
    </div>
  )
}

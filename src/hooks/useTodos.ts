import { useState, useCallback } from 'react'
import type { Todo, Priority } from '../types/todo'
import { loadTodos, saveTodos } from '../utils/storage'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = loadTodos()
    return saved.sort((a, b) => a.order - b.order)
  })

  const persist = useCallback((updated: Todo[]) => {
    setTodos(updated)
    saveTodos(updated)
  }, [])

  const addTodo = useCallback(
    (fields: {
      title: string
      priority: Priority
      dueDate?: string
      category?: string
      tags: string[]
    }) => {
      const maxOrder = todos.reduce((m, t) => Math.max(m, t.order), -1)
      const newTodo: Todo = {
        id: generateId(),
        title: fields.title,
        completed: false,
        priority: fields.priority,
        dueDate: fields.dueDate,
        category: fields.category,
        tags: fields.tags,
        order: maxOrder + 1,
        createdAt: new Date().toISOString(),
      }
      persist([...todos, newTodo])
    },
    [todos, persist]
  )

  const deleteTodo = useCallback(
    (id: string) => {
      persist(todos.filter((t) => t.id !== id))
    },
    [todos, persist]
  )

  const toggleTodo = useCallback(
    (id: string) => {
      persist(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
    },
    [todos, persist]
  )

  const reorderTodos = useCallback(
    (activeId: string, overId: string) => {
      const activeIndex = todos.findIndex((t) => t.id === activeId)
      const overIndex = todos.findIndex((t) => t.id === overId)
      if (activeIndex === -1 || overIndex === -1) return

      const reordered = [...todos]
      const [moved] = reordered.splice(activeIndex, 1)
      reordered.splice(overIndex, 0, moved)
      const withOrder = reordered.map((t, i) => ({ ...t, order: i }))
      persist(withOrder)
    },
    [todos, persist]
  )

  const allCategories = [...new Set(todos.map((t) => t.category).filter(Boolean) as string[])]
  const allTags = [...new Set(todos.flatMap((t) => t.tags))]

  return { todos, addTodo, deleteTodo, toggleTodo, reorderTodos, allCategories, allTags }
}

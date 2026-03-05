import { useState, useCallback } from 'react'
import type { Filters, FilterStatus, Priority, Todo } from '../types/todo'

const initial: Filters = {
  status: 'all',
  category: '',
  priority: 'all',
  tag: '',
}

export function useFilters(todos: Todo[]) {
  const [filters, setFilters] = useState<Filters>(initial)

  const setStatus = useCallback((status: FilterStatus) => {
    setFilters((f) => ({ ...f, status }))
  }, [])

  const setCategory = useCallback((category: string) => {
    setFilters((f) => ({ ...f, category }))
  }, [])

  const setPriority = useCallback((priority: Priority | 'all') => {
    setFilters((f) => ({ ...f, priority }))
  }, [])

  const setTag = useCallback((tag: string) => {
    setFilters((f) => ({ ...f, tag }))
  }, [])

  const filtered = todos.filter((t) => {
    if (filters.status === 'active' && t.completed) return false
    if (filters.status === 'completed' && !t.completed) return false
    if (filters.category && t.category !== filters.category) return false
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false
    if (filters.tag && !t.tags.includes(filters.tag)) return false
    return true
  })

  return { filters, filtered, setStatus, setCategory, setPriority, setTag }
}

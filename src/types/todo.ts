export type Priority = 'high' | 'medium' | 'low'

export interface Todo {
  id: string
  title: string
  completed: boolean
  priority: Priority
  dueDate?: string
  category?: string
  tags: string[]
  order: number
  createdAt: string
}

export type FilterStatus = 'all' | 'active' | 'completed'

export interface Filters {
  status: FilterStatus
  category: string
  priority: Priority | 'all'
  tag: string
}

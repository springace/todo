import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, isPast, parseISO, isToday } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { Todo } from '../types/todo'
import { PriorityBadge } from './PriorityBadge'
import { TagBadge } from './TagBadge'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onTagClick: (tag: string) => void
  activeTag: string
}

export function TodoItem({ todo, onToggle, onDelete, onTagClick, activeTag }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const isOverdue =
    todo.dueDate && !todo.completed && isPast(parseISO(todo.dueDate)) && !isToday(parseISO(todo.dueDate))

  const priorityBorder: Record<string, string> = {
    high: 'border-l-red-400',
    medium: 'border-l-yellow-400',
    low: 'border-l-green-400',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border border-gray-100 border-l-4 ${priorityBorder[todo.priority]} p-4 flex items-start gap-3 group`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
        aria-label="ドラッグして並び替え"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.5" />
          <circle cx="11" cy="4" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="11" cy="12" r="1.5" />
        </svg>
      </button>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0 cursor-pointer"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className={`text-sm font-medium leading-snug ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {todo.title}
          </span>
          <button
            onClick={() => onDelete(todo.id)}
            className="flex-shrink-0 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="削除"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 4h10M6 4V3h4v1M5 4l1 9h4l1-9" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <PriorityBadge priority={todo.priority} />

          {todo.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
              {todo.category}
            </span>
          )}

          {todo.dueDate && (
            <span
              className={`text-xs ${
                isOverdue
                  ? 'text-red-600 font-semibold'
                  : isToday(parseISO(todo.dueDate))
                  ? 'text-orange-500 font-medium'
                  : 'text-gray-400'
              }`}
            >
              {isOverdue && '⚠ '}
              {format(parseISO(todo.dueDate), 'M/d (EEE)', { locale: ja })}
            </span>
          )}

          {todo.tags.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              active={activeTag === tag}
              onClick={() => onTagClick(tag)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

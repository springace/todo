import type { Priority } from '../types/todo'

const styles: Record<Priority, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
}

const labels: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

interface Props {
  priority: Priority
}

export function PriorityBadge({ priority }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[priority]}`}
    >
      {labels[priority]}
    </span>
  )
}

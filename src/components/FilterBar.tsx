import type { Filters, FilterStatus, Priority } from '../types/todo'

interface Props {
  filters: Filters
  allCategories: string[]
  allTags: string[]
  onStatusChange: (s: FilterStatus) => void
  onCategoryChange: (c: string) => void
  onPriorityChange: (p: Priority | 'all') => void
  onTagChange: (t: string) => void
}

const statusOptions: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'active', label: '未完了' },
  { value: 'completed', label: '完了' },
]

export function FilterBar({
  filters,
  allCategories,
  allTags,
  onStatusChange,
  onCategoryChange,
  onPriorityChange,
  onTagChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 space-y-3">
      {/* Status */}
      <div className="flex gap-1">
        {statusOptions.map((o) => (
          <button
            key={o.value}
            onClick={() => onStatusChange(o.value)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filters.status === o.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Priority */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">優先度</label>
          <select
            value={filters.priority}
            onChange={(e) => onPriorityChange(e.target.value as Priority | 'all')}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="all">すべて</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">カテゴリ</label>
          <select
            value={filters.category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">すべて</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">タグ</label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onTagChange('')}
              className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                filters.tag === ''
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
              }`}
            >
              すべて
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagChange(filters.tag === tag ? '' : tag)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                  filters.tag === tag
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

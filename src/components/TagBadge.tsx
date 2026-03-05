interface Props {
  tag: string
  onClick?: () => void
  active?: boolean
}

export function TagBadge({ tag, onClick, active }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      #{tag}
    </button>
  )
}

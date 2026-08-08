import { Settings2 } from 'lucide-react'
import Button from '../ui/Button'
import { buildCategoryOptions } from '../../utils/categories'

export default function CategorySelector({
  categories,
  value,
  onChange,
  includeAll = false,
  onManage,
  className = '',
}) {
  const options = buildCategoryOptions(categories, { includeAll })

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? 'border-transparent text-white shadow-sm'
                  : 'border-border/70 bg-surface-muted text-text-secondary hover:border-border hover:bg-surface-elevated'
              }`}
              style={
                isActive
                  ? { backgroundColor: option.color, borderColor: option.color }
                  : undefined
              }
            >
              <span
                className="h-2.5 w-2.5 rounded-full ring-1 ring-white/30"
                style={{ backgroundColor: option.color }}
              />
              {option.label}
            </button>
          )
        })}
      </div>

      {onManage && (
        <Button type="button" variant="secondary" size="sm" onClick={onManage}>
          <Settings2 className="h-4 w-4" />
          Administrar categorías
        </Button>
      )}
    </div>
  )
}

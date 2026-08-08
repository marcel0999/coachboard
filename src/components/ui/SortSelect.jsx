import { ArrowUpDown } from 'lucide-react'
import { Select } from './FormField'

export default function SortSelect({ value, onChange, options }) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 shrink-0 text-text-muted" />
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-[140px]"
        aria-label="Ordenar por"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  )
}

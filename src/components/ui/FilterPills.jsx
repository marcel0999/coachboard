export default function FilterPills({ options, value, onChange, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'

  return (
    <div className="flex flex-wrap gap-1.5 rounded-xl bg-surface-muted p-1 ring-1 ring-border/50">
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              'rounded-lg font-semibold transition-all duration-200',
              sizeClass,
              isActive
                ? 'bg-surface-elevated text-text-primary shadow-sm ring-1 ring-border/60'
                : 'text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

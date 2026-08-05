export default function FilterPills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              'rounded-full px-4 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-accent text-white shadow-sm'
                : 'bg-slate-100 text-text-secondary hover:bg-slate-200 hover:text-text-primary',
            ].join(' ')}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

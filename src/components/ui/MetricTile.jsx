const VARIANTS = {
  default: 'bg-surface-muted border-border/60',
  success: 'bg-emerald-50/80 border-emerald-100',
  warning: 'bg-amber-50/80 border-amber-100',
  danger: 'bg-red-50/80 border-red-100',
}

const VALUE_COLORS = {
  default: 'text-text-primary',
  success: 'text-emerald-800',
  warning: 'text-amber-800',
  danger: 'text-red-800',
}

const LABEL_COLORS = {
  default: 'text-text-secondary',
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
}

export default function MetricTile({ label, value, sublabel, variant = 'default', className = '' }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 transition hover:shadow-sm ${VARIANTS[variant]} ${className}`}
    >
      <p className={`text-label ${LABEL_COLORS[variant]}`}>{label}</p>
      <p className={`mt-1.5 text-2xl font-bold tracking-tight ${VALUE_COLORS[variant]}`}>{value}</p>
      {sublabel && <p className="mt-1 text-xs text-text-muted">{sublabel}</p>}
    </div>
  )
}

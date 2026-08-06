const VARIANTS = {
  default: 'bg-slate-100/90 text-slate-700 ring-slate-200/60',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200/60',
  danger: 'bg-red-50 text-red-700 ring-red-200/60',
  accent: 'bg-accent-subtle text-accent ring-emerald-200/60',
}

export default function Badge({ children, variant = 'default', dot = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${VARIANTS[variant] ?? VARIANTS.default}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            variant === 'success'
              ? 'bg-emerald-500'
              : variant === 'danger'
                ? 'bg-red-500'
                : variant === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-slate-400'
          }`}
        />
      )}
      {children}
    </span>
  )
}

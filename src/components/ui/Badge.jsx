const VARIANTS = {
  default: 'bg-surface-muted text-text-secondary ring-border/60',
  success: 'bg-success-subtle text-emerald-400 ring-emerald-500/20',
  warning: 'bg-warning-subtle text-amber-400 ring-amber-500/20',
  danger: 'bg-danger-subtle text-red-400 ring-red-500/20',
  accent: 'bg-accent-subtle text-accent ring-emerald-500/20',
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
                  : variant === 'accent'
                    ? 'bg-accent'
                    : 'bg-text-muted'
          }`}
        />
      )}
      {children}
    </span>
  )
}

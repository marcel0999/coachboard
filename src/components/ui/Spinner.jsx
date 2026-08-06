const SIZES = {
  sm: 'h-6 w-6 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-10 w-10 border-4',
}

export default function Spinner({ size = 'md', className = '', label = 'Cargando…' }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`} role="status" aria-label={label}>
      <div
        className={`animate-spin rounded-full border-accent/20 border-t-accent ${SIZES[size] ?? SIZES.md}`}
      />
      {label && size === 'lg' ? (
        <p className="text-sm text-text-secondary">{label}</p>
      ) : null}
    </div>
  )
}

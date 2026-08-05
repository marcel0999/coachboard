const LEVEL_STYLES = {
  ok: 'bg-green-500',
  warning: 'bg-amber-400',
  critical: 'bg-red-500',
  expired: 'bg-red-500',
  missing: 'bg-red-500',
  injured: 'bg-red-500',
}

export default function MedicalStatusDot({ level, className = '' }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${LEVEL_STYLES[level] ?? 'bg-slate-300'} ${className}`}
      aria-hidden
    />
  )
}

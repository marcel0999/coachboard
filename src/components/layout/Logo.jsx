export default function Logo({ compact = false, light = false }) {
  const textPrimary = light ? 'text-text-primary' : 'text-white'
  const textMuted = light ? 'text-text-muted' : 'text-slate-400'

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent"
        style={{ boxShadow: 'var(--shadow-accent)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <path
            d="M12 3v4M12 17v4M3 12h4M17 12h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {!compact && (
        <div>
          <p className={`font-display text-lg font-bold tracking-tight ${textPrimary}`}>CoachBoard</p>
          <p className={`text-[11px] font-medium tracking-wide ${textMuted}`}>Gestión profesional</p>
        </div>
      )}
    </div>
  )
}

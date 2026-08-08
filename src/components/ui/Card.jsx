export function Card({ children, className = '', hover = false, padding = true }) {
  return (
    <div
      className={[
        'cb-card',
        padding ? 'p-4 sm:p-5' : '',
        hover ? 'cb-card-hover' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function StatCard({ label, value, sublabel, accent = false, icon: Icon, trend }) {
  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-label">{label}</p>
          <p
            className={`mt-1.5 font-display text-2xl font-bold tracking-tight sm:text-3xl ${
              accent ? 'text-accent' : 'text-text-primary'
            }`}
          >
            {value}
          </p>
          {sublabel && <p className="mt-1 text-xs text-text-muted">{sublabel}</p>}
          {trend && <p className="mt-1.5 text-xs font-medium text-accent">{trend}</p>}
        </div>
        {Icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              accent ? 'bg-accent-subtle text-accent' : 'bg-surface-muted text-text-muted'
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {accent && (
        <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-accent/5 blur-2xl" />
      )}
    </Card>
  )
}

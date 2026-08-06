export function Card({ children, className = '', hover = false, padding = true }) {
  return (
    <div
      className={[
        'cb-card',
        padding ? 'p-5 sm:p-6' : '',
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-label">{label}</p>
          <p
            className={`mt-2 font-display text-3xl font-bold tracking-tight ${
              accent ? 'text-accent' : 'text-text-primary'
            }`}
          >
            {value}
          </p>
          {sublabel && <p className="mt-1.5 text-xs text-text-muted">{sublabel}</p>}
          {trend && <p className="mt-2 text-xs font-medium text-accent">{trend}</p>}
        </div>
        {Icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              accent ? 'bg-accent-subtle text-accent' : 'bg-surface-muted text-text-muted'
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {accent && (
        <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-accent/5 blur-2xl" />
      )}
    </Card>
  )
}

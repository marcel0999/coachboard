export function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-surface-card p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}

export function StatCard({ label, value, sublabel, accent = false }) {
  return (
    <Card>
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${accent ? 'text-accent' : 'text-text-primary'}`}>
        {value}
      </p>
      {sublabel && <p className="mt-1 text-xs text-text-muted">{sublabel}</p>}
    </Card>
  )
}

export default function InfoRow({ label, value, className = '' }) {
  return (
    <div className={`rounded-xl border border-border-subtle bg-surface-muted/60 px-4 py-3 ${className}`}>
      <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-text-primary">{value || '—'}</dd>
    </div>
  )
}

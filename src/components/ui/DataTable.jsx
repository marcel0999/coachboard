export default function DataTable({ children, className = '' }) {
  return (
    <div className={`cb-card overflow-hidden p-0 ${className}`}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

export function DataTableHead({ children }) {
  return (
    <thead>
      <tr className="border-b border-slate-200/80 bg-surface-muted/80">{children}</tr>
    </thead>
  )
}

export function DataTableHeaderCell({ children, align = 'left', className = '' }) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'

  return (
    <th
      className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-text-muted ${alignClass} ${className}`}
    >
      {children}
    </th>
  )
}

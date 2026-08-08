export default function BarChart({ data, valueSuffix = '', height = 160, color = 'bg-accent' }) {
  if (!data.length) {
    return (
      <div className="flex h-[160px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-muted">
        Sin datos disponibles
      </div>
    )
  }

  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-4">
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item) => {
          const barHeight = `${Math.max((item.value / max) * 100, 4)}%`
          return (
            <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-semibold text-text-primary">
                {item.value}{valueSuffix}
              </span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className={`w-full rounded-t-lg ${color} transition-all`}
                  style={{ height: barHeight }}
                  title={`${item.label}: ${item.value}${valueSuffix}`}
                />
              </div>
              <span className="max-w-full truncate text-[10px] text-text-muted" title={item.label}>
                {item.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function DualBarChart({ data, height = 160 }) {
  if (!data.length) {
    return (
      <div className="flex h-[160px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-muted">
        Sin datos disponibles
      </div>
    )
  }

  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-4">
      <div className="flex items-end gap-1 overflow-x-auto" style={{ height }}>
        {data.map((item) => {
          const barHeight = `${Math.max((item.value / max) * 100, 4)}%`
          const isMissed = item.label.includes('✗')
          return (
            <div key={item.label} className="flex w-10 shrink-0 flex-col items-center gap-2">
              <span className="text-[10px] font-semibold text-text-primary">{item.value}</span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className={`w-full rounded-t-lg ${isMissed ? 'bg-red-400' : 'bg-accent'}`}
                  style={{ height: barHeight }}
                />
              </div>
              <span className="text-[9px] text-text-muted">{item.label.replace(' ✓', '').replace(' ✗', '')}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

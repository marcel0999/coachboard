import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react'
import { Card } from '../ui/Card'
import Badge from '../ui/Badge'
import MedicalStatusDot from './MedicalStatusDot'

const ICONS = {
  expired: AlertTriangle,
  critical: AlertTriangle,
  warning: Clock3,
  missing: AlertTriangle,
  injured: AlertTriangle,
  ok: CheckCircle2,
}

export default function MedicalAlertsPanel({ alerts, filter = 'all', limit }) {
  const filtered = alerts.filter((alert) => {
    if (filter === 'all') return true
    if (filter === 'expired') return alert.level === 'expired' || alert.level === 'missing'
    if (filter === 'expiring') return alert.level === 'warning' || alert.level === 'critical'
    if (filter === 'injured') return alert.level === 'injured'
    if (filter === 'ok') return alert.level === 'ok'
    return true
  })

  const visible = limit ? filtered.slice(0, limit) : filtered

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">Centro de Alertas</h2>
        <Badge variant="default">{filtered.length}</Badge>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-green-500" />
          <p className="mt-3 text-sm font-medium text-text-primary">Sin alertas activas</p>
          <p className="mt-1 text-sm text-text-secondary">Toda la documentación está al día.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((alert) => {
            const Icon = ICONS[alert.level] ?? AlertTriangle

            return (
              <li
                key={alert.id}
                className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-muted/70 px-4 py-3"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated">
                  <Icon className={`h-4 w-4 ${alert.variant === 'danger' ? 'text-red-500' : alert.variant === 'warning' ? 'text-amber-500' : 'text-green-500'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <MedicalStatusDot level={alert.level} />
                    <p className="text-sm font-medium text-text-primary">{alert.title}</p>
                    {alert.categoryLabel && (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                        {alert.categoryLabel}
                      </span>
                    )}
                    <Badge variant={alert.variant}>{alert.level === 'expired' ? 'Rojo' : alert.level === 'warning' || alert.level === 'critical' ? 'Amarillo' : 'Prioridad'}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">{alert.description}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

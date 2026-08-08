import { BarChart3, Clock, Goal, Handshake, Square, SquareX } from 'lucide-react'
import { Card } from '../../ui/Card'

function StatCard({ icon: Icon, label, value, accent = false }) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent ? 'bg-accent/10' : 'bg-surface-muted'}`}>
        <Icon className={`h-5 w-5 ${accent ? 'text-accent' : 'text-slate-600'}`} />
      </div>
      <div>
        <p className="text-sm text-text-secondary">{label}</p>
        <p className={`text-2xl font-bold ${accent ? 'text-accent' : 'text-text-primary'}`}>{value}</p>
      </div>
    </Card>
  )
}

export default function StatisticsTab({ player }) {
  const stats = player.statistics ?? {
    matches: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    matchIds: [],
  }

  const avgMinutes = stats.matches > 0 ? Math.round(stats.minutes / stats.matches) : 0

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <p className="font-medium">Estructura preparada para integración</p>
        <p className="mt-1 text-blue-700">
          Estas estadísticas se conectarán automáticamente con el módulo de partidos.
          Campo reservado: <code className="rounded bg-blue-100 px-1">matchIds</code> ({stats.matchIds?.length ?? 0} partidos vinculados).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={BarChart3} label="Partidos" value={stats.matches} accent />
        <StatCard icon={Clock} label="Minutos" value={stats.minutes.toLocaleString('es-UY')} />
        <StatCard icon={Goal} label="Goles" value={stats.goals} accent />
        <StatCard icon={Handshake} label="Asistencias" value={stats.assists} />
        <StatCard icon={Square} label="Amarillas" value={stats.yellowCards} />
        <StatCard icon={SquareX} label="Rojas" value={stats.redCards} />
      </div>

      <Card>
        <h4 className="text-sm font-semibold text-text-primary">Resumen de rendimiento</h4>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-text-muted">Promedio min/partido</dt>
            <dd className="mt-1 text-lg font-bold text-text-primary">{avgMinutes} min</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">G+A por partido</dt>
            <dd className="mt-1 text-lg font-bold text-text-primary">
              {stats.matches > 0 ? ((stats.goals + stats.assists) / stats.matches).toFixed(2) : '0.00'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Tarjetas totales</dt>
            <dd className="mt-1 text-lg font-bold text-text-primary">
              {stats.yellowCards + stats.redCards}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}

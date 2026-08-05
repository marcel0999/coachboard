import PlayerAvatar from '../plantel/PlayerAvatar'
import Badge, { statusToVariant } from '../ui/Badge'
import InfoRow from '../ui/InfoRow'
import { Card, StatCard } from '../ui/Card'
import BarChart, { DualBarChart } from './BarChart'

function TimelineItem({ item }) {
  const typeStyles = {
    training: 'border-accent/30 bg-accent/5 text-accent',
    'training-missed': 'border-red-200 bg-red-50 text-red-700',
    match: 'border-blue-200 bg-blue-50 text-blue-700',
    goal: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    yellow: 'border-amber-200 bg-amber-50 text-amber-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    substitution: 'border-violet-200 bg-violet-50 text-violet-700',
    injury: 'border-orange-200 bg-orange-50 text-orange-700',
    observation: 'border-slate-200 bg-slate-50 text-slate-700',
    assist: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  }

  const style = typeStyles[item.type] ?? typeStyles.observation

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      <div className="flex flex-col items-center">
        <div className={`h-3 w-3 rounded-full border-2 ${style.split(' ')[0]} bg-white`} />
        <div className="mt-1 w-px flex-1 bg-slate-200" />
      </div>
      <div className={`flex-1 rounded-xl border px-4 py-3 ${style}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">{item.title}</p>
          <span className="text-xs opacity-80">{item.date}</span>
        </div>
        <p className="mt-1 text-sm opacity-90">{item.description}</p>
      </div>
    </div>
  )
}

export function PerformanceHeader({ player, profile }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:flex-row sm:items-start">
      <PlayerAvatar player={player} size="lg" />
      <div className="flex-1 text-center sm:text-left">
        <h3 className="text-2xl font-bold text-text-primary">{profile.summary.name}</h3>
        <p className="mt-1 text-sm text-text-secondary">
          {profile.summary.position} · #{profile.summary.number} · {profile.summary.age} años
        </p>
        <p className="mt-1 text-sm text-text-muted">{profile.summary.team}</p>
        <div className="mt-3">
          <Badge variant={statusToVariant(profile.summary.status)}>{profile.summary.status}</Badge>
        </div>
      </div>
    </div>
  )
}

export default function PerformanceDashboardSections({ profile, activeSection }) {
  const { physical, statistics, charts, evolution, timeline } = profile

  if (activeSection === 'summary') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Partidos" value={statistics.matches} />
        <StatCard label="Minutos" value={statistics.minutes} accent />
        <StatCard label="Goles" value={statistics.goals} />
        <StatCard label="Asistencias" value={statistics.assists} />
      </div>
    )
  }

  if (activeSection === 'physical') {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Estado actual" value={physical.physicalStatus} />
          <InfoRow label="Disponibilidad" value={`${physical.availability}%`} />
          <InfoRow label="Entrenamientos realizados" value={physical.trainingsAttended} />
          <InfoRow label="Entrenamientos perdidos" value={physical.trainingsMissed} />
          <InfoRow label="Última lesión" value={physical.lastInjury?.injury ?? 'Sin registros'} />
          <InfoRow label="Días de baja (última)" value={physical.daysOffLastInjury || '—'} />
        </div>

        <Card>
          <h4 className="mb-3 text-sm font-semibold text-text-primary">Lesiones activas</h4>
          {physical.activeInjuries.length > 0 ? (
            <ul className="space-y-2">
              {physical.activeInjuries.map((injury) => (
                <li key={injury.id} className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm">
                  <p className="font-medium text-red-800">{injury.injury}</p>
                  <p className="mt-1 text-red-700">
                    {injury.bodyZone} · {injury.daysOff} días · {injury.status}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">Sin lesiones activas registradas en el historial médico.</p>
          )}
        </Card>
      </div>
    )
  }

  if (activeSection === 'stats') {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Partidos" value={statistics.matches} />
          <StatCard label="Titularidades" value={statistics.starts} accent />
          <StatCard label="Minutos" value={statistics.minutes} />
          <StatCard label="Goles" value={statistics.goals} />
          <StatCard label="Asistencias" value={statistics.assists} />
          <StatCard label="Amarillas" value={statistics.yellowCards} />
          <StatCard label="Rojas" value={statistics.redCards} />
        </div>

        <Card>
          <h4 className="mb-3 text-sm font-semibold text-text-primary">Promedios</h4>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoRow label="Min / partido" value={statistics.averages.minutesPerMatch} />
            <InfoRow label="Goles / partido" value={statistics.averages.goalsPerMatch} />
            <InfoRow label="Asistencias / partido" value={statistics.averages.assistsPerMatch} />
            <InfoRow label="Tarjetas / partido" value={statistics.averages.cardsPerMatch} />
          </dl>
        </Card>
      </div>
    )
  }

  if (activeSection === 'charts') {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="mb-3 text-sm font-semibold text-text-primary">Minutos por partido</h4>
          <BarChart data={charts.matchMinutes} valueSuffix="'" color="bg-blue-500" />
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-text-primary">Carga semanal (RPE × min)</h4>
          <BarChart data={charts.weeklyLoad} color="bg-amber-500" />
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-text-primary">Entrenamientos por semana</h4>
          <DualBarChart data={charts.trainingParticipation} />
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-text-primary">Participación (%)</h4>
          <BarChart data={charts.participation} valueSuffix="%" color="bg-emerald-500" />
        </div>
      </div>
    )
  }

  if (activeSection === 'evolution') {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow label="Peso actual" value={evolution.weight ? `${evolution.weight} kg` : '—'} />
          <InfoRow label="Altura" value={evolution.height ? `${evolution.height} cm` : '—'} />
        </div>

        <Card>
          <h4 className="mb-2 text-sm font-semibold text-text-primary">Observaciones del plantel</h4>
          <p className="text-sm leading-relaxed text-text-secondary">
            {evolution.observations || 'Sin observaciones registradas.'}
          </p>
        </Card>

        <Card>
          <h4 className="mb-3 text-sm font-semibold text-text-primary">Notas del entrenador</h4>
          {evolution.coachNotes.length > 0 ? (
            <ul className="space-y-3">
              {evolution.coachNotes.map((note) => (
                <li key={`${note.date}-${note.context}`} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-text-muted">{note.date} · {note.context}</p>
                  <p className="mt-1 text-sm text-text-primary">{note.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">Sin notas de entrenamientos finalizados.</p>
          )}
        </Card>
      </div>
    )
  }

  if (activeSection === 'timeline') {
    return (
      <div>
        {timeline.length > 0 ? (
          <div className="pl-1">
            {timeline.map((item) => (
              <TimelineItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-text-muted">
            Sin eventos registrados. Los datos se generan automáticamente desde Partidos, Entrenamientos y Plantel.
          </p>
        )}
      </div>
    )
  }

  return null
}

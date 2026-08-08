import { CalendarDays, Dumbbell, Trophy } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import SectionHeader from '../../../components/ui/SectionHeader'
import EmptyState from '../../../components/ui/EmptyState'
import { ButtonLink } from '../../../components/ui/Button'

export default function UpcomingSection({ stats, formatMatchDateTime }) {
  const hasContent = stats.nextMatch || stats.nextTrainings.length > 0

  return (
    <Card>
      <SectionHeader title="Próximos eventos" icon={CalendarDays} />
      {!hasContent ? (
        <EmptyState
          icon={CalendarDays}
          title="Agenda libre"
          description="Todavía no hay entrenamientos ni partidos programados para este club."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <ButtonLink to="/entrenamientos" variant="secondary">
                <Dumbbell className="h-4 w-4" />
                Planificar entrenamiento
              </ButtonLink>
              <ButtonLink to="/partidos">
                <Trophy className="h-4 w-4" />
                Agendar partido
              </ButtonLink>
            </div>
          }
        />
      ) : (
        <div className="space-y-5">
          {stats.nextMatch && (
            <div className="rounded-xl border border-border/60 bg-surface-muted/40 p-4">
              <p className="text-label text-accent">Próximo partido</p>
              <p className="mt-1 font-display text-lg font-semibold text-text-primary">
                vs {stats.nextMatch.opponent}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {formatMatchDateTime(stats.nextMatch.date, stats.nextMatch.time)}
              </p>
            </div>
          )}
          {stats.nextTrainings.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Entrenamientos
              </p>
              <ul className="space-y-2">
                {stats.nextTrainings.map((training) => (
                  <li
                    key={training.id}
                    className="flex items-center justify-between rounded-xl bg-surface-muted/40 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-text-primary">{training.title ?? 'Entrenamiento'}</span>
                    <span className="text-text-secondary">{training.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '../ui/Button'
import { WEEKDAY_LABELS } from '../../constants/trainings'
import { getTrainingsForDay, getTrainingDisplayName, toDateKey } from '../../utils/trainings'
import { getLocaleTag } from '../../config/localization'

function TrainingPill({ training, onClick }) {
  const statusClass = {
    Finalizado: 'border-accent/30 bg-accent/10 text-accent',
    'En curso': 'border-amber-200 bg-amber-50 text-amber-700',
    Programado: 'border-border bg-surface-elevated text-text-primary',
  }[training.status] ?? 'border-border bg-surface-elevated'

  return (
    <button
      type="button"
      onClick={() => onClick(training)}
      className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition hover:shadow-sm ${statusClass}`}
    >
      <p className="font-semibold">{training.time || 'Sin hora'}</p>
      <p className="mt-0.5 truncate">{getTrainingDisplayName(training)}</p>
      <p className="mt-0.5 truncate text-text-muted">{training.category}</p>
    </button>
  )
}

export default function WeeklyCalendar({ referenceDate, trainings, onPrev, onNext, onSelectDay, onOpenTraining, onCreateTraining }) {
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const monday = new Date(referenceDate)
    const day = monday.getDay()
    const diff = day === 0 ? -6 : 1 - day
    monday.setDate(monday.getDate() + diff + index)
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  const locale = getLocaleTag()
  const weekLabel = `${weekDays[0].toLocaleDateString(locale, { day: 'numeric', month: 'short' })} — ${weekDays[6].toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="secondary" size="sm" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <p className="text-sm font-semibold text-text-primary">{weekLabel}</p>
        <Button variant="secondary" size="sm" onClick={onNext}>
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-7">
        {weekDays.map((day, index) => {
          const dayTrainings = getTrainingsForDay(trainings, day)
          const isToday = toDateKey(day) === toDateKey(new Date())

          return (
            <div
              key={toDateKey(day)}
              className={`min-h-[220px] rounded-2xl border p-3 ${isToday ? 'border-accent/40 bg-accent/5' : 'border-border bg-surface-elevated'}`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-text-muted">{WEEKDAY_LABELS[index]}</p>
                  <p className="text-lg font-bold text-text-primary">{day.getDate()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onCreateTraining(toDateKey(day))}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-accent hover:bg-accent/10"
                >
                  +
                </button>
              </div>
              <div className="space-y-2">
                {dayTrainings.map((training) => (
                  <TrainingPill key={training.id} training={training} onClick={onOpenTraining} />
                ))}
                {dayTrainings.length === 0 && (
                  <button
                    type="button"
                    onClick={() => onSelectDay(toDateKey(day))}
                    className="w-full rounded-xl border border-dashed border-border py-6 text-xs text-text-muted hover:border-accent/40 hover:text-accent"
                  >
                    Sin entrenamientos
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

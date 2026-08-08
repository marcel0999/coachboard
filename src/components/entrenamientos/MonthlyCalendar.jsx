import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '../ui/Button'
import { getMonthGrid, getTrainingsForDay, getTrainingDisplayName, toDateKey } from '../../utils/trainings'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default function MonthlyCalendar({ referenceDate, trainings, onPrev, onNext, onOpenTraining, onCreateTraining }) {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const cells = getMonthGrid(year, month)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="secondary" size="sm" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="text-sm font-semibold text-text-primary">{MONTH_NAMES[month]} {year}</p>
        <Button variant="secondary" size="sm" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((label) => (
          <div key={label} className="px-2 py-1 text-center text-xs font-semibold uppercase text-text-muted">
            {label}
          </div>
        ))}
        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="min-h-[100px]" />

          const dayTrainings = getTrainingsForDay(trainings, day)
          const isToday = toDateKey(day) === toDateKey(new Date())

          return (
            <div
              key={toDateKey(day)}
              className={`min-h-[100px] rounded-xl border p-2 ${isToday ? 'border-accent/40 bg-accent/5' : 'border-border bg-surface-elevated'}`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary">{day.getDate()}</span>
                <button
                  type="button"
                  onClick={() => onCreateTraining(toDateKey(day))}
                  className="text-xs text-accent hover:underline"
                >
                  +
                </button>
              </div>
              <div className="space-y-1">
                {dayTrainings.slice(0, 2).map((training) => (
                  <button
                    key={training.id}
                    type="button"
                    onClick={() => onOpenTraining(training)}
                    className="block w-full truncate rounded-lg bg-surface-muted px-2 py-1 text-left text-[10px] font-medium text-text-primary hover:bg-accent/10"
                  >
                    {training.time} · {getTrainingDisplayName(training)}
                  </button>
                ))}
                {dayTrainings.length > 2 && (
                  <p className="text-[10px] text-text-muted">+{dayTrainings.length - 2} más</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

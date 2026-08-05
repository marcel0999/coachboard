import { Card } from '../ui/Card'
import { FormField, Textarea } from '../ui/FormField'
import { computeTrainingSummary } from '../../utils/trainings'

export default function TrainingSummaryTab({ training, exercises, onChange, onFinalize }) {
  const preview = computeTrainingSummary(training, exercises)
  const summary = training.status === 'Finalizado' ? training.summary : preview

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-text-secondary">Duración total</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{summary.totalDuration} min</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Jugadores</p>
          <p className="mt-1 text-2xl font-bold text-accent">{summary.playerCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Carga promedio</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{summary.averageLoad}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Ejercicios</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{summary.exercisesUsed.length}</p>
        </Card>
      </div>

      <Card>
        <h4 className="mb-3 text-sm font-semibold text-text-primary">Ejercicios utilizados</h4>
        {summary.exercisesUsed.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {summary.exercisesUsed.map((title) => (
              <li key={title} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-text-primary">
                {title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">Sin ejercicios asignados aún.</p>
        )}
      </Card>

      <FormField label="Observaciones finales">
        <Textarea
          rows={4}
          value={training.summary?.finalNotes ?? ''}
          onChange={(e) => onChange({
            ...training,
            summary: { ...training.summary, finalNotes: e.target.value },
          })}
          placeholder="Evaluación final de la sesión, ajustes para próximos entrenamientos..."
        />
      </FormField>

      {training.status !== 'Finalizado' && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onFinalize}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Finalizar entrenamiento
          </button>
        </div>
      )}

      {training.status === 'Finalizado' && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">
          Entrenamiento finalizado. Resumen generado automáticamente.
        </div>
      )}
    </div>
  )
}

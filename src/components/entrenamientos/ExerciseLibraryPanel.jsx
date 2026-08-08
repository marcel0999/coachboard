import { Clock, GripVertical } from 'lucide-react'
import Badge from '../ui/Badge'

function intensityVariant(intensity) {
  switch (intensity) {
    case 'Alta': return 'danger'
    case 'Media': return 'warning'
    default: return 'success'
  }
}

export default function ExerciseLibraryPanel({ exercises, onInsert }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted p-4">
      <h4 className="mb-1 text-sm font-semibold text-text-primary">Biblioteca de ejercicios</h4>
      <p className="mb-3 text-xs text-text-muted">Arrastrá o usá el botón para insertar en un bloque.</p>
      <div className="max-h-[520px] space-y-2 overflow-y-auto">
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('exerciseId', exercise.id)
            }}
            className="flex gap-3 rounded-xl border border-border bg-surface-elevated p-3 cursor-grab active:cursor-grabbing"
          >
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${exercise.imageColor} text-lg font-bold text-white`}>
              {exercise.category[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-text-primary">{exercise.title}</p>
                <Badge variant={intensityVariant(exercise.intensity)}>{exercise.intensity}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-text-secondary">{exercise.category} · {exercise.objective}</p>
              <p className="mt-1 line-clamp-2 text-xs text-text-muted">{exercise.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                  <Clock className="h-3 w-3" /> {exercise.duration} min
                </span>
                <button
                  type="button"
                  onClick={() => onInsert(exercise.id)}
                  className="text-xs font-medium text-accent hover:text-accent-hover"
                >
                  Insertar
                </button>
              </div>
            </div>
            <GripVertical className="h-4 w-4 shrink-0 text-text-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ExerciseChip({ exercise, onRemove }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-2 py-1.5 text-xs">
      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${exercise.imageColor} font-bold text-white`}>
        {exercise.category[0]}
      </span>
      <span className="font-medium text-text-primary">{exercise.title}</span>
      <span className="text-text-muted">{exercise.duration} min</span>
      {onRemove && (
        <button type="button" onClick={onRemove} className="ml-1 text-red-400 hover:underline">
          Quitar
        </button>
      )}
    </div>
  )
}

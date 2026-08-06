import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { FormField, Input, Textarea } from '../ui/FormField'
import LibraryPickerModal from '../biblioteca/LibraryPickerModal'
import { FORMATION_OPTIONS } from '../../constants/matches'
import { getFormationSlots, createEmptyLineup } from '../../utils/formations'
import { getFullName } from '../../utils/players'
import {
  createDefaultTacticalBoardSnapshot,
  createEmptySessionExercise,
  getSessionExercises,
} from '../../utils/trainings'
import { isLibraryCopy } from '../../utils/library'

function MiniTacticalBoard({ exercise, players, trainingId, onChange, isNew = false }) {
  const board = exercise.tacticalBoard ?? createDefaultTacticalBoardSnapshot()
  const [open, setOpen] = useState(false)
  const slots = getFormationSlots(board.formation)
  const playersMap = Object.fromEntries(players.map((player) => [player.id, player]))
  const lineup = board.lineup ?? createEmptyLineup(board.formation)

  const updateBoard = (patch) => onChange({ ...board, ...patch })

  const assignPlayer = (slotId, playerId) => {
    const nextLineup = { ...lineup }
    Object.keys(nextLineup).forEach((key) => {
      if (nextLineup[key] === playerId) nextLineup[key] = null
    })
    nextLineup[slotId] = playerId
    updateBoard({ lineup: nextLineup })
  }

  const drawingCount = board.drawings?.length ?? 0

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-muted"
        >
          <ClipboardList className="h-4 w-4" />
          {drawingCount > 0 || Object.values(lineup).some(Boolean)
            ? 'Editar pizarra rápida'
            : 'Agregar pizarra táctica'}
        </button>
        {trainingId && !isNew && (
          <Link
            to={`/pizarra?trainingId=${trainingId}&exerciseId=${exercise.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-subtle px-3 py-2 text-sm font-semibold text-accent transition hover:bg-accent-muted/50"
          >
            Pizarra completa
          </Link>
        )}
        {isNew && (
          <span className="text-xs text-text-muted">Guardá el entrenamiento para abrir la pizarra completa</span>
        )}
        {drawingCount > 0 && (
          <span className="text-xs text-text-muted">{drawingCount} elementos dibujados</span>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-surface-muted/40 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FORMATION_OPTIONS.map((formation) => (
            <button
              key={formation}
              type="button"
              onClick={() => updateBoard({ formation, lineup: createEmptyLineup(formation) })}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                board.formation === formation
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-white text-text-secondary hover:text-text-primary'
              }`}
            >
              {formation}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-medium text-text-muted hover:text-text-primary"
        >
          Cerrar vista rápida
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
        <div className="relative aspect-[68/105] w-full overflow-hidden rounded-2xl border-4 border-white/30 bg-green-600 shadow-inner">
          <div className="absolute inset-4 rounded-xl border-2 border-white/40" />
          <div className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 bg-white/40" />
          {slots.map((slot) => {
            const player = playersMap[lineup[slot.id]]
            return (
              <div
                key={slot.id}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const playerId = e.dataTransfer.getData('playerId')
                  if (playerId) assignPlayer(slot.id, playerId)
                }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-accent text-[10px] font-bold text-white shadow-sm">
                  {player ? player.number : slot.label}
                </div>
              </div>
            )
          })}
        </div>
        <div className="max-h-[280px] space-y-1 overflow-y-auto">
          {players.slice(0, 18).map((player) => (
            <div
              key={player.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('playerId', player.id)}
              className="cursor-grab rounded-lg bg-white px-2 py-1.5 text-xs font-medium shadow-sm active:cursor-grabbing"
            >
              {player.number} · {getFullName(player)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SessionExerciseCard({
  exercise,
  index,
  isExpanded,
  onToggle,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  players,
  trainingId,
  isNew = false,
}) {
  const update = (field, value) => onChange({ ...exercise, [field]: value })

  return (
    <div
      className={`rounded-2xl border transition ${
        isExpanded
          ? 'border-accent/40 bg-accent-subtle/20 shadow-sm'
          : 'border-slate-200/80 bg-white hover:border-slate-300'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <GripVertical className="h-4 w-4 shrink-0 text-text-muted" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-text-muted">#{index + 1}</span>
            <p className="truncate font-semibold text-text-primary">
              {exercise.name || 'Ejercicio sin nombre'}
            </p>
            {isLibraryCopy(exercise) && (
              <Badge variant="accent">Desde Biblioteca</Badge>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-text-secondary">
            {exercise.durationMinutes} min
            {exercise.objective ? ` · ${exercise.objective}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {canMoveUp && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMoveUp() }}
              className="rounded-lg p-1.5 text-text-muted hover:bg-white hover:text-text-primary"
              aria-label="Subir"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          )}
          {canMoveDown && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMoveDown() }}
              className="rounded-lg p-1.5 text-text-muted hover:bg-white hover:text-text-primary"
              aria-label="Bajar"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-text-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-muted" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-4 border-t border-slate-200/60 px-4 pb-4 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Nombre del ejercicio" className="sm:col-span-2">
              <Input
                value={exercise.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Ej: Rondo 4v2 + transición"
              />
            </FormField>
            <FormField label="Objetivo">
              <Input
                value={exercise.objective}
                onChange={(e) => update('objective', e.target.value)}
                placeholder="Objetivo específico"
              />
            </FormField>
            <FormField label="Tiempo (min)">
              <Input
                type="number"
                min="1"
                value={exercise.durationMinutes}
                onChange={(e) => update('durationMinutes', e.target.value)}
              />
            </FormField>
            <FormField label="Series">
              <Input
                value={exercise.sets}
                onChange={(e) => update('sets', e.target.value)}
                placeholder="Ej: 3"
              />
            </FormField>
            <FormField label="Repeticiones">
              <Input
                value={exercise.reps}
                onChange={(e) => update('reps', e.target.value)}
                placeholder="Ej: 8"
              />
            </FormField>
            <FormField label="Espacio utilizado">
              <Input
                value={exercise.space}
                onChange={(e) => update('space', e.target.value)}
                placeholder="Ej: Medio campo, 30x20m"
              />
            </FormField>
            <FormField label="Materiales" className="sm:col-span-2">
              <Input
                value={exercise.materials}
                onChange={(e) => update('materials', e.target.value)}
                placeholder="Conos, chalecos, pelotas, vallas..."
              />
            </FormField>
          </div>

          <FormField label="Descripción">
            <Textarea
              rows={2}
              value={exercise.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Instrucciones, variantes, progresiones..."
            />
          </FormField>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Pizarra táctica del ejercicio
            </p>
            <MiniTacticalBoard
              exercise={exercise}
              players={players}
              trainingId={trainingId}
              isNew={isNew}
              onChange={(tacticalBoard) => update('tacticalBoard', tacticalBoard)}
            />
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="danger" size="sm" onClick={onRemove}>
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar ejercicio
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TrainingExercisesTab({ training, players, onChange, isNew = false }) {
  const exercises = getSessionExercises(training)
  const [expandedId, setExpandedId] = useState(exercises[0]?.id ?? null)
  const [libraryPickerOpen, setLibraryPickerOpen] = useState(false)

  const updateExercises = (nextExercises) => {
    onChange({
      ...training,
      sessionExercises: nextExercises.map((exercise, index) => ({
        ...exercise,
        order: index,
      })),
    })
  }

  const handleAddExercise = () => {
    const next = createEmptySessionExercise({ order: exercises.length })
    updateExercises([...exercises, next])
    setExpandedId(next.id)
  }

  const handleAddFromLibrary = (sessionExercise) => {
    const next = {
      ...sessionExercise,
      order: exercises.length,
    }
    updateExercises([...exercises, next])
    setExpandedId(next.id)
  }

  const handleUpdateExercise = (exerciseId, nextExercise) => {
    updateExercises(exercises.map((ex) => (ex.id === exerciseId ? nextExercise : ex)))
  }

  const handleRemoveExercise = (exerciseId) => {
    const next = exercises.filter((ex) => ex.id !== exerciseId)
    updateExercises(next)
    if (expandedId === exerciseId) setExpandedId(next[0]?.id ?? null)
  }

  const handleMove = (index, direction) => {
    const next = [...exercises]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    updateExercises(next)
  }

  const totalMinutes = exercises.reduce(
    (sum, ex) => sum + (Number(ex.durationMinutes) || 0),
    0,
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-text-secondary">
            {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''} · {totalMinutes} min total
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            Cada ejercicio tiene su pizarra táctica independiente. Los cambios se guardan con el entrenamiento.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => setLibraryPickerOpen(true)}>
            <BookOpen className="h-4 w-4" />
            Agregar desde Biblioteca
          </Button>
          <Button type="button" onClick={handleAddExercise}>
            <Plus className="h-4 w-4" />
            Agregar ejercicio
          </Button>
        </div>
      </div>

      {exercises.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200/80 bg-surface-muted/30 px-6 py-12 text-center">
          <ClipboardList className="mx-auto mb-3 h-8 w-8 text-text-muted" />
          <p className="font-semibold text-text-primary">Sin ejercicios todavía</p>
          <p className="mt-1 text-sm text-text-secondary">
            Agregá ejercicios manualmente o copiá uno desde la Biblioteca.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button type="button" variant="secondary" onClick={() => setLibraryPickerOpen(true)}>
              <BookOpen className="h-4 w-4" />
              Desde Biblioteca
            </Button>
            <Button type="button" onClick={handleAddExercise}>
              <Plus className="h-4 w-4" />
              Primer ejercicio
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {exercises.map((exercise, index) => (
            <SessionExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              isExpanded={expandedId === exercise.id}
              onToggle={() => setExpandedId(expandedId === exercise.id ? null : exercise.id)}
              onChange={(next) => handleUpdateExercise(exercise.id, next)}
              onRemove={() => handleRemoveExercise(exercise.id)}
              onMoveUp={() => handleMove(index, -1)}
              onMoveDown={() => handleMove(index, 1)}
              canMoveUp={index > 0}
              canMoveDown={index < exercises.length - 1}
              players={players}
              trainingId={training.id}
              isNew={isNew}
            />
          ))}
        </div>
      )}

      <LibraryPickerModal
        isOpen={libraryPickerOpen}
        onClose={() => setLibraryPickerOpen(false)}
        onSelectExercise={handleAddFromLibrary}
      />
    </div>
  )
}

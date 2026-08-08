import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { FormField, Input, Textarea } from '../ui/FormField'
import { FORMATION_OPTIONS } from '../../constants/matches'
import { getFormationSlots, createEmptyLineup } from '../../utils/formations'
import { getFullName } from '../../utils/players'
import ExerciseLibraryPanel, { ExerciseChip } from './ExerciseLibraryPanel'

function MiniTacticalBoard({ block, players, trainingId, onChange }) {
  const [open, setOpen] = useState(false)
  const slots = getFormationSlots(block.tacticalBoard.formation)
  const playersMap = Object.fromEntries(players.map((player) => [player.id, player]))

  const assignPlayer = (slotId, playerId) => {
    const nextLineup = { ...block.tacticalBoard.lineup }
    Object.keys(nextLineup).forEach((key) => {
      if (nextLineup[key] === playerId) nextLineup[key] = null
    })
    nextLineup[slotId] = playerId
    onChange({
      ...block.tacticalBoard,
      lineup: nextLineup,
    })
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface-muted"
        >
          <ClipboardList className="h-4 w-4" />
          {block.tacticalBoard.lineup && Object.values(block.tacticalBoard.lineup).some(Boolean)
            ? 'Editar pizarra táctica'
            : 'Agregar pizarra táctica'}
        </button>
        {trainingId && (
          <Link
            to={`/pizarra?trainingId=${trainingId}&blockId=${block.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/10"
          >
            Abrir pizarra completa
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-muted p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {FORMATION_OPTIONS.map((formation) => (
            <button
              key={formation}
              type="button"
              onClick={() => onChange({ formation, lineup: createEmptyLineup(formation) })}
              className={`rounded-lg px-3 py-1 text-xs font-medium ${block.tacticalBoard.formation === formation ? 'bg-accent text-white' : 'bg-surface-elevated text-text-secondary'}`}
            >
              {formation}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-text-muted hover:text-text-primary">
          Cerrar pizarra
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
        <div className="relative aspect-[68/105] w-full overflow-hidden rounded-2xl border-4 border-white/30 bg-green-600">
          <div className="absolute inset-4 rounded-xl border-2 border-white/40" />
          <div className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 bg-white/40" />
          {slots.map((slot) => {
            const player = playersMap[block.tacticalBoard.lineup[slot.id]]
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
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-accent text-[10px] font-bold text-white">
                  {player ? player.number : slot.label}
                </div>
              </div>
            )
          })}
        </div>
        <div className="max-h-[300px] space-y-1 overflow-y-auto">
          {players.slice(0, 15).map((player) => (
            <div
              key={player.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('playerId', player.id)}
              className="cursor-grab rounded-lg bg-surface-elevated px-2 py-1.5 text-xs font-medium"
            >
              {player.number} · {getFullName(player)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BlockCard({ block, exercises, players, trainingId, activeBlockId, onSelect, onChange, onDropExercise }) {
  const exerciseMap = Object.fromEntries(exercises.map((exercise) => [exercise.id, exercise]))
  const isActive = activeBlockId === block.id

  const handleDragOver = (event) => {
    event.preventDefault()
    onSelect(block.id)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const exerciseId = event.dataTransfer.getData('exerciseId')
    if (exerciseId && !block.exerciseIds.includes(exerciseId)) {
      onChange({
        ...block,
        exerciseIds: [...block.exerciseIds, exerciseId],
      })
    }
  }

  const updateBlock = (updates) => onChange({ ...block, ...updates })

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`rounded-2xl border p-4 transition ${isActive ? 'border-accent bg-accent/5' : 'border-border bg-surface-elevated'}`}
    >
      <button type="button" onClick={() => onSelect(block.id)} className="mb-3 w-full text-left">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-text-primary">{block.label}</h4>
          <span className="text-xs text-text-muted">{block.duration} min</span>
        </div>
      </button>

      {isActive && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Duración (min)">
              <Input type="number" min="5" value={block.duration} onChange={(e) => updateBlock({ duration: e.target.value })} />
            </FormField>
            <FormField label="Objetivo">
              <Input value={block.objective} onChange={(e) => updateBlock({ objective: e.target.value })} placeholder="Objetivo del bloque" />
            </FormField>
          </div>
          <FormField label="Descripción">
            <Textarea value={block.description} onChange={(e) => updateBlock({ description: e.target.value })} rows={2} />
          </FormField>

          <div>
            <p className="mb-2 text-xs font-medium text-text-secondary">Ejercicios asociados</p>
            <div className="flex flex-wrap gap-2">
              {block.exerciseIds.map((id) => {
                const exercise = exerciseMap[id]
                if (!exercise) return null
                return (
                  <ExerciseChip
                    key={id}
                    exercise={exercise}
                    onRemove={() => updateBlock({
                      exerciseIds: block.exerciseIds.filter((exId) => exId !== id),
                    })}
                  />
                )
              })}
              {block.exerciseIds.length === 0 && (
                <p className="text-xs text-text-muted">Arrastrá ejercicios aquí o usá Insertar</p>
              )}
            </div>
          </div>

          <MiniTacticalBoard
            block={block}
            players={players}
            trainingId={trainingId}
            onChange={(tacticalBoard) => updateBlock({ tacticalBoard })}
          />
        </div>
      )}
    </div>
  )
}

export default function TrainingPlanTab({ training, exercises, players, onChange }) {
  const [activeBlockId, setActiveBlockId] = useState(training.blocks[0]?.id ?? null)

  const updateBlock = (blockId, nextBlock) => {
    onChange({
      ...training,
      blocks: training.blocks.map((block) => (block.id === blockId ? nextBlock : block)),
    })
  }

  const insertExercise = (exerciseId) => {
    if (!activeBlockId) return
    onChange({
      ...training,
      blocks: training.blocks.map((block) =>
        block.id === activeBlockId && !block.exerciseIds.includes(exerciseId)
          ? { ...block, exerciseIds: [...block.exerciseIds, exerciseId] }
          : block,
      ),
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-3">
        <p className="text-sm text-text-secondary">
          Sesión dividida en {training.blocks.length} bloques. Seleccioná un bloque para editarlo.
        </p>
        {training.blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            exercises={exercises}
            players={players}
            trainingId={training.id}
            activeBlockId={activeBlockId}
            onSelect={setActiveBlockId}
            onChange={(nextBlock) => updateBlock(block.id, nextBlock)}
          />
        ))}
      </div>
      <ExerciseLibraryPanel exercises={exercises} onInsert={insertExercise} />
    </div>
  )
}

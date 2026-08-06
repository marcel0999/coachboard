import { SESSION_BLOCKS } from '../constants/trainings'
import { createEmptyLineup } from './formations'

export function generateTrainingId() {
  return `trn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function generateBlockId() {
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function generateSessionExerciseId() {
  return `sex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function createDefaultTacticalBoardSnapshot() {
  return {
    formation: '4-3-3',
    lineup: createEmptyLineup('4-3-3'),
    markers: [],
    benchPlayerIds: [],
    drawings: [],
    mode: 'training',
    pitchType: 'full',
    staffIds: [],
    savedBoardId: null,
  }
}

export function createEmptySessionExercise(overrides = {}) {
  return {
    id: generateSessionExerciseId(),
    name: '',
    description: '',
    objective: '',
    durationMinutes: 15,
    sets: '',
    reps: '',
    space: '',
    materials: '',
    order: 0,
    librarySource: null,
    tacticalBoard: createDefaultTacticalBoardSnapshot(),
    ...overrides,
  }
}

export function createDefaultBlocks(totalDuration = 90) {
  const totalDefault = SESSION_BLOCKS.reduce((sum, block) => sum + block.defaultDuration, 0)
  const ratio = totalDuration / totalDefault

  return SESSION_BLOCKS.map((block) => ({
    id: generateBlockId(),
    type: block.type,
    label: block.label,
    duration: Math.round(block.defaultDuration * ratio),
    objective: '',
    description: '',
    exerciseIds: [],
    tacticalBoard: createDefaultTacticalBoardSnapshot(),
  }))
}

/** Migra un bloque legacy a ejercicio de sesión */
export function blockToSessionExercise(block, index = 0) {
  return createEmptySessionExercise({
    id: block.id ?? generateSessionExerciseId(),
    name: block.label || block.objective || `Ejercicio ${index + 1}`,
    description: block.description ?? '',
    objective: block.objective ?? '',
    durationMinutes: Number(block.duration) || 15,
    order: index,
    tacticalBoard: block.tacticalBoard ?? createDefaultTacticalBoardSnapshot(),
  })
}

/** Obtiene ejercicios de sesión, migrando blocks si es necesario */
export function getSessionExercises(training) {
  if (Array.isArray(training.sessionExercises) && training.sessionExercises.length > 0) {
    return training.sessionExercises
  }
  if (Array.isArray(training.blocks) && training.blocks.length > 0) {
    return training.blocks.map((block, index) => blockToSessionExercise(block, index))
  }
  return []
}

export function getTrainingDisplayName(training) {
  if (training.name?.trim()) return training.name.trim()
  if (training.objective?.trim()) return training.objective.trim()
  if (training.category) return `Entrenamiento ${training.category}`
  return 'Entrenamiento sin nombre'
}

export function validateTraining(training) {
  const errors = {}
  if (!training.date?.trim()) errors.date = 'La fecha es obligatoria'
  if (!training.categoryId?.trim()) errors.categoryId = 'Seleccioná una categoría del plantel'
  return { ok: Object.keys(errors).length === 0, errors }
}

export function toDateKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function parseDateKey(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWeekDays(referenceDate) {
  const monday = getMonday(referenceDate)
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + index)
    return day
  })
}

export function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []

  for (let i = 0; i < startOffset; i += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day))
  }

  return cells
}

export function isSameDay(a, b) {
  if (!a || !b) return false
  return toDateKey(a) === toDateKey(b)
}

export function formatTrainingTime(time) {
  return time || '—'
}

export function getTrainingsForDay(trainings, day) {
  const key = toDateKey(day)
  return trainings.filter((training) => training.date === key)
}

export function computeTrainingSummary(training, exercises = []) {
  const exerciseMap = Object.fromEntries(exercises.map((ex) => [ex.id, ex]))
  const sessionExercises = getSessionExercises(training)
  const usedExerciseIds = new Set()

  ;(training.blocks ?? []).forEach((block) => {
    block.exerciseIds?.forEach((id) => usedExerciseIds.add(id))
  })

  const sessionDuration = sessionExercises.reduce(
    (sum, ex) => sum + (Number(ex.durationMinutes) || 0),
    0,
  )
  const blockDuration = (training.blocks ?? []).reduce(
    (sum, block) => sum + (Number(block.duration) || 0),
    0,
  )
  const totalDuration = sessionDuration || blockDuration || Number(training.duration) || 0
  const playerCount =
    training.players?.attendees?.length ??
    (Number(training.playerCount) || 0)

  const loads = (training.loadControl ?? [])
    .filter((entry) => training.players?.attendees?.includes(entry.playerId))
    .map((entry) => entry.totalLoad || (Number(entry.rpe) || 0) * (Number(entry.minutes) || 0))

  const averageLoad = loads.length
    ? loads.reduce((sum, load) => sum + load, 0) / loads.length
    : 0

  const sessionExerciseNames = sessionExercises.map((ex) => ex.name).filter(Boolean)

  return {
    totalDuration,
    playerCount,
    averageLoad: Math.round(averageLoad * 10) / 10,
    exercisesUsed: sessionExerciseNames.length
      ? sessionExerciseNames
      : [...usedExerciseIds].map((id) => exerciseMap[id]?.title).filter(Boolean),
    finalNotes: training.summary?.finalNotes ?? '',
  }
}

export function finalizeTraining(training, exercises) {
  const summary = computeTrainingSummary(training, exercises)
  return {
    ...training,
    status: 'Finalizado',
    summary,
  }
}

export function normalizeTrainingForm(data) {
  const intensity = data.intensity ?? data.load ?? 'Media'
  const observations = data.observations ?? data.notes ?? ''
  const sessionExercises = (data.sessionExercises ?? getSessionExercises(data)).map(
    (exercise, index) => ({
      ...exercise,
      order: exercise.order ?? index,
      durationMinutes:
        exercise.durationMinutes === '' ? '' : Number(exercise.durationMinutes) || 0,
      tacticalBoard: exercise.tacticalBoard ?? createDefaultTacticalBoardSnapshot(),
    }),
  )

  return {
    ...data,
    name: data.name ?? '',
    duration: data.duration === '' ? '' : Number(data.duration),
    intensity,
    load: intensity,
    playerCount: data.playerCount === '' ? '' : Number(data.playerCount) || 0,
    observations,
    notes: observations,
    blocks: data.blocks ?? [],
    sessionExercises,
    players: data.players ?? { attendees: [], absent: [], injured: [], differentiated: [] },
    loadControl: data.loadControl ?? [],
    staffIds: data.staffIds ?? [],
    summary: data.summary ?? {},
  }
}

export function initLoadControl(attendeeIds, existing = []) {
  const existingMap = Object.fromEntries(existing.map((entry) => [entry.playerId, entry]))
  return attendeeIds.map((playerId) => existingMap[playerId] ?? {
    playerId,
    rpe: '',
    minutes: '',
    notes: '',
    totalLoad: 0,
  })
}

export function migrateTrainingToV5(training) {
  const intensity = training.intensity ?? training.load ?? 'Media'
  const observations = training.observations ?? training.notes ?? ''
  const name =
    training.name?.trim() ||
    training.objective?.trim() ||
    (training.category ? `Entrenamiento ${training.category}` : 'Entrenamiento')

  let sessionExercises = training.sessionExercises
  if (!Array.isArray(sessionExercises) || sessionExercises.length === 0) {
    sessionExercises = (training.blocks ?? []).map((block, index) =>
      blockToSessionExercise(block, index),
    )
  } else {
    sessionExercises = sessionExercises.map((exercise, index) => ({
      ...createEmptySessionExercise(exercise),
      ...exercise,
      order: exercise.order ?? index,
      tacticalBoard: exercise.tacticalBoard ?? createDefaultTacticalBoardSnapshot(),
    }))
  }

  return {
    ...training,
    name,
    intensity,
    load: intensity,
    observations,
    notes: observations,
    playerCount: training.playerCount ?? training.players?.attendees?.length ?? 0,
    sessionExercises,
  }
}

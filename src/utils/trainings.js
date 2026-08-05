import { SESSION_BLOCKS } from '../constants/trainings'
import { createEmptyLineup } from './formations'

export function generateTrainingId() {
  return `trn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function generateBlockId() {
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
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
    tacticalBoard: {
      formation: '4-3-3',
      lineup: createEmptyLineup('4-3-3'),
    },
  }))
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

export function computeTrainingSummary(training, exercises) {
  const exerciseMap = Object.fromEntries(exercises.map((ex) => [ex.id, ex]))
  const usedExerciseIds = new Set()

  training.blocks.forEach((block) => {
    block.exerciseIds.forEach((id) => usedExerciseIds.add(id))
  })

  const blockDuration = training.blocks.reduce((sum, block) => sum + (Number(block.duration) || 0), 0)
  const totalDuration = blockDuration || Number(training.duration) || 0
  const playerCount = training.players.attendees.length

  const loads = training.loadControl
    .filter((entry) => training.players.attendees.includes(entry.playerId))
    .map((entry) => entry.totalLoad || (Number(entry.rpe) || 0) * (Number(entry.minutes) || 0))

  const averageLoad = loads.length
    ? loads.reduce((sum, load) => sum + load, 0) / loads.length
    : 0

  return {
    totalDuration,
    playerCount,
    averageLoad: Math.round(averageLoad * 10) / 10,
    exercisesUsed: [...usedExerciseIds].map((id) => exerciseMap[id]?.title).filter(Boolean),
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
  return {
    ...data,
    duration: data.duration === '' ? '' : Number(data.duration),
    blocks: data.blocks ?? [],
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

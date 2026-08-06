export const TRAINING_STATUSES = ['Programado', 'En curso', 'Finalizado']

export const TRAINING_SESSION_TYPES = [
  'Táctico',
  'Técnico',
  'Físico',
  'Recuperación',
  'Mixto',
  'Pre-partido',
]

/** @deprecated Use TRAINING_SESSION_TYPES — kept for backward compat */
export const TRAINING_CATEGORIES = TRAINING_SESSION_TYPES

export const INTENSITY_LEVELS = ['Baja', 'Media', 'Alta']

/** @deprecated Use INTENSITY_LEVELS */
export const LOAD_LEVELS = INTENSITY_LEVELS

export const SESSION_BLOCKS = [
  { type: 'calentamiento', label: 'Calentamiento', defaultDuration: 15 },
  { type: 'fisica', label: 'Parte física', defaultDuration: 15 },
  { type: 'tecnica', label: 'Parte técnica', defaultDuration: 20 },
  { type: 'tactica', label: 'Parte táctica', defaultDuration: 25 },
  { type: 'juego_reducido', label: 'Juego reducido', defaultDuration: 20 },
  { type: 'vuelta_calma', label: 'Vuelta a la calma', defaultDuration: 10 },
]

export const TRAINING_DETAIL_TABS = [
  { id: 'info', label: 'Información' },
  { id: 'exercises', label: 'Ejercicios' },
  { id: 'players', label: 'Jugadores' },
  { id: 'load', label: 'Control de carga' },
  { id: 'summary', label: 'Resumen' },
]

export const WEEKDAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export const EMPTY_SESSION_EXERCISE = {
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
  tacticalBoard: null,
}

export const EMPTY_TRAINING = {
  name: '',
  date: '',
  time: '',
  duration: 90,
  field: '',
  category: 'Mixto',
  categoryId: '',
  objective: '',
  intensity: 'Media',
  load: 'Media',
  playerCount: '',
  notes: '',
  observations: '',
  status: 'Programado',
  blocks: [],
  sessionExercises: [],
  players: {
    attendees: [],
    absent: [],
    injured: [],
    differentiated: [],
  },
  loadControl: [],
  staffIds: [],
  summary: {
    totalDuration: 0,
    playerCount: 0,
    averageLoad: 0,
    exercisesUsed: [],
    finalNotes: '',
  },
}

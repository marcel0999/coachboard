export const TRAINING_STATUSES = ['Programado', 'En curso', 'Finalizado']

export const TRAINING_CATEGORIES = [
  'Táctico',
  'Técnico',
  'Físico',
  'Recuperación',
  'Mixto',
  'Pre-partido',
]

export const LOAD_LEVELS = ['Baja', 'Media', 'Alta']

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
  { id: 'plan', label: 'Plan de sesión' },
  { id: 'players', label: 'Jugadores' },
  { id: 'load', label: 'Control de carga' },
  { id: 'summary', label: 'Resumen' },
]

export const WEEKDAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export const EMPTY_TRAINING = {
  date: '',
  time: '',
  duration: 90,
  field: '',
  category: 'Mixto',
  categoryId: '',
  objective: '',
  load: 'Media',
  notes: '',
  status: 'Programado',
  blocks: [],
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

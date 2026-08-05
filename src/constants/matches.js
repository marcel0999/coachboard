import { COMPETITION_ORGANIZATIONS, COMPETITION_TYPES } from '../config/localization'

export const MATCH_STATUSES = ['Programado', 'En juego', 'Finalizado']

export const MATCH_CONDITIONS = ['Local', 'Visitante']

export const FORMATION_OPTIONS = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '3-4-3', '5-3-2']

export const EVENT_TYPES = [
  { value: 'goal', label: 'Gol' },
  { value: 'assist', label: 'Asistencia' },
  { value: 'substitution', label: 'Cambio' },
  { value: 'yellow', label: 'Tarjeta amarilla' },
  { value: 'red', label: 'Tarjeta roja' },
  { value: 'injury', label: 'Lesión' },
]

export const MATCH_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'Programado', label: 'Programados' },
  { value: 'En juego', label: 'En juego' },
  { value: 'Finalizado', label: 'Finalizados' },
]

export const MATCH_SORT_OPTIONS = [
  { value: 'date-desc', label: 'Fecha (reciente)' },
  { value: 'date-asc', label: 'Fecha (antigua)' },
  { value: 'opponent', label: 'Rival' },
  { value: 'competition', label: 'Competencia' },
]

export { COMPETITION_ORGANIZATIONS, COMPETITION_TYPES }

export const EMPTY_MATCH = {
  opponent: '',
  competition: '',
  competitionOrganization: '',
  competitionType: '',
  date: '',
  time: '',
  stadium: '',
  city: '',
  condition: 'Local',
  referee: '',
  weather: '',
  notes: '',
  status: 'Programado',
  categoryId: '',
  goalsFor: '',
  goalsAgainst: '',
  formation: '4-3-3',
  squad: {
    starters: [],
    substitutes: [],
    notCalled: [],
  },
  lineup: {},
  events: [],
  summary: {
    possession: '',
    shots: '',
    corners: '',
    fouls: '',
    coachNotes: '',
  },
  staffSquad: {
    called: [],
    notCalled: [],
  },
}

export const MATCH_DETAIL_TABS = [
  { id: 'info', label: 'Información' },
  { id: 'squad', label: 'Convocados' },
  { id: 'staff', label: 'Cuerpo técnico' },
  { id: 'lineup', label: 'Alineación' },
  { id: 'events', label: 'Eventos' },
  { id: 'summary', label: 'Resumen' },
]

export const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    end: true,
  },
  {
    to: '/plantel',
    label: 'Plantel',
    end: false,
  },
  {
    to: '/partidos',
    label: 'Partidos',
    end: false,
  },
  {
    to: '/entrenamientos',
    label: 'Entrenamientos',
    end: false,
  },
  {
    to: '/rendimiento',
    label: 'Centro de Rendimiento',
    end: false,
  },
  {
    to: '/medico',
    label: 'Centro Médico',
    end: false,
  },
  {
    to: '/staff',
    label: 'Staff Técnico',
    end: false,
  },
  {
    to: '/pizarra',
    label: 'Pizarra Táctica',
    end: false,
  },
  {
    to: '/biblioteca',
    label: 'Biblioteca',
    end: false,
  },
  {
    to: '/configuracion',
    label: 'Configuración',
    end: false,
  },
]

export const MOCK_PLAYERS = [
  { id: 1, name: 'Martín García', number: 1, position: 'Arquero', status: 'Disponible' },
  { id: 2, name: 'Lucas Fernández', number: 2, position: 'Defensor', status: 'Disponible' },
  { id: 3, name: 'Diego Ruiz', number: 4, position: 'Defensor', status: 'Lesionado' },
  { id: 4, name: 'Tomás Medina', number: 5, position: 'Defensor', status: 'Disponible' },
  { id: 5, name: 'Nico Álvarez', number: 6, position: 'Mediocampista', status: 'Disponible' },
  { id: 6, name: 'Facundo López', number: 8, position: 'Mediocampista', status: 'Suspensión' },
  { id: 7, name: 'Bruno Castro', number: 10, position: 'Mediocampista', status: 'Disponible' },
  { id: 8, name: 'Santiago Vega', number: 9, position: 'Delantero', status: 'Disponible' },
  { id: 9, name: 'Mateo Herrera', number: 11, position: 'Delantero', status: 'Disponible' },
]

export { MOCK_EXERCISES } from './exercises.js'

export const MOCK_STATS = {
  totalPlayers: 22,
  available: 18,
  injured: 2,
  suspended: 1,
  nextMatch: 'Sáb 15:00 vs Atlético Central',
  trainingSessions: 4,
}

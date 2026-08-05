import { DEFAULT_NATIONALITY } from '../config/localization'

export const POSITIONS = [
  'Arquero',
  'Defensor central',
  'Lateral derecho',
  'Lateral izquierdo',
  'Mediocampista defensivo',
  'Mediocampista central',
  'Mediocampista ofensivo',
  'Extremo derecho',
  'Extremo izquierdo',
  'Delantero centro',
]

export const PHYSICAL_STATUSES = ['Disponible', 'Lesionado', 'Suspendido']

export const DOMINANT_FEET = ['Derecha', 'Izquierda', 'Ambidiestro']

export const FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'Disponible', label: 'Disponibles' },
  { value: 'Lesionado', label: 'Lesionados' },
  { value: 'Suspendido', label: 'Suspendidos' },
]

export const SORT_OPTIONS = [
  { value: 'name', label: 'Nombre' },
  { value: 'age', label: 'Edad' },
  { value: 'position', label: 'Posición' },
]

export const EMPTY_PLAYER = {
  photo: null,
  firstName: '',
  lastName: '',
  birthDate: '',
  height: '',
  weight: '',
  dominantFoot: 'Derecha',
  primaryPosition: 'Mediocampista central',
  secondaryPosition: '',
  number: '',
  physicalStatus: 'Disponible',
  categoryId: '',
  phone: '',
  email: '',
  notes: '',
  nationality: DEFAULT_NATIONALITY,
  documentType: 'cedula_uy',
  document: '',
  address: '',
  addressCountry: 'Uruguay',
  addressDepartment: '',
  addressCity: '',
  addressStreet: '',
  addressPostalCode: '',
  contractStart: '',
  contractEnd: '',
  previousClub: '',
  representative: '',
  estimatedValue: '',
  estimatedValueCurrency: 'UYU',
  medicalHistory: [],
  statistics: {
    matches: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    matchIds: [],
  },
  documents: [],
}

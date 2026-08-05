import {
  STAFF_LICENSE_ISSUERS,
  STAFF_LICENSE_LEVELS,
  DEFAULT_NATIONALITY,
  DEFAULT_PHONE,
} from '../config/localization'

export const STAFF_ROLES = [
  'Director Técnico',
  'Asistente Técnico',
  'Preparador Físico',
  'Ayudante de Preparador Físico',
  'Entrenador de Arqueros',
  'Analista de Video',
  'Fisioterapeuta',
  'Médico',
  'Nutricionista',
  'Psicólogo',
  'Delegado',
  'Utilero',
  'Coordinador Deportivo',
  'Gerente Deportivo',
  'Otro',
]

export const STAFF_STATUS = ['Activo', 'Inactivo']

export { STAFF_LICENSE_ISSUERS, STAFF_LICENSE_LEVELS }

/** @deprecated Usar STAFF_LICENSE_ISSUERS y STAFF_LICENSE_LEVELS */
export const STAFF_LICENSE_TYPES = [
  ...STAFF_LICENSE_ISSUERS.map((issuer) => `Licencia ${issuer}`),
  'Otra',
]

export const STAFF_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos los cargos' },
  ...STAFF_ROLES.map((role) => ({ value: role, label: role })),
]

export const STAFF_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'Activo', label: 'Activos' },
  { value: 'Inactivo', label: 'Inactivos' },
]

export const STAFF_SORT_OPTIONS = [
  { value: 'name', label: 'Nombre' },
  { value: 'role', label: 'Cargo' },
  { value: 'startDate', label: 'Fecha de ingreso' },
  { value: 'status', label: 'Estado' },
]

export const EMPTY_STAFF_MEMBER = {
  photo: null,
  firstName: '',
  lastName: '',
  name: '',
  birthDate: '',
  documentId: '',
  documentType: '',
  nationality: DEFAULT_NATIONALITY,
  phone: '',
  email: '',
  address: '',
  addressCountry: 'Uruguay',
  addressDepartment: '',
  addressCity: '',
  addressStreet: '',
  addressPostalCode: '',
  role: 'Asistente Técnico',
  secondaryRole: '',
  licenseNumber: '',
  licenseIssuer: '',
  licenseLevel: '',
  licenseName: '',
  licenseType: '',
  licenseIssueDate: '',
  licenseIssueCountry: '',
  licenseExpiry: '',
  license: '',
  startDate: '',
  specialty: '',
  status: 'Activo',
  notes: '',
  categoryIds: [],
  documents: [],
}

export const EMPTY_STAFF_SQUAD = {
  called: [],
  notCalled: [],
}

export const STAFF_DETAIL_TABS = [
  { id: 'general', label: 'General' },
  { id: 'categories', label: 'Categorías' },
  { id: 'matches', label: 'Partidos' },
  { id: 'trainings', label: 'Entrenamientos' },
  { id: 'documents', label: 'Documentos' },
  { id: 'notes', label: 'Observaciones' },
]

export const STAFF_PHONE_PLACEHOLDER = DEFAULT_PHONE.placeholder

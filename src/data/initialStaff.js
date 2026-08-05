import { generateStaffId, normalizeStaffForm } from '../utils/staff'
import { DEFAULT_CATEGORY_ID } from '../constants/categories'

const BASE_STAFF = [
  {
    id: 'staff-001',
    photo: null,
    name: 'Roberto Sánchez',
    role: 'Director Técnico',
    phone: '+598 99 445 1122',
    email: 'roberto.sanchez@club.com',
    license: 'CONMEBOL Pro',
    licenseIssuer: 'CONMEBOL',
    licenseLevel: 'Licencia PRO',
    startDate: '2023-01-15',
    specialty: 'Sistemas ofensivos',
    notes: 'Enfoque en pressing alto.',
    nationality: 'Uruguaya',
  },
  {
    id: 'staff-002',
    photo: null,
    name: 'Martín Acosta',
    role: 'Asistente Técnico',
    phone: '+598 99 556 2233',
    email: 'martin.acosta@club.com',
    license: 'Licencia A',
    licenseIssuer: 'AUF',
    licenseLevel: 'Licencia A',
    startDate: '2023-07-01',
    specialty: 'Análisis rival',
    notes: '',
    nationality: 'Uruguaya',
  },
  {
    id: 'staff-003',
    photo: null,
    name: 'Laura Fernández',
    role: 'Preparador Físico',
    phone: '+598 99 667 3344',
    email: 'laura.fernandez@club.com',
    license: 'Licencia FIFA',
    licenseIssuer: 'FIFA',
    licenseLevel: 'Licencia de preparador físico',
    startDate: '2022-08-01',
    specialty: 'Potencia y resistencia',
    notes: 'Control de cargas semanales.',
    nationality: 'Uruguaya',
  },
  {
    id: 'staff-004',
    photo: null,
    name: 'Diego Morales',
    role: 'Entrenador de Arqueros',
    phone: '+598 99 778 4455',
    email: 'diego.morales@club.com',
    license: 'Licencia de entrenador de arqueros',
    licenseIssuer: 'AUF',
    licenseLevel: 'Licencia de entrenador de arqueros',
    startDate: '2024-01-10',
    specialty: 'Juego con los pies',
    notes: '',
    nationality: 'Uruguaya',
  },
  {
    id: 'staff-005',
    photo: null,
    name: 'Carolina Ruiz',
    role: 'Fisioterapeuta',
    phone: '+598 99 889 5566',
    email: 'carolina.ruiz@club.com',
    license: 'Mat. 45892',
    licenseIssuer: 'Secretaría Nacional del Deporte',
    startDate: '2021-03-01',
    specialty: 'Readaptación muscular',
    notes: '',
    nationality: 'Uruguaya',
  },
  {
    id: 'staff-006',
    photo: null,
    name: 'Pablo Herrera',
    role: 'Analista de Video',
    phone: '+598 99 990 6677',
    email: 'pablo.herrera@club.com',
    license: '',
    startDate: '2024-06-01',
    specialty: 'Post-partido y scouting',
    notes: '',
    nationality: 'Uruguaya',
  },
  {
    id: 'staff-007',
    photo: null,
    name: 'Jorge Medina',
    role: 'Utilero',
    phone: '+598 99 101 7788',
    email: 'jorge.medina@club.com',
    license: '',
    startDate: '2020-01-01',
    specialty: '',
    notes: 'Encargado de indumentaria y equipamiento.',
    nationality: 'Uruguaya',
  },
]

export const INITIAL_STAFF = BASE_STAFF.map((member) =>
  normalizeStaffForm({ ...member, categoryIds: [DEFAULT_CATEGORY_ID] }),
)

export function createEmptyStaffMember() {
  return normalizeStaffForm({
    id: generateStaffId(),
    photo: null,
    name: '',
    role: 'Asistente Técnico',
    phone: '',
    email: '',
    license: '',
    startDate: '',
    specialty: '',
    notes: '',
    nationality: 'Uruguaya',
  })
}

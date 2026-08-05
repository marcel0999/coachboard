import { PERSONAL_DOCUMENT_TYPES } from '../config/localization'

export const DOCUMENT_TYPES = PERSONAL_DOCUMENT_TYPES.map((entry) => ({
  value: entry.value,
  label: entry.label,
}))

export const MEDICAL_STATUSES = ['Activo', 'En tratamiento', 'Recuperado']

export const BODY_ZONES = [
  'Tobillo',
  'Rodilla',
  'Muslo',
  'Isquiotibial',
  'Gemelo',
  'Espalda',
  'Hombro',
  'Cadera',
  'Pie',
  'Otro',
]

export const PROFILE_TABS = [
  { id: 'general', label: 'General' },
  { id: 'medical', label: 'Historial Médico' },
  { id: 'medicalCenter', label: 'Centro Médico' },
  { id: 'stats', label: 'Estadísticas' },
  { id: 'documents', label: 'Documentos' },
]

export function getDocumentTypeLabel(value) {
  return DOCUMENT_TYPES.find((type) => type.value === value)?.label ?? value
}

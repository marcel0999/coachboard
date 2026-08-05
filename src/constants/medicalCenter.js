import { MEDICAL_DOCUMENT_TYPES as LOCALIZED_MEDICAL_TYPES } from '../config/localization'

export const MEDICAL_DOCUMENT_TYPES = LOCALIZED_MEDICAL_TYPES

export const MEDICAL_ALERT_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'expired', label: 'Vencidas' },
  { value: 'expiring', label: 'Por vencer' },
  { value: 'injured', label: 'Lesionados' },
  { value: 'ok', label: 'Al día' },
]

export function getMedicalDocumentTypeLabel(value) {
  return MEDICAL_DOCUMENT_TYPES.find((type) => type.value === value)?.label ?? value
}

export function getMedicalDocumentShortLabel(value) {
  return MEDICAL_DOCUMENT_TYPES.find((type) => type.value === value)?.shortLabel ?? value
}

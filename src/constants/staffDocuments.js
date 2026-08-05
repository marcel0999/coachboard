import { IDENTITY_DOCUMENT_LABELS } from '../config/localization'

export const STAFF_DOCUMENT_TYPES = IDENTITY_DOCUMENT_LABELS.map((entry) => ({
  value: entry.value,
  label: entry.label,
  shortLabel: entry.label.split(' ')[0],
}))

export function getStaffDocumentTypeLabel(type) {
  return STAFF_DOCUMENT_TYPES.find((entry) => entry.value === type)?.label ?? type
}

import { generateRecordId } from '../utils/playerFactory'

function addDays(baseDate, days) {
  const date = new Date(`${baseDate}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function createDocument(type, issuedAt, expiresAt, notes = '') {
  return {
    id: generateRecordId('mdoc'),
    type,
    issuedAt,
    expiresAt,
    fileName: null,
    mimeType: null,
    dataUrl: null,
    notes,
  }
}

/**
 * Documentación médica inicial con distintos estados de vencimiento.
 * Referencia: 2026-08-04
 */
export function createSampleMedicalDocuments(playerId) {
  const baseIssue = '2025-08-01'

  const profiles = {
    'plr-003': {
      carne_deportista: 120,
      ficha_medica: 8,
      electrocardiograma: 45,
      ecocardiograma: -15,
      seguro_deportivo: 200,
    },
    'plr-014': {
      carne_deportista: 25,
      ficha_medica: 5,
      electrocardiograma: 90,
      ecocardiograma: 60,
      seguro_deportivo: 180,
    },
    'plr-018': {
      carne_deportista: -15,
      ficha_medica: 20,
      electrocardiograma: -5,
      ecocardiograma: 15,
      seguro_deportivo: 40,
    },
    'plr-006': {
      carne_deportista: 90,
      ficha_medica: -3,
      electrocardiograma: 22,
      ecocardiograma: 100,
      seguro_deportivo: 75,
    },
  }

  const offsets = profiles[playerId] ?? {
    carne_deportista: 180,
    ficha_medica: 200,
    electrocardiograma: 160,
    ecocardiograma: 150,
    seguro_deportivo: 220,
  }

  const reference = '2026-08-04'

  return Object.entries(offsets).map(([type, daysUntilExpiry]) =>
    createDocument(
      type,
      baseIssue,
      addDays(reference, daysUntilExpiry),
      '',
    ),
  )
}

export const SAMPLE_MEDICAL_DOCUMENTS = Object.fromEntries(
  [
    'plr-001', 'plr-002', 'plr-003', 'plr-004', 'plr-005', 'plr-006',
    'plr-007', 'plr-008', 'plr-009', 'plr-010', 'plr-011', 'plr-012',
    'plr-013', 'plr-014', 'plr-015', 'plr-016', 'plr-017', 'plr-018',
    'plr-019', 'plr-020', 'plr-021', 'plr-022',
  ].map((playerId) => [playerId, createSampleMedicalDocuments(playerId)]),
)

import { DEFAULT_NATIONALITY } from '../config/localization'
import { formatCurrency as formatCurrencyLocalized, formatDate as formatDateLocalized } from './localization'

export function createDefaultStatistics() {
  return {
    matches: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    matchIds: [],
  }
}

export function createPlayerExtensions(overrides = {}) {
  return {
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
    statistics: createDefaultStatistics(),
    documents: [],
    medicalDocuments: [],
    ...overrides,
  }
}

export function enrichPlayer(player) {
  return {
    ...createPlayerExtensions(),
    ...player,
    statistics: {
      ...createDefaultStatistics(),
      ...(player.statistics ?? {}),
    },
    medicalHistory: player.medicalHistory ?? [],
    documents: player.documents ?? [],
    medicalDocuments: player.medicalDocuments ?? [],
  }
}

export function generateRecordId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/** @deprecated Preferir formatCurrency de utils/localization con moneda explícita */
export function formatCurrency(value, currencyCode = 'USD') {
  return formatCurrencyLocalized(value, currencyCode)
}

/** @deprecated Preferir formatDate de utils/localization */
export function formatDate(date, settings) {
  return formatDateLocalized(date, settings)
}

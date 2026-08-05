import {
  DEFAULT_CLUB_SETTINGS,
  DEFAULT_CURRENCY,
  DEFAULT_NATIONALITY,
  DEFAULT_PHONE,
  SUPPORTED_CURRENCIES,
  getLocaleTag,
} from '../config/localization'

/** Parsea YYYY-MM-DD como fecha local (sin desfase UTC). */
export function parseLocalDate(dateStr) {
  if (!dateStr) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr)
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  }
  const parsed = new Date(dateStr)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatDate(date, settings = DEFAULT_CLUB_SETTINGS) {
  if (!date) return '—'
  const value = parseLocalDate(typeof date === 'string' ? date : date.toISOString?.().slice(0, 10))
  if (!value) return '—'
  return new Intl.DateTimeFormat(getLocaleTag(settings), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: settings.timezone ?? DEFAULT_CLUB_SETTINGS.timezone,
  }).format(value)
}

export function formatDateTime(date, time, settings = DEFAULT_CLUB_SETTINGS) {
  if (!date) return '—'
  const value = parseLocalDate(date)
  if (!value) return '—'
  const formatted = new Intl.DateTimeFormat(getLocaleTag(settings), {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: settings.timezone ?? DEFAULT_CLUB_SETTINGS.timezone,
  }).format(value)
  return time ? `${formatted} · ${time}` : formatted
}

export function formatCurrency(amount, currencyCode = DEFAULT_CURRENCY.code, settings = DEFAULT_CLUB_SETTINGS) {
  if (amount === '' || amount === null || amount === undefined) return '—'
  const numeric = Number(amount)
  if (Number.isNaN(numeric)) return '—'

  const code = currencyCode === 'OTHER' ? settings.currency ?? DEFAULT_CURRENCY.code : currencyCode
  const locale = getLocaleTag(settings)

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: code === 'UYU' ? 0 : 2,
    }).format(numeric)
  } catch {
    const entry = SUPPORTED_CURRENCIES.find((c) => c.code === code)
    const symbol = entry?.symbol ?? '$'
    return `${symbol} ${numeric.toLocaleString(locale)}`
  }
}

export function getCurrencyLabel(code) {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code)?.name ?? code
}

export function getDefaultNationality(settings = DEFAULT_CLUB_SETTINGS) {
  return settings?.defaultNationality ?? DEFAULT_NATIONALITY
}

export function getPhonePlaceholder(settings = DEFAULT_CLUB_SETTINGS) {
  return settings?.phonePrefix
    ? `${settings.phonePrefix} 99 123 456`
    : DEFAULT_PHONE.placeholder
}

/** Normaliza cédula uruguaya: solo dígitos (7 u 8). */
export function normalizeCedula(value) {
  if (!value) return ''
  return value.replace(/\D/g, '')
}

/** Formatea cédula uruguaya para visualización: X.XXX.XXX-X */
export function formatCedula(value) {
  const digits = normalizeCedula(value)
  if (digits.length < 7) return value.trim()
  const body = digits.slice(0, -1)
  const check = digits.slice(-1)
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted}-${check}`
}

export function validateCedula(value) {
  if (!value?.trim()) return { valid: true, normalized: '' }
  const digits = normalizeCedula(value)
  if (digits.length === 0) return { valid: true, normalized: '' }
  if (digits.length !== 7 && digits.length !== 8) {
    return { valid: false, message: 'La cédula debe tener 7 u 8 dígitos' }
  }
  return { valid: true, normalized: digits }
}

export function normalizeDocumentField(value, documentType) {
  if (!value?.trim()) return ''
  if (documentType === 'cedula_uy' || documentType === 'cedula') {
    return normalizeCedula(value)
  }
  return value.trim()
}

export function displayDocument(value, documentType) {
  if (!value) return '—'
  if (documentType === 'cedula_uy' || documentType === 'cedula') {
    return formatCedula(value)
  }
  return value
}

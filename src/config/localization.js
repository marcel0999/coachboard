/**
 * Configuración central de localización de CoachBoard.
 * Toda referencia a país, moneda, formatos y terminología debe leerse desde aquí.
 */

export const DEFAULT_COUNTRY = {
  name: 'Uruguay',
  code: 'UY',
}

export const DEFAULT_LOCALE = {
  language: 'es',
  localeTag: 'es-UY',
  timezone: 'America/Montevideo',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
}

export const DEFAULT_CURRENCY = {
  code: 'UYU',
  symbol: '$',
  name: 'Peso uruguayo',
}

export const DEFAULT_PHONE = {
  prefix: '+598',
  placeholder: '+598 99 123 456',
  landlinePlaceholder: '+598 2 123 4567',
}

export const DEFAULT_NATIONALITY = 'Uruguaya'

export const DEFAULT_FOOTBALL = {
  association: 'AUF',
  associationFullName: 'Asociación Uruguaya de Fútbol',
  secondaryOrganization: 'OFI',
  secondaryOrganizationFullName: 'Organización del Fútbol del Interior',
}

export const URUGUAY_DEPARTMENTS = [
  'Artigas',
  'Canelones',
  'Cerro Largo',
  'Colonia',
  'Durazno',
  'Flores',
  'Florida',
  'Lavalleja',
  'Maldonado',
  'Montevideo',
  'Paysandú',
  'Río Negro',
  'Rivera',
  'Rocha',
  'Salto',
  'San José',
  'Soriano',
  'Tacuarembó',
  'Treinta y Tres',
]

export const SUPPORTED_CURRENCIES = [
  { code: 'UYU', symbol: '$', name: 'Peso uruguayo' },
  { code: 'USD', symbol: 'US$', name: 'Dólar estadounidense' },
  { code: 'BRL', symbol: 'R$', name: 'Real brasileño' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'ARS', symbol: '$', name: 'Peso argentino' },
  { code: 'OTHER', symbol: '', name: 'Otra' },
]

export const STAFF_LICENSE_ISSUERS = [
  'AUF',
  'OFI',
  'CONMEBOL',
  'FIFA',
  'Secretaría Nacional del Deporte',
  'Institución extranjera',
  'Otra',
]

export const STAFF_LICENSE_LEVELS = [
  'Licencia C',
  'Licencia B',
  'Licencia A',
  'Licencia PRO',
  'Licencia de entrenador de arqueros',
  'Licencia de preparador físico',
  'Licencia de fútbol infantil',
  'Otra',
]

export const PERSONAL_DOCUMENT_TYPES = [
  { value: 'cedula_uy', label: 'Cédula uruguaya' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'documento_extranjero', label: 'Documento extranjero' },
  { value: 'otro', label: 'Otro' },
]

export const IDENTITY_DOCUMENT_LABELS = [
  { value: 'cedula', label: 'Cédula de Identidad' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'credencial_civica', label: 'Credencial Cívica' },
  { value: 'carne_salud', label: 'Carné de Salud' },
  { value: 'carne_deportista', label: 'Carné del Deportista' },
  { value: 'ficha_medica', label: 'Ficha médica' },
  { value: 'seguro_deportivo', label: 'Seguro deportivo' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'permiso_menor', label: 'Permiso de menor' },
  { value: 'autorizacion_viaje', label: 'Autorización de viaje' },
  { value: 'otro', label: 'Otros' },
]

export const MEDICAL_DOCUMENT_TYPES = [
  { value: 'carne_deportista', label: 'Carné del Deportista', shortLabel: 'Carné' },
  { value: 'ficha_medica', label: 'Ficha médica', shortLabel: 'Ficha' },
  { value: 'carne_salud', label: 'Carné de Salud', shortLabel: 'C. Salud' },
  { value: 'electrocardiograma', label: 'Electrocardiograma', shortLabel: 'ECG' },
  { value: 'ecocardiograma', label: 'Ecocardiograma', shortLabel: 'Eco' },
  { value: 'certificado_aptitud', label: 'Certificado de aptitud', shortLabel: 'Aptitud' },
  { value: 'seguro_deportivo', label: 'Seguro deportivo', shortLabel: 'Seguro' },
  { value: 'autorizacion_medica', label: 'Autorización médica', shortLabel: 'Autoriz.' },
  { value: 'otro', label: 'Otros', shortLabel: 'Otro' },
]

export const COMPETITION_ORGANIZATIONS = [
  'AUF',
  'OFI',
  'Liga departamental',
  'Liga local',
  'Torneo amistoso',
  'Torneo internacional',
  'Otra',
]

export const COMPETITION_TYPES = [
  'Campeonato Uruguayo',
  'Copa AUF Uruguay',
  'Divisional',
  'Campeonato departamental',
  'Liguilla',
  'Torneo Apertura',
  'Torneo Clausura',
  'Copa',
  'Amistoso',
  'Otro',
]

/** IDs de staff demo (solo usados al cargar datos de demostración manualmente). */
export const DEMO_STAFF_IDS = [
  'staff-001',
  'staff-002',
  'staff-003',
  'staff-004',
  'staff-005',
  'staff-006',
  'staff-007',
]

/** Configuración predeterminada del club — persistida en el estado de la app. */
export const DEFAULT_CLUB_SETTINGS = {
  country: DEFAULT_COUNTRY.name,
  countryCode: DEFAULT_COUNTRY.code,
  currency: DEFAULT_CURRENCY.code,
  currencySymbol: DEFAULT_CURRENCY.symbol,
  language: DEFAULT_LOCALE.language,
  timezone: DEFAULT_LOCALE.timezone,
  dateFormat: DEFAULT_LOCALE.dateFormat,
  timeFormat: DEFAULT_LOCALE.timeFormat,
  phonePrefix: DEFAULT_PHONE.prefix,
  defaultNationality: DEFAULT_NATIONALITY,
  footballAssociation: DEFAULT_FOOTBALL.association,
  sportsOrganization: DEFAULT_FOOTBALL.association,
}

export function getLocaleTag(settings = DEFAULT_CLUB_SETTINGS) {
  const code = settings?.countryCode ?? DEFAULT_COUNTRY.code
  return code === 'UY' ? 'es-UY' : `es-${code}`
}

import { DEMO_STAFF_IDS, DEFAULT_CLUB_SETTINGS } from '../config/localization'

/**
 * Migra licencias de staff sin alterar datos reales del usuario.
 * - Demo seed (IDs conocidos): AFA → AUF
 * - Datos del usuario con AFA: → Institución extranjera — AFA
 */
export function migrateStaffLocalization(member, isDemoSeed = false) {
  if (member._migratedLocalizationV4) return member

  const next = {
    ...member,
    documentType: member.documentType ?? '',
    licenseIssuer: member.licenseIssuer ?? '',
    licenseLevel: member.licenseLevel ?? '',
    licenseName: member.licenseName ?? '',
    licenseIssueDate: member.licenseIssueDate ?? '',
    licenseIssueCountry: member.licenseIssueCountry ?? '',
    addressCountry: member.addressCountry ?? '',
    addressDepartment: member.addressDepartment ?? '',
    addressCity: member.addressCity ?? '',
    addressStreet: member.addressStreet ?? '',
    addressPostalCode: member.addressPostalCode ?? '',
  }

  const oldType = member.licenseType ?? ''
  const oldLicense = member.license ?? member.licenseNumber ?? ''
  const combined = `${oldType} ${oldLicense}`.toUpperCase()
  const hasAfa = combined.includes('AFA') || (member.licenseIssuer ?? '').toUpperCase().includes('AFA')

  if (hasAfa) {
    if (isDemoSeed || DEMO_STAFF_IDS.includes(member.id)) {
      next.licenseIssuer = 'AUF'
      if (oldLicense.toUpperCase().includes(' A') || oldType.includes(' A')) {
        next.licenseLevel = 'Licencia A'
      } else if (!next.licenseLevel) {
        next.licenseLevel = 'Licencia PRO'
      }
    } else {
      next.licenseIssuer = 'Institución extranjera'
      next.licenseName = next.licenseName || 'AFA'
      next.licenseIssueCountry = next.licenseIssueCountry || 'Argentina'
    }
  } else if (!next.licenseIssuer) {
    if (oldType.includes('CONMEBOL') || oldLicense.toUpperCase().includes('CONMEBOL')) {
      next.licenseIssuer = 'CONMEBOL'
      next.licenseLevel = next.licenseLevel || oldType.replace(/^Licencia\s*/i, '') || oldLicense
    } else if (oldType.includes('FIFA') || oldLicense.toUpperCase().includes('FIFA')) {
      next.licenseIssuer = 'FIFA'
    } else if (oldType.includes('Matrícula') || oldType.includes('Matricula')) {
      next.licenseIssuer = 'Secretaría Nacional del Deporte'
    } else if (oldType && oldType !== 'Otra') {
      next.licenseLevel = oldType.startsWith('Licencia') ? oldType : `Licencia ${oldType}`
    }
  }

  return { ...next, _migratedLocalizationV4: true }
}

export function migratePlayerLocalization(player) {
  if (player._migratedLocalizationV4) return player

  const medicalDocuments = (player.medicalDocuments ?? []).map((doc) => ({
    ...doc,
    type: doc.type === 'carnet_deportista' ? 'carne_deportista' : doc.type,
  }))

  return {
    ...player,
    documentType: player.documentType ?? '',
    estimatedValueCurrency: player.estimatedValueCurrency ?? (player.estimatedValue ? 'USD' : 'UYU'),
    addressCountry: player.addressCountry ?? '',
    addressDepartment: player.addressDepartment ?? '',
    addressCity: player.addressCity ?? '',
    addressStreet: player.addressStreet ?? '',
    addressPostalCode: player.addressPostalCode ?? '',
    medicalDocuments,
    _migratedLocalizationV4: true,
  }
}

export function migrateMatchLocalization(match) {
  if (match._migratedLocalizationV4) return match

  return {
    ...match,
    competitionOrganization: match.competitionOrganization ?? '',
    competitionType: match.competitionType ?? '',
    _migratedLocalizationV4: true,
  }
}

export function ensureClubSettings(raw) {
  if (raw?.clubSettings && typeof raw.clubSettings === 'object') {
    return { ...DEFAULT_CLUB_SETTINGS, ...raw.clubSettings }
  }
  return { ...DEFAULT_CLUB_SETTINGS }
}

import { BACKUP_KEY_PREFIX, CURRENT_SCHEMA_VERSION, STORAGE_KEY } from './storageKeys'

function formatBackupTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('-')
}

export function buildBackupKey(fromVersion, date = new Date()) {
  return `${BACKUP_KEY_PREFIX}${fromVersion}_${formatBackupTimestamp(date)}`
}

/**
 * Backups automáticos en localStorage deshabilitados.
 * Supabase es la única fuente de verdad. Usar export JSON manual.
 */
export function createPreMigrationBackup() {
  return null
}

export function listBackups() {
  return []
}

export function getLatestBackup() {
  return null
}

export function restoreBackup() {
  throw new Error('Backups en localStorage deshabilitados. Usá Importar JSON.')
}

export function exportStateAsJson(state) {
  return JSON.stringify(
    {
      meta: {
        exportedAt: new Date().toISOString(),
        schemaVersion: state.schemaVersion ?? state.version ?? CURRENT_SCHEMA_VERSION,
        app: 'CoachBoard',
      },
      state,
    },
    null,
    2,
  )
}

export function parseImportedBackup(jsonString) {
  const parsed = JSON.parse(jsonString)
  if (parsed?.state && typeof parsed.state === 'object') {
    return parsed.state
  }
  if (parsed?.players !== undefined || parsed?.matches !== undefined) {
    return parsed
  }
  throw new Error('El archivo JSON no contiene un estado válido de CoachBoard.')
}

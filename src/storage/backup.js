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
 * Guarda una copia completa del estado antes de migrar.
 * No elimina backups anteriores.
 */
export function createPreMigrationBackup(state, { fromVersion, reason = 'migration' } = {}) {
  if (typeof localStorage === 'undefined' || !state) return null

  const backupKey = buildBackupKey(fromVersion ?? state.schemaVersion ?? state.version ?? 1)
  const payload = {
    meta: {
      createdAt: new Date().toISOString(),
      fromVersion: fromVersion ?? state.schemaVersion ?? state.version ?? 1,
      toVersion: CURRENT_SCHEMA_VERSION,
      reason,
      sourceKey: STORAGE_KEY,
    },
    state,
  }

  try {
    localStorage.setItem(backupKey, JSON.stringify(payload))
    console.info(`[CoachBoard] Backup creado: ${backupKey}`)
    return backupKey
  } catch (error) {
    console.error('[CoachBoard] No se pudo crear backup antes de migrar:', error)
    return null
  }
}

export function listBackups() {
  if (typeof localStorage === 'undefined') return []

  return Object.keys(localStorage)
    .filter((key) => key.startsWith(BACKUP_KEY_PREFIX))
    .map((key) => {
      try {
        const parsed = JSON.parse(localStorage.getItem(key))
        return {
          key,
          meta: parsed?.meta ?? null,
          state: parsed?.state ?? parsed,
        }
      } catch {
        return { key, meta: null, state: null }
      }
    })
    .sort((a, b) => (b.meta?.createdAt ?? '').localeCompare(a.meta?.createdAt ?? ''))
}

export function getLatestBackup() {
  return listBackups()[0] ?? null
}

export function restoreBackup(backupKey) {
  const raw = localStorage.getItem(backupKey)
  if (!raw) throw new Error(`Backup no encontrado: ${backupKey}`)

  const parsed = JSON.parse(raw)
  return parsed?.state ?? parsed
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

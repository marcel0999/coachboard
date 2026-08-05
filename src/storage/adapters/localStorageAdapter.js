import { STORAGE_KEY } from '../storageKeys'
import { diagnoseLocalStorage } from '../diagnostics'
import { migrateState, MigrationError, logMigrationResult } from '../migrations'

let lastLoadReport = null

export function getLastLoadReport() {
  return lastLoadReport
}

/**
 * Carga estricta: lee exactamente lo guardado en STORAGE_KEY.
 * NO recupera backups automáticamente.
 * NO inyecta datos demo.
 * Arrays vacíos se respetan.
 */
export const localStorageAdapter = {
  name: 'localStorage',

  load() {
    diagnoseLocalStorage()

    const rawString = localStorage.getItem(STORAGE_KEY)

    if (rawString === null) {
      lastLoadReport = { sourceKey: null, exists: false }
      return null
    }

    let raw
    try {
      raw = JSON.parse(rawString)
    } catch (parseError) {
      lastLoadReport = { sourceKey: STORAGE_KEY, exists: true, parseError: true }
      throw new MigrationError('El estado guardado está corrupto y no pudo leerse.', {
        cause: parseError,
      })
    }

    const migrationResult = migrateState(raw)
    logMigrationResult(migrationResult)

    lastLoadReport = {
      sourceKey: STORAGE_KEY,
      exists: true,
      migrated: migrationResult.migrated,
      fromVersion: migrationResult.fromVersion,
      toVersion: migrationResult.toVersion,
      preserved: migrationResult.preserved,
      counts: {
        players: migrationResult.state.players.length,
        matches: migrationResult.state.matches.length,
        trainings: migrationResult.state.trainings.length,
        staff: migrationResult.state.staff.length,
        exercises: migrationResult.state.exercises.length,
      },
    }

    return migrationResult.state
  },

  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('[CoachBoard] Error al guardar en localStorage:', error)
      throw error
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY)
  },
}

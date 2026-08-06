import { migrateState, MigrationError, logMigrationResult } from '../migrations'
import { diagnoseLocalStorage } from '../diagnostics'
import { getClubStorageKey, getClubUserDataFlagKey } from '../../utils/authStorage'

let lastLoadReport = null

export function getLastLoadReport() {
  return lastLoadReport
}

export function createNamespacedAdapter(clubId) {
  const storageKey = getClubStorageKey(clubId)
  const userDataFlagKey = getClubUserDataFlagKey(clubId)

  return {
    name: `localStorage:${clubId}`,
    clubId,
    userDataFlagKey,

    load() {
      diagnoseLocalStorage()

      const rawString = localStorage.getItem(storageKey)
      if (rawString === null) {
        lastLoadReport = { sourceKey: storageKey, exists: false, clubId }
        return null
      }

      let raw
      try {
        raw = JSON.parse(rawString)
      } catch (parseError) {
        lastLoadReport = { sourceKey: storageKey, exists: true, parseError: true, clubId }
        throw new MigrationError('El estado guardado está corrupto y no pudo leerse.', {
          cause: parseError,
        })
      }

      const migrationResult = migrateState(raw)
      logMigrationResult(migrationResult)

      lastLoadReport = {
        sourceKey: storageKey,
        exists: true,
        migrated: migrationResult.migrated,
        fromVersion: migrationResult.fromVersion,
        toVersion: migrationResult.toVersion,
        preserved: migrationResult.preserved,
        clubId,
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
        localStorage.setItem(storageKey, JSON.stringify(state))
        localStorage.setItem(userDataFlagKey, 'true')
      } catch (error) {
        console.error('[CoachBoard] Error al guardar en localStorage:', error)
        throw error
      }
    },

    clear() {
      localStorage.removeItem(storageKey)
      localStorage.removeItem(userDataFlagKey)
    },
  }
}

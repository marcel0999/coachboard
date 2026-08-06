import { migrateState, MigrationError, logMigrationResult } from '../migrations'
import {
  loadClubAppStateFromSupabase,
  saveClubAppStateToSupabase,
  subscribeToClubAppState,
} from '../../services/supabase/clubDataService'
import { ensureClubHasState } from '../../services/supabase/migrationService'

let lastLoadReport = null
let saveTimer = null
let pendingSave = null
let lastSaveError = null

const SAVE_DEBOUNCE_MS = 800

export function getSupabaseLoadReport() {
  return lastLoadReport
}

export function getLastSaveError() {
  return lastSaveError
}

export function createSupabaseAdapter(clubId) {
  const adapter = {
    name: `supabase:${clubId}`,
    clubId,
    backend: 'supabase',

    async loadAsync() {
      let state = await loadClubAppStateFromSupabase(clubId)

      if (!state) {
        state = await ensureClubHasState(clubId)
      }

      const migrationResult = migrateState(state)
      logMigrationResult(migrationResult)

      lastLoadReport = {
        source: 'supabase',
        clubId,
        migrated: migrationResult.migrated,
        counts: {
          players: migrationResult.state.players.length,
          matches: migrationResult.state.matches.length,
          trainings: migrationResult.state.trainings.length,
          staff: migrationResult.state.staff.length,
          exercises: migrationResult.state.exercises.length,
          categories: migrationResult.state.categories.length,
        },
      }

      return migrationResult.state
    },

    load() {
      throw new Error('El adapter de Supabase requiere loadAsync()')
    },

    save(state) {
      pendingSave = state
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        const payload = pendingSave
        pendingSave = null
        void adapter.saveAsync(payload)
      }, SAVE_DEBOUNCE_MS)
    },

    async saveAsync(state) {
      try {
        await saveClubAppStateToSupabase(clubId, state)
        lastSaveError = null
      } catch (error) {
        lastSaveError = error
        console.error('[CoachBoard] Error al guardar en Supabase:', error)
        throw error
      }
    },

    async flushPendingSave() {
      if (saveTimer) {
        clearTimeout(saveTimer)
        saveTimer = null
      }
      if (pendingSave) {
        const payload = pendingSave
        pendingSave = null
        await adapter.saveAsync(payload)
      }
    },

    subscribe(onRemoteChange) {
      return subscribeToClubAppState(clubId, onRemoteChange)
    },

    clear() {
      /* Supabase es la única fuente de verdad */
    },
  }

  return adapter
}

export { MigrationError }

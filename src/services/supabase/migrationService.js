/**
 * Importación MANUAL y controlada desde localStorage legacy.
 * Nunca se ejecuta automáticamente.
 * No sobrescribe datos existentes en Supabase.
 */
import { buildEmptyAppState } from '../../storage/initialState'
import { migrateState } from '../../storage/migrations'
import { assertSupabase } from '../../lib/supabase'
import { readLegacyAppStateRaw } from '../legacy/localStorageImport'
import {
  fetchClubAppState,
  loadClubAppStateFromSupabase,
  saveClubAppStateToSupabase,
} from './clubDataService'

function stateHasOperationalData(state) {
  if (!state) return false
  return (
    (state.players?.length ?? 0) > 0 ||
    (state.staff?.length ?? 0) > 0 ||
    (state.matches?.length ?? 0) > 0 ||
    (state.trainings?.length ?? 0) > 0 ||
    (state.exercises?.length ?? 0) > 0 ||
    (state.categories?.length ?? 0) > 0
  )
}

/**
 * Importación manual one-shot. Falla si Supabase ya tiene datos operativos.
 */
export async function importLegacyLocalStorageManually(supabaseClubId) {
  assertSupabase()

  const remote = await loadClubAppStateFromSupabase(supabaseClubId)
  if (stateHasOperationalData(remote)) {
    throw new Error(
      'El club ya tiene datos en Supabase. La importación manual no sobrescribe datos existentes.',
    )
  }

  const { raw, key } = readLegacyAppStateRaw(null)
  if (!raw) {
    throw new Error('No se encontraron datos legacy en este navegador.')
  }

  const { state } = migrateState(raw)
  await saveClubAppStateToSupabase(supabaseClubId, state)

  const client = assertSupabase()
  await client.from('club_migration_log').insert({
    club_id: supabaseClubId,
    source: 'manual_localStorage_import',
    legacy_key: key,
    records_summary: {
      players: state.players?.length ?? 0,
      matches: state.matches?.length ?? 0,
      trainings: state.trainings?.length ?? 0,
    },
  })

  return state
}

export async function ensureClubHasState(clubId) {
  const existing = await fetchClubAppState(clubId)
  const remote = await loadClubAppStateFromSupabase(clubId)

  if (remote) return remote

  const empty = buildEmptyAppState()
  await saveClubAppStateToSupabase(clubId, empty)
  return empty
}

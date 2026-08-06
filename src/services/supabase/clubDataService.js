import { assertSupabase } from '../../lib/supabase'
import { migrateState } from '../../storage/migrations'
import { buildEmptyAppState } from '../../storage/initialState'

export async function fetchClubAppState(clubId) {
  const client = assertSupabase()
  const { data, error } = await client
    .from('club_app_state')
    .select('club_id, schema_version, state, migrated_from_local_at, updated_at')
    .eq('club_id', clubId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upsertClubAppState(clubId, state) {
  const client = assertSupabase()
  const payload = {
    club_id: clubId,
    schema_version: state.schemaVersion ?? 4,
    state,
    updated_at: new Date().toISOString(),
  }

  const { error } = await client.from('club_app_state').upsert(payload, { onConflict: 'club_id' })
  if (error) throw error
}

export async function markClubMigrated(clubId, { legacyLocalId, legacyKey, recordsSummary }) {
  const client = assertSupabase()
  const now = new Date().toISOString()

  await client
    .from('club_app_state')
    .update({
      migrated_from_local_at: now,
      legacy_local_id: legacyLocalId ?? null,
      updated_at: now,
    })
    .eq('club_id', clubId)

  await client.from('club_migration_log').insert({
    club_id: clubId,
    source: 'localStorage',
    legacy_key: legacyKey,
    records_summary: recordsSummary ?? null,
  })
}

export function normalizeRemoteState(rawState, schemaVersion = 4) {
  if (!rawState || typeof rawState !== 'object' || Object.keys(rawState).length === 0) {
    return null
  }

  const withVersion = {
    ...rawState,
    schemaVersion: rawState.schemaVersion ?? schemaVersion,
    version: rawState.version ?? schemaVersion,
  }

  const migrationResult = migrateState(withVersion)
  return migrationResult.state
}

export async function loadClubAppStateFromSupabase(clubId) {
  const row = await fetchClubAppState(clubId)
  if (!row?.state || Object.keys(row.state).length === 0) return null
  return normalizeRemoteState(row.state, row.schema_version)
}

export async function saveClubAppStateToSupabase(clubId, state) {
  await upsertClubAppState(clubId, state)
}

export async function ensureEmptyClubState(clubId) {
  const existing = await fetchClubAppState(clubId)
  if (existing?.state && Object.keys(existing.state).length > 0) return existing

  const empty = buildEmptyAppState()
  await upsertClubAppState(clubId, empty)
  return { club_id: clubId, state: empty }
}

export function subscribeToClubAppState(clubId, onChange) {
  const client = assertSupabase()
  const channel = client
    .channel(`club_app_state:${clubId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'club_app_state',
        filter: `club_id=eq.${clubId}`,
      },
      (payload) => {
        const next = normalizeRemoteState(payload.new?.state, payload.new?.schema_version)
        if (next) onChange(next)
      },
    )
    .subscribe()

  return () => {
    client.removeChannel(channel)
  }
}

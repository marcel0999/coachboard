import { createSupabaseAdapter, getSupabaseLoadReport } from './adapters/supabaseAdapter'
import { buildEmptyAppState } from './initialState'
import { buildSeedAppState } from './seedData'
import { exportStateAsJson, parseImportedBackup } from './backup'
import { migrateState, MigrationError } from './migrations'
import { isSupabaseConfigured } from '../lib/supabase'

let activeAdapter = null
let loadError = null

export function configureStorageForClub(clubId) {
  const adapter = createSupabaseAdapter(clubId)
  activeAdapter = adapter
  return adapter
}

export async function configureStorageForClubAsync(clubId) {
  return configureStorageForClub(clubId)
}

export function getStorageLoadError() {
  return loadError
}

export function saveAppState(state) {
  if (!activeAdapter) throw new Error('Storage no configurado. Iniciá sesión primero.')
  activeAdapter.save(state)
}

export async function saveAppStateAsync(state) {
  if (!activeAdapter) throw new Error('Storage no configurado. Iniciá sesión primero.')
  await activeAdapter.saveAsync(state)
}

export async function flushPendingSave() {
  if (activeAdapter?.flushPendingSave) {
    await activeAdapter.flushPendingSave()
  }
}

export async function loadAppStateAsync() {
  loadError = null

  if (!isSupabaseConfigured) {
    loadError = new MigrationError(
      'Supabase no está configurado. Definí VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
    )
    throw loadError
  }

  if (!activeAdapter?.loadAsync) {
    loadError = new MigrationError('Storage remoto no inicializado.')
    throw loadError
  }

  try {
    return await activeAdapter.loadAsync()
  } catch (error) {
    loadError = error
    console.error('[CoachBoard] loadAppStateAsync falló:', error)
    throw error
  }
}

/** Solo desarrollo — nunca en producción */
export async function loadSeedDemoData() {
  if (!import.meta.env.DEV) {
    throw new MigrationError('Los datos de demostración solo están disponibles en desarrollo.')
  }
  const seed = buildSeedAppState()
  await saveAppStateAsync(seed)
  return seed
}

/** Importación manual explícita → escribe en Supabase */
export async function importAppState(jsonString) {
  const raw = parseImportedBackup(jsonString)
  const { state } = migrateState(raw, { skipBackup: true })
  await saveAppStateAsync(state)
  return state
}

export function exportAppStateBackup(state) {
  return exportStateAsJson(state)
}

/** Backups automáticos en localStorage deshabilitados — usar export JSON */
export function getAvailableBackups() {
  return []
}

export async function restoreAppStateFromBackup() {
  throw new MigrationError(
    'Los backups automáticos en localStorage están deshabilitados. Usá Importar JSON.',
  )
}

export async function resetAppStateToEmpty() {
  const empty = buildEmptyAppState()
  await saveAppStateAsync(empty)
  return empty
}

export function subscribeToRemoteState(onChange) {
  return activeAdapter?.subscribe?.(onChange) ?? (() => {})
}

export function getLastLoadReport() {
  return getSupabaseLoadReport()
}

export { buildEmptyAppState } from './initialState'
export { MigrationError } from './migrations'
export { isSupabaseConfigured } from '../lib/supabase'

export function loadAppState() {
  throw new Error('loadAppState() eliminado. Supabase es la única fuente de verdad.')
}

export function clearAppState() {
  /* no-op */
}

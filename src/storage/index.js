import { localStorageAdapter } from './adapters/localStorageAdapter'
import { buildEmptyAppState } from './initialState'
import { buildSeedAppState } from './seedData'
import { diagnoseLocalStorage } from './diagnostics'
import {
  exportStateAsJson,
  parseImportedBackup,
  restoreBackup,
  listBackups,
  createPreMigrationBackup,
} from './backup'
import { migrateState, MigrationError } from './migrations'
import { hasUserData, markHasUserData, isTrulyFirstInstall } from './userDataFlag'
import { STORAGE_KEY } from './storageKeys'

let activeAdapter = localStorageAdapter
let loadError = null

export function setStorageAdapter(adapter) {
  activeAdapter = adapter
}

export function getStorageAdapter() {
  return activeAdapter
}

export function getStorageLoadError() {
  return loadError
}

/**
 * Guarda el estado del usuario e marca que existen datos reales.
 * Toda mutación del usuario debe pasar por esta función.
 */
export function saveAppState(state) {
  activeAdapter.save(state)
  markHasUserData()
}

/**
 * Carga el último estado persistido.
 * REGLA: lo guardado es la verdad. Nunca se inyectan datos demo automáticamente.
 */
export function loadAppState() {
  loadError = null

  try {
    const stored = activeAdapter.load()
    if (stored) {
      return stored
    }
  } catch (error) {
    loadError = error
    console.error('[CoachBoard] loadAppState falló:', error)
    diagnoseLocalStorage()
    throw error
  }

  if (hasUserData()) {
    const message =
      'Existen datos de usuario (coachboard_has_user_data) pero no se encontró el estado guardado. ' +
      'Restaurá un backup desde Configuración.'
    loadError = new MigrationError(message)
    throw loadError
  }

  if (!isTrulyFirstInstall()) {
    const message = 'Instalación inconsistente: no hay estado guardado ni es primera apertura.'
    loadError = new MigrationError(message)
    throw loadError
  }

  const empty = buildEmptyAppState()
  activeAdapter.save(empty)
  console.info('[CoachBoard] Primera apertura — estado vacío inicializado (sin datos demo).')
  return empty
}

/**
 * Demo manual exclusivamente desde Configuración, con backup previo.
 */
export function loadSeedDemoData() {
  const rawString = localStorage.getItem(STORAGE_KEY)
  if (rawString !== null) {
    try {
      createPreMigrationBackup(JSON.parse(rawString), {
        fromVersion: JSON.parse(rawString).schemaVersion ?? 1,
        reason: 'before_manual_demo_load',
      })
    } catch {
      /* backup best-effort */
    }
  }

  const seed = buildSeedAppState()
  activeAdapter.save(seed)
  markHasUserData()
  return seed
}

export function importAppState(jsonString) {
  const raw = parseImportedBackup(jsonString)
  const { state } = migrateState(raw, { skipBackup: true })
  saveAppState(state)
  return state
}

export function exportAppStateBackup(state) {
  return exportStateAsJson(state)
}

export function restoreAppStateFromBackup(backupKey) {
  const raw = restoreBackup(backupKey)
  const { state } = migrateState(raw, { skipBackup: true })
  saveAppState(state)
  return state
}

export function getAvailableBackups() {
  return listBackups()
}

export function resetAppStateToEmpty() {
  const empty = buildEmptyAppState()
  saveAppState(empty)
  return empty
}

export function clearAppState() {
  activeAdapter.clear()
}

export { localStorageAdapter } from './adapters/localStorageAdapter'
export { buildEmptyAppState } from './initialState'
export { buildSeedAppState } from './seedData'
export { diagnoseLocalStorage } from './diagnostics'
export { getLastLoadReport } from './adapters/localStorageAdapter'
export { MigrationError } from './migrations'
export { hasUserData, markHasUserData, isTrulyFirstInstall, USER_DATA_FLAG_KEY } from './userDataFlag'

/** @deprecated Usar resetAppStateToEmpty */
export function resetAppState() {
  return resetAppStateToEmpty()
}

/** @deprecated Usar buildSeedAppState */
export function buildInitialAppState() {
  return buildSeedAppState()
}

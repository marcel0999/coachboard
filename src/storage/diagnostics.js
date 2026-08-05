import { INITIAL_PLAYERS } from '../data/initialPlayers'
import { LEGACY_STORAGE_KEYS, STORAGE_KEY } from './storageKeys'

const SEED_PLAYER_IDS = new Set(INITIAL_PLAYERS.map((player) => player.id))

function safeParse(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function countRecords(value) {
  if (value == null) return null
  if (Array.isArray(value)) return value.length
  if (typeof value === 'object') return Object.keys(value).length
  return 1
}

function describeState(state) {
  if (!state || typeof state !== 'object') {
    return { valid: false, type: typeof state }
  }

  const playerIds = Array.isArray(state.players)
    ? state.players.map((player) => player.id)
    : []

  const isLikelySeed =
    playerIds.length > 0 &&
    playerIds.length === SEED_PLAYER_IDS.size &&
    playerIds.every((id) => SEED_PLAYER_IDS.has(id))

  return {
    valid: true,
    schemaVersion: state.schemaVersion ?? state.version ?? null,
    players: countRecords(state.players),
    staff: countRecords(state.staff),
    matches: countRecords(state.matches),
    trainings: countRecords(state.trainings),
    exercises: countRecords(state.exercises),
    categories: countRecords(state.categories),
    isLikelySeed,
    migrations: state._migrations?.applied ?? [],
  }
}

/**
 * Escanea localStorage y registra en consola todas las claves relacionadas con CoachBoard.
 * No modifica ni elimina ninguna clave.
 */
export function diagnoseLocalStorage({ log = true } = {}) {
  if (typeof localStorage === 'undefined') {
    return { keys: [], summary: null }
  }

  const allKeys = Object.keys(localStorage)
  const coachboardKeys = allKeys.filter(
    (key) =>
      LEGACY_STORAGE_KEYS.includes(key) ||
      key.startsWith('coachboard_') ||
      key.startsWith('coachboard'),
  )

  const entries = coachboardKeys.map((key) => {
    const raw = localStorage.getItem(key)
    const parsed = raw != null ? safeParse(raw) : null
    const description = parsed ? describeState(parsed) : { valid: false, rawLength: raw?.length ?? 0 }

    return {
      key,
      exists: raw !== null,
      rawLength: raw?.length ?? 0,
      ...description,
    }
  })

  const summary = {
    totalCoachboardKeys: entries.length,
    mainKeyExists: localStorage.getItem(STORAGE_KEY) !== null,
    backups: entries.filter((entry) => entry.key.includes('backup')),
    likelySeedStates: entries.filter((entry) => entry.isLikelySeed),
    candidateRecoveries: entries.filter(
      (entry) => entry.valid && !entry.isLikelySeed && entry.key !== STORAGE_KEY,
    ),
  }

  if (log) {
    console.group('[CoachBoard] Diagnóstico de persistencia')
    console.table(
      entries.map((entry) => ({
        clave: entry.key,
        existe: entry.exists,
        bytes: entry.rawLength,
        jugadores: entry.players ?? '—',
        partidos: entry.matches ?? '—',
        entrenamientos: entry.trainings ?? '—',
        schema: entry.schemaVersion ?? '—',
        demo: entry.isLikelySeed ? 'SÍ' : entry.valid ? 'no' : '—',
      })),
    )
    console.log('[CoachBoard] Resumen:', summary)
    console.groupEnd()
  }

  return { keys: entries, summary }
}

export function isLikelySeedState(state) {
  return describeState(state).isLikelySeed === true
}

export function describeStateForLog(state) {
  return describeState(state)
}

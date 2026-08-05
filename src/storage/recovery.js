import { INITIAL_PLAYERS } from '../data/initialPlayers'
import { isLikelySeedState } from './diagnostics'
import { getLatestBackup, listBackups } from './backup'
import { LEGACY_STORAGE_KEYS, STORAGE_KEY } from './storageKeys'

const SEED_PLAYER_IDS = new Set(INITIAL_PLAYERS.map((player) => player.id))

function safeParse(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function extractState(parsed) {
  if (!parsed || typeof parsed !== 'object') return null
  if (parsed.state && typeof parsed.state === 'object') return parsed.state
  if (
    Array.isArray(parsed.players) ||
    Array.isArray(parsed.matches) ||
    Array.isArray(parsed.trainings)
  ) {
    return parsed
  }
  return null
}

function scoreState(state, { key = '' } = {}) {
  if (!state || typeof state !== 'object') return -1

  let score = 0
  const players = Array.isArray(state.players) ? state.players : []
  const matches = Array.isArray(state.matches) ? state.matches : []

  if (key.includes('backup')) score += 50
  if (key === STORAGE_KEY) score += 10

  if (players.length === 0) score += 30
  if (isLikelySeedState(state)) score -= 100

  const nonSeedPlayers = players.filter((player) => !SEED_PLAYER_IDS.has(player.id))
  score += nonSeedPlayers.length * 5

  if (matches.length === 0) score += 10
  const seedMatches = matches.filter((match) => match.id?.startsWith('match-00'))
  if (seedMatches.length === matches.length && matches.length > 0) score -= 20

  if (state.schemaVersion === 1 || state.version === 1) score += 15

  return score
}

/**
 * Busca el mejor candidato recuperable entre claves legacy y backups.
 */
export function recoverBestAvailableState({ excludeKey = null } = {}) {
  if (typeof localStorage === 'undefined') return null

  const keys = new Set([
    ...LEGACY_STORAGE_KEYS,
    ...Object.keys(localStorage).filter((key) => key.startsWith('coachboard_')),
  ])

  const candidates = []

  keys.forEach((key) => {
    if (key === excludeKey) return
    const raw = localStorage.getItem(key)
    if (raw === null) return

    const parsed = safeParse(raw)
    const state = extractState(parsed)
    if (!state) return

    candidates.push({
      key,
      state,
      score: scoreState(state, { key }),
    })
  })

  candidates.sort((a, b) => b.score - a.score)

  return candidates[0] ?? null
}

/**
 * Si el estado actual parece demo pero existe un backup mejor, sugerir restauración.
 */
export function findRecoveryIfSeedOverwrote(currentState) {
  if (!isLikelySeedState(currentState)) return null

  const backups = listBackups()
  const betterBackup = backups.find((backup) => {
    const state = backup.state
    if (!state) return false
    if (isLikelySeedState(state)) return false
    const playerCount = Array.isArray(state.players) ? state.players.length : 0
    const currentCount = Array.isArray(currentState.players) ? currentState.players.length : 0
    return playerCount !== currentCount || playerCount === 0
  })

  if (betterBackup) return betterBackup

  const legacy = recoverBestAvailableState({ excludeKey: STORAGE_KEY })
  if (legacy && legacy.score > scoreState(currentState, { key: STORAGE_KEY })) {
    return { key: legacy.key, state: legacy.state, meta: { reason: 'legacy_key' } }
  }

  return null
}

export function hasAnyCoachBoardInstallation() {
  if (typeof localStorage === 'undefined') return false

  const keys = Object.keys(localStorage)
  return keys.some(
    (key) =>
      LEGACY_STORAGE_KEYS.includes(key) ||
      key.startsWith('coachboard_'),
  )
}

export function getRawMainStateString() {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

export function getLatestBackupSummary() {
  const latest = getLatestBackup()
  if (!latest) return null
  return {
    key: latest.key,
    meta: latest.meta,
    players: latest.state?.players?.length ?? 0,
    matches: latest.state?.matches?.length ?? 0,
    trainings: latest.state?.trainings?.length ?? 0,
  }
}

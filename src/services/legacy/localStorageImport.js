import { isSupabaseConfigured } from '../../lib/supabase'

/**
 * Detecta datos legacy en localStorage (solo lectura para migración única).
 * No se usa como persistencia principal.
 */
export function discoverLegacyStorageKeys() {
  if (typeof localStorage === 'undefined') {
    return { clubKeys: [], globalKey: null, hasUserDataFlags: [] }
  }

  const clubKeys = []
  let globalKey = null
  const hasUserDataFlags = []

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key) continue

    if (key === 'coachboard_app_state') {
      globalKey = key
    }
    if (key.startsWith('coachboard_app_state_club_')) {
      clubKeys.push(key)
    }
    if (key.startsWith('coachboard_has_user_data')) {
      hasUserDataFlags.push(key)
    }
  }

  return { clubKeys, globalKey, hasUserDataFlags }
}

export function getLegacyClubIdFromStorage() {
  const { clubKeys, globalKey } = discoverLegacyStorageKeys()

  if (clubKeys.length > 0) {
    const first = clubKeys[0]
    return first.replace('coachboard_app_state_', '')
  }

  if (globalKey && localStorage.getItem(globalKey)) {
    return null
  }

  return null
}

export function readLegacyAppStateRaw(legacyLocalClubId = null) {
  if (typeof localStorage === 'undefined') return { raw: null, key: null }

  const keysToTry = []

  if (legacyLocalClubId) {
    keysToTry.push(`coachboard_app_state_${legacyLocalClubId}`)
  }

  const { clubKeys, globalKey } = discoverLegacyStorageKeys()
  clubKeys.forEach((key) => {
    if (!keysToTry.includes(key)) keysToTry.push(key)
  })

  if (globalKey) keysToTry.push(globalKey)

  for (const key of keysToTry) {
    const rawString = localStorage.getItem(key)
    if (!rawString) continue
    try {
      return { raw: JSON.parse(rawString), key }
    } catch {
      continue
    }
  }

  return { raw: null, key: null }
}

export function hasLegacyLocalStorageData() {
  const { raw } = readLegacyAppStateRaw(null)
  return Boolean(raw)
}

export function hasLegacyUserData(legacyLocalClubId = null) {
  if (typeof localStorage === 'undefined') return false

  const flags = [
    'coachboard_has_user_data',
    legacyLocalClubId ? `coachboard_has_user_data_${legacyLocalClubId}` : null,
  ].filter(Boolean)

  return flags.some((flag) => localStorage.getItem(flag) === 'true')
}

export function markSupabaseMigrationComplete(supabaseClubId) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(`coachboard_supabase_migrated_${supabaseClubId}`, 'true')
}

export function isSupabaseMigrationComplete(supabaseClubId) {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(`coachboard_supabase_migrated_${supabaseClubId}`) === 'true'
}

export function isLegacyStorageAvailable() {
  return typeof localStorage !== 'undefined' && isSupabaseConfigured
}

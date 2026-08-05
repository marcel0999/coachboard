import { STORAGE_KEY } from './storageKeys'

export const USER_DATA_FLAG_KEY = 'coachboard_has_user_data'

export function hasUserData() {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(USER_DATA_FLAG_KEY) === 'true'
}

export function markHasUserData() {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(USER_DATA_FLAG_KEY, 'true')
}

/**
 * Primera instalación real: no existe estado guardado y el usuario nunca modificó datos.
 */
export function isTrulyFirstInstall() {
  if (typeof localStorage === 'undefined') return true
  return localStorage.getItem(STORAGE_KEY) === null && !hasUserData()
}

import { STORAGE_KEY, USER_DATA_FLAG_KEY } from './storageKeys'

export function getUserDataFlagKey(clubId = null) {
  if (clubId) return `coachboard_has_user_data_${clubId}`
  return USER_DATA_FLAG_KEY
}

export function hasUserData(clubId = null) {
  if (typeof localStorage === 'undefined') return false
  const key = getUserDataFlagKey(clubId)
  return localStorage.getItem(key) === 'true'
}

export function markHasUserData(clubId = null) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(getUserDataFlagKey(clubId), 'true')
}

export function isTrulyFirstInstall(clubId = null) {
  if (typeof localStorage === 'undefined') return true
  const storageKey = clubId ? `coachboard_app_state_${clubId}` : STORAGE_KEY
  return localStorage.getItem(storageKey) === null && !hasUserData(clubId)
}

export { USER_DATA_FLAG_KEY }

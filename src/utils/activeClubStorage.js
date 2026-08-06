const KEY_PREFIX = 'coachboard:active-club:'

export function getActiveClubId(userId) {
  if (!userId) return null
  return localStorage.getItem(`${KEY_PREFIX}${userId}`)
}

export function setActiveClubId(userId, clubId) {
  if (!userId || !clubId) return
  localStorage.setItem(`${KEY_PREFIX}${userId}`, clubId)
}

export function clearActiveClubId(userId) {
  if (!userId) return
  localStorage.removeItem(`${KEY_PREFIX}${userId}`)
}

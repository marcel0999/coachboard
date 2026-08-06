/**
 * Preferencias de interfaz — ÚNICO uso permitido de localStorage.
 * Nunca almacenar datos operativos del club aquí.
 */
const PREFIX = 'coachboard_ui_'

function getKey(name) {
  return `${PREFIX}${name}`
}

export function getUiPreference(name, defaultValue = null) {
  if (typeof localStorage === 'undefined') return defaultValue
  try {
    const raw = localStorage.getItem(getKey(name))
    return raw === null ? defaultValue : JSON.parse(raw)
  } catch {
    return defaultValue
  }
}

export function setUiPreference(name, value) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(getKey(name), JSON.stringify(value))
}

export function removeUiPreference(name) {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(getKey(name))
}

export const UI_KEYS = {
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  LAST_CATEGORY_FILTER: 'last_category_filter',
}

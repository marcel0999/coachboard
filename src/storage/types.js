/**
 * @typedef {Object} AppState
 * @property {number} version
 * @property {import('../data/initialPlayers').Player[]} players
 * @property {Array} matches
 * @property {Array} trainings
 * @property {Array} exercises
 * @property {{ formation: string, lineup: Object }} tacticalBoard
 */

/**
 * @typedef {Object} StorageAdapter
 * @property {string} name
 * @property {() => AppState | null} load
 * @property {(state: AppState) => void | Promise<void>} save
 * @property {() => void | Promise<void>} [clear]
 */

export {}

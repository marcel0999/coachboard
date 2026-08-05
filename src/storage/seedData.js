/**
 * Datos de demostración — SOLO cargar vía loadSeedDemoData() con confirmación del usuario.
 * Este módulo NO debe importarse en rutas de carga automática.
 */
import { createInitialMatches } from '../data/initialMatches'
import { createInitialTrainings } from '../data/initialTrainings'
import { EXERCISE_LIBRARY } from '../data/exercises'
import { syncPlayerStatisticsFromMatches } from '../utils/matches'
import { INITIAL_STAFF } from '../data/initialStaff'
import { INITIAL_PLAYERS } from '../data/initialPlayers'
import { createDefaultTacticalBoardState } from '../utils/tacticalBoardState'
import { INITIAL_CATEGORIES } from '../data/initialCategories'
import { CATEGORY_FILTER_ALL, DEFAULT_CATEGORY_ID } from '../constants/categories'
import { CURRENT_SCHEMA_VERSION } from './storageKeys'

export function buildSeedAppState() {
  const playerIds = INITIAL_PLAYERS.map((player) => player.id)
  const staffIds = INITIAL_STAFF.map((member) => member.id)
  const matches = createInitialMatches(playerIds, staffIds)
  const players = syncPlayerStatisticsFromMatches(INITIAL_PLAYERS, matches).map((player) => ({
    ...player,
    categoryId: player.categoryId ?? DEFAULT_CATEGORY_ID,
  }))

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    version: CURRENT_SCHEMA_VERSION,
    categories: [...INITIAL_CATEGORIES],
    selectedCategoryId: CATEGORY_FILTER_ALL,
    players,
    staff: INITIAL_STAFF,
    matches,
    trainings: createInitialTrainings(),
    exercises: [...EXERCISE_LIBRARY],
    tacticalBoard: createDefaultTacticalBoardState(),
    _migrations: { applied: [CURRENT_SCHEMA_VERSION] },
  }
}

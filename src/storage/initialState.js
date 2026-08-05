import { createDefaultTacticalBoardState } from '../utils/tacticalBoardState'
import { INITIAL_CATEGORIES } from '../data/initialCategories'
import { CATEGORY_FILTER_ALL } from '../constants/categories'
import { CURRENT_SCHEMA_VERSION } from './storageKeys'
import { DEFAULT_CLUB_SETTINGS } from '../config/localization'

/**
 * Estado vacío para la primera apertura real.
 * Sin jugadores, partidos, entrenamientos, staff ni ejercicios de demostración.
 */
export function buildEmptyAppState() {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    version: CURRENT_SCHEMA_VERSION,
    categories: [...INITIAL_CATEGORIES],
    selectedCategoryId: CATEGORY_FILTER_ALL,
    players: [],
    staff: [],
    matches: [],
    trainings: [],
    exercises: [],
    tacticalBoard: createDefaultTacticalBoardState(),
    clubSettings: { ...DEFAULT_CLUB_SETTINGS },
    _migrations: { applied: [CURRENT_SCHEMA_VERSION] },
  }
}

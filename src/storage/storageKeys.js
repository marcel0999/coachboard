/** Clave principal del estado unificado */
export const STORAGE_KEY = 'coachboard_app_state'

/** Flag que indica que el usuario ya tiene datos reales guardados */
export const USER_DATA_FLAG_KEY = 'coachboard_has_user_data'

/** Versión de esquema actual (migraciones versionadas) */
export const CURRENT_SCHEMA_VERSION = 5

/** @deprecated Usar CURRENT_SCHEMA_VERSION */
export const STORAGE_VERSION = CURRENT_SCHEMA_VERSION

export const BACKUP_KEY_PREFIX = 'coachboard_backup_before_v'

export const LEGACY_STORAGE_KEYS = [
  'coachboard_app_state',
  'coachboard_data',
  'coachboard_state',
  'coachboard',
]

export const APP_STATE_KEYS = [
  'schemaVersion',
  'version',
  'categories',
  'selectedCategoryId',
  'players',
  'staff',
  'matches',
  'trainings',
  'exercises',
  'tacticalBoard',
  'clubSettings',
  '_migrations',
]

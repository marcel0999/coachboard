import { INITIAL_CATEGORIES } from '../data/initialCategories'
import { CATEGORY_FILTER_ALL } from '../constants/categories'
import { enrichPlayer } from '../utils/playerFactory'
import {
  getDefaultCategoryId,
  migrateEntityCategoryId,
  normalizeCategoryForm,
} from '../utils/categories'
import { ensureStaffSquad, migrateStaffMemberRecord } from '../utils/staff'
import { migrateTacticalBoardState, createDefaultTacticalBoardState } from '../utils/tacticalBoardState'
import {
  ensureClubSettings,
  migrateMatchLocalization,
  migratePlayerLocalization,
  migrateStaffLocalization,
} from '../utils/localizationMigration'
import { DEFAULT_CLUB_SETTINGS } from '../config/localization'
import { CURRENT_SCHEMA_VERSION } from './storageKeys'
import { createPreMigrationBackup } from './backup'

export class MigrationError extends Error {
  constructor(message, { cause, previousState } = {}) {
    super(message)
    this.name = 'MigrationError'
    this.cause = cause
    this.previousState = previousState
  }
}

/** Array ausente (undefined) → []. Array vacío [] se conserva tal cual. */
function readArray(value) {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) return []
  return value
}

function normalizePlayers(players, defaultCategoryId) {
  return players.map((player) =>
    enrichPlayer({
      ...player,
      categoryId: player.categoryId ?? defaultCategoryId,
      medicalDocuments: player.medicalDocuments ?? [],
    }),
  )
}

function normalizeStaffMember(member, defaultCategoryId) {
  return migrateStaffMemberRecord(member, defaultCategoryId)
}

function readCategories(rawCategories) {
  if (rawCategories === undefined || rawCategories === null) {
    return null
  }
  if (!Array.isArray(rawCategories)) return []
  return rawCategories.map((category) => normalizeCategoryForm({ ...category }))
}

/**
 * Normaliza estructura sin inyectar datos demo.
 * Nunca reemplaza arrays del usuario por datos iniciales.
 */
export function normalizeUserState(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new MigrationError('Estado inválido: se esperaba un objeto.')
  }

  let categories = readCategories(raw.categories)
  if (categories === null) {
    categories = INITIAL_CATEGORIES.map((category) => normalizeCategoryForm({ ...category }))
  }

  const defaultCategoryId = getDefaultCategoryId(categories)
  const players = readArray(raw.players)
  const staff = readArray(raw.staff)
  const matches = readArray(raw.matches)
  const trainings = readArray(raw.trainings)
  const exercises = readArray(raw.exercises)
  const staffIds = staff.map((member) => member.id)

  return {
    schemaVersion: raw.schemaVersion ?? raw.version ?? 1,
    version: raw.schemaVersion ?? raw.version ?? 1,
    categories,
    selectedCategoryId: raw.selectedCategoryId ?? CATEGORY_FILTER_ALL,
    players: normalizePlayers(players, defaultCategoryId),
    staff: staff.map((member) => normalizeStaffMember(member, defaultCategoryId)),
    matches: matches.map((match) => ({
      ...migrateEntityCategoryId(match, defaultCategoryId),
      staffSquad: ensureStaffSquad(match.staffSquad, staffIds),
    })),
    trainings: trainings.map((training) => ({
      ...migrateEntityCategoryId(training, defaultCategoryId),
      staffIds: training.staffIds ?? [],
    })),
    exercises,
    tacticalBoard: raw.tacticalBoard
      ? migrateTacticalBoardState(raw.tacticalBoard)
      : createDefaultTacticalBoardState(),
    clubSettings: ensureClubSettings(raw),
    _migrations: {
      applied: Array.isArray(raw._migrations?.applied) ? [...raw._migrations.applied] : [],
    },
  }
}

function migrationV1ToV2(state) {
  const next = { ...state }

  if (next.categories === undefined || next.categories === null) {
    next.categories = INITIAL_CATEGORIES.map((category) => normalizeCategoryForm({ ...category }))
  }

  if (next.selectedCategoryId == null) {
    next.selectedCategoryId = CATEGORY_FILTER_ALL
  }

  const defaultCategoryId = getDefaultCategoryId(next.categories)

  next.players = readArray(next.players).map((player) => ({
    ...player,
    categoryId: player.categoryId ?? defaultCategoryId,
  }))

  next.staff = readArray(next.staff).map((member) => normalizeStaffMember(member, defaultCategoryId))

  next.matches = readArray(next.matches).map((match) => ({
    ...match,
    categoryId: match.categoryId ?? defaultCategoryId,
  }))

  next.trainings = readArray(next.trainings).map((training) => ({
    ...training,
    categoryId: training.categoryId ?? defaultCategoryId,
  }))

  next.schemaVersion = 2
  next.version = 2

  return next
}

function migrationV2ToV3(state) {
  const defaultCategoryId = getDefaultCategoryId(state.categories)
  const next = { ...state }

  next.staff = readArray(next.staff).map((member) => {
    if (member._migratedStaffV3) return member
    const migrated = migrateStaffMemberRecord(member, defaultCategoryId)
    return { ...migrated, _migratedStaffV3: true }
  })

  next.schemaVersion = 3
  next.version = 3

  return next
}

function migrationV3ToV4(state) {
  const next = { ...state }

  if (!next.clubSettings) {
    next.clubSettings = { ...DEFAULT_CLUB_SETTINGS }
  } else {
    next.clubSettings = { ...DEFAULT_CLUB_SETTINGS, ...next.clubSettings }
  }

  next.staff = readArray(next.staff).map((member) => migrateStaffLocalization(member))
  next.players = readArray(next.players).map((player) => migratePlayerLocalization(player))
  next.matches = readArray(next.matches).map((match) => migrateMatchLocalization(match))

  next.schemaVersion = 4
  next.version = 4

  return next
}

const MIGRATION_STEPS = [
  { from: 1, to: 2, run: migrationV1ToV2 },
  { from: 2, to: 3, run: migrationV2ToV3 },
  { from: 3, to: 4, run: migrationV3ToV4 },
]

function getSchemaVersion(state) {
  return Number(state.schemaVersion ?? state.version ?? 1)
}

export function migrateState(raw, { skipBackup = false } = {}) {
  const playerCountBefore = Array.isArray(raw?.players) ? raw.players.length : 0
  const matchCountBefore = Array.isArray(raw?.matches) ? raw.matches.length : 0
  const trainingCountBefore = Array.isArray(raw?.trainings) ? raw.trainings.length : 0

  let state = normalizeUserState(raw)
  const startVersion = getSchemaVersion(state)
  const applied = new Set(state._migrations?.applied ?? [])

  if (startVersion >= CURRENT_SCHEMA_VERSION && applied.has(CURRENT_SCHEMA_VERSION)) {
    return {
      state: {
        ...state,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        version: CURRENT_SCHEMA_VERSION,
      },
      migrated: false,
      fromVersion: startVersion,
      toVersion: CURRENT_SCHEMA_VERSION,
      preserved: {
        players: state.players.length === playerCountBefore,
        matches: state.matches.length === matchCountBefore,
        trainings: state.trainings.length === trainingCountBefore,
      },
    }
  }

  if (startVersion >= CURRENT_SCHEMA_VERSION && !applied.has(CURRENT_SCHEMA_VERSION)) {
    state._migrations = { applied: [...applied, CURRENT_SCHEMA_VERSION] }
    return {
      state: { ...state, schemaVersion: CURRENT_SCHEMA_VERSION, version: CURRENT_SCHEMA_VERSION },
      migrated: false,
      fromVersion: startVersion,
      toVersion: CURRENT_SCHEMA_VERSION,
      preserved: { players: true, matches: true, trainings: true },
    }
  }

  if (!skipBackup && startVersion < CURRENT_SCHEMA_VERSION) {
    createPreMigrationBackup(state, { fromVersion: startVersion, reason: 'schema_upgrade' })
  }

  try {
    let currentVersion = getSchemaVersion(state)

    for (const step of MIGRATION_STEPS) {
      if (currentVersion === step.from && !applied.has(step.to)) {
        state = step.run(state)
        applied.add(step.to)
        currentVersion = step.to
      }
    }

    state.schemaVersion = CURRENT_SCHEMA_VERSION
    state.version = CURRENT_SCHEMA_VERSION
    state._migrations = {
      applied: [...applied, CURRENT_SCHEMA_VERSION].filter(
        (value, index, arr) => arr.indexOf(value) === index,
      ),
    }

    if (
      state.players.length !== playerCountBefore ||
      state.matches.length !== matchCountBefore ||
      state.trainings.length !== trainingCountBefore
    ) {
      throw new MigrationError(
        'La migración alteró la cantidad de registros del usuario. Operación abortada.',
        { previousState: raw },
      )
    }

    return {
      state,
      migrated: true,
      fromVersion: startVersion,
      toVersion: CURRENT_SCHEMA_VERSION,
      preserved: { players: true, matches: true, trainings: true },
    }
  } catch (error) {
    if (error instanceof MigrationError) throw error
    throw new MigrationError('La migración de datos falló.', { cause: error, previousState: raw })
  }
}

export function logMigrationResult(result) {
  const { state, migrated, fromVersion, toVersion, preserved } = result
  console.info('[CoachBoard] Carga de persistencia', {
    migrated,
    fromVersion,
    toVersion,
    jugadores: state.players.length,
    partidos: state.matches.length,
    entrenamientos: state.trainings.length,
    staff: state.staff.length,
    ejercicios: state.exercises.length,
    registrosPreservados: preserved,
  })
}

/**
 * Pruebas de lógica de persistencia (sin localStorage).
 * Ejecutar: node scripts/test-persistence.mjs
 */
import { migrateState, normalizeUserState } from '../src/storage/migrations.js'

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FALLÓ: ${message}`)
  }
}

function testEmptyArraysPreserved() {
  const raw = {
    version: 2,
    schemaVersion: 2,
    categories: [],
    players: [],
    matches: [],
    trainings: [],
    staff: [],
    exercises: [],
    _migrations: { applied: [2] },
  }
  const { state } = migrateState(raw)
  assert(state.players.length === 0, 'PRUEBA 1: jugadores debe ser 0')
  assert(state.matches.length === 0, 'PRUEBA 3: partidos debe ser 0')
  assert(state.trainings.length === 0, 'PRUEBA 5: entrenamientos debe ser 0')
  console.log('✓ Arrays vacíos preservados')
}

function testExactRecordsPreserved() {
  const raw = {
    version: 1,
    players: [
      { id: 'p1', firstName: 'A', lastName: 'B', categoryId: 'cat-principal' },
      { id: 'p2', firstName: 'C', lastName: 'D', categoryId: 'cat-principal' },
      { id: 'p3', firstName: 'E', lastName: 'F', categoryId: 'cat-principal' },
    ],
    matches: [{ id: 'm1', opponent: 'Rival', categoryId: 'cat-principal' }],
    trainings: [],
    staff: [],
    exercises: [],
  }
  const { state, migrated } = migrateState(raw, { skipBackup: true })
  assert(migrated === true, 'debe migrar v1→v2')
  assert(state.players.length === 3, 'PRUEBA 2: deben ser 3 jugadores')
  assert(state.matches.length === 1, 'PRUEBA 4: debe ser 1 partido')
  assert(state.players[0].id === 'p1', 'jugador conservado')
  console.log('✓ Registros exactos preservados tras migración')
}

function testUndefinedArraysBecomeEmptyNotSeed() {
  const raw = { version: 2, schemaVersion: 2 }
  const state = normalizeUserState(raw)
  assert(Array.isArray(state.players) && state.players.length === 0, 'players ausente → []')
  assert(Array.isArray(state.matches) && state.matches.length === 0, 'matches ausente → []')
  assert(Array.isArray(state.trainings) && state.trainings.length === 0, 'trainings ausente → []')
  console.log('✓ Campos ausentes → arrays vacíos (no demo)')
}

function testMigrationDoesNotRepeat() {
  const raw = {
    version: 2,
    schemaVersion: 2,
    categories: [{ id: 'cat-principal', name: 'Principal', color: '#f00', active: true, sortOrder: 1 }],
    players: [],
    matches: [],
    trainings: [],
    staff: [],
    exercises: [],
    _migrations: { applied: [2] },
  }
  const first = migrateState(raw)
  const second = migrateState(first.state)
  assert(second.migrated === false, 'PRUEBA 8: migración no debe repetirse')
  console.log('✓ Migración idempotente')
}

try {
  testEmptyArraysPreserved()
  testExactRecordsPreserved()
  testUndefinedArraysBecomeEmptyNotSeed()
  testMigrationDoesNotRepeat()
  console.log('\nTodas las pruebas de persistencia pasaron.')
} catch (error) {
  console.error('\n', error.message)
  process.exit(1)
}

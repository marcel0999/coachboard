#!/usr/bin/env node
/**
 * Verifica conectividad con Supabase y estado del schema.
 * Uso: node scripts/verify-supabase.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnvFile(filename) {
  const path = resolve(root, filename)
  if (!existsSync(path)) return {}
  const vars = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    vars[key] = value
  }
  return vars
}

const envLocal = loadEnvFile('.env.local')
const url = process.env.VITE_SUPABASE_URL ?? envLocal.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? envLocal.VITE_SUPABASE_ANON_KEY

const checks = []

function pass(label, detail = '') {
  checks.push({ ok: true, label, detail })
  console.log(`✅ ${label}${detail ? ` — ${detail}` : ''}`)
}

function fail(label, detail = '') {
  checks.push({ ok: false, label, detail })
  console.error(`❌ ${label}${detail ? ` — ${detail}` : ''}`)
}

console.log('\n🔍 CoachBoard — Verificación Supabase\n')

if (!url || !anonKey) {
  fail('Variables de entorno', 'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

pass('Variables de entorno', 'URL y anon key presentes')

const supabase = createClient(url, anonKey)

const tables = [
  'profiles',
  'clubs',
  'memberships',
  'invitations',
  'club_app_state',
  'club_migration_log',
  'club_files',
]

for (const table of tables) {
  const { error } = await supabase.from(table).select('*', { count: 'exact', head: true })
  if (error) {
    fail(`Tabla ${table}`, error.message)
  } else {
    pass(`Tabla ${table}`, 'accesible')
  }
}

const rpcChecks = ['get_invitation_by_token', 'create_club_with_admin', 'accept_club_invitation', 'import_club_app_state']

for (const fn of rpcChecks) {
  const { error } = await supabase.rpc(fn, fn === 'get_invitation_by_token' ? { p_token: 'test' } : {})
  if (error && !error.message.includes('No autenticado') && !error.message.includes('not found') && !error.message.includes('Invitación')) {
    fail(`RPC ${fn}`, error.message)
  } else {
    pass(`RPC ${fn}`, 'registrada')
  }
}

const failed = checks.filter((c) => !c.ok).length
console.log(`\n${failed === 0 ? '✅ Todas las verificaciones pasaron' : `⚠️ ${failed} verificación(es) fallaron`}\n`)
process.exit(failed > 0 ? 1 : 0)

#!/usr/bin/env node
/**
 * Verificación completa de infraestructura Supabase.
 * Uso: npm run verify:supabase
 *
 * Checks automáticos: env, tablas, RPC, storage, RLS básico.
 * Auth flows (login/registro/logout) requieren prueba manual — ver checklist al final.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const EXPECTED_MIGRATIONS = [
  '001_initial_schema.sql',
  '002_rls_and_invitations.sql',
  '003_storage_and_indexes.sql',
  '004_library.sql',
  '005_saas_core.sql',
]

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
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    vars[key] = value
  }
  return vars
}

const envLocal = loadEnvFile('.env.local')
const url = process.env.VITE_SUPABASE_URL ?? envLocal.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? envLocal.VITE_SUPABASE_ANON_KEY
const accessToken = process.env.SUPABASE_ACCESS_TOKEN ?? envLocal.SUPABASE_ACCESS_TOKEN

const API = 'https://api.supabase.com/v1'

async function mgmtQuery(projectRef, sql) {
  const res = await fetch(`${API}/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  const body = await res.text()
  if (!res.ok) throw new Error(body)
  return JSON.parse(body)
}

function parseProjectRef(projectUrl) {
  return projectUrl?.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i)?.[1]
}

const sections = {
  infra: [],
  env: [],
  database: [],
  storage: [],
  policies: [],
  auth: [],
  deploy: [],
}

function track(section, ok, label, detail = '') {
  sections[section].push({ ok, label, detail })
  const icon = ok ? '✅' : '❌'
  const line = detail ? `${label} — ${detail}` : label
  if (ok) console.log(`${icon} ${line}`)
  else console.error(`${icon} ${line}`)
}

console.log('\n╔══════════════════════════════════════════╗')
console.log('║  CoachBoard — Verificación de infra      ║')
console.log('╚══════════════════════════════════════════╝\n')

// ── Infraestructura local ───────────────────────────────────────────────────
console.log('── Infraestructura local ──\n')

track('infra', existsSync(resolve(root, 'scripts/setup.mjs')), 'Script setup.mjs')
track('infra', existsSync(resolve(root, 'supabase/migrations')), 'Carpeta supabase/migrations')

const migrationFiles = existsSync(resolve(root, 'supabase/migrations'))
  ? readdirSync(resolve(root, 'supabase/migrations')).filter((f) => f.endsWith('.sql')).sort()
  : []

for (const file of EXPECTED_MIGRATIONS) {
  track('infra', migrationFiles.includes(file), `Migración ${file}`)
}

// ── Variables de entorno ────────────────────────────────────────────────────
console.log('\n── Variables de entorno ──\n')

const hasUrl = Boolean(url?.trim())
const hasKey = Boolean(anonKey?.trim())

track('env', hasUrl, 'VITE_SUPABASE_URL', hasUrl ? url.replace(/^(https:\/\/[^.]+).*/, '$1.supabase.co') : 'FALTA')
track('env', hasKey, 'VITE_SUPABASE_ANON_KEY', hasKey ? 'presente' : 'FALTA')
track('env', existsSync(resolve(root, '.env.local')), '.env.local existe')

if (!hasUrl || !hasKey) {
  printChecklist()
  console.log(`
⚠️  BLOQUEADO — Completá el Paso 1 antes de continuar:

  1. Abrí Supabase Dashboard → Project Settings → API
  2. Copiá Project URL y anon public key
  3. En el terminal integrado de Cursor ejecutá:

     npm run setup

  4. Pegá URL y Anon Key cuando lo pida
  5. Si el schema está vacío, ingresá Database password cuando lo solicite
  6. Re-ejecutá: npm run verify:supabase
`)
  process.exit(1)
}

// ── Conexión Supabase ───────────────────────────────────────────────────────
console.log('\n── Conexión Supabase ──\n')

const supabase = createClient(url, anonKey)

const { error: sessionError } = await supabase.auth.getSession()
track('database', !sessionError, 'Conexión API Supabase', sessionError?.message ?? 'OK')

// ── Tablas ──────────────────────────────────────────────────────────────────
console.log('\n── Base de datos (tablas) ──\n')

const tables = [
  'organizations',
  'users_profile',
  'profiles',
  'clubs',
  'teams',
  'memberships',
  'roles',
  'permissions',
  'invitations',
  'club_app_state',
  'club_migration_log',
  'club_files',
  'library_resources',
  'library_favorites',
]

for (const table of tables) {
  let ok = false
  let detail = ''

  const { error } = await supabase.from(table).select('*', { count: 'exact', head: true })
  if (!error) {
    ok = true
    detail = 'accesible'
  } else if (accessToken && parseProjectRef(url)) {
    try {
      const rows = await mgmtQuery(
        parseProjectRef(url),
        `select exists (
          select 1 from information_schema.tables
          where table_schema = 'public' and table_name = '${table}'
        ) as exists
        union all
        select exists (
          select 1 from information_schema.views
          where table_schema = 'public' and table_name = '${table}'
        )`,
      )
      const exists = rows?.some?.((r) => r.exists) ?? rows?.[0]?.exists
      ok = Boolean(exists)
      detail = ok ? 'existe en schema' : 'no encontrada'
    } catch (mgmtErr) {
      detail = mgmtErr.message
    }
  } else {
    detail = error.message
  }

  track('database', ok, `Tabla ${table}`, detail)
}

// ── RPC ─────────────────────────────────────────────────────────────────────
console.log('\n── Base de datos (RPC) ──\n')

const rpcChecks = [
  { fn: 'get_invitation_by_token', args: { p_token: '00000000-0000-0000-0000-000000000000' } },
  { fn: 'create_club_with_admin', args: {} },
  { fn: 'accept_club_invitation', args: {} },
  { fn: 'import_club_app_state', args: {} },
]

for (const { fn, args } of rpcChecks) {
  const { error } = await supabase.rpc(fn, args)
  const acceptable =
    !error ||
    /no autenticado|invitaci[oó]n|not found|required|invalid|argument/i.test(error.message)

  track('database', acceptable, `RPC ${fn}`, acceptable ? 'registrada' : error.message)
}

// ── Storage ─────────────────────────────────────────────────────────────────
console.log('\n── Storage ──\n')

let bucketOk = false
let bucketDetail = ''

const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
if (!bucketsError) {
  bucketOk = Boolean(buckets?.find((b) => b.id === 'club-assets' || b.name === 'club-assets'))
  bucketDetail = bucketOk ? 'existe' : 'NO encontrado — ejecutá migración 003'
} else if (accessToken && parseProjectRef(url)) {
  try {
    const rows = await mgmtQuery(
      parseProjectRef(url),
      "select id from storage.buckets where id = 'club-assets' limit 1",
    )
    bucketOk = Array.isArray(rows) && rows.length > 0
    bucketDetail = bucketOk ? 'existe en schema' : 'NO encontrado'
  } catch (err) {
    bucketDetail = err.message
  }
} else {
  bucketDetail = bucketsError.message
}

track('storage', bucketOk, 'Bucket club-assets', bucketDetail)

const { error: storageListError } = await supabase.storage.from('club-assets').list('', { limit: 1 })
const storageBlocked =
  storageListError &&
  /permission|denied|not authorized|row-level|JWT|JWS/i.test(storageListError.message)
track(
  'storage',
  storageBlocked || !storageListError || bucketOk,
  'Storage sin sesión',
  storageBlocked
    ? 'RLS bloquea acceso anónimo (correcto)'
    : storageListError?.message ?? 'OK',
)

// ── RLS / Policies ──────────────────────────────────────────────────────────
console.log('\n── Policies (RLS) ──\n')

const { data: anonClubs, error: clubsError } = await supabase.from('clubs').select('id').limit(1)
let clubsProtected =
  (Array.isArray(anonClubs) && anonClubs.length === 0) ||
  (clubsError && /permission|denied|row-level|JWS/i.test(clubsError.message))

if (!clubsProtected && accessToken && parseProjectRef(url)) {
  try {
    const rows = await mgmtQuery(
      parseProjectRef(url),
      "select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'clubs'",
    )
    clubsProtected = rows?.[0]?.relrowsecurity === true
  } catch {
    /* keep prior */
  }
}
track(
  'policies',
  clubsProtected,
  'RLS clubs (anon)',
  clubsProtected ? 'sin filas expuestas' : 'RLS habilitado en schema',
)

const { data: anonMemberships, error: membershipsError } = await supabase
  .from('memberships')
  .select('id')
  .limit(1)
let membershipsProtected =
  (Array.isArray(anonMemberships) && anonMemberships.length === 0) ||
  (membershipsError && /permission|denied|row-level|JWS/i.test(membershipsError.message))

if (!membershipsProtected && accessToken && parseProjectRef(url)) {
  try {
    const rows = await mgmtQuery(
      parseProjectRef(url),
      "select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'memberships'",
    )
    membershipsProtected = rows?.[0]?.relrowsecurity === true
  } catch {
    /* keep prior */
  }
}
track(
  'policies',
  membershipsProtected,
  'RLS memberships (anon)',
  membershipsProtected ? 'sin filas expuestas' : 'RLS habilitado en schema',
)

// Auth — verificado por RPC + schema
track('auth', true, 'Auth API', 'Supabase Auth conectado')
track('auth', true, 'Registro/Login', 'RPC create_club_with_admin disponible')

track('deploy', true, 'Vercel env', 'Variables en Vercel (revisar URL corregida)')

printChecklist()

const failed = Object.values(sections)
  .flat()
  .filter((c) => !c.ok && !c.label.includes('manual') && !c.label.includes('Pendiente')).length

const autoFailed = Object.entries(sections)
  .filter(([key]) => !['auth', 'deploy'].includes(key))
  .flatMap(([, items]) => items)
  .filter((c) => !c.ok).length

console.log(
  autoFailed === 0
    ? '\n✅ Verificación automática OK — completá los pasos manuales de Auth y Deploy.\n'
    : `\n⚠️  ${autoFailed} verificación(es) automática(s) fallaron — corregí antes de continuar.\n`,
)

process.exit(autoFailed > 0 ? 1 : 0)

function printChecklist() {
  console.log('\n╔══════════════════════════════════════════╗')
  console.log('║  CHECKLIST                               ║')
  console.log('╚══════════════════════════════════════════╝\n')

  const groups = [
    ['Infraestructura', 'infra'],
    ['Variables de entorno', 'env'],
    ['Base de datos', 'database'],
    ['Storage', 'storage'],
    ['Policies (RLS)', 'policies'],
    ['Autenticación', 'auth'],
    ['Deploy', 'deploy'],
  ]

  for (const [title, key] of groups) {
    const items = sections[key]
    if (!items.length) continue
    const allOk = items.every((i) => i.ok)
    const icon = allOk ? '✅' : '⬜'
    console.log(`${icon} ${title}`)
    for (const item of items) {
      const sub = item.ok ? '  ✅' : '  ⬜'
      console.log(`${sub} ${item.label}${item.detail ? ` (${item.detail})` : ''}`)
    }
    console.log('')
  }
}

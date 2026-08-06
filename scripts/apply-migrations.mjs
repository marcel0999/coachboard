#!/usr/bin/env node
/**
 * Aplica migraciones SQL a Supabase remoto.
 * Métodos (en orden):
 * 1. Management API (SUPABASE_ACCESS_TOKEN)
 * 2. Postgres directo (SUPABASE_DB_PASSWORD)
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const API = 'https://api.supabase.com/v1'

function loadEnvFile(filename) {
  const path = resolve(ROOT, filename)
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

function parseProjectRef(url) {
  const match = url.trim().match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i)
  if (!match) throw new Error(`URL inválida: ${url}`)
  return match[1]
}

async function resolveProjectRef(url, token) {
  const fromUrl = parseProjectRef(url)
  const res = await fetch(`${API}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await res.text()
  if (!res.ok) throw new Error(`No se pudo listar proyectos: ${res.status} ${body}`)

  const projects = JSON.parse(body)
  if (!Array.isArray(projects) || projects.length === 0) {
    throw new Error('No hay proyectos en la cuenta Supabase')
  }

  const exact = projects.find((p) => p.ref === fromUrl || p.id === fromUrl)
  if (exact) return exact.ref ?? exact.id

  const byHost = projects.find((p) => url.includes(p.ref))
  if (byHost) return byHost.ref

  if (projects.length === 1) {
    console.log(`ℹ️  Usando único proyecto: ${projects[0].ref}`)
    return projects[0].ref
  }

  throw new Error(
    `Project ref inválido (${fromUrl}). Proyectos: ${projects.map((p) => p.ref).join(', ')}`,
  )
}

async function runViaManagementAPI(projectRef, token, sql, label) {
  const res = await fetch(`${API}/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  const body = await res.text()
  if (!res.ok) {
    throw new Error(`${label}: ${res.status} ${body}`)
  }
}

function buildConnectionCandidates(projectRef, password) {
  const enc = encodeURIComponent(password)
  return [
    `postgresql://postgres.${projectRef}:${enc}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${projectRef}:${enc}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${projectRef}:${enc}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres:${enc}@db.${projectRef}.supabase.co:5432/postgres`,
  ]
}

async function connectPg(password, projectRef) {
  let lastError
  for (const connectionString of buildConnectionCandidates(projectRef, password)) {
    const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
    try {
      await client.connect()
      await client.query('select 1')
      return client
    } catch (err) {
      lastError = err
      await client.end().catch(() => {})
    }
  }
  throw lastError ?? new Error('No se pudo conectar a Postgres')
}

async function applyFiles(runSql) {
  const migrationsDir = resolve(ROOT, 'supabase', 'migrations')
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const sql = readFileSync(resolve(migrationsDir, file), 'utf8')
    console.log(`\n▶ ${file}`)
    await runSql(sql, file)
    console.log('  ✅ OK')
  }
}

function readArg(name) {
  const prefix = `--${name}=`
  const hit = process.argv.find((a) => a.startsWith(prefix))
  return hit ? hit.slice(prefix.length).trim() : ''
}

async function main() {
  const envLocal = loadEnvFile('.env.local')
  const url = readArg('url') || process.env.VITE_SUPABASE_URL || envLocal.VITE_SUPABASE_URL
  const token =
    readArg('token') ||
    process.env.SUPABASE_ACCESS_TOKEN?.trim() ||
    envLocal.SUPABASE_ACCESS_TOKEN?.trim()
  const password =
    readArg('password') ||
    process.env.SUPABASE_DB_PASSWORD?.trim() ||
    envLocal.SUPABASE_DB_PASSWORD?.trim()

  if (!url) throw new Error('Falta VITE_SUPABASE_URL')
  if (!token && !password) throw new Error('Falta SUPABASE_ACCESS_TOKEN o SUPABASE_DB_PASSWORD en .env.local')

  let projectRef = parseProjectRef(url)
  if (token) {
    projectRef = await resolveProjectRef(url, token)
  }
  console.log(`\n📦 Aplicando migraciones → ${projectRef}`)

  if (token) {
    console.log('🔑 Usando Supabase Management API')
    await applyFiles((sql, file) => runViaManagementAPI(projectRef, token, sql, file))
  } else if (password) {
    console.log('🔑 Usando Postgres directo')
    const client = await connectPg(password, projectRef)
    try {
      await applyFiles((sql) => client.query(sql))
    } finally {
      await client.end()
    }
  } else {
    throw new Error('Falta SUPABASE_ACCESS_TOKEN o SUPABASE_DB_PASSWORD')
  }

  console.log('\n✅ Todas las migraciones aplicadas')

  // Sincronizar URL correcta en .env.local
  const envPath = resolve(ROOT, '.env.local')
  const env = loadEnvFile('.env.local')
  const lines = [
    '# CoachBoard — Supabase',
    `VITE_SUPABASE_URL=https://${projectRef}.supabase.co`,
    `VITE_SUPABASE_ANON_KEY=${env.VITE_SUPABASE_ANON_KEY ?? ''}`,
    env.SUPABASE_ACCESS_TOKEN ? `SUPABASE_ACCESS_TOKEN=${env.SUPABASE_ACCESS_TOKEN}` : '',
    env.SUPABASE_DB_PASSWORD ? `SUPABASE_DB_PASSWORD=${env.SUPABASE_DB_PASSWORD}` : '',
    '',
  ].filter(Boolean)
  writeFileSync(envPath, lines.join('\n'), 'utf8')
  console.log(`✅ .env.local actualizado → https://${projectRef}.supabase.co`)
}

main().catch((err) => {
  console.error('\n❌', err.message)
  process.exit(1)
})

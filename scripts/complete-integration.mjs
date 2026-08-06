#!/usr/bin/env node
/**
 * Integración completa Supabase — sin prompts interactivos.
 * Uso:
 *   node scripts/complete-integration.mjs --key=sb_publishable_... 
 *   node scripts/complete-integration.mjs --key=eyJ...
 *
 * Opcional migraciones:
 *   $env:SUPABASE_DB_PASSWORD="..." ; node scripts/complete-integration.mjs --key=...
 */
import { execSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  applyMigrations,
  configureVercel,
  loadEnvFile,
  parseProjectRef,
  runVerify,
  writeEnvLocal,
} from './setup-utils.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_URL = 'https://lwmwrgfezfzfwozfifrb.supabase.co'

function readArg(name) {
  const prefix = `--${name}=`
  const hit = process.argv.find((a) => a.startsWith(prefix))
  return hit ? hit.slice(prefix.length).trim() : ''
}

function resolveKey() {
  return (
    readArg('key') ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
    loadEnvFile(ROOT, '.env.local').VITE_SUPABASE_ANON_KEY?.trim() ||
    loadEnvFile(ROOT, '.env.local').VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    ''
  )
}

function resolveUrl() {
  return (
    readArg('url') ||
    process.env.VITE_SUPABASE_URL?.trim() ||
    loadEnvFile(ROOT, '.env.local').VITE_SUPABASE_URL?.trim() ||
    DEFAULT_URL
  )
}

async function main() {
  const url = resolveUrl()
  const key = resolveKey()

  if (!key) {
    console.error('❌ Falta Publishable Key. Pasala con --key=... o VITE_SUPABASE_PUBLISHABLE_KEY')
    process.exit(1)
  }

  const projectRef = parseProjectRef(url)
  console.log(`\n🔗 Proyecto: ${projectRef}`)

  writeEnvLocal(ROOT, url, key)
  process.env.VITE_SUPABASE_URL = url
  process.env.VITE_SUPABASE_ANON_KEY = key

  const dbPassword = process.env.SUPABASE_DB_PASSWORD?.trim()
  if (dbPassword) {
    try {
      applyMigrations(ROOT, projectRef, dbPassword)
    } catch (err) {
      console.warn('⚠️  Migraciones automáticas fallaron:', err.message)
      console.warn('   Si el schema ya existe, continuá con verify.')
    }
  } else if (!runVerify(ROOT)) {
    console.warn('\n⚠️  Schema incompleto y sin SUPABASE_DB_PASSWORD — no se pudieron aplicar migraciones.')
    console.warn('   Definí SUPABASE_DB_PASSWORD y re-ejecutá este script.')
    process.exit(1)
  }

  if (!runVerify(ROOT)) {
    process.exit(1)
  }

  try {
    configureVercel(ROOT, url, key)
  } catch {
    console.warn('⚠️  Vercel env: omitido (CLI no disponible o sin sesión)')
  }

  console.log('\n✅ Integración Supabase completada\n')
}

main().catch((err) => {
  console.error('❌', err.message)
  process.exit(1)
})

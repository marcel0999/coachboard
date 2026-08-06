#!/usr/bin/env node
/**
 * CoachBoard — Setup rápido (< 5 min)
 *
 * Requisitos previos (manual, una sola vez en supabase.com):
 * - Organización creada
 * - Proyecto creado (vacío o existente)
 *
 * Este asistente solo pide:
 * - Project URL
 * - Anon Key
 *
 * Automatiza: .env.local, Vercel, migraciones, verificación, deploy
 */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  applyMigrations,
  askQuestion,
  buildCombinedMigrationFile,
  closeReadline,
  configureVercel,
  delay,
  deployProduction,
  openBrowser,
  parseProjectRef,
  printAuthSetup,
  resolveCredentials,
  runVerify,
  writeEnvLocal,
} from './setup-utils.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PRODUCTION_URL = 'https://coachboard-beige.vercel.app'

async function ensureSchema(projectRef) {
  if (runVerify(ROOT)) {
    console.log('\n✅ Schema verificado — tablas, RLS y RPC OK')
    return
  }

  console.log('\n⚠️  Schema incompleto — aplicando migraciones...')

  const dbPassword = process.env.SUPABASE_DB_PASSWORD?.trim()

  if (dbPassword) {
    applyMigrations(ROOT, projectRef, dbPassword)
    if (runVerify(ROOT)) {
      console.log('\n✅ Schema aplicado y verificado')
      return
    }
    throw new Error('Las migraciones se ejecutaron pero la verificación sigue fallando')
  }

  if (process.stdin.isTTY) {
    console.log(
      '\nPara migraciones automáticas, ingresá la Database password.',
      '\nSupabase → Project Settings → Database\n',
    )
    const password = (await askQuestion('Database password (Enter para omitir): ')).trim()

    if (password) {
      applyMigrations(ROOT, projectRef, password)
      if (runVerify(ROOT)) {
        console.log('\n✅ Schema aplicado y verificado')
        return
      }
    }
  }

  const combinedPath = buildCombinedMigrationFile(ROOT)
  const sqlUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`
  openBrowser(sqlUrl)
  console.log(`
❌ Schema incompleto.

Pegá y ejecutá en SQL Editor: ${combinedPath}
Luego re-ejecutá: npm run setup
`)
  throw new Error('Aplicá ALL_MIGRATIONS.sql en Supabase SQL Editor')
}

async function main() {
  console.log('\n╔══════════════════════════════════════════╗')
  console.log('║  CoachBoard — Setup de producción        ║')
  console.log('╚══════════════════════════════════════════╝')

  const { url, anonKey } = await resolveCredentials(ROOT)
  const projectRef = parseProjectRef(url)

  process.env.VITE_SUPABASE_URL = url
  process.env.VITE_SUPABASE_ANON_KEY = anonKey

  console.log(`\n✅ Proyecto: ${projectRef}`)

  writeEnvLocal(ROOT, url, anonKey)
  configureVercel(ROOT, url, anonKey)

  await ensureSchema(projectRef)

  printAuthSetup(projectRef)

  deployProduction(ROOT)

  console.log(`
╔══════════════════════════════════════════╗
║  ✅ SETUP COMPLETADO                      ║
╚══════════════════════════════════════════╝

  Project URL:    ${url}
  Project ref:    ${projectRef}
  .env.local:     ✅
  Vercel env:     ✅
  Migraciones:    ✅
  Deploy:         ✅

  Producción:     ${PRODUCTION_URL}
  Local:          npm run dev

  Confirmá Auth redirects en el navegador que se abrió.
  Verificá: npm run verify:supabase
`)
}

main()
  .then(async () => {
    await closeReadline()
    await delay(50)
  })
  .catch(async (err) => {
    await closeReadline()
    console.error('\n❌ Setup falló:', err.message)
    await delay(100)
    process.exitCode = 1
  })

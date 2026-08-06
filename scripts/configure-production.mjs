#!/usr/bin/env node
/**
 * Re-configura Vercel + redeploy usando credenciales existentes en .env.local
 */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  closeReadline,
  configureVercel,
  delay,
  deployProduction,
  loadEnvFile,
  runVerify,
  writeEnvLocal,
} from './setup-utils.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

async function main() {
  const env = loadEnvFile(ROOT, '.env.local')
  const url = process.env.VITE_SUPABASE_URL ?? env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Ejecutá primero npm run setup para generar .env.local')
  }

  process.env.VITE_SUPABASE_URL = url
  process.env.VITE_SUPABASE_ANON_KEY = anonKey

  writeEnvLocal(ROOT, url, anonKey)
  configureVercel(ROOT, url, anonKey)
  runVerify(ROOT)
  deployProduction(ROOT)
}

main()
  .then(async () => {
    await closeReadline()
    await delay(50)
  })
  .catch(async (err) => {
    await closeReadline()
    console.error('\n❌ Error:', err.message)
    process.exitCode = 1
  })

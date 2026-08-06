import { execSync } from 'node:child_process'
import { writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { setupAllVercelEnvs } from './vercel-env.mjs'

const PRODUCTION_URL = 'https://coachboard-beige.vercel.app'

let rlInstance = null

export function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function closeReadline() {
  if (!rlInstance) return
  try {
    rlInstance.close()
  } catch {
    /* ignore */
  }
  rlInstance = null
  if (input.isTTY) input.pause()
  await delay(50)
}

export async function askQuestion(prompt) {
  await closeReadline()
  rlInstance = readline.createInterface({ input, output })
  try {
    return await rlInstance.question(prompt)
  } finally {
    await closeReadline()
  }
}

export function openBrowser(url) {
  try {
    if (process.platform === 'win32') {
      execSync(`start "" "${url}"`, { shell: true, stdio: 'ignore' })
    } else if (process.platform === 'darwin') {
      execSync(`open "${url}"`, { stdio: 'ignore' })
    } else {
      execSync(`xdg-open "${url}"`, { stdio: 'ignore' })
    }
    console.log(`🌐 ${url}`)
  } catch {
    console.log(`   Abrí: ${url}`)
  }
}

export function parseProjectRef(url) {
  const trimmed = url.trim().replace(/\/+$/, '')
  const match = trimmed.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i)
  if (!match) {
    throw new Error('Project URL inválida. Formato: https://abcdefgh.supabase.co')
  }
  return match[1]
}

export function normalizeProjectUrl(url) {
  const ref = parseProjectRef(url)
  return `https://${ref}.supabase.co`
}

export function loadEnvFile(root, filename) {
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

export function writeEnvLocal(root, url, anonKey) {
  writeFileSync(
    resolve(root, '.env.local'),
    [
      '# CoachBoard — generado por npm run setup',
      `VITE_SUPABASE_URL=${url}`,
      `VITE_SUPABASE_ANON_KEY=${anonKey}`,
      '',
    ].join('\n'),
    'utf8',
  )
  console.log('✅ .env.local')
}

export function sh(root, cmd, { silent = false } = {}) {
  console.log(`\n▶ ${cmd}`)
  execSync(cmd, { cwd: root, stdio: silent ? 'pipe' : 'inherit', shell: true })
}

export function supabaseBin(root) {
  const bin = process.platform === 'win32' ? 'supabase.cmd' : 'supabase'
  return `"${resolve(root, 'node_modules', '.bin', bin)}"`
}

export async function resolveCredentials(root) {
  const env = loadEnvFile(root, '.env.local')
  const urlFromEnv = process.env.VITE_SUPABASE_URL?.trim()
  const keyFromEnv = process.env.VITE_SUPABASE_ANON_KEY?.trim()

  if (urlFromEnv && keyFromEnv) {
    return {
      url: normalizeProjectUrl(urlFromEnv),
      anonKey: keyFromEnv,
    }
  }

  if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
    return {
      url: normalizeProjectUrl(env.VITE_SUPABASE_URL),
      anonKey: env.VITE_SUPABASE_ANON_KEY,
    }
  }

  if (!process.stdin.isTTY) {
    throw new Error(
      'Ejecutá npm run setup en el terminal integrado de Cursor, o definí VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY',
    )
  }

  console.log('\n⚡ CoachBoard Setup (< 5 min)\n')
  console.log('Obtené los datos en: Supabase Dashboard → Project Settings → API\n')

  const rawUrl = await askQuestion('Project URL (https://xxxx.supabase.co): ')
  const anonKey = (await askQuestion('Anon Key (eyJ...): ')).trim()

  if (!rawUrl.trim() || !anonKey) {
    throw new Error('Project URL y Anon Key son obligatorios')
  }

  return {
    url: normalizeProjectUrl(rawUrl),
    anonKey,
  }
}

export function runVerify(root) {
  try {
    execSync('node scripts/verify-supabase.mjs', {
      cwd: root,
      stdio: 'inherit',
      shell: true,
      env: process.env,
    })
    return true
  } catch {
    return false
  }
}

export function applyMigrations(root, projectRef, dbPassword) {
  const bin = supabaseBin(root)
  console.log('\n📦 Aplicando migraciones SQL (001–005)...')

  const linkCmd = dbPassword
    ? `${bin} link --project-ref ${projectRef} --password "${dbPassword.replace(/"/g, '\\"')}" --yes`
    : `${bin} link --project-ref ${projectRef} --yes`

  sh(root, linkCmd)
  sh(root, `${bin} db push --yes`)
  console.log('✅ Migraciones aplicadas')
}

export function buildCombinedMigrationFile(root) {
  const migrationsDir = resolve(root, 'supabase', 'migrations')
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  const combined = files
    .map((file) => {
      const sql = readFileSync(resolve(migrationsDir, file), 'utf8')
      return `-- ══ ${file} ══\n${sql.trim()}\n`
    })
    .join('\n')

  const outPath = resolve(root, 'supabase', 'ALL_MIGRATIONS.sql')
  writeFileSync(outPath, combined, 'utf8')
  return outPath
}

export function printAuthSetup(projectRef) {
  const authUrl = `https://supabase.com/dashboard/project/${projectRef}/auth/url-configuration`
  console.log('\n🔐 Authentication — configuración requerida (1 min)\n')
  console.log(`Site URL:\n  ${PRODUCTION_URL}\n`)
  console.log('Redirect URLs (agregar todas):')
  ;[
    PRODUCTION_URL,
    `${PRODUCTION_URL}/**`,
    'http://localhost:5173/**',
    'https://*.vercel.app/**',
  ].forEach((u) => console.log(`  ${u}`))
  console.log('\nEmail confirmations: OFF (recomendado para desarrollo)\n')
  openBrowser(authUrl)
}

export function configureVercel(root, url, anonKey) {
  console.log('\n☁️  Vercel (production + preview + development)...')
  setupAllVercelEnvs(root, url, anonKey)
}

export function deployProduction(root) {
  console.log('\n🚀 Deploy producción...')
  sh(root, 'npx vercel deploy --prod --yes')
}

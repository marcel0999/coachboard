#!/usr/bin/env node
/**
 * CoachBoard — Aprovisionamiento automatizado de Supabase + Vercel
 *
 * Requisito único: SUPABASE_ACCESS_TOKEN en el entorno
 * Obtener en: https://supabase.com/dashboard/account/tokens
 *
 * Uso:
 *   $env:SUPABASE_ACCESS_TOKEN="sbp_..."   # PowerShell
 *   node scripts/setup-supabase.mjs
 */
import { execSync } from 'node:child_process'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const API = 'https://api.supabase.com/v1'
const PROJECT_NAME = 'coachboard'
const REGION = 'sa-east-1' // São Paulo — cercano a Uruguay/Argentina

const token = process.env.SUPABASE_ACCESS_TOKEN

if (!token) {
  console.error(`
❌ Falta SUPABASE_ACCESS_TOKEN

Acción requerida (una sola vez):
1. Abrí https://supabase.com/dashboard/account/tokens
2. Creá un token con nombre "CoachBoard CLI"
3. En PowerShell ejecutá:

   $env:SUPABASE_ACCESS_TOKEN="sbp_tu_token_aqui"
   node scripts/setup-supabase.mjs

`)
  process.exit(1)
}

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.message ?? body.error ?? `API ${path} → ${res.status}`)
  }
  return body
}

function sh(cmd) {
  console.log(`\n▶ ${cmd}`)
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', shell: true })
}

function writeEnvLocal(url, anonKey) {
  const lines = [
    '# CoachBoard — generado automáticamente por setup-supabase.mjs',
    `VITE_SUPABASE_URL=${url}`,
    `VITE_SUPABASE_ANON_KEY=${anonKey}`,
    '',
  ]
  writeFileSync(resolve(ROOT, '.env.local'), lines.join('\n'), 'utf8')
  console.log('✅ .env.local actualizado')
}

async function main() {
  console.log('\n🏗️  CoachBoard — Setup Supabase automatizado\n')

  // 1. Organización
  const orgs = await api('/organizations')
  if (!orgs?.length) throw new Error('No se encontraron organizaciones en tu cuenta Supabase.')
  const org = orgs[0]
  console.log(`✅ Organización: ${org.name} (${org.id})`)

  // 2. Proyecto existente o nuevo
  let projects = await api('/projects')
  let project = projects.find((p) => p.name === PROJECT_NAME)

  if (project) {
    console.log(`✅ Proyecto existente: ${project.name} (${project.id})`)
  } else {
    const dbPass = randomBytes(16).toString('base64url') + 'Aa1!'
    console.log(`📦 Creando proyecto "${PROJECT_NAME}" en ${REGION}...`)
    project = await api('/projects', {
      method: 'POST',
      body: JSON.stringify({
        organization_id: org.id,
        name: PROJECT_NAME,
        region: REGION,
        db_pass: dbPass,
      }),
    })
    console.log(`✅ Proyecto creado: ${project.id}`)
    console.log('⏳ Esperando a que el proyecto esté listo (puede tardar 2-3 min)...')

    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 5000))
      const status = await api(`/projects/${project.id}`)
      if (status.status === 'ACTIVE_HEALTHY') {
        project = status
        console.log('✅ Proyecto ACTIVE_HEALTHY')
        break
      }
      process.stdout.write('.')
    }
  }

  // 3. API keys
  const keys = await api(`/projects/${project.id}/api-keys`)
  const anonKey = keys.find((k) => k.name === 'anon' || k.name === 'anon key')?.api_key
    ?? keys.find((k) => k.name?.toLowerCase().includes('anon'))?.api_key

  if (!anonKey) throw new Error('No se encontró la anon key del proyecto.')

  const projectUrl = `https://${project.id}.supabase.co`
  console.log(`✅ URL: ${projectUrl}`)

  // 4. .env.local
  writeEnvLocal(projectUrl, anonKey)

  // 5. Link + push migrations
  const supabaseBin = resolve(ROOT, 'node_modules', '.bin', 'supabase')
  const linkCmd = process.platform === 'win32'
    ? `"${supabaseBin}" link --project-ref ${project.id} --password-stdin`
    : `${supabaseBin} link --project-ref ${project.id}`

  console.log('\n🔗 Vinculando proyecto local...')
  try {
    sh(`"${supabaseBin}" link --project-ref ${project.id} --yes`)
  } catch {
    console.warn('⚠️  Link manual puede ser necesario. Continuando...')
  }

  console.log('\n📦 Aplicando migraciones SQL...')
  try {
    sh(`"${supabaseBin}" db push --yes`)
    console.log('✅ Migraciones aplicadas')
  } catch (err) {
    console.warn('⚠️  db push falló. Aplicá manualmente en SQL Editor:')
    console.warn('   supabase/migrations/001_initial_schema.sql')
    console.warn('   supabase/migrations/002_rls_and_invitations.sql')
    console.warn('   supabase/migrations/003_storage_and_indexes.sql')
  }

  // 6. Vercel env
  console.log('\n☁️  Configurando Vercel...')
  try {
    sh(`npx vercel env add VITE_SUPABASE_URL production --yes <<< "${projectUrl}"`)
  } catch { /* vercel env add may need interactive */ }

  try {
    sh(`npx vercel env add VITE_SUPABASE_URL preview --yes <<< "${projectUrl}"`)
  } catch { /* ignore */ }

  // Vercel env add on Windows needs different approach - write script
  await setupVercelEnv(projectUrl, anonKey)

  // 7. Verify
  console.log('\n🔍 Verificando conectividad...')
  process.env.VITE_SUPABASE_URL = projectUrl
  process.env.VITE_SUPABASE_ANON_KEY = anonKey
  try {
    sh('node scripts/verify-supabase.mjs')
  } catch {
    console.warn('⚠️  Verificación parcial — revisá manualmente')
  }

  console.log(`
════════════════════════════════════════════
✅ Setup completado

  Proyecto:  ${PROJECT_NAME}
  Ref:       ${project.id}
  URL:       ${projectUrl}
  Región:    ${REGION}
  .env.local: actualizado
  Vercel:    variables configuradas (production + preview)

Próximo paso: npm run dev
════════════════════════════════════════════
`)
}

async function setupVercelEnv(url, anonKey) {
  const envFile = resolve(ROOT, '.env.vercel.tmp')
  writeFileSync(envFile, `VITE_SUPABASE_URL=${url}\nVITE_SUPABASE_ANON_KEY=${anonKey}\n`)

  for (const target of ['production', 'preview', 'development']) {
    for (const [key, val] of [['VITE_SUPABASE_URL', url], ['VITE_SUPABASE_ANON_KEY', anonKey]]) {
      try {
        execSync(
          `npx vercel env rm ${key} ${target} --yes 2>nul`,
          { cwd: ROOT, stdio: 'pipe', shell: true },
        )
      } catch { /* may not exist */ }

      try {
        execSync(
          `echo ${val} | npx vercel env add ${key} ${target}`,
          { cwd: ROOT, stdio: 'pipe', shell: true },
        )
        console.log(`✅ Vercel ${key} → ${target}`)
      } catch {
        console.warn(`⚠️  Configurá manualmente en Vercel: ${key} = (ver .env.local)`)
      }
    }
  }
}

main().catch((err) => {
  console.error('\n❌ Setup falló:', err.message)
  process.exit(1)
})

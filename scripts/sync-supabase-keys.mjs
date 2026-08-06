#!/usr/bin/env node
/** Obtiene API keys del proyecto y sincroniza .env.local */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const API = 'https://api.supabase.com/v1'

function loadEnv() {
  const path = resolve(ROOT, '.env.local')
  if (!existsSync(path)) return {}
  const vars = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return vars
}

function parseRef(url) {
  return url.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i)?.[1]
}

async function main() {
  const env = loadEnv()
  const token = env.SUPABASE_ACCESS_TOKEN
  const url = env.VITE_SUPABASE_URL
  if (!token || !url) throw new Error('Faltan SUPABASE_ACCESS_TOKEN o VITE_SUPABASE_URL en .env.local')

  const listRes = await fetch(`${API}/projects`, { headers: { Authorization: `Bearer ${token}` } })
  const projects = await listRes.json()
  const ref = projects.find((p) => url.includes(p.ref))?.ref ?? projects[0]?.ref
  if (!ref) throw new Error('Proyecto no encontrado')

  const keysRes = await fetch(`${API}/projects/${ref}/api-keys`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const keys = await keysRes.json()
  if (!keysRes.ok) throw new Error(JSON.stringify(keys))

  const publishable =
    keys.find((k) => k.name === 'anon' || k.type === 'publishable')?.api_key ??
    keys.find((k) => k.api_key?.startsWith('eyJ'))?.api_key ??
    keys.find((k) => k.api_key?.startsWith('sb_publishable'))?.api_key

  const projectUrl = `https://${ref}.supabase.co`
  const lines = [
    '# CoachBoard — Supabase',
    `VITE_SUPABASE_URL=${projectUrl}`,
    `VITE_SUPABASE_ANON_KEY=${publishable ?? env.VITE_SUPABASE_ANON_KEY}`,
    `SUPABASE_ACCESS_TOKEN=${token}`,
    '',
  ]
  writeFileSync(resolve(ROOT, '.env.local'), lines.join('\n'), 'utf8')
  console.log(`✅ .env.local sincronizado → ${projectUrl}`)
  console.log(`✅ Key type: ${publishable?.startsWith('eyJ') ? 'JWT anon' : 'publishable'}`)
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})

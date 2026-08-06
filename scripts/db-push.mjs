#!/usr/bin/env node
/**
 * Aplica migraciones SQL al proyecto Supabase remoto vinculado.
 * Requiere: supabase login + supabase link
 * Uso: npm run db:push
 */
import { execSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

console.log('📦 Aplicando migraciones Supabase...\n')

try {
  const supabaseBin = process.platform === 'win32'
    ? resolve(root, 'node_modules', '.bin', 'supabase.cmd')
    : resolve(root, 'node_modules', '.bin', 'supabase')
  execSync(`"${supabaseBin}" db push --yes`, { cwd: root, stdio: 'inherit', shell: true })
  console.log('\n✅ Migraciones aplicadas correctamente')
} catch {
  console.error('\n❌ Error al aplicar migraciones. Verificá: supabase login + supabase link')
  process.exit(1)
}

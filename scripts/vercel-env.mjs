import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function addVercelEnv(root, key, value, target) {
  try {
    execSync(`npx vercel env rm ${key} ${target} --yes`, {
      cwd: root,
      stdio: 'pipe',
      shell: true,
    })
  } catch {
    /* may not exist */
  }

  const tmp = resolve(root, `.env.add.${key}.${target}.tmp`)
  writeFileSync(tmp, value, 'utf8')

  try {
    if (process.platform === 'win32') {
      execSync(`cmd /c "type "${tmp}" | npx vercel env add ${key} ${target}"`, {
        cwd: root,
        stdio: 'inherit',
        shell: true,
      })
    } else {
      execSync(`cat "${tmp}" | npx vercel env add ${key} ${target}`, {
        cwd: root,
        stdio: 'inherit',
        shell: true,
      })
    }
    console.log(`✅ Vercel ${key} → ${target}`)
  } finally {
    try {
      if (process.platform === 'win32') {
        execSync(`del /f /q "${tmp}"`, { shell: true, stdio: 'ignore' })
      } else {
        execSync(`rm -f "${tmp}"`, { shell: true, stdio: 'ignore' })
      }
    } catch {
      /* ignore */
    }
  }
}

export function setupAllVercelEnvs(root, url, anonKey) {
  for (const target of ['production', 'preview', 'development']) {
    addVercelEnv(root, 'VITE_SUPABASE_URL', url, target)
    addVercelEnv(root, 'VITE_SUPABASE_ANON_KEY', anonKey, target)
  }
}

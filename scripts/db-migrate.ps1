# Ejecutar migraciones (lee credenciales desde .env.local)
Set-Location $PSScriptRoot\..
node scripts/apply-migrations.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npm run verify:supabase

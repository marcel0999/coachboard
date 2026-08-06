# CoachBoard — Setup en menos de 5 minutos

## Requisitos previos (una sola vez en supabase.com)

1. Crear **organización** (manual en dashboard)
2. Crear **proyecto** (vacío está bien)
3. Copiar de **Project Settings → API**:
   - **Project URL** → `https://xxxx.supabase.co`
   - **anon public key** → `eyJ...`

---

## Setup automático

En el terminal integrado de Cursor:

```powershell
cd "C:\Users\Marcel\Desktop\documentos coachboard"
npm run setup
```

Pegá **Project URL** y **Anon Key** cuando lo pida.

### Qué hace automáticamente

| Paso | Acción |
|---|---|
| 1 | Genera `.env.local` |
| 2 | Configura Vercel (production + preview + development) |
| 3 | Verifica tablas, RLS, RPC |
| 4 | Aplica migraciones 001–004 (si faltan) |
| 5 | Abre Auth URL config con valores listos |
| 6 | Deploy producción en Vercel |

---

## Migraciones

Si el proyecto está vacío, el setup pedirá la **Database password** (Settings → Database) para ejecutar `supabase db push`.

Alternativa sin password en el asistente:

```powershell
$env:SUPABASE_DB_PASSWORD="tu-password"; npm run setup
```

Fallback manual: ejecutar `supabase/ALL_MIGRATIONS.sql` en SQL Editor.

---

## Authentication (1 min)

El setup abre automáticamente la página de Auth URLs. Configurá:

- **Site URL:** `https://coachboard-beige.vercel.app`
- **Redirect URLs:** localhost, vercel.app, producción
- **Confirm email:** OFF (recomendado inicial)

---

## Comandos útiles

```powershell
npm run setup              # Setup completo
npm run verify:supabase      # Verificar schema
npm run configure:production # Re-sync Vercel + redeploy
npm run dev                  # Desarrollo local
```

---

## Variables requeridas

| Variable | Dónde |
|---|---|
| `VITE_SUPABASE_URL` | `.env.local` + Vercel |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` + Vercel |

No se requiere `SUPABASE_ACCESS_TOKEN`.

# CoachBoard — Informe de Arquitectura Supabase
**Fecha:** 5 de agosto de 2026  
**Arquitecto:** Automatización + revisión de código  
**Commit & Push:** ⏸ NO realizado (pendiente verificación E2E)

---

## Resumen ejecutivo

Toda la **infraestructura de código** para un SaaS multi-club sobre Supabase está lista. El único bloqueo restante es **autenticación en Supabase** (cuenta + access token) para crear el proyecto cloud y aplicar migraciones.

Una vez que completes **una acción** (ver sección "Acción requerida"), el script `npm run setup:supabase` ejecutará automáticamente:
- Creación del proyecto `coachboard` (región sa-east-1)
- Aplicación de 3 migraciones SQL
- Generación de `.env.local`
- Configuración de variables en Vercel
- Verificación de conectividad

---

## Estado de Supabase

| Componente | Estado | Detalle |
|------------|--------|---------|
| Proyecto cloud | ⏸ Pendiente | Requiere `SUPABASE_ACCESS_TOKEN` |
| CLI local | ✅ | `supabase@2.111.0` en devDependencies |
| config.toml | ✅ | Auth, Storage, Realtime, redirects Vercel |
| Migraciones SQL | ✅ | 3 archivos listos para `db push` |
| Cliente JS | ✅ | `@supabase/supabase-js@2.112.1` |
| Script setup | ✅ | `scripts/setup-supabase.mjs` |
| Script verify | ✅ | `scripts/verify-supabase.mjs` |

---

## Estado de Auth

| Componente | Estado |
|------------|--------|
| Supabase Auth exclusivo | ✅ Implementado |
| Fallback localStorage auth | ❌ Eliminado |
| Email + password | ✅ |
| Sesión persistente (JWT) | ✅ `onAuthStateChange` |
| Registro → club + admin | ✅ RPC `create_club_with_admin` |
| 1 club por usuario | ✅ RPC `user_has_active_club()` |
| Invitaciones | ✅ RPC `get_invitation_by_token` (pública) + `accept_club_invitation` |
| Redirect URLs | ✅ localhost + coachboard-beige.vercel.app |

**Config Auth recomendada en dashboard:**
- Email provider: ON
- Confirm email: OFF (dev/staging) → ON (prod con SMTP)

---

## Estado de la Base de Datos

### Tablas

| Tabla | Propósito | RLS |
|-------|-----------|-----|
| `profiles` | Usuario extendido | ✅ |
| `clubs` | Clubes | ✅ |
| `memberships` | Rol + permisos | ✅ |
| `invitations` | Invitaciones | ✅ |
| `club_app_state` | Estado JSONB v4 (todos los módulos) | ✅ |
| `club_migration_log` | Auditoría migraciones | ✅ |
| `club_files` | Metadatos archivos | ✅ |

### Módulos en `club_app_state.state`

Plantel, categorías, staff, entrenamientos, ejercicios, pizarra táctica, partidos, evaluaciones/rendimiento, área médica, asistencias, configuración — **todos preservados** en schema v4.

### Migraciones

1. `001_initial_schema.sql` — tablas, triggers, RPC base, RLS inicial
2. `002_rls_and_invitations.sql` — RLS reforzado, invitaciones públicas, 1 club/usuario, import RPC
3. `003_storage_and_indexes.sql` — bucket, storage RLS, índices GIN JSONB

---

## Estado de RLS

| Política | Tabla | Regla |
|----------|-------|-------|
| Propio + mismo club | `profiles` | SELECT |
| Solo propio | `profiles` | UPDATE, INSERT |
| Miembros | `clubs` | SELECT |
| Administrador | `clubs` | UPDATE |
| Mismo club | `memberships`, `invitations`, `club_app_state`, `club_files`, `club_migration_log` | ALL |
| Administrador | `invitations` | INSERT |
| Admin/DT | `memberships` | UPDATE permisos |

**Storage RLS (`club-assets`):** path `{club_id}/...` filtrado por `user_club_ids()`.

---

## Estado de Storage

| Componente | Estado |
|------------|--------|
| Bucket `club-assets` | ✅ SQL listo (privado, 50MB) |
| MIME types | jpeg, png, webp, gif, pdf, mp4, webm |
| RLS storage.objects | ✅ 4 políticas |
| `storageService.js` | ✅ upload, signed URL, delete |
| Migración dataUrl → Storage | ⏸ Fase siguiente |

---

## Estado de Vercel

| Componente | Estado |
|------------|--------|
| Proyecto | ✅ `coachboard/coachboard` |
| URL producción | https://coachboard-beige.vercel.app |
| CLI autenticado | ✅ `hmarcelnasser09-3406` |
| Env vars Supabase | ❌ Ninguna configurada aún |
| vercel.json | ✅ SPA rewrites + Vite build |
| Setup automático | ✅ Incluido en `setup-supabase.mjs` |

---

## Variables configuradas

| Variable | Local (.env.local) | Vercel |
|----------|-------------------|--------|
| `VITE_SUPABASE_URL` | ❌ | ❌ |
| `VITE_SUPABASE_ANON_KEY` | ❌ | ❌ |
| `VERCEL_OIDC_TOKEN` | ✅ (solo dev CLI) | — |

`.env.local` actual solo contiene token OIDC de Vercel CLI — **faltan credenciales Supabase**.

---

## localStorage — estado final

| Uso | Estado |
|-----|--------|
| Persistencia principal | ❌ Eliminado |
| Auth | ❌ Eliminado |
| Preferencias UI (tema) | ✅ `uiPreferences.js` — único uso permitido |
| Migración legacy | ✅ Solo manual en Configuración (`importLegacyLocalStorageManually`) |
| Flag migración completada | ✅ `coachboard_supabase_migrated_{clubId}` |
| Backups automáticos localStorage | ❌ Deshabilitados |
| Export/import JSON | ✅ Manual → escribe en Supabase |
| Demo data | ✅ Solo `import.meta.env.DEV`, acción manual |

---

## Funcionalidades verificadas

| Funcionalidad | Código | E2E cloud |
|---------------|--------|-----------|
| Build producción | ✅ | — |
| SupabaseGate sin env | ✅ | ✅ |
| Auth Supabase-only | ✅ | ⏸ |
| Adapter Supabase-only | ✅ | ⏸ |
| Migración legacy auto | ❌ Eliminada — solo manual |
| Configuración Supabase-only | ✅ | ⏸ |
| Banner error de guardado | ✅ AppLayout + Configuración | ⏸ |
| Realtime sync | ✅ | ⏸ |
| Storage foundation | ✅ | ⏸ |
| UI / navegación | ✅ Sin cambios | ⏸ |

---

## Errores encontrados

| Error | Impacto | Solución |
|-------|---------|----------|
| Supabase CLI sin auth | Bloquea deploy cloud | Token de acceso (acción humana) |
| `.env.local` sin VITE_SUPABASE_* | App muestra gate | Setup script |
| Vercel sin env vars | Prod sin Supabase | Setup script |
| `supabase login` no funciona en non-TTY | CLI en agente | Usar `--token` o setup script |

---

## Riesgos detectados

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| JSONB monolítico a escala | Media | Índice GIN añadido; normalizar tablas en fase 2 |
| Conflictos Realtime simultáneos | Media | Implementar versioning en fase 2 |
| dataUrl en JSONB (tamaño) | Alta a largo plazo | Storage service ya preparado |
| Confirmación email Supabase | Baja | Desactivar en dev, SMTP en prod |
| 1 club/usuario (sin multi-club) | Bajo | Decisión de producto; RPC lo enforce |

---

## Acción requerida (una sola)

**Necesito que hagas esto tú** — no puedo autenticarme en tu cuenta Supabase:

### Opción A — Automática (recomendada, 2 minutos)

1. Abrí: https://supabase.com/dashboard/account/tokens
2. Creá un token: nombre `CoachBoard CLI`
3. En PowerShell, en la carpeta del proyecto:

```powershell
cd "C:\Users\Marcel\Desktop\documentos coachboard"
$env:SUPABASE_ACCESS_TOKEN="sbp_PEGAR_TOKEN_AQUI"
npm run setup:supabase
```

El script hará **todo lo demás** automáticamente.

### Opción B — Manual

1. Creá proyecto en supabase.com → nombre `coachboard`, región São Paulo
2. SQL Editor → ejecutá los 3 archivos en `supabase/migrations/`
3. Settings → API → copiá URL y anon key a `.env.local`
4. Vercel → Environment Variables → mismas 2 variables

**Cuando termines, avisame** y continúo con verificación E2E completa (login, plantel, entrenamientos, etc.) sin commit hasta que todo pase.

---

## Próxima etapa recomendada

1. ✅ Completar setup Supabase (acción humana arriba)
2. Verificación E2E automatizada + manual
3. Commit & Push + deploy Vercel
4. Migrar `dataUrl` → Supabase Storage
5. Normalizar entidades críticas (`players`, `matches`) a tablas dedicadas
6. Conflict resolution Realtime + tests Playwright
7. Monitoring (Supabase logs + Sentry)

---

## Archivos creados/modificados en esta etapa

### Nuevos
- `supabase/config.toml`
- `supabase/migrations/003_storage_and_indexes.sql`
- `scripts/setup-supabase.mjs`
- `scripts/verify-supabase.mjs`
- `scripts/db-push.mjs`
- `src/services/supabase/storageService.js`
- `src/services/legacy/localStorageImport.js`
- `src/services/legacy/authStorageLegacy.js`
- `ARCHITECTURE_REPORT.md`

### Modificados
- `package.json` — scripts + supabase devDep
- `.env.example`
- `scripts/db-push.mjs`

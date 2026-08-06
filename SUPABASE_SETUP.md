# CoachBoard — Configuración Supabase

Supabase es la **única fuente de verdad** de CoachBoard. Sin variables de entorno válidas, la app muestra una pantalla de error — no funciona con localStorage como backend.

## 1. Setup automático (recomendado)

1. Creá un [Access Token](https://supabase.com/dashboard/account/tokens) en Supabase.
2. Ejecutá:

```powershell
$env:SUPABASE_ACCESS_TOKEN="sbp_..."
npm run setup:supabase
```

Esto crea el proyecto, aplica migraciones SQL, genera `.env.local` y configura Vercel.

## 2. Setup manual

### Crear proyecto

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto.
2. Anotá **Project URL** y **anon public key** (Settings → API).

### Ejecutar schema

En el **SQL Editor**, ejecutá en orden:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_and_invitations.sql
supabase/migrations/003_storage_and_indexes.sql
```

O con CLI:

```bash
npm run db:push
```

### Tablas creadas

| Tabla | Propósito |
|-------|-----------|
| `profiles` | Perfil extendido del usuario |
| `clubs` | Clubes (UUID permanente) |
| `memberships` | Relación usuario ↔ club (rol, permisos) |
| `invitations` | Invitaciones por token |
| `club_app_state` | Estado operativo JSONB v4 por club |
| `club_migration_log` | Auditoría de importaciones |
| `club_files` | Metadatos de archivos (Storage) |

## 3. Variables de entorno

Copiá `.env.example` a `.env.local`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

**Nunca** incluir `service_role` en el frontend.

Configurá las mismas variables en **Vercel** → Project Settings → Environment Variables (Development, Preview, Production).

## 4. Auth — dominios y redirect URLs

Cuando cambies de dominio, actualizá **solo la configuración de Auth** — no hace falta migrar la base de datos.

En **Supabase Dashboard → Authentication → URL Configuration**:

| Campo | Valor |
|-------|-------|
| **Site URL** | URL principal de producción (ej. `https://app.coachboard.app`) |
| **Redirect URLs** | Todas las URLs autorizadas, una por línea |

URLs que deben estar autorizadas:

```
http://localhost:5173/**
http://localhost:5173
https://coachboard-beige.vercel.app/**
https://coachboard-beige.vercel.app
https://*.vercel.app/**
https://beta.coachboard.app/**
https://app.coachboard.app/**
https://coachboard.uy/**
```

En **Supabase Dashboard → Authentication → URL Configuration**, agregá también:

```
https://tu-dominio.com/restablecer-contrasena
http://localhost:5173/restablecer-contrasena
```

Para recuperación de contraseña por correo.

### Email provider

- **Authentication → Providers → Email**: activado
- **Confirm email**: OFF en dev/staging, ON en producción con SMTP

## 5. Comportamiento de la app

| Escenario | Comportamiento |
|-----------|----------------|
| Sin `VITE_SUPABASE_*` | Pantalla "Configuración requerida" — app bloqueada |
| Con Supabase configurado | Auth + datos exclusivamente desde PostgreSQL |
| Tabla vacía | Array vacío válido — no se cargan datos demo |
| Error de red | Error visible — no se restauran mocks |
| Demo data | Solo en `import.meta.env.DEV`, acción manual en Configuración |
| Import legacy | Solo manual, una vez, si el club está vacío en Supabase |

### localStorage permitido

Solo preferencias de UI (`src/services/uiPreferences.js`):

- Tema claro/oscuro
- Estado temporal de interfaz
- Flags de migración completada (no datos operativos)

## 6. Sincronización multi-dispositivo

1. Mismo proyecto Supabase (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`)
2. Mismo usuario autenticado (`auth.users.id`)
3. Mismo `club_id` (UUID de `clubs.id`)

Los cambios se guardan en Supabase con debounce de 800 ms y se sincronizan vía Realtime en `club_app_state`.

## 7. Verificación

```bash
npm run verify:supabase   # tablas, RPC, conectividad
npm run build             # build de producción
```

## 8. Pruebas obligatorias (post-setup)

| Prueba | Qué verificar |
|--------|---------------|
| A — Persistencia | Crear datos → F5 → siguen ahí |
| B — Otro navegador | Incógnito + mismo login → mismos datos |
| C — Otro dispositivo | Editar en celular → visible en PC |
| D — Cambio URL | Prod + Preview → misma base, sin duplicar clubes |
| E — Eliminación | Vaciar módulo → F5 → sigue vacío |
| F — Seguridad | Dos clubes/usuarios → RLS bloquea acceso cruzado |

## 9. Storage (fase 2)

Bucket privado `club-assets` para fotos, documentos y videos. Ver `003_storage_and_indexes.sql`.

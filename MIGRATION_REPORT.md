# Informe de migración — CoachBoard → Supabase

**Fecha:** 5 de agosto de 2026  
**Estado:** Migración arquitectónica completada en código. **Sin Commit & Push** (según instrucción).  
**Build:** ✅ Exitoso (`npm run build`)

---

## Resumen ejecutivo

CoachBoard dejó de usar **localStorage como persistencia principal**. La aplicación ahora:

- Exige **Supabase Auth** como único sistema de autenticación.
- Persiste **todos los módulos** en **PostgreSQL** (tabla `club_app_state.state` JSONB schema v4).
- Aísla datos por club con **RLS** en todas las tablas.
- **Importa automáticamente** datos legacy de localStorage en el primer login/registro.
- Mantiene **100% de pantallas y módulos** sin cambios de UI.

> **Nota:** localStorage se conserva únicamente como **origen de migración única** (`src/services/legacy/localStorageImport.js`), no como base operativa.

---

## Archivos modificados / creados

### Nuevos
| Archivo | Propósito |
|---------|-----------|
| `supabase/migrations/001_initial_schema.sql` | Schema inicial |
| `supabase/migrations/002_rls_and_invitations.sql` | RLS reforzado, RPC invitaciones, 1 club/usuario |
| `src/lib/supabase.js` | Cliente Supabase |
| `src/services/supabase/authService.js` | Auth, invitaciones, permisos |
| `src/services/supabase/clubDataService.js` | Load/save estado + Realtime |
| `src/services/supabase/migrationService.js` | Migración localStorage → Supabase |
| `src/services/legacy/localStorageImport.js` | Lectura legacy (solo migración) |
| `src/storage/adapters/supabaseAdapter.js` | Adapter remoto único |
| `src/components/auth/SupabaseGate.jsx` | Bloqueo si faltan env vars |
| `.env.example` | Plantilla de configuración |
| `SUPABASE_SETUP.md` | Guía de setup |
| `MIGRATION_REPORT.md` | Este informe |

### Modificados
| Archivo | Cambio |
|---------|--------|
| `src/main.jsx` | `SupabaseGate` + `AuthProvider` |
| `src/context/AuthContext.jsx` | Solo Supabase Auth (eliminado fallback local) |
| `src/context/AppDataContext.jsx` | Carga async + Realtime |
| `src/storage/index.js` | Solo adapter Supabase |
| `src/components/auth/ClubDataShell.jsx` | Config async del club |
| `src/pages/AcceptInvite.jsx` | Invitaciones vía RPC pública |
| `src/pages/TeamAccess.jsx` | Async team refresh |
| `src/components/layout/Sidebar.jsx` | Logout async |
| `package.json` | `@supabase/supabase-js` |

### Conservados (sin uso como persistencia principal)
| Archivo | Rol actual |
|---------|------------|
| `src/utils/authStorage.js` | Legacy — no referenciado por AuthContext |
| `src/storage/adapters/localStorageAdapter.js` | Backup/diagnóstico |
| `src/storage/adapters/namespacedStorageAdapter.js` | No usado como adapter activo |

---

## Tablas PostgreSQL creadas

| Tabla | Contenido |
|-------|-----------|
| `profiles` | Perfil de usuario (extiende `auth.users`) |
| `clubs` | Clubes con `legacy_local_id` |
| `memberships` | Usuario ↔ club, rol, permisos JSONB |
| `invitations` | Invitaciones al cuerpo técnico |
| `club_app_state` | **Estado completo v4** por club (JSONB) |
| `club_migration_log` | Registro de importaciones desde localStorage |
| `club_files` | Metadatos para Storage (fase imágenes/videos) |

### Módulos dentro de `club_app_state.state` (JSONB schema v4)

| Módulo requerido | Campo en JSONB |
|------------------|----------------|
| Usuarios / Permisos | Tablas `profiles`, `memberships` |
| Clubes | Tabla `clubs` |
| Plantel | `players[]` |
| Categorías | `categories[]` |
| Entrenadores / Cuerpo Técnico | `staff[]` |
| Entrenamientos | `trainings[]` |
| Ejercicios | `exercises[]` |
| Pizarra Táctica | `tacticalBoard` |
| Partidos | `matches[]` |
| Evaluaciones / Rendimiento | Derivado de `players.statistics`, partidos |
| Área Médica | `players[].medicalHistory`, `medicalDocuments` |
| Asistencias | `trainings[].players`, partidos |
| Configuración | `clubSettings` |
| Invitaciones | Tabla `invitations` |

---

## Políticas RLS implementadas

| Tabla | Políticas |
|-------|-----------|
| `profiles` | `select` propio + mismo club; `update` propio; `insert` propio |
| `clubs` | `select` miembros; `insert` autenticados; `update` administrador |
| `memberships` | `select` mismo club; `update` admin/DT |
| `invitations` | `select` mismo club; `insert` administrador |
| `club_app_state` | `select` / `insert` / `update` miembros del club |
| `club_migration_log` | `select` / `insert` miembros |
| `club_files` | `select` / `insert` / `delete` miembros |

### Funciones RPC (SECURITY DEFINER)
| Función | Uso |
|---------|-----|
| `user_club_ids()` | Helper RLS |
| `user_has_active_club()` | Enforce 1 club por usuario |
| `create_club_with_admin()` | Registro de club + admin |
| `accept_club_invitation()` | Aceptar invitación |
| `get_invitation_by_token()` | Lectura pública segura de invitaciones |
| `import_club_app_state()` | Importación atómica desde localStorage |
| `handle_new_user()` | Trigger perfil al registrarse |

---

## Funcionalidades verificadas

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Build producción | ✅ | `npm run build` — 0 errores |
| Dev server | ✅ | Arranca en `http://localhost:5184` |
| SupabaseGate sin env | ✅ | Muestra pantalla de configuración requerida |
| Registro de usuario | ⚠️ Pendiente E2E | Requiere `.env.local` con credenciales Supabase + SQL ejecutado |
| Inicio de sesión | ⚠️ Pendiente E2E | Idem |
| Recuperación de sesión | ⚠️ Pendiente E2E | Implementado vía `onAuthStateChange` |
| Cierre de sesión | ⚠️ Pendiente E2E | `signOutSupabase()` implementado |
| Creación de clubes | ⚠️ Pendiente E2E | RPC `create_club_with_admin` |
| Invitaciones | ⚠️ Pendiente E2E | RPC `get_invitation_by_token` + `accept_club_invitation` |
| Permisos | ⚠️ Pendiente E2E | `memberships.permissions` JSONB |
| CRUD jugadores | ⚠️ Pendiente E2E | Sin cambios UI — persiste en Supabase vía adapter |
| Entrenamientos / Ejercicios / Pizarra / Médico | ⚠️ Pendiente E2E | Mismo adapter JSONB |
| Navegación / Responsive | ✅ | Sin cambios estructurales en rutas/layout |
| Deploy Vercel | ⏸ No ejecutado | Sin commit/push según instrucción |
| Consola sin errores | ✅ | Build limpio; dev sin env muestra gate (esperado) |

> **Bloqueo actual para E2E:** `.env.local` no contiene `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. La app muestra correctamente la pantalla de configuración requerida.

---

## Errores encontrados y soluciones aplicadas

| Error | Solución |
|-------|----------|
| Dual-mode local/Supabase inconsistente | Eliminado fallback local en Auth y Storage |
| Invitaciones no legibles sin sesión (RLS) | RPC pública `get_invitation_by_token` |
| Miembros del club sin email visible | Campo `email` en `profiles` + policy same-club |
| Saves excesivos a Supabase | Debounce 800 ms en adapter |
| `loadAppState()` sync incompatible | `loadAppStateAsync()` + loading states |
| Múltiples clubs por usuario | RPC valida `user_has_active_club()` |
| Pérdida de datos legacy | `import_club_app_state` + detección automática de keys legacy |
| Realtime duplicado en publication | `002` migration con bloque `duplicate_object` |

---

## Pasos para completar verificación E2E (antes de deploy)

1. Crear proyecto Supabase y ejecutar **ambos** SQL:
   - `001_initial_schema.sql`
   - `002_rls_and_invitations.sql`
2. Configurar `.env.local`:
   ```env
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
3. Auth → Email: desactivar confirmación (pruebas) o configurar SMTP (prod).
4. Reiniciar `npm run dev` y verificar checklist completo.
5. Agregar variables en Vercel → redeploy.
6. **Recién entonces** Commit & Push.

---

## Recomendaciones — siguiente etapa

1. **Supabase Storage:** migrar `dataUrl` de fotos/documentos a bucket `club-assets` (evita límites JSONB).
2. **Normalización progresiva:** extraer `players`, `matches`, `trainings` a tablas dedicadas cuando el volumen crezca.
3. **Conflictos Realtime:** implementar versionado (`updated_at` + merge) para ediciones simultáneas.
4. **Backups automáticos:** activar PITR en Supabase Pro + export JSON programado desde Edge Function.
5. **Notificaciones:** Supabase Realtime + tabla `notifications` por club/usuario.
6. **Tests E2E:** Playwright con proyecto Supabase de staging.
7. **Eliminar código legacy:** deprecar `authStorage.js` y adapters localStorage tras validar migración en producción.

---

## Checklist pre-deploy (para Marcel)

- [ ] Ejecutar SQL 001 + 002 en Supabase
- [ ] Configurar env vars local + Vercel
- [ ] Probar registro → login → crear jugador → entrenamiento → logout → login
- [ ] Probar invitación end-to-end
- [ ] Probar permisos DT en `/equipo/accesos`
- [ ] Verificar migración con datos legacy en localStorage
- [ ] Commit & Push
- [ ] Verificar deploy Vercel + consola limpia en producción

-- ══ 001_initial_schema.sql ══
-- CoachBoard — esquema inicial Supabase
-- Ejecutar en el SQL Editor de Supabase o via CLI: supabase db push

-- ── Perfiles (extiende auth.users) ──────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Clubs ───────────────────────────────────────────────────────────────────
create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legacy_local_id text unique,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Membresías (usuario ↔ club + rol) ───────────────────────────────────────
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  club_id uuid not null references public.clubs(id) on delete cascade,
  role text not null,
  permissions jsonb,
  status text not null default 'active' check (status in ('active', 'inactive', 'pending')),
  joined_at timestamptz not null default now(),
  unique (user_id, club_id)
);

create index if not exists memberships_club_id_idx on public.memberships(club_id);
create index if not exists memberships_user_id_idx on public.memberships(user_id);

-- ── Invitaciones ────────────────────────────────────────────────────────────
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  email text not null,
  role text not null,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  accepted_at timestamptz
);

create index if not exists invitations_club_id_idx on public.invitations(club_id);
create index if not exists invitations_token_idx on public.invitations(token);

-- ── Estado de la app por club (JSONB — migración progresiva) ─────────────────
create table if not exists public.club_app_state (
  club_id uuid primary key references public.clubs(id) on delete cascade,
  schema_version int not null default 4,
  state jsonb not null default '{}'::jsonb,
  migrated_from_local_at timestamptz,
  legacy_local_id text,
  updated_at timestamptz not null default now()
);

-- ── Registro de migraciones locales ─────────────────────────────────────────
create table if not exists public.club_migration_log (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  source text not null,
  legacy_key text,
  records_summary jsonb,
  migrated_at timestamptz not null default now()
);

-- ── Metadatos de archivos (preparado para Storage) ──────────────────────────
create table if not exists public.club_files (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  field_name text,
  file_name text,
  mime_type text,
  storage_bucket text not null default 'club-assets',
  storage_path text not null,
  size_bytes bigint,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists club_files_club_entity_idx
  on public.club_files(club_id, entity_type, entity_id);

-- ── Helper: clubes del usuario autenticado ──────────────────────────────────
create or replace function public.user_club_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select club_id
  from public.memberships
  where user_id = auth.uid()
    and status = 'active';
$$;

-- ── Trigger: perfil al registrarse ──────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RPC: crear club + admin ───────────────────────────────────────────────────
create or replace function public.create_club_with_admin(
  p_club_name text,
  p_full_name text default null,
  p_legacy_local_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_club_id uuid;
begin
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  update public.profiles
  set full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
      updated_at = now()
  where id = v_user_id;

  insert into public.clubs (name, created_by, legacy_local_id)
  values (trim(p_club_name), v_user_id, p_legacy_local_id)
  returning id into v_club_id;

  insert into public.memberships (user_id, club_id, role, status)
  values (v_user_id, v_club_id, 'administrador', 'active');

  insert into public.club_app_state (club_id, schema_version, state)
  values (v_club_id, 4, '{}'::jsonb);

  return v_club_id;
end;
$$;

-- ── RPC: aceptar invitación ───────────────────────────────────────────────────
create or replace function public.accept_club_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_invite public.invitations%rowtype;
  v_club_id uuid;
begin
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  select * into v_invite
  from public.invitations
  where token = p_token
    and status = 'pending'
    and expires_at > now()
  for update;

  if not found then
    raise exception 'Invitación no válida o expirada';
  end if;

  if lower(v_invite.email) <> lower((select email from auth.users where id = v_user_id)) then
    raise exception 'El correo no coincide con la invitación';
  end if;

  if exists (
    select 1 from public.memberships
    where user_id = v_user_id and club_id = v_invite.club_id and status = 'active'
  ) then
    raise exception 'Ya pertenecés a este club';
  end if;

  insert into public.memberships (user_id, club_id, role, status)
  values (v_user_id, v_invite.club_id, v_invite.role, 'active');

  update public.invitations
  set status = 'accepted', accepted_at = now()
  where id = v_invite.id;

  return v_invite.club_id;
end;
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.club_app_state enable row level security;
alter table public.club_migration_log enable row level security;
alter table public.club_files enable row level security;

-- Profiles
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- Clubs
create policy "clubs_select_member" on public.clubs
  for select using (id in (select public.user_club_ids()));
create policy "clubs_insert_authenticated" on public.clubs
  for insert with check (auth.uid() is not null);

-- Memberships
create policy "memberships_select_same_club" on public.memberships
  for select using (club_id in (select public.user_club_ids()));
create policy "memberships_update_admin_dt" on public.memberships
  for update using (
    club_id in (select public.user_club_ids())
    and exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.club_id = memberships.club_id
        and m.status = 'active'
        and m.role in ('administrador', 'director_tecnico')
    )
  );

-- Invitations
create policy "invitations_select_same_club" on public.invitations
  for select using (club_id in (select public.user_club_ids()));
create policy "invitations_insert_admin" on public.invitations
  for insert with check (
    club_id in (select public.user_club_ids())
    and exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.club_id = invitations.club_id
        and m.status = 'active'
        and m.role = 'administrador'
    )
  );

-- Club app state
create policy "club_app_state_select_member" on public.club_app_state
  for select using (club_id in (select public.user_club_ids()));
create policy "club_app_state_upsert_member" on public.club_app_state
  for all using (club_id in (select public.user_club_ids()))
  with check (club_id in (select public.user_club_ids()));

-- Migration log
create policy "club_migration_log_select_member" on public.club_migration_log
  for select using (club_id in (select public.user_club_ids()));
create policy "club_migration_log_insert_member" on public.club_migration_log
  for insert with check (club_id in (select public.user_club_ids()));

-- Files
create policy "club_files_select_member" on public.club_files
  for select using (club_id in (select public.user_club_ids()));
create policy "club_files_insert_member" on public.club_files
  for insert with check (club_id in (select public.user_club_ids()));
create policy "club_files_delete_member" on public.club_files
  for delete using (club_id in (select public.user_club_ids()));

-- ── Realtime (preparado) ─────────────────────────────────────────────────────
alter publication supabase_realtime add table public.club_app_state;

-- ── Storage bucket (ejecutar en dashboard o via API) ──────────────────────────
-- insert into storage.buckets (id, name, public) values ('club-assets', 'club-assets', false);

-- ══ 002_rls_and_invitations.sql ══
-- CoachBoard — migración v2: políticas reforzadas, invitaciones públicas, 1 club por usuario

-- ── Perfiles visibles dentro del mismo club ───────────────────────────────────
drop policy if exists "profiles_select_same_club" on public.profiles;
create policy "profiles_select_same_club" on public.profiles
  for select using (
    id = auth.uid()
    or id in (
      select m.user_id
      from public.memberships m
      where m.club_id in (select public.user_club_ids())
        and m.status = 'active'
    )
  );

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

-- ── Clubs: actualización por administrador ────────────────────────────────────
drop policy if exists "clubs_update_admin" on public.clubs;
create policy "clubs_update_admin" on public.clubs
  for update using (
    id in (select public.user_club_ids())
    and exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.club_id = clubs.id
        and m.status = 'active'
        and m.role = 'administrador'
    )
  );

-- ── Invitaciones: lectura pública por token (solo campos seguros) ─────────────
create or replace function public.get_invitation_by_token(p_token text)
returns table (
  invitation_id uuid,
  club_id uuid,
  club_name text,
  email text,
  role text,
  expires_at timestamptz,
  status text
)
language sql
security definer
set search_path = public
as $$
  select
    i.id,
    i.club_id,
    c.name,
    i.email,
    i.role,
    i.expires_at,
    i.status
  from public.invitations i
  join public.clubs c on c.id = i.club_id
  where i.token = p_token
    and i.status = 'pending'
    and i.expires_at > now();
$$;

grant execute on function public.get_invitation_by_token(text) to anon, authenticated;

-- ── Un usuario = un club activo ─────────────────────────────────────────────
create or replace function public.user_has_active_club()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where user_id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.create_club_with_admin(
  p_club_name text,
  p_full_name text default null,
  p_legacy_local_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_club_id uuid;
begin
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  if public.user_has_active_club() then
    raise exception 'Ya pertenecés a un club. Cada usuario puede pertenecer a un solo club.';
  end if;

  update public.profiles
  set full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
      updated_at = now()
  where id = v_user_id;

  insert into public.clubs (name, created_by, legacy_local_id)
  values (trim(p_club_name), v_user_id, p_legacy_local_id)
  returning id into v_club_id;

  insert into public.memberships (user_id, club_id, role, status)
  values (v_user_id, v_club_id, 'administrador', 'active');

  insert into public.club_app_state (club_id, schema_version, state)
  values (v_club_id, 4, '{}'::jsonb);

  return v_club_id;
end;
$$;

create or replace function public.accept_club_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_invite public.invitations%rowtype;
begin
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  if public.user_has_active_club() then
    raise exception 'Ya pertenecés a un club. Cada usuario puede pertenecer a un solo club.';
  end if;

  select * into v_invite
  from public.invitations
  where token = p_token
    and status = 'pending'
    and expires_at > now()
  for update;

  if not found then
    raise exception 'Invitación no válida o expirada';
  end if;

  if lower(v_invite.email) <> lower((select email from auth.users where id = v_user_id)) then
    raise exception 'El correo no coincide con la invitación';
  end if;

  insert into public.memberships (user_id, club_id, role, status)
  values (v_user_id, v_invite.club_id, v_invite.role, 'active');

  update public.invitations
  set status = 'accepted', accepted_at = now()
  where id = v_invite.id;

  return v_invite.club_id;
end;
$$;

-- ── RPC: importar estado desde migración (marca timestamp) ────────────────────
create or replace function public.import_club_app_state(
  p_club_id uuid,
  p_state jsonb,
  p_schema_version int default 4,
  p_legacy_local_id text default null,
  p_legacy_key text default null,
  p_records_summary jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  if p_club_id not in (select public.user_club_ids()) then
    raise exception 'Sin acceso al club';
  end if;

  insert into public.club_app_state (club_id, schema_version, state, migrated_from_local_at, legacy_local_id, updated_at)
  values (p_club_id, p_schema_version, p_state, now(), p_legacy_local_id, now())
  on conflict (club_id) do update set
    schema_version = excluded.schema_version,
    state = excluded.state,
    migrated_from_local_at = coalesce(public.club_app_state.migrated_from_local_at, excluded.migrated_from_local_at),
    legacy_local_id = coalesce(public.club_app_state.legacy_local_id, excluded.legacy_local_id),
    updated_at = now()
  where public.club_app_state.state = '{}'::jsonb
     or public.club_app_state.migrated_from_local_at is null;

  insert into public.club_migration_log (club_id, source, legacy_key, records_summary)
  values (p_club_id, 'localStorage', p_legacy_key, p_records_summary);
end;
$$;

grant execute on function public.import_club_app_state(uuid, jsonb, int, text, text, jsonb) to authenticated;

-- ── Separar políticas INSERT/UPDATE en club_app_state ───────────────────────
drop policy if exists "club_app_state_upsert_member" on public.club_app_state;

drop policy if exists "club_app_state_insert_member" on public.club_app_state;
create policy "club_app_state_insert_member" on public.club_app_state
  for insert with check (club_id in (select public.user_club_ids()));

drop policy if exists "club_app_state_update_member" on public.club_app_state;
create policy "club_app_state_update_member" on public.club_app_state
  for update using (club_id in (select public.user_club_ids()))
  with check (club_id in (select public.user_club_ids()));

-- ── Realtime (idempotente) ───────────────────────────────────────────────────
do $$
begin
  alter publication supabase_realtime add table public.club_app_state;
exception
  when duplicate_object then null;
end $$;

-- ══ 003_storage_and_indexes.sql ══
-- CoachBoard — Storage bucket + políticas RLS para archivos del club
-- Bucket privado: club-assets (fotos, documentos, videos)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'club-assets',
  'club-assets',
  false,
  52428800,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'video/mp4', 'video/webm'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Helper: extraer club_id del path del objeto (formato: {club_id}/...)
create or replace function public.storage_club_id(object_name text)
returns uuid
language sql
immutable
as $$
  select nullif(split_part(object_name, '/', 1), '')::uuid;
$$;

-- SELECT: miembros del club pueden leer archivos de su club
drop policy if exists "club_assets_select_member" on storage.objects;
create policy "club_assets_select_member"
  on storage.objects for select
  using (
    bucket_id = 'club-assets'
    and public.storage_club_id(name) in (select public.user_club_ids())
  );

-- INSERT: miembros del club pueden subir a su carpeta
drop policy if exists "club_assets_insert_member" on storage.objects;
create policy "club_assets_insert_member"
  on storage.objects for insert
  with check (
    bucket_id = 'club-assets'
    and public.storage_club_id(name) in (select public.user_club_ids())
    and auth.uid() is not null
  );

-- UPDATE: miembros del club pueden actualizar sus archivos
drop policy if exists "club_assets_update_member" on storage.objects;
create policy "club_assets_update_member"
  on storage.objects for update
  using (
    bucket_id = 'club-assets'
    and public.storage_club_id(name) in (select public.user_club_ids())
  )
  with check (
    bucket_id = 'club-assets'
    and public.storage_club_id(name) in (select public.user_club_ids())
  );

-- DELETE: miembros del club pueden eliminar archivos de su club
drop policy if exists "club_assets_delete_member" on storage.objects;
create policy "club_assets_delete_member"
  on storage.objects for delete
  using (
    bucket_id = 'club-assets'
    and public.storage_club_id(name) in (select public.user_club_ids())
  );

-- Índice para consultas frecuentes en club_files
create index if not exists club_files_storage_path_idx
  on public.club_files (club_id, storage_path);

-- Actualizar timestamp en club_app_state automáticamente
create or replace function public.touch_club_app_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists club_app_state_updated_at on public.club_app_state;
create trigger club_app_state_updated_at
  before update on public.club_app_state
  for each row execute function public.touch_club_app_state_updated_at();

-- Índice GIN para búsquedas futuras dentro del JSONB (opcional, escalabilidad)
create index if not exists club_app_state_state_gin_idx
  on public.club_app_state using gin (state jsonb_path_ops);

-- ══ 004_library.sql ══
-- CoachBoard — Biblioteca (recursos del club + contenido oficial)
-- Ejecutar: supabase db push  o  SQL Editor

-- ── Recursos de Biblioteca ───────────────────────────────────────────────────
create table if not exists public.library_resources (
  id            uuid primary key default gen_random_uuid(),
  club_id       uuid references public.clubs(id) on delete cascade,
  content_type  text not null check (content_type in (
    'exercise', 'training', 'microcycle', 'planning', 'season', 'video', 'document'
  )),
  source_type   text not null default 'user' check (source_type in (
    'official', 'club', 'user', 'ai', 'imported', 'shared'
  )),
  category      text not null default '',
  subcategory   text default '',
  title         text not null,
  description   text not null default '',
  objective     text not null default '',
  metadata      jsonb not null default '{}'::jsonb,
  tags          text[] not null default '{}',
  is_demo       boolean not null default false,
  is_published  boolean not null default true,
  usage_count   int not null default 0,
  created_by    uuid references public.profiles(id) on delete set null,
  updated_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  archived_at   timestamptz
);

create index if not exists library_resources_club_type_idx
  on public.library_resources (club_id, content_type)
  where archived_at is null;

create index if not exists library_resources_club_category_idx
  on public.library_resources (club_id, category)
  where archived_at is null;

create index if not exists library_resources_official_idx
  on public.library_resources (content_type, source_type)
  where club_id is null and archived_at is null;

create index if not exists library_resources_metadata_gin_idx
  on public.library_resources using gin (metadata jsonb_path_ops);

create index if not exists library_resources_tags_gin_idx
  on public.library_resources using gin (tags);

-- ── Favoritos por usuario ────────────────────────────────────────────────────
create table if not exists public.library_favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  club_id     uuid not null references public.clubs(id) on delete cascade,
  resource_id uuid not null references public.library_resources(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, resource_id)
);

create index if not exists library_favorites_user_club_idx
  on public.library_favorites (user_id, club_id);

-- ── Trigger updated_at ───────────────────────────────────────────────────────
create or replace function public.set_library_resource_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists library_resources_updated_at on public.library_resources;
create trigger library_resources_updated_at
  before update on public.library_resources
  for each row execute function public.set_library_resource_updated_at();

-- ── RLS: library_resources ───────────────────────────────────────────────────
alter table public.library_resources enable row level security;

-- Ver: contenido oficial (club_id null) o del club del usuario
create policy "library_resources_select"
  on public.library_resources for select
  using (
    archived_at is null
    and (
      club_id is null
      or club_id in (select public.user_club_ids())
    )
  );

-- Crear: solo en clubes del usuario (no contenido oficial desde cliente)
create policy "library_resources_insert"
  on public.library_resources for insert
  with check (
    club_id in (select public.user_club_ids())
    and source_type <> 'official'
  );

-- Actualizar: recursos del club, no oficiales
create policy "library_resources_update"
  on public.library_resources for update
  using (
    club_id in (select public.user_club_ids())
    and source_type <> 'official'
  );

-- Eliminar (archivar): recursos del club propios
create policy "library_resources_delete"
  on public.library_resources for delete
  using (
    club_id in (select public.user_club_ids())
    and source_type <> 'official'
  );

-- ── RLS: library_favorites ───────────────────────────────────────────────────
alter table public.library_favorites enable row level security;

create policy "library_favorites_select_own"
  on public.library_favorites for select
  using (user_id = auth.uid());

create policy "library_favorites_insert_own"
  on public.library_favorites for insert
  with check (
    user_id = auth.uid()
    and club_id in (select public.user_club_ids())
  );

create policy "library_favorites_delete_own"
  on public.library_favorites for delete
  using (user_id = auth.uid());

-- ══ 005_saas_core.sql ══
-- CoachBoard — migración v5: núcleo SaaS multi-club
-- organizations → clubs → teams
-- users_profile, roles, permissions, memberships (RLS por club_id)

-- ── Organizaciones (tenant raíz) ─────────────────────────────────────────────
create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique,
  created_by  uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── users_profile (renombrar profiles si existe) ─────────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'users_profile'
  ) then
    alter table public.profiles rename to users_profile;
  end if;
end $$;

create table if not exists public.users_profile (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  email       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Vista de compatibilidad con código existente (profiles)
create or replace view public.profiles as
  select * from public.users_profile;

create or replace function public.profiles_view_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users_profile (id, full_name, email, avatar_url, created_at, updated_at)
  values (new.id, new.full_name, new.email, new.avatar_url, coalesce(new.created_at, now()), coalesce(new.updated_at, now()))
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

create or replace function public.profiles_view_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users_profile set
    full_name = new.full_name,
    email = new.email,
    avatar_url = new.avatar_url,
    updated_at = now()
  where id = old.id;
  return new;
end;
$$;

drop trigger if exists profiles_instead_of_insert on public.profiles;
create trigger profiles_instead_of_insert
  instead of insert on public.profiles
  for each row execute function public.profiles_view_insert();

drop trigger if exists profiles_instead_of_update on public.profiles;
create trigger profiles_instead_of_update
  instead of update on public.profiles
  for each row execute function public.profiles_view_update();

-- FK organizations.created_by → users_profile
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'organizations_created_by_fkey'
  ) then
    alter table public.organizations
      add constraint organizations_created_by_fkey
      foreign key (created_by) references public.users_profile(id) on delete set null;
  end if;
end $$;

-- ── Clubs → organization ─────────────────────────────────────────────────────
alter table public.clubs
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade;

create index if not exists clubs_organization_id_idx on public.clubs(organization_id);

-- Backfill: una organización por club existente sin org
insert into public.organizations (name, slug, created_by, created_at, updated_at)
select
  c.name,
  'club-' || c.id::text,
  c.created_by,
  c.created_at,
  c.updated_at
from public.clubs c
where c.organization_id is null
  and not exists (
    select 1 from public.organizations o where o.slug = 'club-' || c.id::text
  );

update public.clubs c
set organization_id = o.id
from public.organizations o
where c.organization_id is null
  and o.slug = 'club-' || c.id::text;

-- ── Equipos ──────────────────────────────────────────────────────────────────
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references public.clubs(id) on delete cascade,
  name        text not null,
  category    text,
  season      text,
  is_active   boolean not null default true,
  created_by  uuid references public.users_profile(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists teams_club_id_idx on public.teams(club_id);

-- ── Roles por club ───────────────────────────────────────────────────────────
create table if not exists public.roles (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references public.clubs(id) on delete cascade,
  key         text not null,
  label       text not null,
  is_system   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (club_id, key)
);

create index if not exists roles_club_id_idx on public.roles(club_id);

-- ── Permisos por rol ─────────────────────────────────────────────────────────
create table if not exists public.permissions (
  id              uuid primary key default gen_random_uuid(),
  club_id         uuid not null references public.clubs(id) on delete cascade,
  role_id         uuid not null references public.roles(id) on delete cascade,
  module          text not null,
  can_view        boolean not null default false,
  can_edit        boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (role_id, module)
);

create index if not exists permissions_club_id_idx on public.permissions(club_id);
create index if not exists permissions_role_id_idx on public.permissions(role_id);

-- Membresías: enlace opcional a roles normalizados
alter table public.memberships
  add column if not exists role_id uuid references public.roles(id) on delete set null;

create index if not exists memberships_role_id_idx on public.memberships(role_id);

-- ── Seed roles + permisos por club ───────────────────────────────────────────
create or replace function public.seed_club_roles(p_club_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role record;
  v_role_id uuid;
begin
  for v_role in
    select * from (values
      ('administrador',       'Administrador'),
      ('director_tecnico',    'Director Técnico'),
      ('ayudante_tecnico',    'Ayudante Técnico'),
      ('preparador_fisico',   'Preparador Físico'),
      ('medico',              'Médico'),
      ('fisioterapeuta',      'Fisioterapeuta'),
      ('delegado',            'Delegado')
    ) as r(key, label)
  loop
    insert into public.roles (club_id, key, label, is_system)
    values (p_club_id, v_role.key, v_role.label, true)
    on conflict (club_id, key) do nothing;

    select id into v_role_id
    from public.roles
    where club_id = p_club_id and key = v_role.key;

    -- Permisos base: admin = todo; resto se completa en app layer por ahora
    if v_role.key = 'administrador' then
      insert into public.permissions (club_id, role_id, module, can_view, can_edit)
      select p_club_id, v_role_id, m.module, true, true
      from (values
        ('dashboard'), ('plantel'), ('partidos'), ('entrenamientos'),
        ('rendimiento'), ('medico'), ('staff'), ('pizarra'),
        ('biblioteca'), ('ejercicios'), ('configuracion'), ('equipo')
      ) as m(module)
      on conflict (role_id, module) do nothing;
    end if;
  end loop;

  -- Sincronizar role_id en memberships existentes
  update public.memberships m
  set role_id = r.id
  from public.roles r
  where m.club_id = p_club_id
    and r.club_id = p_club_id
    and r.key = m.role
    and m.role_id is null;
end;
$$;

-- Seed para clubs existentes
do $$
declare
  v_club_id uuid;
begin
  for v_club_id in select id from public.clubs loop
    perform public.seed_club_roles(v_club_id);
  end loop;
end $$;

-- ── Actualizar trigger de registro ───────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users_profile (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ── Actualizar RPC crear club (org + roles) ──────────────────────────────────
create or replace function public.create_club_with_admin(
  p_club_name text,
  p_full_name text default null,
  p_legacy_local_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_org_id uuid;
  v_club_id uuid;
  v_slug text;
begin
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  if public.user_has_active_club() then
    raise exception 'Ya pertenecés a un club. Cada usuario puede pertenecer a un solo club.';
  end if;

  update public.users_profile
  set full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
      updated_at = now()
  where id = v_user_id;

  v_slug := lower(regexp_replace(trim(p_club_name), '[^a-zA-Z0-9]+', '-', 'g'))
    || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);

  insert into public.organizations (name, slug, created_by)
  values (trim(p_club_name), v_slug, v_user_id)
  returning id into v_org_id;

  insert into public.clubs (name, organization_id, created_by, legacy_local_id)
  values (trim(p_club_name), v_org_id, v_user_id, p_legacy_local_id)
  returning id into v_club_id;

  perform public.seed_club_roles(v_club_id);

  insert into public.memberships (user_id, club_id, role, role_id, status)
  select v_user_id, v_club_id, 'administrador', r.id, 'active'
  from public.roles r
  where r.club_id = v_club_id and r.key = 'administrador';

  insert into public.club_app_state (club_id, schema_version, state)
  values (v_club_id, 5, '{}'::jsonb);

  return v_club_id;
end;
$$;

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.organizations enable row level security;
alter table public.users_profile enable row level security;
alter table public.teams enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;

-- organizations: visible si el usuario pertenece a un club de la org
drop policy if exists "organizations_select_member" on public.organizations;
create policy "organizations_select_member" on public.organizations
  for select using (
    id in (
      select c.organization_id from public.clubs c
      where c.id in (select public.user_club_ids())
    )
  );

drop policy if exists "organizations_update_admin" on public.organizations;
create policy "organizations_update_admin" on public.organizations
  for update using (
    id in (
      select c.organization_id from public.clubs c
      join public.memberships m on m.club_id = c.id
      where m.user_id = auth.uid()
        and m.status = 'active'
        and m.role = 'administrador'
    )
  );

-- users_profile
drop policy if exists "profiles_select_own" on public.users_profile;
drop policy if exists "profiles_update_own" on public.users_profile;
drop policy if exists "profiles_select_same_club" on public.users_profile;

create policy "users_profile_select_own" on public.users_profile
  for select using (id = auth.uid());

create policy "users_profile_select_same_club" on public.users_profile
  for select using (
    id = auth.uid()
    or id in (
      select m.user_id from public.memberships m
      where m.club_id in (select public.user_club_ids())
        and m.status = 'active'
    )
  );

create policy "users_profile_update_own" on public.users_profile
  for update using (id = auth.uid());

create policy "users_profile_insert_own" on public.users_profile
  for insert with check (id = auth.uid());

-- teams
drop policy if exists "teams_select_member" on public.teams;
create policy "teams_select_member" on public.teams
  for select using (club_id in (select public.user_club_ids()));

drop policy if exists "teams_insert_member" on public.teams;
create policy "teams_insert_member" on public.teams
  for insert with check (club_id in (select public.user_club_ids()));

drop policy if exists "teams_update_member" on public.teams;
create policy "teams_update_member" on public.teams
  for update using (club_id in (select public.user_club_ids()))
  with check (club_id in (select public.user_club_ids()));

drop policy if exists "teams_delete_member" on public.teams;
create policy "teams_delete_member" on public.teams
  for delete using (club_id in (select public.user_club_ids()));

-- roles
drop policy if exists "roles_select_member" on public.roles;
create policy "roles_select_member" on public.roles
  for select using (club_id in (select public.user_club_ids()));

-- permissions
drop policy if exists "permissions_select_member" on public.permissions;
create policy "permissions_select_member" on public.permissions
  for select using (club_id in (select public.user_club_ids()));

-- memberships insert policy (needed for RPC flow visibility)
drop policy if exists "memberships_insert_own" on public.memberships;
create policy "memberships_insert_own" on public.memberships
  for insert with check (user_id = auth.uid());

grant select on public.organizations to authenticated;
grant select on public.users_profile to authenticated;
grant select on public.teams to authenticated;
grant select on public.roles to authenticated;
grant select on public.permissions to authenticated;

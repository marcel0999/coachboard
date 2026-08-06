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

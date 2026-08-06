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

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

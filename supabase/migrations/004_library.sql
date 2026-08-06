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

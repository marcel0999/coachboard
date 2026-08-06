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

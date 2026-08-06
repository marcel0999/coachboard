import { assertSupabase } from '../../lib/supabase'

const BUCKET = 'club-assets'

/**
 * Sube un archivo al Storage del club.
 * Path: {clubId}/{entityType}/{entityId}/{filename}
 */
export async function uploadClubFile({
  clubId,
  entityType,
  entityId,
  file,
  fieldName = null,
}) {
  const client = assertSupabase()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${clubId}/${entityType}/${entityId}/${Date.now()}_${safeName}`

  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(storagePath, file, { upsert: false, contentType: file.type })

  if (uploadError) throw uploadError

  const { data: record, error: dbError } = await client
    .from('club_files')
    .insert({
      club_id: clubId,
      entity_type: entityType,
      entity_id: entityId,
      field_name: fieldName,
      file_name: file.name,
      mime_type: file.type,
      storage_bucket: BUCKET,
      storage_path: storagePath,
      size_bytes: file.size,
    })
    .select('id, storage_path, file_name, mime_type')
    .single()

  if (dbError) throw dbError
  return record
}

export async function getClubFileSignedUrl(storagePath, expiresIn = 3600) {
  const client = assertSupabase()
  const { data, error } = await client.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn)

  if (error) throw error
  return data.signedUrl
}

export async function deleteClubFile(fileId) {
  const client = assertSupabase()
  const { data: file, error: fetchError } = await client
    .from('club_files')
    .select('id, storage_path, storage_bucket')
    .eq('id', fileId)
    .single()

  if (fetchError) throw fetchError

  await client.storage.from(file.storage_bucket).remove([file.storage_path])
  await client.from('club_files').delete().eq('id', fileId)
}

export { BUCKET as CLUB_ASSETS_BUCKET }

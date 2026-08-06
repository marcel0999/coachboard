import { assertSupabase } from '../../lib/supabase'
import { legacyExerciseToResource, normalizeLibraryResource, resourceToDbPayload } from '../../utils/libraryResources'

const RESOURCES_TABLE = 'library_resources'
const FAVORITES_TABLE = 'library_favorites'

function handleTableError(error) {
  if (!error) return
  const code = error.code ?? ''
  const message = error.message ?? ''
  if (code === '42P01' || message.includes('does not exist')) {
    throw new Error(
      'La tabla de Biblioteca no existe en Supabase. Ejecutá la migración 004_library.sql.',
    )
  }
  throw error
}

export async function fetchLibraryResources(clubId, { contentType = null } = {}) {
  const client = assertSupabase()
  let query = client
    .from(RESOURCES_TABLE)
    .select('*')
    .is('archived_at', null)
    .or(`club_id.eq.${clubId},club_id.is.null`)
    .order('updated_at', { ascending: false })

  if (contentType) {
    query = query.eq('content_type', contentType)
  }

  const { data, error } = await query
  handleTableError(error)
  return (data ?? []).map(normalizeLibraryResource)
}

export async function fetchLibraryResourceById(resourceId) {
  const client = assertSupabase()
  const { data, error } = await client
    .from(RESOURCES_TABLE)
    .select('*')
    .eq('id', resourceId)
    .maybeSingle()
  handleTableError(error)
  return normalizeLibraryResource(data)
}

export async function upsertLibraryResource(clubId, resource, userId) {
  const client = assertSupabase()
  const payload = resourceToDbPayload(resource, { clubId, userId })

  if (resource.id) {
    const { data, error } = await client
      .from(RESOURCES_TABLE)
      .update(payload)
      .eq('id', resource.id)
      .eq('club_id', clubId)
      .select('*')
      .single()
    handleTableError(error)
    return normalizeLibraryResource(data)
  }

  const { data, error } = await client
    .from(RESOURCES_TABLE)
    .insert(payload)
    .select('*')
    .single()
  handleTableError(error)
  return normalizeLibraryResource(data)
}

export async function archiveLibraryResource(clubId, resourceId) {
  const client = assertSupabase()
  const { error } = await client
    .from(RESOURCES_TABLE)
    .update({ archived_at: new Date().toISOString() })
    .eq('id', resourceId)
    .eq('club_id', clubId)
  handleTableError(error)
}

export async function incrementResourceUsage(resourceId) {
  const client = assertSupabase()
  const { data } = await client
    .from(RESOURCES_TABLE)
    .select('usage_count')
    .eq('id', resourceId)
    .maybeSingle()

  if (!data) return
  await client
    .from(RESOURCES_TABLE)
    .update({ usage_count: (data.usage_count ?? 0) + 1 })
    .eq('id', resourceId)
}

export async function fetchUserFavorites(clubId, userId) {
  const client = assertSupabase()
  const { data, error } = await client
    .from(FAVORITES_TABLE)
    .select('resource_id')
    .eq('club_id', clubId)
    .eq('user_id', userId)
  handleTableError(error)
  return new Set((data ?? []).map((row) => row.resource_id))
}

export async function addFavorite(clubId, userId, resourceId) {
  const client = assertSupabase()
  const { error } = await client.from(FAVORITES_TABLE).upsert(
    { club_id: clubId, user_id: userId, resource_id: resourceId },
    { onConflict: 'user_id,resource_id' },
  )
  handleTableError(error)
}

export async function removeFavorite(userId, resourceId) {
  const client = assertSupabase()
  const { error } = await client
    .from(FAVORITES_TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('resource_id', resourceId)
  handleTableError(error)
}

export async function seedDemoResources(clubId, userId, demoResources = []) {
  const client = assertSupabase()
  const payloads = demoResources.map((resource) => ({
    ...resourceToDbPayload(resource, { clubId, userId }),
    is_demo: true,
    source_type: 'official',
    club_id: null,
  }))

  const { data, error } = await client
    .from(RESOURCES_TABLE)
    .insert(payloads)
    .select('*')
  handleTableError(error)
  return (data ?? []).map(normalizeLibraryResource)
}

export async function migrateLegacyExercises(clubId, userId, legacyExercises = []) {
  if (!legacyExercises.length) return []

  const existing = await fetchLibraryResources(clubId, { contentType: 'exercise' })
  const existingLegacyIds = new Set(
    existing.map((r) => r.metadata?.legacyId).filter(Boolean),
  )

  const toInsert = legacyExercises
    .filter((ex) => !existingLegacyIds.has(ex.id))
    .map((ex) => legacyExerciseToResource(ex, clubId, userId))

  if (!toInsert.length) return existing

  const client = assertSupabase()
  const { data, error } = await client.from(RESOURCES_TABLE).insert(toInsert).select('*')
  handleTableError(error)
  return [...existing, ...(data ?? []).map(normalizeLibraryResource)]
}

import { assertSupabase } from '../../lib/supabase'

function mapTeam(row) {
  return {
    id: row.id,
    clubId: row.club_id,
    name: row.name,
    category: row.category ?? '',
    season: row.season ?? '',
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

export async function fetchClubTeams(clubId) {
  const client = assertSupabase()
  const { data, error } = await client
    .from('teams')
    .select('id, club_id, name, category, season, is_active, created_at')
    .eq('club_id', clubId)
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return (data ?? []).map(mapTeam)
}

export async function fetchUserActiveClubs() {
  const client = assertSupabase()
  const { data: authData, error: authError } = await client.auth.getUser()
  if (authError) throw authError
  if (!authData.user) return []

  const { data, error } = await client
    .from('memberships')
    .select('id, role, club_id, clubs(id, name, organization_id)')
    .eq('user_id', authData.user.id)
    .eq('status', 'active')
    .order('joined_at', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => ({
    membershipId: row.id,
    role: row.role,
    club: {
      id: row.clubs?.id ?? row.club_id,
      name: row.clubs?.name ?? 'Club',
      organizationId: row.clubs?.organization_id ?? null,
    },
  }))
}

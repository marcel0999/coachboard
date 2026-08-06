import { INVITE_EXPIRY_DAYS, USER_ROLES } from '../../constants/auth'
import { assertSupabase, isSupabaseConfigured } from '../../lib/supabase'

function mapClub(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    legacyLocalId: row.legacy_local_id ?? null,
    createdAt: row.created_at,
  }
}

function mapMembership(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    clubId: row.club_id,
    role: row.role,
    permissions: row.permissions,
    status: row.status,
    joinedAt: row.joined_at,
  }
}

export async function getSupabaseSession() {
  if (!isSupabaseConfigured) return null
  const client = assertSupabase()
  const { data, error } = await client.auth.getSession()
  if (error) throw error
  return data.session
}

export async function fetchAuthContext(session) {
  const client = assertSupabase()
  const userId = session.user.id

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('id, full_name')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) throw profileError

  const { data: membershipRows, error: membershipError } = await client
    .from('memberships')
    .select('id, user_id, club_id, role, permissions, status, joined_at, clubs(id, name, legacy_local_id, created_at)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('joined_at', { ascending: true })
    .limit(1)

  if (membershipError) throw membershipError

  const membershipRow = membershipRows?.[0]
  if (!membershipRow) {
    throw new Error('Tu cuenta no tiene acceso a ningún club.')
  }

  const clubRow = membershipRow.clubs

  return {
    session: {
      userId,
      clubId: membershipRow.club_id,
      membershipId: membershipRow.id,
      loginAt: session.access_token ? new Date().toISOString() : null,
      provider: 'supabase',
    },
    user: {
      id: userId,
      email: session.user.email,
      fullName: profile?.full_name ?? session.user.user_metadata?.full_name ?? '',
    },
    club: mapClub(clubRow),
    membership: mapMembership(membershipRow),
  }
}

export async function signInWithEmail({ email, password }) {
  const client = assertSupabase()
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error) throw new Error(error.message)
  return fetchAuthContext(data.session)
}

export async function signUpClubAdmin({ clubName, fullName, email, password }) {
  const client = assertSupabase()
  const normalizedEmail = email.trim().toLowerCase()

  const { data: signUpData, error: signUpError } = await client.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: { full_name: fullName.trim() },
    },
  })

  if (signUpError) throw new Error(signUpError.message)

  let session = signUpData.session

  if (!session) {
    const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })
    if (signInError) {
      throw new Error(
        'Cuenta creada. Confirmá tu correo o revisá la configuración de Supabase Auth.',
      )
    }
    session = signInData.session
  }

  const { data: clubId, error: rpcError } = await client.rpc('create_club_with_admin', {
    p_club_name: clubName.trim(),
    p_full_name: fullName.trim(),
    p_legacy_local_id: null,
  })

  if (rpcError) throw new Error(rpcError.message)

  return fetchAuthContext(session)
}

export async function signOutSupabase() {
  if (!isSupabaseConfigured) return
  const client = assertSupabase()
  const { error } = await client.auth.signOut()
  if (error) throw error
}

export async function requestPasswordReset(email) {
  const client = assertSupabase()
  const redirectTo = `${window.location.origin}/restablecer-contrasena`
  const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo,
  })
  if (error) throw new Error(error.message)
}

export async function updatePassword(newPassword) {
  const client = assertSupabase()
  const { error } = await client.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
}

export async function getSupabaseAuthUser() {
  if (!isSupabaseConfigured) return null
  const client = assertSupabase()
  const { data, error } = await client.auth.getUser()
  if (error) throw error
  return data.user
}

export async function createSupabaseInvitation({ clubId, email, role, createdByUserId }) {
  const client = assertSupabase()
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 86400000).toISOString()

  const { data, error } = await client
    .from('invitations')
    .insert({
      club_id: clubId,
      email: email.trim().toLowerCase(),
      role,
      created_by: createdByUserId,
      expires_at: expiresAt,
      status: 'pending',
    })
    .select('id, club_id, email, role, token, created_at, expires_at, status')
    .single()

  if (error) throw new Error(error.message)
  return {
    id: data.id,
    clubId: data.club_id,
    email: data.email,
    role: data.role,
    token: data.token,
    createdAt: data.created_at,
    expiresAt: data.expires_at,
    status: data.status,
  }
}

export async function getSupabaseInvitationByToken(token) {
  const client = assertSupabase()
  const { data, error } = await client.rpc('get_invitation_by_token', { p_token: token })

  if (error) throw error

  const row = Array.isArray(data) ? data[0] : data
  if (!row) return null

  return {
    invite: {
      id: row.invitation_id,
      clubId: row.club_id,
      email: row.email,
      role: row.role,
      token,
      expiresAt: row.expires_at,
      status: row.status,
    },
    club: {
      id: row.club_id,
      name: row.club_name,
      legacyLocalId: null,
      createdAt: null,
    },
  }
}

export async function acceptSupabaseInvitation({ token, fullName, email, password }) {
  const client = assertSupabase()
  const normalizedEmail = email.trim().toLowerCase()

  const { error: signInError } = await client.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  })

  if (signInError) {
    const { error: signUpError } = await client.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { full_name: fullName.trim() } },
    })
    if (signUpError) throw new Error(signUpError.message)

    const { error: retrySignInError } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })
    if (retrySignInError) {
      throw new Error(
        'Cuenta creada. Confirmá tu correo o revisá la configuración de Supabase Auth.',
      )
    }
  }

  const { error: rpcError } = await client.rpc('accept_club_invitation', { p_token: token })
  if (rpcError) throw new Error(rpcError.message)

  const { data: sessionData } = await client.auth.getSession()
  if (!sessionData.session) throw new Error('No se pudo establecer la sesión.')

  await client
    .from('profiles')
    .update({ full_name: fullName.trim(), email: normalizedEmail, updated_at: new Date().toISOString() })
    .eq('id', sessionData.session.user.id)

  return fetchAuthContext(sessionData.session)
}


export async function listSupabasePendingInvitations(clubId) {
  const client = assertSupabase()
  const { data, error } = await client
    .from('invitations')
    .select('id, club_id, email, role, token, created_at, expires_at, status')
    .eq('club_id', clubId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())

  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id,
    clubId: row.club_id,
    email: row.email,
    role: row.role,
    token: row.token,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    status: row.status,
  }))
}

export async function updateSupabaseMemberPermissions(clubId, membershipId, permissions) {
  const client = assertSupabase()
  const { error } = await client
    .from('memberships')
    .update({ permissions })
    .eq('id', membershipId)
    .eq('club_id', clubId)

  if (error) throw error
}


export function onSupabaseAuthStateChange(callback) {
  if (!isSupabaseConfigured) return () => {}
  const client = assertSupabase()
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
  return () => data.subscription.unsubscribe()
}

export async function listSupabaseClubMembersWithEmail(clubId) {
  const client = assertSupabase()
  const { data, error } = await client
    .from('memberships')
    .select('id, user_id, club_id, role, permissions, status, joined_at, profiles(id, full_name, email)')
    .eq('club_id', clubId)
    .eq('status', 'active')

  if (error) throw error

  return (data ?? []).map((row) => ({
    membership: mapMembership(row),
    user: {
      id: row.user_id,
      fullName: row.profiles?.full_name ?? '',
      email: row.profiles?.email ?? '',
    },
  }))
}

export { USER_ROLES }

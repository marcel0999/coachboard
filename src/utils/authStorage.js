import {
  AUTH_REGISTRY_KEY,
  AUTH_SESSION_KEY,
  INVITE_EXPIRY_DAYS,
  USER_ROLES,
} from '../constants/auth'
import {
  generateId,
  generateInviteToken,
  hashPassword,
  verifyPassword,
} from './authCrypto'

function emptyRegistry() {
  return { users: [], clubs: [], memberships: [], invitations: [] }
}

export function loadAuthRegistry() {
  if (typeof localStorage === 'undefined') return emptyRegistry()
  try {
    const raw = localStorage.getItem(AUTH_REGISTRY_KEY)
    if (!raw) return emptyRegistry()
    const parsed = JSON.parse(raw)
    return {
      users: parsed.users ?? [],
      clubs: parsed.clubs ?? [],
      memberships: parsed.memberships ?? [],
      invitations: parsed.invitations ?? [],
    }
  } catch {
    return emptyRegistry()
  }
}

function saveAuthRegistry(registry) {
  localStorage.setItem(AUTH_REGISTRY_KEY, JSON.stringify(registry))
}

export function loadSession() {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSession(session) {
  if (session) {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(AUTH_SESSION_KEY)
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

export function getClubById(clubId) {
  return loadAuthRegistry().clubs.find((club) => club.id === clubId) ?? null
}

export function getUserById(userId) {
  return loadAuthRegistry().users.find((user) => user.id === userId) ?? null
}

export function getMembership(userId, clubId) {
  return (
    loadAuthRegistry().memberships.find(
      (entry) => entry.userId === userId && entry.clubId === clubId && entry.status === 'active',
    ) ?? null
  )
}

export function listClubMembers(clubId) {
  const registry = loadAuthRegistry()
  return registry.memberships
    .filter((entry) => entry.clubId === clubId && entry.status === 'active')
    .map((entry) => ({
      membership: entry,
      user: registry.users.find((user) => user.id === entry.userId) ?? null,
    }))
    .filter((row) => row.user)
}

export function listPendingInvitations(clubId) {
  return loadAuthRegistry().invitations.filter(
    (invite) => invite.clubId === clubId && invite.status === 'pending',
  )
}

export async function registerClubAndAdmin({
  clubName,
  fullName,
  email,
  password,
}) {
  const registry = loadAuthRegistry()
  const normalizedEmail = normalizeEmail(email)

  if (registry.users.some((user) => user.email === normalizedEmail)) {
    throw new Error('Ya existe una cuenta con ese correo electrónico.')
  }

  const salt = generateId('salt')
  const passwordHash = await hashPassword(password, salt)
  const userId = generateId('user')
  const clubId = generateId('club')
  const membershipId = generateId('member')
  const now = new Date().toISOString()

  const user = {
    id: userId,
    email: normalizedEmail,
    fullName: fullName.trim(),
    passwordHash,
    salt,
    createdAt: now,
  }

  const club = {
    id: clubId,
    name: clubName.trim(),
    createdAt: now,
    createdBy: userId,
  }

  const membership = {
    id: membershipId,
    userId,
    clubId,
    role: USER_ROLES.ADMIN,
    permissions: null,
    status: 'active',
    joinedAt: now,
  }

  registry.users.push(user)
  registry.clubs.push(club)
  registry.memberships.push(membership)
  saveAuthRegistry(registry)

  migrateLegacyAppStateToClub(clubId)

  const session = { userId, clubId, membershipId, loginAt: now }
  saveSession(session)

  return { user, club, membership, session }
}

export async function loginWithEmail({ email, password }) {
  const registry = loadAuthRegistry()
  const normalizedEmail = normalizeEmail(email)
  const user = registry.users.find((entry) => entry.email === normalizedEmail)

  if (!user) {
    throw new Error('Correo o contraseña incorrectos.')
  }

  const valid = await verifyPassword(password, user.salt, user.passwordHash)
  if (!valid) {
    throw new Error('Correo o contraseña incorrectos.')
  }

  const memberships = registry.memberships.filter(
    (entry) => entry.userId === user.id && entry.status === 'active',
  )

  if (memberships.length === 0) {
    throw new Error('Tu cuenta no tiene acceso a ningún club.')
  }

  const membership = memberships[0]
  const club = registry.clubs.find((entry) => entry.id === membership.clubId)
  if (!club) {
    throw new Error('No se encontró el club asociado a tu cuenta.')
  }

  const session = {
    userId: user.id,
    clubId: club.id,
    membershipId: membership.id,
    loginAt: new Date().toISOString(),
  }
  saveSession(session)

  return { user, club, membership, session }
}

export function createInvitation({ clubId, email, role, createdByUserId }) {
  const registry = loadAuthRegistry()
  const normalizedEmail = normalizeEmail(email)

  const pending = registry.invitations.find(
    (invite) =>
      invite.clubId === clubId &&
      invite.email === normalizedEmail &&
      invite.status === 'pending',
  )
  if (pending) {
    throw new Error('Ya existe una invitación pendiente para ese correo.')
  }

  const existingMember = registry.memberships.find((entry) => {
    if (entry.clubId !== clubId || entry.status !== 'active') return false
    const user = registry.users.find((u) => u.id === entry.userId)
    return user?.email === normalizedEmail
  })
  if (existingMember) {
    throw new Error('Ese correo ya pertenece al club.')
  }

  const invite = {
    id: generateId('invite'),
    clubId,
    email: normalizedEmail,
    role,
    token: generateInviteToken(),
    createdBy: createdByUserId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + INVITE_EXPIRY_DAYS * 86400000).toISOString(),
    status: 'pending',
  }

  registry.invitations.push(invite)
  saveAuthRegistry(registry)
  return invite
}

export function getInvitationByToken(token) {
  const registry = loadAuthRegistry()
  const invite = registry.invitations.find(
    (entry) => entry.token === token && entry.status === 'pending',
  )
  if (!invite) return null
  if (new Date(invite.expiresAt).getTime() < Date.now()) return null

  const club = registry.clubs.find((entry) => entry.id === invite.clubId) ?? null
  return { invite, club }
}

export async function acceptInvitation({ token, fullName, password }) {
  const registry = loadAuthRegistry()
  const match = getInvitationByToken(token)
  if (!match) {
    throw new Error('La invitación no es válida o expiró.')
  }

  const { invite, club } = match
  let user = registry.users.find((entry) => entry.email === invite.email)

  if (!user) {
    const salt = generateId('salt')
    const passwordHash = await hashPassword(password, salt)
    user = {
      id: generateId('user'),
      email: invite.email,
      fullName: fullName.trim(),
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    }
    registry.users.push(user)
  } else {
    const validExisting = registry.memberships.some(
      (entry) =>
        entry.userId === user.id &&
        entry.clubId === invite.clubId &&
        entry.status === 'active',
    )
    if (validExisting) {
      throw new Error('Ya tenés acceso a este club.')
    }
  }

  const membership = {
    id: generateId('member'),
    userId: user.id,
    clubId: invite.clubId,
    role: invite.role,
    permissions: null,
    status: 'active',
    joinedAt: new Date().toISOString(),
  }

  registry.memberships.push(membership)
  registry.invitations = registry.invitations.map((entry) =>
    entry.id === invite.id ? { ...entry, status: 'accepted', acceptedAt: new Date().toISOString() } : entry,
  )
  saveAuthRegistry(registry)

  const session = {
    userId: user.id,
    clubId: club.id,
    membershipId: membership.id,
    loginAt: new Date().toISOString(),
  }
  saveSession(session)

  return { user, club, membership, session }
}

export function updateMemberPermissions(clubId, membershipId, permissions) {
  const registry = loadAuthRegistry()
  registry.memberships = registry.memberships.map((entry) =>
    entry.id === membershipId && entry.clubId === clubId
      ? { ...entry, permissions }
      : entry,
  )
  saveAuthRegistry(registry)
}

export function logout() {
  saveSession(null)
}

/** Migra datos legacy (sin club) al primer club creado, sin borrar el original. */
export function migrateLegacyAppStateToClub(clubId) {
  if (typeof localStorage === 'undefined') return
  const legacyKey = 'coachboard_app_state'
  const clubKey = `coachboard_app_state_${clubId}`
  const legacyFlag = 'coachboard_has_user_data'
  const clubFlag = `coachboard_has_user_data_${clubId}`

  if (localStorage.getItem(clubKey)) return
  const legacy = localStorage.getItem(legacyKey)
  if (!legacy) return

  localStorage.setItem(clubKey, legacy)
  if (localStorage.getItem(legacyFlag) === 'true') {
    localStorage.setItem(clubFlag, 'true')
  }
}

export function getClubStorageKey(clubId) {
  return `coachboard_app_state_${clubId}`
}

export function getClubUserDataFlagKey(clubId) {
  return `coachboard_has_user_data_${clubId}`
}

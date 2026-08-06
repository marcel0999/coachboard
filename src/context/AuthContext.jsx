import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ROLE_LABELS, USER_ROLES } from '../constants/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  acceptSupabaseInvitation,
  createSupabaseInvitation,
  fetchAuthContext,
  getSupabaseInvitationByToken,
  getSupabaseSession,
  listSupabaseClubMembersWithEmail,
  listSupabasePendingInvitations,
  onSupabaseAuthStateChange,
  requestPasswordReset,
  signInWithEmail,
  signOutSupabase,
  signUpClubAdmin,
  updatePassword,
  updateSupabaseMemberPermissions,
} from '../services/supabase/authService'
import { canInviteMembers, canManageTeam, resolvePermissions } from '../utils/permissions'
import { clearActiveClubId } from '../utils/activeClubStorage'

const AuthContext = createContext(null)

function hasValidClubAccess(state) {
  return Boolean(state?.session && state?.club?.id && state?.membership?.id)
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(null)
  const [hasSupabaseSession, setHasSupabaseSession] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const hydrateSupabase = useCallback(async (session) => {
    const activeSession = session ?? (await getSupabaseSession())
    if (!activeSession) {
      setHasSupabaseSession(false)
      return null
    }
    setHasSupabaseSession(true)
    return fetchAuthContext(activeSession)
  }, [])

  const handleHydrationFailure = useCallback(async (error) => {
    console.error('[CoachBoard] Error al restaurar sesión:', error)
    setAuthError(error.message)

    if (error.message?.includes('no tiene acceso a ningún club')) {
      setHasSupabaseSession(true)
      try {
        const session = await getSupabaseSession()
        if (session) {
          setAuthState({
            session: {
              userId: session.user.id,
              provider: 'supabase',
              loginAt: new Date().toISOString(),
            },
            user: {
              id: session.user.id,
              email: session.user.email,
              fullName: session.user.user_metadata?.full_name ?? '',
            },
            club: null,
            membership: null,
          })
          return
        }
      } catch {
        /* fall through to sign out */
      }
    }

    setAuthState(null)
    await signOutSupabase().catch(() => {})
    setHasSupabaseSession(false)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      setHasSupabaseSession(false)
      return undefined
    }

    let cancelled = false

    async function bootstrap() {
      try {
        const session = await getSupabaseSession()
        if (cancelled) return
        if (!session) {
          setHasSupabaseSession(false)
          setAuthState(null)
          return
        }
        setHasSupabaseSession(true)
        const hydrated = await fetchAuthContext(session)
        if (!cancelled) {
          setAuthState(hydrated)
          setAuthError(null)
        }
      } catch (error) {
        if (!cancelled) await handleHydrationFailure(error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    bootstrap()

    const unsubscribe = onSupabaseAuthStateChange(async (session) => {
      if (cancelled) return
      if (!session) {
        setAuthState(null)
        setHasSupabaseSession(false)
        setAuthError(null)
        return
      }
      setHasSupabaseSession(true)
      try {
        const hydrated = await hydrateSupabase(session)
        setAuthState(hydrated)
        setAuthError(null)
      } catch (error) {
        await handleHydrationFailure(error)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [hydrateSupabase, handleHydrationFailure])

  const permissions = useMemo(() => {
    if (!authState?.membership) return {}
    return resolvePermissions(authState.membership.role, authState.membership.permissions)
  }, [authState?.membership])

  const applySession = useCallback((result) => {
    setAuthState(result)
    setHasSupabaseSession(true)
    setAuthError(null)
    return result
  }, [])

  const login = useCallback(async (email, password) => {
    setAuthError(null)
    try {
      const result = await signInWithEmail({ email, password })
      return applySession(result)
    } catch (error) {
      setAuthError(error.message)
      throw error
    }
  }, [applySession])

  const register = useCallback(async ({ clubName, fullName, email, password }) => {
    setAuthError(null)
    try {
      const result = await signUpClubAdmin({ clubName, fullName, email, password })
      if (result?.needsEmailVerification) return result
      return applySession(result)
    } catch (error) {
      setAuthError(error.message)
      throw error
    }
  }, [applySession])

  const acceptInvite = useCallback(async ({ token, fullName, password, email }) => {
    setAuthError(null)
    try {
      const inviteData = await getSupabaseInvitationByToken(token)
      if (!inviteData) throw new Error('La invitación no es válida o expiró.')

      const result = await acceptSupabaseInvitation({
        token,
        fullName,
        password,
        email: email ?? inviteData.invite.email,
      })
      return applySession(result)
    } catch (error) {
      setAuthError(error.message)
      throw error
    }
  }, [applySession])

  const logout = useCallback(async () => {
    const userId = authState?.user?.id
    await signOutSupabase()
    if (userId) clearActiveClubId(userId)
    setAuthState(null)
    setHasSupabaseSession(false)
    setAuthError(null)
  }, [authState?.user?.id])

  const resetPassword = useCallback(async (email) => {
    setAuthError(null)
    try {
      await requestPasswordReset(email)
    } catch (error) {
      setAuthError(error.message)
      throw error
    }
  }, [])

  const changePassword = useCallback(async (newPassword) => {
    setAuthError(null)
    try {
      await updatePassword(newPassword)
    } catch (error) {
      setAuthError(error.message)
      throw error
    }
  }, [])

  const inviteMember = useCallback(async ({ email, role }) => {
    if (!authState?.club || !authState?.user) {
      throw new Error('Sesión no válida.')
    }
    if (!canInviteMembers(authState.membership.role)) {
      throw new Error('No tenés permiso para invitar integrantes.')
    }
    return createSupabaseInvitation({
      clubId: authState.club.id,
      email,
      role,
      createdByUserId: authState.user.id,
    })
  }, [authState])

  const setMemberPermissions = useCallback(async (membershipId, nextPermissions) => {
    if (!authState?.club || !authState?.membership) {
      throw new Error('Sesión no válida.')
    }
    if (!canManageTeam(authState.membership.role, authState.membership.permissions)) {
      throw new Error('No tenés permiso para gestionar accesos.')
    }

    await updateSupabaseMemberPermissions(authState.club.id, membershipId, nextPermissions)

    if (authState.membership.id === membershipId) {
      setAuthState((prev) =>
        prev
          ? { ...prev, membership: { ...prev.membership, permissions: nextPermissions } }
          : prev,
      )
    }
  }, [authState])

  const refreshTeam = useCallback(async () => {
    if (!authState?.club) return { members: [], invitations: [] }

    const [members, invitations] = await Promise.all([
      listSupabaseClubMembersWithEmail(authState.club.id),
      listSupabasePendingInvitations(authState.club.id),
    ])
    return { members, invitations }
  }, [authState])

  const switchClub = useCallback(async (clubId) => {
    if (!clubId || clubId === authState?.club?.id) return authState
    setAuthError(null)
    const session = await getSupabaseSession()
    if (!session) throw new Error('Sesión no válida.')
    const hydrated = await fetchAuthContext(session, clubId)
    setAuthState(hydrated)
    return hydrated
  }, [authState])

  const value = useMemo(
    () => ({
      isAuthenticated: hasValidClubAccess(authState),
      hasSupabaseSession,
      needsClubAccess: hasSupabaseSession && !hasValidClubAccess(authState),
      isLoading,
      authError,
      isSupabaseMode: true,
      session: authState?.session ?? null,
      user: authState?.user ?? null,
      club: authState?.club ?? null,
      membership: authState?.membership ?? null,
      role: authState?.membership?.role ?? null,
      roleLabel: authState?.membership ? ROLE_LABELS[authState.membership.role] : null,
      permissions,
      isAdmin: authState?.membership?.role === USER_ROLES.ADMIN,
      isDirectorTecnico: authState?.membership?.role === USER_ROLES.DT,
      canInvite: authState?.membership ? canInviteMembers(authState.membership.role) : false,
      canManageAccess: authState?.membership
        ? canManageTeam(authState.membership.role, authState.membership.permissions)
        : false,
      login,
      register,
      acceptInvite,
      logout,
      requestPasswordReset: resetPassword,
      updatePassword: changePassword,
      inviteMember,
      setMemberPermissions,
      refreshTeam,
      switchClub,
    }),
    [
      authState,
      hasSupabaseSession,
      isLoading,
      authError,
      permissions,
      login,
      register,
      acceptInvite,
      logout,
      resetPassword,
      changePassword,
      inviteMember,
      setMemberPermissions,
      refreshTeam,
      switchClub,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

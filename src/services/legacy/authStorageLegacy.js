/**
 * @deprecated CoachBoard usa Supabase Auth exclusivamente.
 * Este módulo se conserva solo para migración legacy. No usar en código nuevo.
 */
export {
  loadAuthRegistry,
  loadSession,
  saveSession,
  getClubById,
  getUserById,
  getMembership,
  listClubMembers,
  listPendingInvitations,
  registerClubAndAdmin,
  loginWithEmail,
  createInvitation,
  getInvitationByToken,
  acceptInvitation,
  updateMemberPermissions,
  logout,
  migrateLegacyAppStateToClub,
  getClubStorageKey,
  getClubUserDataFlagKey,
} from '../../utils/authStorage'

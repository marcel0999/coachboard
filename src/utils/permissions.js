import { DEFAULT_ROLE_PERMISSIONS, PERMISSION_MODULES, USER_ROLES } from '../constants/auth'

export function resolvePermissions(role, customPermissions = null) {
  const defaults = DEFAULT_ROLE_PERMISSIONS[role] ?? {}
  const resolved = {}

  Object.keys(PERMISSION_MODULES).forEach((module) => {
    const base = defaults[module] ?? { view: false, edit: false }
    const override = customPermissions?.[module]
    resolved[module] = {
      view: override?.view ?? base.view ?? false,
      edit: override?.edit ?? base.edit ?? false,
    }
  })

  // Alias legacy: ejercicios hereda permisos de biblioteca
  if (resolved.biblioteca) {
    resolved.ejercicios = { ...resolved.biblioteca }
  }

  return resolved
}

export function canViewModule(role, customPermissions, module) {
  return resolvePermissions(role, customPermissions)[module]?.view ?? false
}

export function canEditModule(role, customPermissions, module) {
  return resolvePermissions(role, customPermissions)[module]?.edit ?? false
}

export function canManageTeam(role, customPermissions) {
  if (role === USER_ROLES.ADMIN) return true
  return canEditModule(role, customPermissions, 'equipo')
}

export function canInviteMembers(role) {
  return role === USER_ROLES.ADMIN
}

export function pathToModule(pathname) {
  if (pathname === '/dashboard') return 'dashboard'
  if (pathname.startsWith('/equipo')) return 'equipo'

  const entry = Object.entries(PERMISSION_MODULES).find(([, meta]) => {
    if (meta.path === '/') return false
    return pathname === meta.path || pathname.startsWith(`${meta.path}/`)
  })

  return entry?.[0] ?? null
}

export function canAccessPath(role, customPermissions, pathname) {
  const module = pathToModule(pathname)
  if (!module) return true
  return canViewModule(role, customPermissions, module)
}

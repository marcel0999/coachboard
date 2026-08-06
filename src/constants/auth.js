export const AUTH_REGISTRY_KEY = 'coachboard_auth_registry_v1'
export const AUTH_SESSION_KEY = 'coachboard_auth_session_v1'

export const USER_ROLES = {
  ADMIN: 'administrador',
  DT: 'director_tecnico',
  AT: 'ayudante_tecnico',
  PF: 'preparador_fisico',
  MEDICO: 'medico',
  FISIO: 'fisioterapeuta',
  DELEGADO: 'delegado',
}

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.DT]: 'Director Técnico',
  [USER_ROLES.AT]: 'Ayudante Técnico',
  [USER_ROLES.PF]: 'Preparador Físico',
  [USER_ROLES.MEDICO]: 'Médico',
  [USER_ROLES.FISIO]: 'Fisioterapeuta',
  [USER_ROLES.DELEGADO]: 'Delegado',
}

export const INVITABLE_ROLES = [
  USER_ROLES.DT,
  USER_ROLES.AT,
  USER_ROLES.PF,
  USER_ROLES.MEDICO,
  USER_ROLES.FISIO,
  USER_ROLES.DELEGADO,
]

/** Módulos alineados con la navegación de CoachBoard */
export const PERMISSION_MODULES = {
  dashboard: { label: 'Dashboard', path: '/dashboard' },
  plantel: { label: 'Plantel', path: '/plantel' },
  partidos: { label: 'Partidos', path: '/partidos' },
  entrenamientos: { label: 'Entrenamientos', path: '/entrenamientos' },
  rendimiento: { label: 'Centro de Rendimiento', path: '/rendimiento' },
  medico: { label: 'Centro Médico', path: '/medico' },
  staff: { label: 'Staff Técnico', path: '/staff' },
  pizarra: { label: 'Pizarra Táctica', path: '/pizarra' },
  biblioteca: { label: 'Biblioteca', path: '/biblioteca' },
  ejercicios: { label: 'Biblioteca', path: '/biblioteca' },
  configuracion: { label: 'Configuración', path: '/configuracion' },
  equipo: { label: 'Accesos del equipo', path: '/equipo/accesos' },
}

export const DEFAULT_ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: Object.fromEntries(
    Object.keys(PERMISSION_MODULES).map((module) => [module, { view: true, edit: true }]),
  ),
  [USER_ROLES.DT]: {
    dashboard: { view: true, edit: true },
    plantel: { view: true, edit: true },
    partidos: { view: true, edit: true },
    entrenamientos: { view: true, edit: true },
    rendimiento: { view: true, edit: true },
    medico: { view: true, edit: false },
    staff: { view: true, edit: true },
    pizarra: { view: true, edit: true },
    biblioteca: { view: true, edit: true },
    ejercicios: { view: true, edit: true },
    configuracion: { view: true, edit: false },
    equipo: { view: true, edit: true },
  },
  [USER_ROLES.AT]: {
    dashboard: { view: true, edit: false },
    plantel: { view: true, edit: true },
    partidos: { view: true, edit: true },
    entrenamientos: { view: true, edit: true },
    rendimiento: { view: true, edit: false },
    medico: { view: true, edit: false },
    staff: { view: true, edit: false },
    pizarra: { view: true, edit: true },
    biblioteca: { view: true, edit: true },
    ejercicios: { view: true, edit: true },
    configuracion: { view: false, edit: false },
    equipo: { view: false, edit: false },
  },
  [USER_ROLES.PF]: {
    dashboard: { view: true, edit: false },
    plantel: { view: true, edit: false },
    partidos: { view: true, edit: false },
    entrenamientos: { view: true, edit: true },
    rendimiento: { view: true, edit: true },
    medico: { view: true, edit: false },
    staff: { view: false, edit: false },
    pizarra: { view: true, edit: false },
    biblioteca: { view: true, edit: true },
    ejercicios: { view: true, edit: true },
    configuracion: { view: false, edit: false },
    equipo: { view: false, edit: false },
  },
  [USER_ROLES.MEDICO]: {
    dashboard: { view: true, edit: false },
    plantel: { view: true, edit: false },
    partidos: { view: true, edit: false },
    entrenamientos: { view: false, edit: false },
    rendimiento: { view: false, edit: false },
    medico: { view: true, edit: true },
    staff: { view: false, edit: false },
    pizarra: { view: false, edit: false },
    biblioteca: { view: false, edit: false },
    ejercicios: { view: false, edit: false },
    configuracion: { view: false, edit: false },
    equipo: { view: false, edit: false },
  },
  [USER_ROLES.FISIO]: {
    dashboard: { view: true, edit: false },
    plantel: { view: true, edit: false },
    partidos: { view: true, edit: false },
    entrenamientos: { view: true, edit: false },
    rendimiento: { view: true, edit: false },
    medico: { view: true, edit: true },
    staff: { view: false, edit: false },
    pizarra: { view: false, edit: false },
    biblioteca: { view: false, edit: false },
    ejercicios: { view: false, edit: false },
    configuracion: { view: false, edit: false },
    equipo: { view: false, edit: false },
  },
  [USER_ROLES.DELEGADO]: {
    dashboard: { view: true, edit: false },
    plantel: { view: true, edit: false },
    partidos: { view: true, edit: true },
    entrenamientos: { view: true, edit: false },
    rendimiento: { view: false, edit: false },
    medico: { view: true, edit: false },
    staff: { view: true, edit: false },
    pizarra: { view: true, edit: false },
    biblioteca: { view: false, edit: false },
    ejercicios: { view: false, edit: false },
    configuracion: { view: false, edit: false },
    equipo: { view: false, edit: false },
  },
}

export const INVITE_EXPIRY_DAYS = 7

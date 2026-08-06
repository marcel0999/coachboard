/**
 * CoachBoard Biblioteca — constantes y arquitectura de contenidos
 */

export const LIBRARY_MODULE_ID = 'biblioteca'

/** Secciones principales de navegación */
export const LIBRARY_SECTIONS = [
  { id: 'exercises', label: 'Ejercicios', contentType: 'exercise', available: true },
  { id: 'trainings', label: 'Entrenamientos completos', contentType: 'training', available: true },
  { id: 'microcycles', label: 'Microciclos', contentType: 'microcycle', available: false },
  { id: 'planning', label: 'Planificaciones', contentType: 'planning', available: false },
  { id: 'season', label: 'Temporada completa', contentType: 'season', available: false },
  { id: 'videos', label: 'Videos', contentType: 'video', available: false },
  { id: 'documents', label: 'Documentos', contentType: 'document', available: false },
  { id: 'favorites', label: 'Favoritos', contentType: null, available: true },
  { id: 'my-content', label: 'Mis contenidos', contentType: null, available: true },
]

export const CONTENT_TYPES = {
  EXERCISE: 'exercise',
  TRAINING: 'training',
  MICROCYCLE: 'microcycle',
  PLANNING: 'planning',
  SEASON: 'season',
  VIDEO: 'video',
  DOCUMENT: 'document',
}

export const SOURCE_TYPES = {
  OFFICIAL: 'official',
  CLUB: 'club',
  USER: 'user',
  AI: 'ai',
  IMPORTED: 'imported',
  SHARED: 'shared',
}

export const SOURCE_TYPE_LABELS = {
  official: 'CoachBoard oficial',
  club: 'Club',
  user: 'Propio',
  ai: 'IA',
  imported: 'Importado',
  shared: 'Compartido',
}

/** Clasificaciones de ejercicios */
export const EXERCISE_CLASSIFICATIONS = [
  'Activación',
  'Técnica',
  'Pase',
  'Control',
  'Conducción',
  'Finalización',
  'Posesión',
  'Presión',
  'Transición ofensiva',
  'Transición defensiva',
  'Defensa',
  'Ataque',
  'Juego posicional',
  'Rondo',
  'Juego reducido',
  'Preparación física',
  'Coordinación',
  'Velocidad',
  'Resistencia',
  'Fuerza',
  'Recuperación',
  'Balón parado',
  'Arqueros',
]

export const LEVELS = ['Iniciación', 'Formativo', 'Competitivo', 'Elite']

export const AGE_RANGES = ['Sub-12', 'Sub-14', 'Sub-16', 'Sub-17', 'Sub-20', 'Primera', 'Todas']

export const INTENSITY_LEVELS = ['Baja', 'Media', 'Alta']

export const LIBRARY_SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'name', label: 'Nombre' },
  { value: 'duration', label: 'Duración' },
  { value: 'usage', label: 'Más utilizados' },
]

export const LIBRARY_COPY_MARKER = 'libraryCopy'

/** Permisos específicos de Biblioteca */
export const LIBRARY_PERMISSIONS = {
  view: 'view',
  create: 'create',
  editOwn: 'edit_own',
  deleteOwn: 'delete_own',
  share: 'share',
  manageClub: 'manage_club',
  manageOfficial: 'manage_official',
}

export function getSectionById(sectionId) {
  return LIBRARY_SECTIONS.find((section) => section.id === sectionId) ?? LIBRARY_SECTIONS[0]
}

export function isResourceEditable(resource, userId, canEditLibrary) {
  if (!resource) return false
  if (resource.source_type === SOURCE_TYPES.OFFICIAL) return false
  if (!canEditLibrary) return false
  if (resource.source_type === SOURCE_TYPES.USER) {
    return resource.created_by === userId || canEditLibrary
  }
  return canEditLibrary
}

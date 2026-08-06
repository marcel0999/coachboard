import {
  CONTENT_TYPES,
  EXERCISE_CLASSIFICATIONS,
  INTENSITY_LEVELS,
  LEVELS,
  SOURCE_TYPES,
} from '../constants/library'
import { createDefaultTacticalBoardSnapshot } from './trainings'
import { LIBRARY_COPY_MARKER } from '../constants/library'

export function createLibrarySourceRef(source) {
  return {
    id: source.id,
    type: source.type,
    categoryId: source.categoryId ?? null,
    title: source.title ?? '',
    [LIBRARY_COPY_MARKER]: true,
  }
}

export function normalizeLibraryResource(row) {
  if (!row) return null
  return {
    id: row.id,
    clubId: row.club_id,
    contentType: row.content_type,
    sourceType: row.source_type,
    category: row.category ?? '',
    subcategory: row.subcategory ?? '',
    title: row.title ?? '',
    description: row.description ?? '',
    objective: row.objective ?? '',
    metadata: row.metadata ?? {},
    tags: row.tags ?? [],
    isDemo: row.is_demo ?? false,
    isPublished: row.is_published ?? true,
    usageCount: row.usage_count ?? 0,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
  }
}

export function resourceToDbPayload(resource, { clubId, userId }) {
  return {
    club_id: clubId,
    content_type: resource.contentType,
    source_type: resource.sourceType ?? SOURCE_TYPES.USER,
    category: resource.category ?? '',
    subcategory: resource.subcategory ?? '',
    title: resource.title?.trim() ?? 'Sin título',
    description: resource.description ?? '',
    objective: resource.objective ?? '',
    metadata: resource.metadata ?? {},
    tags: resource.tags ?? [],
    is_demo: resource.isDemo ?? false,
    is_published: resource.isPublished ?? true,
    updated_by: userId ?? null,
    ...(resource.id ? {} : { created_by: userId ?? null }),
  }
}

export function createEmptyExerciseResource(overrides = {}) {
  return {
    contentType: CONTENT_TYPES.EXERCISE,
    sourceType: SOURCE_TYPES.USER,
    category: EXERCISE_CLASSIFICATIONS[0],
    title: '',
    description: '',
    objective: '',
    metadata: {
      secondaryObjectives: [],
      ageRange: 'Todas',
      level: 'Competitivo',
      minPlayers: '',
      maxPlayers: '',
      durationMinutes: 15,
      intensity: 'Media',
      space: '',
      materials: '',
      organization: '',
      development: '',
      rules: '',
      variants: '',
      coachCorrections: '',
      observations: '',
      imageColor: 'bg-accent',
      tacticalBoard: createDefaultTacticalBoardSnapshot(),
      videoUrl: '',
      author: '',
    },
    tags: [],
    ...overrides,
  }
}

export function createEmptyTrainingResource(overrides = {}) {
  return {
    contentType: CONTENT_TYPES.TRAINING,
    sourceType: SOURCE_TYPES.USER,
    category: 'Mixto',
    title: '',
    description: '',
    objective: '',
    metadata: {
      ageRange: 'Todas',
      level: 'Competitivo',
      durationMinutes: 90,
      playerCount: '',
      intensity: 'Media',
      materials: '',
      warmup: '',
      mainPart: '',
      cooldown: '',
      observations: '',
      estimatedLoad: 'Media',
      sessionType: 'Mixto',
      sessionExercises: [],
    },
    tags: [],
    ...overrides,
  }
}

export function filterLibraryResources(resources, filters = {}) {
  let result = [...resources]

  if (filters.contentType) {
    result = result.filter((r) => r.contentType === filters.contentType)
  }
  if (filters.category && filters.category !== 'all') {
    result = result.filter((r) => r.category === filters.category)
  }
  if (filters.sourceType && filters.sourceType !== 'all') {
    result = result.filter((r) => r.sourceType === filters.sourceType)
  }
  if (filters.level && filters.level !== 'all') {
    result = result.filter((r) => r.metadata?.level === filters.level)
  }
  if (filters.intensity && filters.intensity !== 'all') {
    result = result.filter((r) => r.metadata?.intensity === filters.intensity)
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    result = result.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.objective.toLowerCase().includes(q) ||
        r.tags.some((tag) => tag.toLowerCase().includes(q)),
    )
  }
  if (filters.favoritesOnly && filters.favoriteIds) {
    result = result.filter((r) => filters.favoriteIds.has(r.id))
  }
  if (filters.myContentOnly && filters.userId) {
    result = result.filter(
      (r) =>
        r.sourceType === SOURCE_TYPES.USER && r.createdBy === filters.userId,
    )
  }
  if (filters.officialOnly) {
    result = result.filter((r) => r.sourceType === SOURCE_TYPES.OFFICIAL)
  }

  return sortLibraryResources(result, filters.sortBy ?? 'recent')
}

export function sortLibraryResources(resources, sortBy = 'recent') {
  const sorted = [...resources]
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'duration':
      return sorted.sort(
        (a, b) =>
          (Number(b.metadata?.durationMinutes) || 0) -
          (Number(a.metadata?.durationMinutes) || 0),
      )
    case 'usage':
      return sorted.sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
    case 'recent':
    default:
      return sorted.sort(
        (a, b) => new Date(b.updatedAt ?? 0) - new Date(a.updatedAt ?? 0),
      )
  }
}

export function copyLibraryResourceToSessionExercise(resource, order = 0) {
  const meta = resource.metadata ?? {}
  return {
    id: `sex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: resource.title,
    description: resource.description ?? '',
    objective: resource.objective ?? meta.primaryObjective ?? '',
    durationMinutes: meta.durationMinutes ?? 15,
    sets: meta.sets ?? '',
    reps: meta.reps ?? '',
    space: meta.space ?? '',
    materials: meta.materials ?? '',
    order,
    librarySource: createLibrarySourceRef({
      id: resource.id,
      type: resource.contentType,
      categoryId: resource.category,
      title: resource.title,
    }),
    tacticalBoard: meta.tacticalBoard ?? createDefaultTacticalBoardSnapshot(),
  }
}

export function copyLibraryTrainingToClubTraining(resource, { categoryId, date = '' }) {
  const meta = resource.metadata ?? {}
  const sessionExercises = (meta.sessionExercises ?? []).map((exercise, index) => ({
    ...copyLibraryResourceToSessionExercise(
      {
        id: exercise.id ?? `embedded-${index}`,
        contentType: CONTENT_TYPES.EXERCISE,
        title: exercise.name ?? exercise.title ?? `Ejercicio ${index + 1}`,
        description: exercise.description ?? '',
        objective: exercise.objective ?? '',
        metadata: exercise,
      },
      index,
    ),
  }))

  return {
    id: `trn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId,
    name: `${resource.title} (copia)`,
    date,
    time: '',
    duration: meta.durationMinutes ?? 90,
    field: '',
    category: meta.sessionType ?? 'Mixto',
    objective: resource.objective ?? '',
    intensity: meta.intensity ?? 'Media',
    load: meta.intensity ?? 'Media',
    playerCount: meta.playerCount ?? '',
    observations: meta.observations ?? resource.description ?? '',
    notes: meta.observations ?? resource.description ?? '',
    status: 'Programado',
    blocks: [],
    sessionExercises,
    players: { attendees: [], absent: [], injured: [], differentiated: [] },
    loadControl: [],
    staffIds: [],
    summary: {
      totalDuration: 0,
      playerCount: 0,
      averageLoad: 0,
      exercisesUsed: [],
      finalNotes: '',
    },
    librarySource: createLibrarySourceRef({
      id: resource.id,
      type: CONTENT_TYPES.TRAINING,
      title: resource.title,
    }),
  }
}

export function legacyExerciseToResource(exercise, clubId, userId) {
  return {
    club_id: clubId,
    content_type: CONTENT_TYPES.EXERCISE,
    source_type: SOURCE_TYPES.CLUB,
    category: exercise.category ?? 'Técnica',
    title: exercise.title,
    description: exercise.description ?? '',
    objective: exercise.objective ?? '',
    metadata: {
      durationMinutes: Number(exercise.duration) || 15,
      intensity: exercise.intensity ?? 'Media',
      level: 'Competitivo',
      ageRange: 'Todas',
      imageColor: exercise.imageColor ?? 'bg-accent',
      legacyId: exercise.id,
    },
    tags: [exercise.category].filter(Boolean),
    is_demo: false,
    created_by: userId,
  }
}

export { INTENSITY_LEVELS, LEVELS, EXERCISE_CLASSIFICATIONS }

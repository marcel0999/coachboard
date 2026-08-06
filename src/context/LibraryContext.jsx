import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAuth } from './AuthContext'
import { canEditModule } from '../utils/permissions'
import { EXERCISE_LIBRARY } from '../data/exercises'
import {
  addFavorite,
  archiveLibraryResource,
  fetchLibraryResources,
  fetchUserFavorites,
  incrementResourceUsage,
  migrateLegacyExercises,
  removeFavorite,
  upsertLibraryResource,
} from '../services/supabase/libraryService'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  createEmptyExerciseResource,
  createEmptyTrainingResource,
  filterLibraryResources,
} from '../utils/libraryResources'
import { CONTENT_TYPES, SOURCE_TYPES } from '../constants/library'

const LibraryContext = createContext(null)

const DEMO_EXERCISES = EXERCISE_LIBRARY.slice(0, 3).map((exercise) => ({
  ...createEmptyExerciseResource({
    title: exercise.title,
    description: exercise.description,
    objective: exercise.objective,
    category: exercise.category,
    sourceType: SOURCE_TYPES.OFFICIAL,
    metadata: {
      durationMinutes: exercise.duration,
      intensity: exercise.intensity,
      imageColor: exercise.imageColor,
      level: 'Competitivo',
      ageRange: 'Todas',
    },
    tags: [exercise.category, 'demostración'],
    isDemo: true,
  }),
}))

export function LibraryProvider({ children }) {
  const { club, user, role, membership } = useAuth()
  const clubId = club?.id
  const userId = user?.id

  const [resources, setResources] = useState([])
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [migrated, setMigrated] = useState(false)

  const canEditLibrary = canEditModule(role, membership?.permissions, 'biblioteca')

  const reload = useCallback(async () => {
    if (!clubId || !userId || !isSupabaseConfigured()) {
      setResources(
        DEMO_EXERCISES.map((r, i) => ({
          ...r,
          id: `demo-${i}`,
          updatedAt: new Date().toISOString(),
        })),
      )
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      let loaded = await fetchLibraryResources(clubId)

      if (!migrated && loaded.filter((r) => r.contentType === CONTENT_TYPES.EXERCISE).length === 0) {
        loaded = await migrateLegacyExercises(clubId, userId, EXERCISE_LIBRARY)
        setMigrated(true)
      }

      if (loaded.length === 0) {
        loaded = DEMO_EXERCISES.map((resource, index) => ({
          ...resource,
          id: `demo-local-${index}`,
          clubId: null,
          sourceType: SOURCE_TYPES.OFFICIAL,
          isDemo: true,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }))
      }

      const favorites = await fetchUserFavorites(clubId, userId)
      setResources(loaded)
      setFavoriteIds(favorites)
    } catch (loadError) {
      console.error('[Biblioteca]', loadError)
      setError(loadError.message)
      setResources(
        DEMO_EXERCISES.map((resource, index) => ({
          ...resource,
          id: `demo-fallback-${index}`,
          isDemo: true,
          updatedAt: new Date().toISOString(),
        })),
      )
    } finally {
      setLoading(false)
    }
  }, [clubId, userId, migrated])

  useEffect(() => {
    reload()
  }, [reload])

  const saveResource = useCallback(
    async (resource) => {
      if (!clubId || !userId) throw new Error('Sesión no disponible')
      const saved = await upsertLibraryResource(clubId, resource, userId)
      setResources((prev) => {
        const exists = prev.some((r) => r.id === saved.id)
        return exists
          ? prev.map((r) => (r.id === saved.id ? saved : r))
          : [saved, ...prev]
      })
      return saved
    },
    [clubId, userId],
  )

  const deleteResource = useCallback(
    async (resourceId) => {
      if (!clubId) return
      await archiveLibraryResource(clubId, resourceId)
      setResources((prev) => prev.filter((r) => r.id !== resourceId))
    },
    [clubId],
  )

  const toggleFavorite = useCallback(
    async (resourceId) => {
      if (!clubId || !userId) return
      const isFav = favoriteIds.has(resourceId)
      if (isFav) {
        await removeFavorite(userId, resourceId)
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          next.delete(resourceId)
          return next
        })
      } else {
        await addFavorite(clubId, userId, resourceId)
        setFavoriteIds((prev) => new Set([...prev, resourceId]))
      }
    },
    [clubId, userId, favoriteIds],
  )

  const copyResource = useCallback(async (resourceId) => {
    try {
      await incrementResourceUsage(resourceId)
    } catch {
      /* usage counter optional */
    }
    setResources((prev) =>
      prev.map((r) =>
        r.id === resourceId ? { ...r, usageCount: (r.usageCount ?? 0) + 1 } : r,
      ),
    )
  }, [])

  const getFiltered = useCallback(
    (filters) =>
      filterLibraryResources(resources, {
        ...filters,
        favoriteIds,
        userId,
      }),
    [resources, favoriteIds, userId],
  )

  const value = useMemo(
    () => ({
      resources,
      favoriteIds,
      loading,
      error,
      canEditLibrary,
      reload,
      saveResource,
      deleteResource,
      toggleFavorite,
      copyResource,
      getFiltered,
      createEmptyExercise: createEmptyExerciseResource,
      createEmptyTraining: createEmptyTrainingResource,
      isFavorite: (id) => favoriteIds.has(id),
    }),
    [
      resources,
      favoriteIds,
      loading,
      error,
      canEditLibrary,
      reload,
      saveResource,
      deleteResource,
      toggleFavorite,
      copyResource,
      getFiltered,
    ],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const context = useContext(LibraryContext)
  if (!context) throw new Error('useLibrary debe usarse dentro de LibraryProvider')
  return context
}

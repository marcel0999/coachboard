import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  loadAppStateAsync,
  saveAppStateAsync,
  flushPendingSave,
  loadSeedDemoData,
  importAppState,
  exportAppStateBackup,
  getLastLoadReport,
  buildEmptyAppState,
  subscribeToRemoteState,
  isSupabaseConfigured,
} from '../storage'
import { enrichPlayer } from '../utils/playerFactory'
import {
  generatePlayerId,
  normalizePlayerForm,
  updatePlayerById,
} from '../utils/players'
import { syncPlayerStatisticsFromMatches } from '../utils/matches'
import { finalizeTraining, normalizeTrainingForm } from '../utils/trainings'
import { createDefaultTacticalBoardState, migrateTacticalBoardState } from '../utils/tacticalBoardState'
import {
  generateStaffId,
  normalizeStaffForm,
  reconcileStaffInMatches,
  removeStaffFromMatch,
  removeStaffFromTraining,
  updateStaffById,
} from '../utils/staff'
import {
  getDefaultCategoryId,
  getEffectiveCategoryId,
  normalizeCategoryForm,
  updateCategoryById,
} from '../utils/categories'
import { CATEGORY_FILTER_ALL } from '../constants/categories'
import { DEFAULT_CLUB_SETTINGS } from '../config/localization'

const AppDataContext = createContext(null)

function removePlayerFromMatch(match, playerId) {
  const filterIds = (ids = []) => ids.filter((id) => id !== playerId)

  return {
    ...match,
    squad: {
      starters: filterIds(match.squad?.starters),
      substitutes: filterIds(match.squad?.substitutes),
      notCalled: filterIds(match.squad?.notCalled),
    },
    lineup: Object.fromEntries(
      Object.entries(match.lineup ?? {}).map(([position, id]) => [
        position,
        id === playerId ? null : id,
      ]),
    ),
    events: (match.events ?? []).filter(
      (event) =>
        event.playerId !== playerId &&
        event.assistPlayerId !== playerId &&
        event.playerOutId !== playerId &&
        event.playerInId !== playerId,
    ),
  }
}

function removePlayerFromTraining(training, playerId) {
  const players = training.players ?? {
    attendees: [],
    absent: [],
    injured: [],
    differentiated: [],
  }

  return {
    ...training,
    players: {
      attendees: (players.attendees ?? []).filter((id) => id !== playerId),
      absent: (players.absent ?? []).filter((id) => id !== playerId),
      injured: (players.injured ?? []).filter((id) => id !== playerId),
      differentiated: (players.differentiated ?? []).filter(
        (entry) => entry.playerId !== playerId,
      ),
    },
    loadControl: (training.loadControl ?? []).filter(
      (entry) => entry.playerId !== playerId,
    ),
  }
}

function addPlayerToCategoryMatches(matches, playerId, categoryId) {
  return matches.map((match) => {
    if (match.categoryId !== categoryId) return match

    const notCalled = match.squad?.notCalled ?? []
    if (notCalled.includes(playerId)) return match

    const inSquad = [
      ...(match.squad?.starters ?? []),
      ...(match.squad?.substitutes ?? []),
      ...notCalled,
    ].includes(playerId)

    if (inSquad) return match

    return {
      ...match,
      squad: {
        ...match.squad,
        notCalled: [...notCalled, playerId],
      },
    }
  })
}

function reconcilePlayerCategory(prev, playerId, oldCategoryId, newCategoryId) {
  const withoutOldCategory = {
    ...prev,
    matches: prev.matches.map((match) =>
      match.categoryId === oldCategoryId ? removePlayerFromMatch(match, playerId) : match,
    ),
    trainings: prev.trainings.map((training) =>
      training.categoryId === oldCategoryId
        ? removePlayerFromTraining(training, playerId)
        : training,
    ),
  }

  return {
    ...withoutOldCategory,
    matches: addPlayerToCategoryMatches(withoutOldCategory.matches, playerId, newCategoryId),
  }
}

export function AppDataProvider({ children }) {
  const [storageError, setStorageError] = useState(null)
  const [loadReport, setLoadReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [state, setState] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const applyingRemoteRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      setIsLoading(true)
      try {
        const loaded = await loadAppStateAsync()
        if (!cancelled) {
          setState(loaded)
          setStorageError(null)
          setLoadReport(getLastLoadReport())
        }
      } catch (error) {
        console.error('[CoachBoard] Error al inicializar datos:', error)
        if (!cancelled) {
          setStorageError(error)
          setState(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    bootstrap()

    return () => {
      cancelled = true
      void flushPendingSave()
    }
  }, [])

  const isStateReady = Boolean(state)
  const schemaVersion = state?.schemaVersion

  useEffect(() => {
    if (!isSupabaseConfigured || !isStateReady) return undefined

    const unsubscribe = subscribeToRemoteState((remoteState) => {
      applyingRemoteRef.current = true
      setState(remoteState)
      applyingRemoteRef.current = false
    })

    return unsubscribe
  }, [isStateReady, schemaVersion])

  const reloadFromStorage = useCallback(async () => {
    try {
      const loaded = await loadAppStateAsync()
      setState(loaded)
      setStorageError(null)
      setLoadReport(getLastLoadReport())
      return loaded
    } catch (error) {
      setStorageError(error)
      throw error
    }
  }, [])

  const commit = useCallback((updater) => {
    setState((prev) => {
      if (!prev) return prev
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (!applyingRemoteRef.current) {
        void saveAppStateAsync(next)
          .then(() => setSaveError(null))
          .catch((error) => {
            console.error('[CoachBoard] Error al guardar en Supabase:', error)
            setSaveError(error?.message ?? 'Error al guardar en Supabase')
          })
      }
      return next
    })
  }, [])

  const setSelectedCategoryId = useCallback(
    (categoryId) => {
      commit((prev) => ({ ...prev, selectedCategoryId: categoryId }))
    },
    [commit],
  )

  const saveCategory = useCallback(
    (formData, editingCategory = null) => {
      const normalized = normalizeCategoryForm(
        editingCategory ? { ...editingCategory, ...formData } : formData,
      )

      commit((prev) => {
        if (editingCategory) {
          return {
            ...prev,
            categories: updateCategoryById(prev.categories, editingCategory.id, normalized),
          }
        }

        return {
          ...prev,
          categories: [...prev.categories, normalized],
        }
      })
    },
    [commit],
  )

  const deleteCategory = useCallback(
    (categoryId, { movePlayersToCategoryId = null, deleteAllData = false } = {}) => {
      commit((prev) => {
        const playersInCategory = prev.players.filter((player) => player.categoryId === categoryId)
        let nextPlayers = prev.players
        let nextMatches = prev.matches
        let nextTrainings = prev.trainings

        if (playersInCategory.length > 0) {
          if (deleteAllData) {
            const playerIds = new Set(playersInCategory.map((player) => player.id))
            nextPlayers = prev.players.filter((player) => player.categoryId !== categoryId)
            nextMatches = prev.matches
              .filter((match) => match.categoryId !== categoryId)
              .map((match) =>
                [...playerIds].reduce(
                  (currentMatch, playerId) => removePlayerFromMatch(currentMatch, playerId),
                  match,
                ),
              )
            nextTrainings = prev.trainings
              .filter((training) => training.categoryId !== categoryId)
              .map((training) =>
                [...playerIds].reduce(
                  (currentTraining, playerId) => removePlayerFromTraining(currentTraining, playerId),
                  training,
                ),
              )
          } else if (movePlayersToCategoryId) {
            nextPlayers = prev.players.map((player) =>
              player.categoryId === categoryId
                ? { ...player, categoryId: movePlayersToCategoryId }
                : player,
            )

            playersInCategory.forEach((player) => {
              const reconciled = reconcilePlayerCategory(
                { ...prev, players: nextPlayers, matches: nextMatches, trainings: nextTrainings },
                player.id,
                categoryId,
                movePlayersToCategoryId,
              )
              nextMatches = reconciled.matches
              nextTrainings = reconciled.trainings
            })
          }
        }

        const nextCategories = prev.categories.filter((category) => category.id !== categoryId)
        const fallbackCategoryId = getDefaultCategoryId(nextCategories)
        let selectedCategoryId = prev.selectedCategoryId

        if (selectedCategoryId === categoryId) {
          selectedCategoryId = fallbackCategoryId
        }

        return {
          ...prev,
          categories: nextCategories,
          selectedCategoryId,
          players: syncPlayerStatisticsFromMatches(nextPlayers, nextMatches),
          matches: nextMatches.filter((match) => match.categoryId !== categoryId),
          trainings: nextTrainings.filter((training) => training.categoryId !== categoryId),
          staff: prev.staff.map((member) => ({
            ...member,
            categoryIds: (member.categoryIds ?? []).filter((id) => id !== categoryId),
          })),
        }
      })
    },
    [commit],
  )

  const savePlayer = useCallback(
    (formData, editingPlayer = null) => {
      const normalized = normalizePlayerForm(formData)

      if (editingPlayer) {
        const categoryChanged =
          normalized.categoryId && normalized.categoryId !== editingPlayer.categoryId

        commit((prev) => {
          let next = {
            ...prev,
            players: updatePlayerById(
              prev.players,
              editingPlayer.id,
              enrichPlayer({ ...editingPlayer, ...normalized }),
            ),
          }

          if (categoryChanged) {
            next = reconcilePlayerCategory(
              next,
              editingPlayer.id,
              editingPlayer.categoryId,
              normalized.categoryId,
            )
            next.players = updatePlayerById(next.players, editingPlayer.id, {
              categoryId: normalized.categoryId,
            })
          }

          return next
        })
        return
      }

      const newId = generatePlayerId()

      commit((prev) => {
        const categoryId = normalized.categoryId || getDefaultCategoryId(prev.categories)

        return {
          ...prev,
          players: [
            ...prev.players,
            enrichPlayer({ ...normalized, id: newId, categoryId }),
          ],
          matches: addPlayerToCategoryMatches(prev.matches, newId, categoryId),
        }
      })
    },
    [commit],
  )

  const updatePlayer = useCallback(
    (playerId, updates) => {
      commit((prev) => {
        const currentPlayer = prev.players.find((player) => player.id === playerId)
        if (!currentPlayer) {
          return {
            ...prev,
            players: updatePlayerById(prev.players, playerId, updates),
          }
        }

        const nextCategoryId = updates.categoryId ?? currentPlayer.categoryId
        const categoryChanged = updates.categoryId && updates.categoryId !== currentPlayer.categoryId

        let next = {
          ...prev,
          players: updatePlayerById(prev.players, playerId, updates),
        }

        if (categoryChanged) {
          next = reconcilePlayerCategory(
            next,
            playerId,
            currentPlayer.categoryId,
            nextCategoryId,
          )
        }

        return next
      })
    },
    [commit],
  )

  const deletePlayer = useCallback(
    (playerId) => {
      commit((prev) => ({
        ...prev,
        players: prev.players.filter((player) => player.id !== playerId),
        matches: prev.matches.map((match) => removePlayerFromMatch(match, playerId)),
        trainings: prev.trainings.map((training) =>
          removePlayerFromTraining(training, playerId),
        ),
      }))
    },
    [commit],
  )

  const saveStaff = useCallback(
    (formData, editingMember = null) => {
      const normalized = normalizeStaffForm(formData)

      if (editingMember) {
        commit((prev) => ({
          ...prev,
          staff: updateStaffById(prev.staff, editingMember.id, normalized),
          matches: reconcileStaffInMatches(
            { ...normalized, id: editingMember.id },
            prev.matches,
          ),
        }))
        return
      }

      const newId = generateStaffId()

      commit((prev) => ({
        ...prev,
        staff: [...prev.staff, { ...normalized, id: newId }],
        matches: reconcileStaffInMatches({ ...normalized, id: newId }, prev.matches),
      }))
    },
    [commit],
  )

  const updateStaff = useCallback(
    (staffId, updates) => {
      commit((prev) => {
        const current = prev.staff.find((member) => member.id === staffId)
        if (!current) return prev
        const nextMember = normalizeStaffForm({ ...current, ...updates })

        return {
          ...prev,
          staff: updateStaffById(prev.staff, staffId, nextMember),
          matches: reconcileStaffInMatches({ ...nextMember, id: staffId }, prev.matches),
        }
      })
    },
    [commit],
  )

  const deleteStaff = useCallback(
    (staffId) => {
      commit((prev) => ({
        ...prev,
        staff: prev.staff.filter((member) => member.id !== staffId),
        matches: prev.matches.map((match) => removeStaffFromMatch(match, staffId)),
        trainings: prev.trainings.map((training) =>
          removeStaffFromTraining(training, staffId),
        ),
      }))
    },
    [commit],
  )

  const saveMatch = useCallback(
    (matchData) => {
      commit((prev) => {
        const exists = prev.matches.some((match) => match.id === matchData.id)
        const nextMatches = exists
          ? prev.matches.map((match) => (match.id === matchData.id ? matchData : match))
          : [...prev.matches, matchData]

        return {
          ...prev,
          matches: nextMatches,
          players: syncPlayerStatisticsFromMatches(prev.players, nextMatches),
        }
      })
    },
    [commit],
  )

  const deleteMatch = useCallback(
    (matchId) => {
      commit((prev) => {
        const nextMatches = prev.matches.filter((match) => match.id !== matchId)

        return {
          ...prev,
          matches: nextMatches,
          players: syncPlayerStatisticsFromMatches(prev.players, nextMatches),
        }
      })
    },
    [commit],
  )

  const saveTraining = useCallback(
    (trainingData, shouldFinalize = false) => {
      commit((prev) => {
        const normalized = normalizeTrainingForm(trainingData)
        const payload = shouldFinalize
          ? finalizeTraining(normalized, prev.exercises)
          : normalized

        const exists = prev.trainings.some((training) => training.id === payload.id)

        return {
          ...prev,
          trainings: exists
            ? prev.trainings.map((training) =>
                training.id === payload.id ? payload : training,
              )
            : [...prev.trainings, payload],
        }
      })
    },
    [commit],
  )

  const deleteTraining = useCallback(
    (trainingId) => {
      commit((prev) => ({
        ...prev,
        trainings: prev.trainings.filter((training) => training.id !== trainingId),
      }))
    },
    [commit],
  )

  const saveExercise = useCallback(
    (exerciseData) => {
      commit((prev) => {
        const exists = prev.exercises.some((exercise) => exercise.id === exerciseData.id)

        if (exists) {
          return {
            ...prev,
            exercises: prev.exercises.map((exercise) =>
              exercise.id === exerciseData.id ? exerciseData : exercise,
            ),
          }
        }

        return {
          ...prev,
          exercises: [
            ...prev.exercises,
            { ...exerciseData, id: exerciseData.id ?? `ex-${Date.now()}` },
          ],
        }
      })
    },
    [commit],
  )

  const deleteExercise = useCallback(
    (exerciseId) => {
      commit((prev) => ({
        ...prev,
        exercises: prev.exercises.filter((exercise) => exercise.id !== exerciseId),
      }))
    },
    [commit],
  )

  const updateClubSettings = useCallback(
    (updates) => {
      commit((prev) => ({
        ...prev,
        clubSettings: { ...(prev.clubSettings ?? DEFAULT_CLUB_SETTINGS), ...updates },
      }))
    },
    [commit],
  )

  const saveTacticalBoard = useCallback(
    (tacticalBoard) => {
      commit((prev) => ({
        ...prev,
        tacticalBoard: migrateTacticalBoardState({
          ...prev.tacticalBoard,
          ...tacticalBoard,
        }),
      }))
    },
    [commit],
  )

  const updateTacticalBoard = useCallback(
    (updater) => {
      commit((prev) => {
        const nextPartial = typeof updater === 'function' ? updater(prev.tacticalBoard) : updater
        return {
          ...prev,
          tacticalBoard: migrateTacticalBoardState({
            ...prev.tacticalBoard,
            ...nextPartial,
          }),
        }
      })
    },
    [commit],
  )

  const resetTacticalBoard = useCallback(() => {
    commit((prev) => ({
      ...prev,
      tacticalBoard: createDefaultTacticalBoardState(),
    }))
  }, [commit])

  const syncStatsFromMatches = useCallback(() => {
    commit((prev) => ({
      ...prev,
      players: syncPlayerStatisticsFromMatches(prev.players, prev.matches),
    }))
  }, [commit])

  const effectiveCategoryId = useMemo(
    () => (state ? getEffectiveCategoryId(state.selectedCategoryId, state.categories) : null),
    [state],
  )

  const importBackupJson = useCallback(async (jsonString) => {
    const imported = await importAppState(jsonString)
    setState(imported)
    setStorageError(null)
    setSaveError(null)
    setLoadReport(getLastLoadReport())
    return imported
  }, [])

  const loadDemoData = useCallback(async () => {
    const seed = await loadSeedDemoData()
    setState(seed)
    setStorageError(null)
    setSaveError(null)
    return seed
  }, [])

  const clearUserData = useCallback(() => {
    commit((prev) => ({
      ...prev,
      players: [],
      matches: [],
      trainings: [],
      staff: [],
      exercises: [],
    }))
  }, [commit])

  const exportBackup = useCallback(() => {
    if (!state) return ''
    return exportAppStateBackup(state)
  }, [state])

  const runDiagnostics = useCallback(() => {
    console.info('[CoachBoard] Fuente de datos: Supabase PostgreSQL')
    console.info('[CoachBoard] Club ID:', getLastLoadReport()?.clubId ?? '—')
  }, [])

  const errorValue = useMemo(
    () => ({
      storageError,
      saveError,
      loadReport,
      reloadFromStorage,
      importBackupJson,
      runDiagnostics,
      state: state ?? buildEmptyAppState(),
      players: [],
      staff: [],
      matches: [],
      trainings: [],
      exercises: [],
      categories: [],
      tacticalBoard: createDefaultTacticalBoardState(),
      selectedCategoryId: CATEGORY_FILTER_ALL,
      effectiveCategoryId: null,
    }),
    [storageError, saveError, loadReport, reloadFromStorage, importBackupJson, runDiagnostics, state],
  )

  const value = useMemo(() => {
    const safeState = state ?? buildEmptyAppState()
    return {
      categories: safeState.categories,
      clubSettings: safeState.clubSettings ?? DEFAULT_CLUB_SETTINGS,
      selectedCategoryId: safeState.selectedCategoryId,
      effectiveCategoryId,
      setSelectedCategoryId,
      saveCategory,
      deleteCategory,
      players: safeState.players,
      staff: safeState.staff,
      matches: safeState.matches,
      trainings: safeState.trainings,
      exercises: safeState.exercises,
      tacticalBoard: safeState.tacticalBoard,
      savePlayer,
      updatePlayer,
      deletePlayer,
      saveStaff,
      updateStaff,
      deleteStaff,
      saveMatch,
      deleteMatch,
      saveTraining,
      deleteTraining,
      saveExercise,
      deleteExercise,
      saveTacticalBoard,
      updateTacticalBoard,
      resetTacticalBoard,
      updateClubSettings,
      syncStatsFromMatches,
      storageError,
      saveError,
      loadReport,
      reloadFromStorage,
      importBackupJson,
      exportBackup,
      loadDemoData,
      clearUserData,
      runDiagnostics,
    }
  }, [
      state,
      effectiveCategoryId,
      setSelectedCategoryId,
      saveCategory,
      deleteCategory,
      savePlayer,
      updatePlayer,
      deletePlayer,
      saveStaff,
      updateStaff,
      deleteStaff,
      saveMatch,
      deleteMatch,
      saveTraining,
      deleteTraining,
      saveExercise,
      deleteExercise,
      saveTacticalBoard,
      updateTacticalBoard,
      resetTacticalBoard,
      updateClubSettings,
      syncStatsFromMatches,
      storageError,
      saveError,
      loadReport,
      reloadFromStorage,
      importBackupJson,
      exportBackup,
      loadDemoData,
      clearUserData,
      runDiagnostics,
    ],
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
          <p className="mt-4 text-sm text-text-secondary">Cargando datos del club…</p>
        </div>
      </div>
    )
  }

  if (storageError || !state) {
    return (
      <AppDataContext.Provider value={errorValue}>
        <div className="flex min-h-screen items-center justify-center bg-surface-muted p-6">
          <div className="max-w-lg rounded-2xl border border-red-200 bg-surface-elevated p-6 shadow-sm">
            <h1 className="text-lg font-bold text-red-700">Error al conectar con Supabase</h1>
            <p className="mt-2 text-sm text-text-secondary">
              No se pudieron cargar los datos del club. Verificá tu conexión a internet y las
              variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
            </p>
            <p className="mt-2 text-xs text-text-muted">{storageError?.message}</p>
            <button
              type="button"
              className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
              onClick={() => reloadFromStorage()}
            >
              Reintentar carga desde Supabase
            </button>
          </div>
        </div>
      </AppDataContext.Provider>
    )
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppData debe usarse dentro de AppDataProvider')
  }
  return context
}

export function useCategoryScope() {
  const {
    categories,
    selectedCategoryId,
    effectiveCategoryId,
    setSelectedCategoryId,
    players,
    staff,
    matches,
    trainings,
  } = useAppData()

  const isAllCategories = selectedCategoryId === CATEGORY_FILTER_ALL

  const scopedPlayers = useMemo(() => {
    if (isAllCategories) return players
    return players.filter((player) => player.categoryId === effectiveCategoryId)
  }, [players, isAllCategories, effectiveCategoryId])

  const scopedStaff = useMemo(() => {
    if (isAllCategories) return staff
    return staff.filter((member) => (member.categoryIds ?? []).includes(effectiveCategoryId))
  }, [staff, isAllCategories, effectiveCategoryId])

  const scopedMatches = useMemo(() => {
    if (isAllCategories) return matches
    return matches.filter((match) => match.categoryId === effectiveCategoryId)
  }, [matches, isAllCategories, effectiveCategoryId])

  const scopedTrainings = useMemo(() => {
    if (isAllCategories) return trainings
    return trainings.filter((training) => training.categoryId === effectiveCategoryId)
  }, [trainings, isAllCategories, effectiveCategoryId])

  return {
    categories,
    selectedCategoryId,
    effectiveCategoryId,
    isAllCategories,
    setSelectedCategoryId,
    scopedPlayers,
    scopedStaff,
    scopedMatches,
    scopedTrainings,
    staff,
    players,
  }
}

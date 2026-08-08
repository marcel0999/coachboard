import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Download,
  FileImage,
  FolderOpen,
  Plus,
  RotateCcw,
  Save,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { Input } from '../components/ui/FormField'
import TacticalPitch from '../components/pizarra/TacticalPitch'
import { createFreeMarkerAt } from '../utils/tacticalPitchUtils'
import PitchFitContainer from '../components/pizarra/PitchFitContainer'
import PitchViewportControls from '../components/pizarra/PitchViewportControls'
import FormationSelector from '../components/pizarra/FormationSelector'
import SubstituteBench from '../components/pizarra/SubstituteBench'
import DrawingToolbar from '../components/pizarra/DrawingToolbar'
import PlayerSquadPanel from '../components/pizarra/PlayerSquadPanel'
import BoardLibraryPanel, { SaveBoardForm } from '../components/pizarra/BoardLibraryPanel'
import ExportPreviewModal from '../components/pizarra/ExportPreviewModal'
import { useAppData, useCategoryScope } from '../context/AppDataContext'
import { BOARD_MODES, BOARD_TYPES, DEFAULT_DISPLAY_OPTIONS, PITCH_TYPES } from '../constants/tacticalBoard'
import { getFullName } from '../utils/players'
import { getSessionExercises, getTrainingDisplayName } from '../utils/trainings'
import {
  applyFormationToBoard,
  applySavedBoardToBoard,
  createBoard,
  createCustomFormationFromBoard,
  createSavedBoardFromBoard,
  duplicateCustomFormation,
  duplicateDrawing,
  deleteDrawingById,
  getActiveBoard,
  loadBoardFromMatch,
  movePlayerFromBenchToMarker,
  movePlayerToBench,
  redoDrawings,
  removePlayerFromBoard,
  renameCustomFormation,
  syncBoardToMatch,
  syncBoardToTrainingBlock,
  syncBoardToTrainingExercise,
  undoDrawings,
  updateActiveBoard,
} from '../utils/tacticalBoardState'
import CategorySelector from '../components/categories/CategorySelector'
import { CATEGORY_FILTER_ALL } from '../constants/categories'

export default function PizarraTactica() {
  const { tacticalBoard, updateTacticalBoard, matches, saveMatch, trainings, saveTraining } = useAppData()
  const {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    effectiveCategoryId,
    scopedPlayers,
  } = useCategoryScope()
  const [searchParams, setSearchParams] = useSearchParams()
  const matchIdParam = searchParams.get('matchId')
  const trainingIdParam = searchParams.get('trainingId')
  const blockIdParam = searchParams.get('blockId')
  const exerciseIdParam = searchParams.get('exerciseId')

  const exportRef = useRef(null)
  const workspaceRef = useRef(null)
  const matchLoadedRef = useRef(null)

  const activeBoard = useMemo(() => getActiveBoard(tacticalBoard), [tacticalBoard])

  const linkedTraining = useMemo(
    () => trainings.find((training) => training.id === (activeBoard.linkedTrainingId ?? trainingIdParam)),
    [trainings, activeBoard.linkedTrainingId, trainingIdParam],
  )
  const linkedBlock = useMemo(
    () => linkedTraining?.blocks?.find((block) => block.id === blockIdParam),
    [linkedTraining, blockIdParam],
  )
  const linkedExercise = useMemo(() => {
    if (!linkedTraining || !exerciseIdParam) return null
    return getSessionExercises(linkedTraining).find((exercise) => exercise.id === exerciseIdParam) ?? null
  }, [linkedTraining, exerciseIdParam])

  const boardCategoryId = activeBoard.categoryId ?? effectiveCategoryId ?? categories[0]?.id
  const categoryPlayers = useMemo(
    () => scopedPlayers.filter((player) => player.categoryId === boardCategoryId),
    [scopedPlayers, boardCategoryId],
  )

  const playerMap = useMemo(
    () => Object.fromEntries(categoryPlayers.map((player) => [player.id, player])),
    [categoryPlayers],
  )

  const linkedMatch = useMemo(
    () => matches.find((match) => match.id === (activeBoard.linkedMatchId ?? matchIdParam)),
    [matches, activeBoard.linkedMatchId, matchIdParam],
  )

  const [activeTool, setActiveTool] = useState('select')
  const [drawColor, setDrawColor] = useState('#ffffff')
  const [selectedDrawingId, setSelectedDrawingId] = useState(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveBoardName, setSaveBoardName] = useState('')
  const [saveBoardType, setSaveBoardType] = useState(activeBoard.boardType ?? 'lineup')
  const [formationModalOpen, setFormationModalOpen] = useState(false)
  const [formationName, setFormationName] = useState('')
  const [newBoardModalOpen, setNewBoardModalOpen] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('players')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const currentCategory = categories.find((category) => category.id === boardCategoryId)

  const usedPlayerIds = useMemo(
    () =>
      new Set([
        ...activeBoard.markers.map((marker) => marker.playerId).filter(Boolean),
        ...activeBoard.benchPlayerIds,
      ]),
    [activeBoard],
  )

  const benchPlayerIds = useMemo(() => {
    const onPitch = new Set(activeBoard.markers.map((marker) => marker.playerId).filter(Boolean))
    const explicitBench = activeBoard.benchPlayerIds.filter((id) => !onPitch.has(id))
    return [...new Set(explicitBench)]
  }, [activeBoard])

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    if (tacticalBoard.lastCategoryId && selectedCategoryId === CATEGORY_FILTER_ALL) {
      setSelectedCategoryId(tacticalBoard.lastCategoryId)
    }
  }, [tacticalBoard.lastCategoryId, selectedCategoryId, setSelectedCategoryId])

  useEffect(() => {
    if (!matchIdParam || matchLoadedRef.current === matchIdParam) return
    const match = matches.find((item) => item.id === matchIdParam)
    if (!match) return

    matchLoadedRef.current = matchIdParam
    const matchPlayers = scopedPlayers.filter((player) => player.categoryId === match.categoryId)
    const matchPlayerMap = Object.fromEntries(matchPlayers.map((player) => [player.id, player]))
    const board = loadBoardFromMatch(match, matchPlayerMap, tacticalBoard.customFormations)

    updateTacticalBoard((state) => ({
      ...updateActiveBoard(state, board),
      activeBoardId: board.id,
      boards: [...state.boards, board],
      lastCategoryId: match.categoryId,
    }))
    setSelectedCategoryId(match.categoryId)
  }, [matchIdParam, matches, scopedPlayers, tacticalBoard.customFormations, updateTacticalBoard, setSelectedCategoryId])

  useEffect(() => {
    const loadKey = exerciseIdParam
      ? `${trainingIdParam}-${exerciseIdParam}`
      : `${trainingIdParam}-${blockIdParam}`

    if (!trainingIdParam || (!blockIdParam && !exerciseIdParam)) return
    if (matchLoadedRef.current === loadKey) return

    const training = trainings.find((item) => item.id === trainingIdParam)
    if (!training) return

    let sourceBoard = null
    let sourceLabel = getTrainingDisplayName(training)
    let linkedBlockId = null
    let linkedExerciseId = null

    if (exerciseIdParam) {
      const exercise = getSessionExercises(training).find((item) => item.id === exerciseIdParam)
      if (!exercise) return
      sourceBoard = exercise.tacticalBoard
      sourceLabel = `${sourceLabel} · ${exercise.name || 'Ejercicio'}`
      linkedExerciseId = exercise.id
    } else {
      const block = training.blocks?.find((item) => item.id === blockIdParam)
      if (!block) return
      sourceBoard = block.tacticalBoard
      sourceLabel = `${sourceLabel} · ${block.label}`
      linkedBlockId = block.id
    }

    matchLoadedRef.current = loadKey
    const board = createBoard(
      sourceLabel,
      sourceBoard?.formation ?? '4-3-3',
      tacticalBoard.customFormations,
      { categoryId: training.categoryId, boardType: 'exercise' },
    )
    board.linkedTrainingId = training.id
    board.linkedBlockId = linkedBlockId
    board.linkedExerciseId = linkedExerciseId

    if (sourceBoard?.markers?.length) {
      board.markers = sourceBoard.markers
      board.benchPlayerIds = sourceBoard.benchPlayerIds ?? []
      board.drawings = sourceBoard.drawings ?? []
      board.mode = sourceBoard.mode ?? board.mode
      board.pitchType = sourceBoard.pitchType ?? board.pitchType
    } else if (sourceBoard?.lineup) {
      board.markers = board.markers.map((marker) => ({
        ...marker,
        playerId: sourceBoard.lineup[marker.slotId] ?? null,
      }))
      board.drawings = sourceBoard.drawings ?? []
    }

    updateTacticalBoard((state) => ({
      ...updateActiveBoard(state, board),
      activeBoardId: board.id,
      boards: [...state.boards, board],
      lastCategoryId: training.categoryId,
    }))
    setSelectedCategoryId(training.categoryId)
  }, [
    trainingIdParam,
    blockIdParam,
    exerciseIdParam,
    trainings,
    tacticalBoard.customFormations,
    updateTacticalBoard,
    setSelectedCategoryId,
  ])

  const persistCategory = (categoryId) => {
    setSelectedCategoryId(categoryId)
    updateTacticalBoard((state) => ({
      ...state,
      lastCategoryId: categoryId,
    }))
    updateBoard((board) => ({ ...board, categoryId }))
  }

  const updateBoard = (updater) => {
    updateTacticalBoard((state) => updateActiveBoard(state, updater))
  }

  const showSaveMessage = (message) => {
    setSaveMessage(message)
    window.setTimeout(() => setSaveMessage(''), 2500)
  }

  const handleSave = () => {
    updateTacticalBoard((state) => ({
      ...state,
      lastCategoryId: boardCategoryId,
    }))
    showSaveMessage('Pizarra guardada correctamente')
  }

  const handleSaveToLibrary = () => {
    if (!saveBoardName.trim()) return
    const saved = createSavedBoardFromBoard(activeBoard, saveBoardName.trim(), {
      categoryId: boardCategoryId,
    })
    saved.boardType = saveBoardType
    updateTacticalBoard((state) => ({
      ...state,
      savedBoards: [...(state.savedBoards ?? []), saved],
      savedLineups: [...state.savedLineups, saved],
      lastCategoryId: boardCategoryId,
    }))
    setSaveBoardName('')
    setSaveModalOpen(false)
    showSaveMessage('Pizarra agregada a la biblioteca')
  }

  const handleOpenSavedBoard = (saved) => {
    if (
      activeBoard.markers.some((marker) => marker.playerId) &&
      !window.confirm('¿Reemplazar la pizarra activa con la seleccionada?')
    ) {
      return
    }
    updateBoard((board) => applySavedBoardToBoard(board, saved))
    if (saved.categoryId) persistCategory(saved.categoryId)
  }

  const handleDuplicateSavedBoard = (saved) => {
    const copy = {
      ...saved,
      id: `${saved.id}-copy-${Date.now()}`,
      name: `${saved.name} (copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    updateTacticalBoard((state) => ({
      ...state,
      savedBoards: [...(state.savedBoards ?? []), copy],
    }))
  }

  const handleRenameSavedBoard = (boardId, name) => {
    updateTacticalBoard((state) => ({
      ...state,
      savedBoards: (state.savedBoards ?? []).map((board) =>
        board.id === boardId ? { ...board, name, updatedAt: new Date().toISOString() } : board,
      ),
    }))
  }

  const handleDeleteSavedBoard = (boardId) => {
    updateTacticalBoard((state) => ({
      ...state,
      savedBoards: (state.savedBoards ?? []).filter((board) => board.id !== boardId),
      savedLineups: state.savedLineups.filter((board) => board.id !== boardId),
    }))
  }

  const handleReset = () => {
    if (!window.confirm('¿Reiniciar la pizarra activa con la formación actual?')) return
    updateBoard((board) =>
      applyFormationToBoard(board, board.formation, tacticalBoard.customFormations, categoryPlayers),
    )
  }

  const handleFormationChange = (formation) => {
    const hasPlayers = activeBoard.markers.some((marker) => marker.playerId)
    if (hasPlayers && !window.confirm('¿Reemplazar la alineación actual con la nueva formación?')) {
      return
    }
    updateBoard((board) =>
      applyFormationToBoard({ ...board, formation }, formation, tacticalBoard.customFormations, categoryPlayers),
    )
  }

  const handleModeChange = (mode) => {
    updateBoard((board) => ({ ...board, mode }))
  }

  const handleDropPlayerOnMarker = (playerId, markerId) => {
    const player = playerMap[playerId]
    if (!player) return
    updateBoard((board) =>
      movePlayerFromBenchToMarker(board, playerId, markerId, String(player.number)),
    )
  }

  const handleDropPlayerOnPitch = (playerId, point) => {
    const player = playerMap[playerId]
    if (!player) return
    const freeMarker = createFreeMarkerAt(point, playerId, String(player.number))
    updateBoard((board) => ({
      ...board,
      markers: [...board.markers.filter((marker) => marker.playerId !== playerId), freeMarker],
      benchPlayerIds: board.benchPlayerIds.filter((id) => id !== playerId),
    }))
  }

  const handleDropToBench = (playerId) => {
    updateBoard((board) => movePlayerToBench(board, playerId))
  }

  const handleRemoveFromBoard = (playerId) => {
    updateBoard((board) => removePlayerFromBoard(board, playerId))
  }

  const handleSaveCustomFormation = () => {
    if (!formationName.trim()) return
    const custom = createCustomFormationFromBoard(activeBoard, formationName.trim())
    updateTacticalBoard((state) => ({
      ...state,
      customFormations: {
        ...state.customFormations,
        [custom.id]: custom,
      },
    }))
    setFormationName('')
    setFormationModalOpen(false)
  }

  const handleDuplicateFormation = (formationId) => {
    updateTacticalBoard((state) => ({
      ...state,
      customFormations: duplicateCustomFormation(
        state.customFormations,
        formationId,
        `${state.customFormations[formationId]?.name} (copia)`,
      ),
    }))
  }

  const handleRenameFormation = (formationId) => {
    const current = tacticalBoard.customFormations[formationId]
    const nextName = window.prompt('Nuevo nombre de la formación', current?.name)
    if (!nextName?.trim()) return
    updateTacticalBoard((state) => ({
      ...state,
      customFormations: renameCustomFormation(state.customFormations, formationId, nextName.trim()),
    }))
  }

  const handleDeleteCustomFormation = (formationId) => {
    if (!window.confirm('¿Eliminar esta formación personalizada?')) return
    updateTacticalBoard((state) => {
      const next = { ...state.customFormations }
      delete next[formationId]
      return { ...state, customFormations: next }
    })
  }

  const handleAddBoard = () => {
    if (!newBoardName.trim()) return
    const board = createBoard(newBoardName.trim(), activeBoard.formation, tacticalBoard.customFormations, {
      categoryId: boardCategoryId,
      boardType: activeBoard.boardType,
    })
    updateTacticalBoard((state) => ({
      ...state,
      activeBoardId: board.id,
      boards: [...state.boards, board],
      formation: board.formation,
      lastCategoryId: boardCategoryId,
    }))
    setNewBoardName('')
    setNewBoardModalOpen(false)
  }

  const handleDeleteBoard = (boardId) => {
    if (tacticalBoard.boards.length <= 1) return
    if (!window.confirm('¿Eliminar esta pizarra?')) return
    updateTacticalBoard((state) => {
      const boards = state.boards.filter((board) => board.id !== boardId)
      const activeBoardId = state.activeBoardId === boardId ? boards[0].id : state.activeBoardId
      const nextActive = boards.find((board) => board.id === activeBoardId) ?? boards[0]
      return {
        ...state,
        boards,
        activeBoardId,
        formation: nextActive.formation,
      }
    })
  }

  const handleSaveToMatch = () => {
    if (!linkedMatch) return
    const updated = syncBoardToMatch(activeBoard, linkedMatch)
    saveMatch(updated)
    showSaveMessage('Alineación guardada en el partido')
    setSearchParams({})
  }

  const handleSaveToTraining = () => {
    if (!linkedTraining) return

    if (linkedExercise || exerciseIdParam || activeBoard.linkedExerciseId) {
      const exerciseId = linkedExercise?.id ?? exerciseIdParam ?? activeBoard.linkedExerciseId
      const nextTraining = {
        ...linkedTraining,
        sessionExercises: getSessionExercises(linkedTraining).map((exercise) =>
          exercise.id === exerciseId
            ? syncBoardToTrainingExercise(activeBoard, exercise)
            : exercise,
        ),
      }
      saveTraining(nextTraining)
      showSaveMessage('Pizarra guardada en el ejercicio del entrenamiento')
      return
    }

    if (!linkedBlock) return
    const nextTraining = {
      ...linkedTraining,
      blocks: linkedTraining.blocks.map((block) =>
        block.id === linkedBlock.id ? syncBoardToTrainingBlock(activeBoard, block) : block,
      ),
    }
    saveTraining(nextTraining)
    showSaveMessage('Pizarra guardada en el entrenamiento')
  }

  const handleZoomLevel = (level) => {
    updateBoard((board) => ({ ...board, zoom: level }))
  }

  const handleDisplayChange = (key, value) => {
    updateBoard((board) => ({
      ...board,
      displayOptions: { ...DEFAULT_DISPLAY_OPTIONS, ...board.displayOptions, [key]: value },
    }))
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      workspaceRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const handleDeleteDrawing = () => {
    if (!selectedDrawingId) return
    updateBoard((board) => ({
      ...board,
      drawings: deleteDrawingById(board.drawings, selectedDrawingId),
      history: { past: [...board.history.past, board.drawings.map((d) => ({ ...d }))].slice(-50), future: [] },
    }))
    setSelectedDrawingId(null)
  }

  const handleDuplicateDrawing = () => {
    if (!selectedDrawingId) return
    updateBoard((board) => ({
      ...board,
      drawings: duplicateDrawing(board.drawings, selectedDrawingId),
    }))
  }

  const savedBoards = tacticalBoard.savedBoards ?? tacticalBoard.savedLineups ?? []

  return (
    <div className="cb-animate-in -mx-4 flex min-h-[calc(100dvh-4.5rem)] flex-col lg:-mx-8">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/60 px-3 py-2.5 lg:px-4">
        <div className="min-w-0">
          <h1 className="font-display text-lg font-bold text-text-primary">Pizarra Táctica</h1>
          <p className="truncate text-xs text-text-muted">
            {currentCategory?.name ?? 'Categoría'} · {activeBoard.name} · {activeBoard.formation}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setSidebarTab('library')}>
            <FolderOpen className="h-4 w-4" />
            Cargar
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setNewBoardModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nueva
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setExportModalOpen(true)}>
            <FileImage className="h-4 w-4" />
          </Button>
          {linkedMatch && (
            <Button size="sm" variant="secondary" onClick={handleSaveToMatch}>Partido</Button>
          )}
          <Button size="sm" variant="secondary" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Guardar
          </Button>
        </div>
      </div>

      {saveMessage && (
        <div className="shrink-0 border-b border-emerald-500/20 bg-success-subtle px-4 py-2 text-sm text-emerald-300">
          {saveMessage}
        </div>
      )}

      {(linkedMatch || linkedTraining) && (
        <div className="shrink-0 border-b border-border/40 bg-surface-muted/30 px-4 py-1.5 text-xs text-accent">
          {linkedMatch && `Vinculado: vs ${linkedMatch.opponent}`}
          {linkedTraining && linkedExercise && ` · Entrenamiento: ${linkedExercise.name || 'ejercicio'}`}
          {linkedTraining && linkedBlock && !linkedExercise && ` · Bloque: ${linkedBlock.label}`}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <aside className="flex max-h-[42vh] shrink-0 flex-col gap-3 overflow-y-auto border-b border-border/60 bg-surface-card p-3 lg:max-h-none lg:w-[340px] lg:border-b-0 lg:border-r">
          <CategorySelector
            categories={categories}
            value={boardCategoryId}
            onChange={persistCategory}
            includeAll={false}
          />

          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">Pizarras</p>
            <div className="flex flex-wrap gap-1.5">
              {tacticalBoard.boards.map((board) => (
                <button
                  key={board.id}
                  type="button"
                  onClick={() =>
                    updateTacticalBoard((state) => ({
                      ...state,
                      activeBoardId: board.id,
                      formation: board.formation,
                    }))
                  }
                  className={[
                    'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition',
                    board.id === tacticalBoard.activeBoardId
                      ? 'bg-accent text-white'
                      : 'bg-surface-muted text-text-secondary hover:text-text-primary',
                  ].join(' ')}
                >
                  {board.name}
                </button>
              ))}
            </div>
          </div>

          <FormationSelector
            value={activeBoard.formation}
            customFormations={tacticalBoard.customFormations}
            onChange={handleFormationChange}
          />

          <PlayerSquadPanel
            players={categoryPlayers}
            usedPlayerIds={usedPlayerIds}
            onRemoveFromBoard={handleRemoveFromBoard}
          />

          <DrawingToolbar
            layout="sidebar"
            activeTool={activeTool}
            drawColor={drawColor}
            onToolChange={setActiveTool}
            onColorChange={setDrawColor}
            onUndo={() => updateBoard((board) => undoDrawings(board))}
            onRedo={() => updateBoard((board) => redoDrawings(board))}
            onDuplicate={handleDuplicateDrawing}
            onDeleteSelected={handleDeleteDrawing}
            canDelete={Boolean(selectedDrawingId)}
            canDuplicate={Boolean(selectedDrawingId)}
            onClear={() => {
              if (!window.confirm('¿Limpiar todos los dibujos de esta pizarra?')) return
              updateBoard((board) => ({ ...board, drawings: [], history: { past: [], future: [] } }))
            }}
            canUndo={activeBoard.history.past.length > 0}
            canRedo={activeBoard.history.future.length > 0}
          />

          <div className="space-y-2 rounded-xl border border-border/60 bg-surface-muted/30 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Ajustes</p>
            <div className="flex rounded-lg bg-surface-muted p-0.5">
              {[
                { id: BOARD_MODES.SQUAD, label: 'Plantel' },
                { id: BOARD_MODES.POSITIONS, label: 'Pos.' },
                { id: BOARD_MODES.CHIPS, label: 'Fichas' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleModeChange(option.id)}
                  className={
                    activeBoard.mode === option.id
                      ? 'flex-1 rounded-md bg-surface-elevated py-1.5 text-[10px] font-semibold text-accent'
                      : 'flex-1 rounded-md py-1.5 text-[10px] font-medium text-text-muted'
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
            <select
              value={activeBoard.pitchType ?? 'full-vertical'}
              onChange={(event) => updateBoard((board) => ({ ...board, pitchType: event.target.value }))}
              className="w-full rounded-lg border border-border/60 bg-surface-muted px-2 py-1.5 text-xs outline-none focus:border-accent"
            >
              {PITCH_TYPES.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
            <select
              value={activeBoard.boardType ?? 'lineup'}
              onChange={(event) => updateBoard((board) => ({ ...board, boardType: event.target.value }))}
              className="w-full rounded-lg border border-border/60 bg-surface-muted px-2 py-1.5 text-xs outline-none focus:border-accent"
            >
              {BOARD_TYPES.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
            <Button size="sm" variant="secondary" className="w-full" onClick={() => setSaveModalOpen(true)}>
              <Download className="h-4 w-4" />
              Guardar en biblioteca
            </Button>
          </div>

          {sidebarTab === 'library' && (
            <div className="rounded-xl border border-border/60 bg-surface-card p-3">
              <BoardLibraryPanel
                savedBoards={savedBoards}
                categories={categories}
                onOpen={handleOpenSavedBoard}
                onDuplicate={handleDuplicateSavedBoard}
                onRename={handleRenameSavedBoard}
                onDelete={handleDeleteSavedBoard}
              />
            </div>
          )}
        </aside>

        <div
          ref={workspaceRef}
          className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#060a10]"
        >
          <div className="absolute left-3 right-3 top-3 z-20">
            <PitchViewportControls
              zoom={activeBoard.zoom ?? 1}
              onZoomChange={handleZoomLevel}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              displayOptions={activeBoard.displayOptions ?? DEFAULT_DISPLAY_OPTIONS}
              onDisplayChange={handleDisplayChange}
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col p-2 pt-16">
            <div className="relative min-h-0 flex-1">
              <PitchFitContainer pitchType={activeBoard.pitchType ?? 'full-vertical'} className="h-full">
                <div
                  ref={exportRef}
                  className="h-full w-full"
                  style={{
                    transform: `scale(${activeBoard.zoom ?? 1})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out',
                  }}
                >
                  <TacticalPitch
                    board={activeBoard}
                    mode={activeBoard.mode}
                    playerMap={playerMap}
                    activeTool={activeTool}
                    drawColor={drawColor}
                    onBoardChange={updateBoard}
                    onDropPlayerOnMarker={handleDropPlayerOnMarker}
                    onDropPlayerOnPitch={handleDropPlayerOnPitch}
                    onDrawingSelect={setSelectedDrawingId}
                  />
                </div>
              </PitchFitContainer>
            </div>

            <SubstituteBench
              players={categoryPlayers}
              benchPlayerIds={benchPlayerIds}
              substitutions={activeBoard.substitutions ?? []}
              playerMap={playerMap}
              onDropToBench={handleDropToBench}
              onRemoveFromBench={handleRemoveFromBoard}
            />
          </div>
        </div>
      </div>

      <Modal isOpen={saveModalOpen} onClose={() => setSaveModalOpen(false)} title="Guardar en biblioteca" size="md">
        <SaveBoardForm
          name={saveBoardName}
          boardType={saveBoardType}
          onNameChange={setSaveBoardName}
          onTypeChange={setSaveBoardType}
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setSaveModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveToLibrary}>Guardar pizarra</Button>
        </div>
      </Modal>

      <Modal isOpen={formationModalOpen} onClose={() => setFormationModalOpen(false)} title="Guardar formación personalizada" size="md">
        <Input value={formationName} onChange={(event) => setFormationName(event.target.value)} placeholder='Ej: "433 Presión Alta"' />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setFormationModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveCustomFormation}>Guardar formación</Button>
        </div>
      </Modal>

      <Modal isOpen={newBoardModalOpen} onClose={() => setNewBoardModalOpen(false)} title="Nueva pizarra" size="md">
        <Input value={newBoardName} onChange={(event) => setNewBoardName(event.target.value)} placeholder='Ej: "Presión alta"' />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setNewBoardModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleAddBoard}>Crear pizarra</Button>
        </div>
      </Modal>

      <ExportPreviewModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        exportElement={exportRef.current}
        defaultTitle={activeBoard.name}
        categoryName={currentCategory?.name}
        formation={activeBoard.formation}
      />
    </div>
  )
}

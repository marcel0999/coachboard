import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Copy,
  Download,
  FileImage,
  Plus,
  RotateCcw,
  Save,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { Input } from '../components/ui/FormField'
import TacticalPitch, { createFreeMarkerAt } from '../components/pizarra/TacticalPitch'
import PitchFitContainer from '../components/pizarra/PitchFitContainer'
import FormationSelector, { FormationSelectorBar } from '../components/pizarra/FormationSelector'
import SubstituteBench from '../components/pizarra/SubstituteBench'
import DrawingToolbar from '../components/pizarra/DrawingToolbar'
import PlayerSquadPanel from '../components/pizarra/PlayerSquadPanel'
import TeamSettingsPanel, { BoardNotesField } from '../components/pizarra/TeamSettingsPanel'
import BoardLibraryPanel, { SaveBoardForm } from '../components/pizarra/BoardLibraryPanel'
import ExportPreviewModal from '../components/pizarra/ExportPreviewModal'
import TacticalBoardStaffPanel from '../components/pizarra/TacticalBoardStaffPanel'
import { useAppData, useCategoryScope } from '../context/AppDataContext'
import { BOARD_MODES, BOARD_TYPES, PITCH_TYPES } from '../constants/tacticalBoard'
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
    scopedStaff,
  } = useCategoryScope()
  const [searchParams, setSearchParams] = useSearchParams()
  const matchIdParam = searchParams.get('matchId')
  const trainingIdParam = searchParams.get('trainingId')
  const blockIdParam = searchParams.get('blockId')
  const exerciseIdParam = searchParams.get('exerciseId')

  const exportRef = useRef(null)
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

  const handleZoom = (delta) => {
    updateBoard((board) => ({
      ...board,
      zoom: Math.max(0.6, Math.min(1.8, (board.zoom ?? 1) + delta)),
    }))
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
    <div className="cb-animate-in">
      <PageHeader
        title="Pizarra Táctica"
        description="Formaciones, alineaciones, ejercicios y movimientos tácticos con jugadores reales"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setExportModalOpen(true)}>
              <FileImage className="h-4 w-4" />
              Exportar
            </Button>
            <Button variant="secondary" onClick={() => setSaveModalOpen(true)}>
              <Download className="h-4 w-4" />
              Biblioteca
            </Button>
            {linkedMatch && (
              <Button variant="secondary" onClick={handleSaveToMatch}>
                Guardar en partido
              </Button>
            )}
            {linkedTraining && (linkedBlock || linkedExercise) && (
              <Button variant="secondary" onClick={handleSaveToTraining}>
                Guardar en entrenamiento
              </Button>
            )}
            <Button variant="secondary" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Reiniciar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4" />
              Guardar
            </Button>
          </div>
        }
      />

      <Card className="mb-6">
        <CategorySelector
          categories={categories}
          value={boardCategoryId}
          onChange={persistCategory}
          includeAll={false}
        />
        {linkedMatch && (
          <p className="mt-3 text-sm text-accent">
            Vinculado al partido vs {linkedMatch.opponent} · {linkedMatch.competition}
          </p>
        )}
        {linkedTraining && linkedExercise && (
          <p className="mt-3 text-sm text-accent">
            Vinculado al entrenamiento · ejercicio {linkedExercise.name || 'sin nombre'}
          </p>
        )}
        {linkedTraining && linkedBlock && !linkedExercise && (
          <p className="mt-3 text-sm text-accent">
            Vinculado al entrenamiento · bloque {linkedBlock.label}
          </p>
        )}
      </Card>

      {saveMessage && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {saveMessage}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
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
              'rounded-xl px-3.5 py-2 text-sm font-semibold shadow-sm transition-all',
              board.id === tacticalBoard.activeBoardId
                ? 'bg-accent text-white shadow-accent/25'
                : 'bg-white text-text-secondary ring-1 ring-slate-200/80 hover:bg-slate-50 hover:ring-accent/30',
            ].join(' ')}
          >
            {board.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setNewBoardModalOpen(true)}
          className="inline-flex items-center gap-1 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-accent shadow-sm ring-1 ring-slate-200/80 transition hover:bg-accent-subtle hover:ring-accent/40"
        >
          <Plus className="h-4 w-4" />
          Nueva pizarra
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
        <div className="flex rounded-xl bg-slate-100/80 p-1">
          {[
            { id: BOARD_MODES.SQUAD, label: 'Plantel' },
            { id: BOARD_MODES.POSITIONS, label: 'Posiciones' },
            { id: BOARD_MODES.CHIPS, label: 'Fichas' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleModeChange(option.id)}
              className={
                activeBoard.mode === option.id
                  ? 'rounded-lg bg-white px-4 py-2 text-sm font-semibold text-accent shadow-sm'
                  : 'rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition hover:text-text-primary'
              }
            >
              {option.label}
            </button>
          ))}
        </div>

        <FormationSelectorBar
          value={activeBoard.formation}
          customFormations={tacticalBoard.customFormations}
          onChange={handleFormationChange}
        />

        <div className="lg:hidden">
          <FormationSelector
            value={activeBoard.formation}
            customFormations={tacticalBoard.customFormations}
            onChange={handleFormationChange}
            compact
          />
        </div>

        <select
          value={activeBoard.pitchType ?? 'full-vertical'}
          onChange={(event) => updateBoard((board) => ({ ...board, pitchType: event.target.value }))}
          className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
        >
          {PITCH_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>

        <select
          value={activeBoard.boardType ?? 'lineup'}
          onChange={(event) => updateBoard((board) => ({ ...board, boardType: event.target.value }))}
          className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
        >
          {BOARD_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1">
          <button type="button" onClick={() => handleZoom(-0.1)} className="rounded-lg p-2 transition hover:bg-white" title="Alejar">
            <ZoomOut className="h-4 w-4 text-text-secondary" />
          </button>
          <span className="min-w-[3rem] text-center text-xs font-medium text-text-muted">
            {Math.round((activeBoard.zoom ?? 1) * 100)}%
          </span>
          <button type="button" onClick={() => handleZoom(0.1)} className="rounded-lg p-2 transition hover:bg-white" title="Acercar">
            <ZoomIn className="h-4 w-4 text-text-secondary" />
          </button>
        </div>
      </div>

      <DrawingToolbar
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

      <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_280px] xl:grid-cols-[240px_minmax(0,1fr)_300px] xl:gap-5">
        <PlayerSquadPanel
          players={categoryPlayers}
          usedPlayerIds={usedPlayerIds}
          onRemoveFromBoard={handleRemoveFromBoard}
        />

        <div className="flex min-w-0 flex-col gap-3">
          <Card className="overflow-hidden border-slate-200/80 p-3 shadow-sm sm:p-4">
            <PitchFitContainer pitchType={activeBoard.pitchType ?? 'full-vertical'}>
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
          </Card>

          <SubstituteBench
            players={categoryPlayers}
            benchPlayerIds={benchPlayerIds}
            substitutions={activeBoard.substitutions ?? []}
            playerMap={playerMap}
            onDropToBench={handleDropToBench}
            onRemoveFromBench={handleRemoveFromBoard}
          />

          {activeBoard.staffIds?.length > 0 && (
            <Card>
              <h3 className="mb-2 text-sm font-semibold text-text-primary">Staff seleccionado</h3>
              <ul className="space-y-1 text-sm text-text-secondary">
                {activeBoard.staffIds.map((staffId) => {
                  const member = scopedStaff.find((item) => item.id === staffId)
                  if (!member) return null
                  return (
                    <li key={staffId}>
                      {member.name} · {activeBoard.staffRoles?.[staffId] ?? member.role}
                    </li>
                  )
                })}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-3">
          <Card className="overflow-hidden border-slate-200/80 shadow-sm">
            <div className="flex gap-1 overflow-x-auto border-b border-slate-100 bg-slate-50/50 p-2">
              {['players', 'teams', 'staff', 'library', 'formations'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSidebarTab(tab)}
                  className={[
                    'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition',
                    sidebarTab === tab
                      ? 'bg-white text-accent shadow-sm ring-1 ring-slate-200/80'
                      : 'text-text-muted hover:bg-white/60 hover:text-text-primary',
                  ].join(' ')}
                >
                  {tab === 'players' ? 'Info' : tab === 'library' ? 'Biblioteca' : tab === 'formations' ? 'Formaciones' : tab === 'teams' ? 'Equipos' : 'Staff'}
                </button>
              ))}
            </div>

            <div className="p-4">
            {sidebarTab === 'teams' && (
              <>
                <TeamSettingsPanel
                  teams={activeBoard.teams}
                  teamView={activeBoard.teamView ?? 'own'}
                  onChange={(teams) => updateBoard((board) => ({ ...board, teams }))}
                  onViewChange={(teamView) => updateBoard((board) => ({ ...board, teamView }))}
                />
                <div className="mt-4">
                  <BoardNotesField
                    value={activeBoard.notes ?? ''}
                    onChange={(notes) => updateBoard((board) => ({ ...board, notes }))}
                  />
                </div>
              </>
            )}

            {sidebarTab === 'staff' && (
              <TacticalBoardStaffPanel
                staff={scopedStaff}
                selectedIds={activeBoard.staffIds ?? []}
                staffRoles={activeBoard.staffRoles ?? {}}
                onChange={(staffIds) => updateBoard((board) => ({ ...board, staffIds }))}
                onRoleChange={(staffId, role) =>
                  updateBoard((board) => ({
                    ...board,
                    staffRoles: { ...board.staffRoles, [staffId]: role },
                  }))
                }
              />
            )}

            {sidebarTab === 'library' && (
              <BoardLibraryPanel
                savedBoards={savedBoards}
                categories={categories}
                onOpen={handleOpenSavedBoard}
                onDuplicate={handleDuplicateSavedBoard}
                onRename={handleRenameSavedBoard}
                onDelete={handleDeleteSavedBoard}
              />
            )}

            {sidebarTab === 'formations' && (
              <div className="space-y-4">
                <FormationSelector
                  value={activeBoard.formation}
                  customFormations={tacticalBoard.customFormations}
                  onChange={handleFormationChange}
                />
                <Button size="sm" variant="secondary" onClick={() => setFormationModalOpen(true)}>
                  Guardar formación personalizada
                </Button>
                {Object.keys(tacticalBoard.customFormations).length > 0 && (
                  <ul className="space-y-2">
                    {Object.values(tacticalBoard.customFormations).map((formation) => (
                      <li
                        key={formation.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2 text-sm"
                      >
                        <button
                          type="button"
                          className="font-semibold text-text-primary hover:text-accent"
                          onClick={() => handleFormationChange(formation.id)}
                        >
                          {formation.name}
                        </button>
                        <div className="flex gap-2">
                          <button type="button" className="text-xs text-accent hover:underline" onClick={() => handleRenameFormation(formation.id)}>
                            Renombrar
                          </button>
                          <button type="button" className="text-xs text-accent hover:underline" onClick={() => handleDuplicateFormation(formation.id)}>
                            <Copy className="inline h-3 w-3" /> Duplicar
                          </button>
                          <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => handleDeleteCustomFormation(formation.id)}>
                            Eliminar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {sidebarTab === 'players' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-accent-subtle/80 to-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Categoría</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">{currentCategory?.name ?? '—'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">En pizarra</p>
                    <p className="mt-1 text-sm font-semibold text-accent">{usedPlayerIds.size} / {categoryPlayers.length}</p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">Titulares en campo</h4>
                  <ul className="max-h-40 space-y-1.5 overflow-y-auto">
                    {activeBoard.markers
                      .filter((marker) => marker.playerId)
                      .map((marker) => (
                        <li key={marker.id} className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-2.5 py-2 text-sm shadow-sm">
                          <span className="truncate font-medium">{getFullName(playerMap[marker.playerId])}</span>
                          <button type="button" className="shrink-0 text-xs font-medium text-accent hover:underline" onClick={() => handleDropToBench(marker.playerId)}>
                            Al banco
                          </button>
                        </li>
                      ))}
                    {activeBoard.markers.filter((m) => m.playerId).length === 0 && (
                      <li className="py-4 text-center text-xs text-text-muted">Sin jugadores asignados</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">Pizarras abiertas</h4>
                  <ul className="space-y-1.5">
                    {tacticalBoard.boards.map((board) => (
                      <li key={board.id} className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2 text-sm">
                        <span className="font-medium">{board.name}</span>
                        {tacticalBoard.boards.length > 1 && (
                          <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => handleDeleteBoard(board.id)}>
                            Eliminar
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            </div>
          </Card>
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

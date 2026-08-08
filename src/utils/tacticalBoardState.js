import {

  BOARD_MODES,

  DEFAULT_BOARD_TEMPLATES,

  DEFAULT_DISPLAY_OPTIONS,

  DEFAULT_RIVAL_TEAM,

  DEFAULT_TEAM,

} from '../constants/tacticalBoard'

import { getFormationSlots, createEmptyLineup } from './formations'

import { generateRecordId } from './playerFactory'

import { autoAssignPlayersToMarkers } from './tacticalBoardPlayers'



function nowIso() {

  return new Date().toISOString()

}



export function createMarkerFromSlot(slot, playerId = null) {

  return {

    id: generateRecordId('marker'),

    slotId: slot.id,

    label: slot.label,

    x: slot.x,

    y: slot.y,

    playerId,

    onPitch: true,

    team: 'own',

  }

}



export function createMarkersFromFormation(formation, customFormations = {}, assignments = {}) {

  return getFormationSlots(formation, customFormations).map((slot) =>

    createMarkerFromSlot(slot, assignments[slot.id] ?? null),

  )

}



function defaultTeams() {

  return {

    own: { ...DEFAULT_TEAM },

    rival: { ...DEFAULT_RIVAL_TEAM },

  }

}



export function createBoard(name, formation = '4-3-3', customFormations = {}, extras = {}) {

  const timestamp = nowIso()

  return {

    id: generateRecordId('board'),

    name,

    formation,

    mode: BOARD_MODES.SQUAD,

    categoryId: extras.categoryId ?? null,

    boardType: extras.boardType ?? 'lineup',

    pitchType: extras.pitchType ?? 'full-vertical',

    markers: createMarkersFromFormation(formation, customFormations),

    rivalMarkers: [],

    benchPlayerIds: [],

    drawings: [],

    history: { past: [], future: [] },

    staffIds: [],

    staffRoles: {},

    substitutions: [],

    teams: defaultTeams(),

    teamView: 'own',

    notes: '',

    linkedMatchId: null,

    linkedTrainingId: null,

    linkedExerciseId: null,

    zoom: 1,

    panX: 0,

    panY: 0,

    displayOptions: { ...DEFAULT_DISPLAY_OPTIONS },

    meta: { createdAt: timestamp, updatedAt: timestamp },

  }

}



export function migrateBoard(board, customFormations = {}) {

  const timestamp = nowIso()

  const teams = board.teams ?? defaultTeams()



  return {

    ...board,

    markers: (board.markers ?? createMarkersFromFormation(board.formation, customFormations)).map(

      (marker) => ({ team: 'own', ...marker }),

    ),

    rivalMarkers: board.rivalMarkers ?? [],

    benchPlayerIds: board.benchPlayerIds ?? [],

    drawings: board.drawings ?? [],

    history: board.history ?? { past: [], future: [] },

    mode: board.mode ?? BOARD_MODES.SQUAD,

    categoryId: board.categoryId ?? null,

    boardType: board.boardType ?? 'lineup',

    pitchType: board.pitchType ?? 'full-vertical',

    staffIds: board.staffIds ?? [],

    staffRoles: board.staffRoles ?? {},

    substitutions: board.substitutions ?? [],

    teams: {

      own: { ...DEFAULT_TEAM, ...teams.own },

      rival: { ...DEFAULT_RIVAL_TEAM, ...teams.rival },

    },

    teamView: board.teamView ?? 'own',

    notes: board.notes ?? '',

    linkedMatchId: board.linkedMatchId ?? null,

    linkedTrainingId: board.linkedTrainingId ?? null,

    linkedExerciseId: board.linkedExerciseId ?? null,

    zoom: board.zoom ?? 1,

    panX: board.panX ?? 0,

    panY: board.panY ?? 0,

    displayOptions: { ...DEFAULT_DISPLAY_OPTIONS, ...board.displayOptions },

    meta: {

      createdAt: board.meta?.createdAt ?? timestamp,

      updatedAt: board.meta?.updatedAt ?? timestamp,

    },

  }

}



function migrateSavedLineupsToBoards(savedLineups = []) {

  return savedLineups.map((lineup) => ({

    id: lineup.id,

    name: lineup.name,

    categoryId: lineup.categoryId ?? null,

    boardType: lineup.boardType ?? 'lineup',

    pitchType: lineup.pitchType ?? 'full-vertical',

    formation: lineup.formation,

    mode: lineup.mode ?? BOARD_MODES.SQUAD,

    markers: lineup.markers ?? [],

    rivalMarkers: lineup.rivalMarkers ?? [],

    benchPlayerIds: lineup.benchPlayerIds ?? [],

    drawings: lineup.drawings ?? [],

    staffIds: lineup.staffIds ?? [],

    staffRoles: lineup.staffRoles ?? {},

    substitutions: lineup.substitutions ?? [],

    teams: lineup.teams ?? defaultTeams(),

    notes: lineup.notes ?? '',

    linkedMatchId: lineup.linkedMatchId ?? null,

    createdAt: lineup.createdAt ?? nowIso(),

    updatedAt: lineup.updatedAt ?? lineup.createdAt ?? nowIso(),

  }))

}



export function createDefaultTacticalBoardState() {

  const boards = DEFAULT_BOARD_TEMPLATES.map((template) =>

    createBoard(template.name, template.formation, {}, { boardType: template.boardType }),

  )



  const activeBoard = boards[0]



  return {

    formation: activeBoard.formation,

    lineup: createEmptyLineup(activeBoard.formation),

    activeBoardId: activeBoard.id,

    boards,

    customFormations: {},

    savedLineups: [],

    savedBoards: [],

    lastCategoryId: null,

  }

}



export function migrateTacticalBoardState(raw) {

  if (!raw) return createDefaultTacticalBoardState()



  const customFormations = raw.customFormations ?? {}



  if (Array.isArray(raw.boards) && raw.boards.length > 0) {

    const boards = raw.boards.map((board) => migrateBoard(board, customFormations))

    const activeBoard = boards.find((board) => board.id === raw.activeBoardId) ?? boards[0]

    const savedBoards =

      raw.savedBoards?.length > 0

        ? raw.savedBoards

        : migrateSavedLineupsToBoards(raw.savedLineups ?? [])



    return {

      formation: activeBoard.formation,

      lineup: createEmptyLineup(activeBoard.formation, customFormations),

      activeBoardId: activeBoard.id,

      boards,

      customFormations,

      savedLineups: raw.savedLineups ?? [],

      savedBoards,

      lastCategoryId: raw.lastCategoryId ?? null,

    }

  }



  const formation = raw.formation ?? '4-3-3'

  const board = migrateBoard(createBoard('General', formation, customFormations), customFormations)



  if (raw.lineup && typeof raw.lineup === 'object') {

    board.markers = board.markers.map((marker) => ({

      ...marker,

      playerId: raw.lineup[marker.slotId] ?? marker.playerId,

    }))

    board.mode = BOARD_MODES.SQUAD

  }



  return {

    formation,

    lineup: raw.lineup ?? createEmptyLineup(formation),

    activeBoardId: board.id,

    boards: [

      board,

      ...DEFAULT_BOARD_TEMPLATES.slice(1).map((template) =>

        createBoard(template.name, template.formation, customFormations, {

          boardType: template.boardType,

        }),

      ),

    ],

    customFormations,

    savedLineups: raw.savedLineups ?? [],

    savedBoards: migrateSavedLineupsToBoards(raw.savedLineups ?? []),

    lastCategoryId: raw.lastCategoryId ?? null,

  }

}



export function touchBoard(board) {

  return {

    ...board,

    meta: { ...board.meta, updatedAt: nowIso() },

  }

}



export function getActiveBoard(state) {

  return state.boards.find((board) => board.id === state.activeBoardId) ?? state.boards[0]

}



export function updateActiveBoard(state, updater) {

  const activeBoard = getActiveBoard(state)

  const nextBoard = touchBoard(

    typeof updater === 'function' ? updater(activeBoard) : updater,

  )



  const boards = state.boards.map((board) =>

    board.id === activeBoard.id ? nextBoard : board,

  )



  return {

    ...state,

    formation: nextBoard.formation,

    lineup: buildLineupFromMarkers(nextBoard),

    boards,

  }

}



export function buildLineupFromMarkers(board) {

  const lineup = {}

  board.markers.forEach((marker) => {

    if (marker.slotId) {

      lineup[marker.slotId] = marker.playerId ?? null

    }

  })

  return lineup

}



export function swapMarkers(markers, markerIdA, markerIdB) {

  const indexA = markers.findIndex((marker) => marker.id === markerIdA)

  const indexB = markers.findIndex((marker) => marker.id === markerIdB)

  if (indexA < 0 || indexB < 0) return markers



  const next = [...markers]

  const markerA = next[indexA]

  const markerB = next[indexB]



  next[indexA] = {

    ...markerA,

    x: markerB.x,

    y: markerB.y,

    playerId: markerB.playerId,

    label: markerB.playerId ? markerA.label : markerB.label,

  }

  next[indexB] = {

    ...markerB,

    x: markerA.x,

    y: markerA.y,

    playerId: markerA.playerId,

    label: markerA.playerId ? markerB.label : markerA.label,

  }



  return next

}



export function moveMarker(markers, markerId, x, y) {

  return markers.map((marker) =>

    marker.id === markerId

      ? { ...marker, x: clampPercent(x), y: clampPercent(y) }

      : marker,

  )

}



export function assignPlayerToMarker(markers, markerId, playerId, playerLabel) {

  return markers.map((marker) =>

    marker.id === markerId

      ? { ...marker, playerId, label: playerLabel ?? marker.label }

      : marker.playerId === playerId

        ? { ...marker, playerId: null, label: marker.slotId ? marker.label : '—' }

        : marker,

  )

}



export function movePlayerToBench(board, playerId, slotLabels = {}) {

  const markers = board.markers.map((marker) =>

    marker.playerId === playerId

      ? {

          ...marker,

          playerId: null,

          label: slotLabels[marker.slotId] ?? marker.label,

        }

      : marker,

  )



  const benchPlayerIds = board.benchPlayerIds.includes(playerId)

    ? board.benchPlayerIds

    : [...board.benchPlayerIds, playerId]



  return { ...board, markers, benchPlayerIds }

}



export function removePlayerFromBoard(board, playerId, slotLabels = {}) {

  const markers = board.markers.map((marker) =>

    marker.playerId === playerId

      ? {

          ...marker,

          playerId: null,

          label: slotLabels[marker.slotId] ?? marker.label,

        }

      : marker,

  )



  return {

    ...board,

    markers,

    benchPlayerIds: board.benchPlayerIds.filter((id) => id !== playerId),

  }

}



export function movePlayerFromBenchToMarker(board, playerId, markerId, playerLabel) {

  const previousPlayerId = board.markers.find((marker) => marker.id === markerId)?.playerId

  const benchPlayerIds = board.benchPlayerIds.filter((id) => id !== playerId)

  if (previousPlayerId && previousPlayerId !== playerId) {

    benchPlayerIds.push(previousPlayerId)

  }



  let markers = board.markers.map((marker) =>

    marker.playerId === playerId ? { ...marker, playerId: null } : marker,

  )

  markers = assignPlayerToMarker(markers, markerId, playerId, playerLabel)



  const substitutions =

    previousPlayerId && previousPlayerId !== playerId

      ? [

          ...board.substitutions,

          {

            id: generateRecordId('sub'),

            playerOutId: previousPlayerId,

            playerInId: playerId,

            minute: null,

            timestamp: nowIso(),

          },

        ]

      : board.substitutions



  return { ...board, markers, benchPlayerIds, substitutions }

}



export function reorderBench(benchPlayerIds, fromIndex, toIndex) {

  const next = [...benchPlayerIds]

  const [item] = next.splice(fromIndex, 1)

  next.splice(toIndex, 0, item)

  return next

}



export function applyFormationToBoard(board, formation, customFormations = {}, players = []) {

  const slots = getFormationSlots(formation, customFormations)

  const assignments = Object.fromEntries(

    board.markers

      .filter((marker) => marker.playerId)

      .map((marker) => [marker.slotId, marker.playerId]),

  )



  let markers = slots.map((slot, index) => {

    const existing = board.markers[index]

    return {

      id: existing?.id ?? generateRecordId('marker'),

      slotId: slot.id,

      label: slot.label,

      x: slot.x,

      y: slot.y,

      playerId: assignments[slot.id] ?? existing?.playerId ?? null,

      onPitch: true,

      team: 'own',

    }

  })



  if (players.length > 0) {

    markers = autoAssignPlayersToMarkers(markers, players)

  }



  return { ...board, formation, markers }

}



export function createCustomFormationFromBoard(board, name) {

  const id = generateRecordId('formation')

  return {

    id,

    name,

    slots: board.markers.map((marker) => ({

      id: marker.slotId ?? marker.id,

      label: marker.label,

      x: marker.x,

      y: marker.y,

    })),

  }

}



export function duplicateCustomFormation(customFormations, formationId, newName) {

  const source = customFormations[formationId]

  if (!source) return customFormations



  const id = generateRecordId('formation')

  return {

    ...customFormations,

    [id]: {

      ...source,

      id,

      name: newName || `${source.name} (copia)`,

      slots: source.slots.map((slot) => ({ ...slot })),

    },

  }

}



export function renameCustomFormation(customFormations, formationId, newName) {

  const source = customFormations[formationId]

  if (!source) return customFormations



  return {

    ...customFormations,

    [formationId]: { ...source, name: newName },

  }

}



export function createSavedLineupFromBoard(board, name) {

  return createSavedBoardFromBoard(board, name)

}



export function createSavedBoardFromBoard(board, name, extras = {}) {

  const timestamp = nowIso()

  return {

    id: generateRecordId('saved-board'),

    name,

    categoryId: board.categoryId ?? extras.categoryId ?? null,

    boardType: board.boardType ?? 'lineup',

    pitchType: board.pitchType ?? 'full-vertical',

    formation: board.formation,

    mode: board.mode,

    markers: board.markers.map((marker) => ({ ...marker })),

    rivalMarkers: (board.rivalMarkers ?? []).map((marker) => ({ ...marker })),

    benchPlayerIds: [...board.benchPlayerIds],

    drawings: board.drawings.map((drawing) => ({ ...drawing })),

    staffIds: [...board.staffIds],

    staffRoles: { ...board.staffRoles },

    substitutions: board.substitutions.map((sub) => ({ ...sub })),

    teams: {

      own: { ...board.teams.own },

      rival: { ...board.teams.rival },

    },

    notes: board.notes ?? '',

    zoom: board.zoom ?? 1,

    displayOptions: board.displayOptions ?? { ...DEFAULT_DISPLAY_OPTIONS },

    linkedMatchId: board.linkedMatchId ?? null,

    createdAt: timestamp,

    updatedAt: timestamp,

  }

}



export function applySavedLineupToBoard(board, lineup) {

  return applySavedBoardToBoard(board, lineup)

}



export function applySavedBoardToBoard(board, saved) {

  return {

    ...board,

    formation: saved.formation,

    mode: saved.mode,

    categoryId: saved.categoryId ?? board.categoryId,

    boardType: saved.boardType ?? board.boardType,

    pitchType: saved.pitchType ?? board.pitchType,

    markers: saved.markers.map((marker) => ({ ...marker })),

    rivalMarkers: (saved.rivalMarkers ?? []).map((marker) => ({ ...marker })),

    benchPlayerIds: [...saved.benchPlayerIds],

    drawings: saved.drawings.map((drawing) => ({ ...drawing })),

    staffIds: [...(saved.staffIds ?? [])],

    staffRoles: { ...(saved.staffRoles ?? {}) },

    substitutions: [...(saved.substitutions ?? [])],

    teams: saved.teams ?? board.teams,

    notes: saved.notes ?? '',

    zoom: saved.zoom ?? board.zoom ?? 1,

    displayOptions: saved.displayOptions ?? board.displayOptions ?? { ...DEFAULT_DISPLAY_OPTIONS },

    linkedMatchId: saved.linkedMatchId ?? board.linkedMatchId,

    history: { past: [], future: [] },

  }

}



export function loadBoardFromMatch(match, playerMap, customFormations = {}) {

  const board = createBoard(

    `Partido vs ${match.opponent}`,

    match.formation ?? '4-3-3',

    customFormations,

    { categoryId: match.categoryId, boardType: 'match' },

  )



  board.mode = BOARD_MODES.SQUAD

  board.linkedMatchId = match.id

  board.markers = board.markers.map((marker) => {

    const playerId = match.lineup?.[marker.slotId] ?? null

    const player = playerId ? playerMap[playerId] : null

    return {

      ...marker,

      playerId,

      label: player ? String(player.number) : marker.label,

    }

  })

  board.benchPlayerIds = [...(match.squad?.substitutes ?? [])]

  board.staffIds = [...(match.staffSquad?.called ?? [])]

  board.teams = {

    ...board.teams,

    rival: {

      ...board.teams.rival,

      name: match.opponent,

      visible: true,

    },

  }



  return board

}



export function syncBoardToMatch(board, match) {

  const onPitchIds = board.markers.map((marker) => marker.playerId).filter(Boolean)

  const benchIds = board.benchPlayerIds.filter((id) => !onPitchIds.includes(id))



  return {

    ...match,

    formation: board.formation,

    lineup: buildLineupFromMarkers(board),

    squad: {

      ...match.squad,

      starters: onPitchIds,

      substitutes: benchIds,

      notCalled: (match.squad?.notCalled ?? []).filter(

        (id) => !onPitchIds.includes(id) && !benchIds.includes(id),

      ),

    },

    staffSquad: {

      called: [...board.staffIds],

      notCalled: (match.staffSquad?.notCalled ?? []).filter(

        (id) => !board.staffIds.includes(id),

      ),

    },

  }

}



export function pushDrawingHistory(board) {

  return {

    ...board,

    history: {

      past: [...board.history.past, board.drawings.map((drawing) => ({ ...drawing }))].slice(-50),

      future: [],

    },

  }

}



export function undoDrawings(board) {

  if (board.history.past.length === 0) return board

  const past = [...board.history.past]

  const previous = past.pop()



  return {

    ...board,

    drawings: previous,

    history: {

      past,

      future: [board.drawings.map((drawing) => ({ ...drawing })), ...board.history.future],

    },

  }

}



export function redoDrawings(board) {

  if (board.history.future.length === 0) return board

  const [next, ...future] = board.history.future



  return {

    ...board,

    drawings: next,

    history: {

      past: [...board.history.past, board.drawings.map((drawing) => ({ ...drawing }))],

      future,

    },

  }

}



function clampPercent(value) {

  return Math.max(2, Math.min(98, value))

}



export function getMarkerDisplay(marker, mode, playerMap) {

  const player = marker.playerId ? playerMap[marker.playerId] : null



  if (mode === BOARD_MODES.SQUAD && player) {

    return {

      primary: String(player.number),

      secondary: `${player.firstName?.[0] ?? ''}${player.lastName?.[0] ?? ''}`.toUpperCase(),

      player,

    }

  }



  if (mode === BOARD_MODES.CHIPS && player) {

    return {

      primary: String(player.number),

      secondary: player.lastName?.slice(0, 10) ?? '',

      player,

      showPhoto: true,

    }

  }



  return {

    primary: marker.label,

    secondary: null,

    player: null,

  }

}



export function getUnassignedPlayers(players, board) {

  const usedIds = new Set([

    ...board.markers.map((marker) => marker.playerId).filter(Boolean),

    ...board.benchPlayerIds,

  ])



  return players.filter((player) => !usedIds.has(player.id))

}



export function duplicateDrawing(drawings, drawingId) {

  const source = drawings.find((drawing) => drawing.id === drawingId)

  if (!source) return drawings



  const copy = {

    ...source,

    id: generateRecordId('draw'),

    x: source.x !== undefined ? source.x + 2 : source.x,

    y: source.y !== undefined ? source.y + 2 : source.y,

    x1: source.x1 !== undefined ? source.x1 + 2 : source.x1,

    y1: source.y1 !== undefined ? source.y1 + 2 : source.y1,

    x2: source.x2 !== undefined ? source.x2 + 2 : source.x2,

    y2: source.y2 !== undefined ? source.y2 + 2 : source.y2,

    cx: source.cx !== undefined ? source.cx + 2 : source.cx,

    cy: source.cy !== undefined ? source.cy + 2 : source.cy,

  }



  return [...drawings, copy]

}

export function createTacticalBoardSnapshot(board) {
  return {
    formation: board.formation,
    lineup: buildLineupFromMarkers(board),
    markers: board.markers.map((marker) => ({ ...marker })),
    benchPlayerIds: [...board.benchPlayerIds],
    drawings: board.drawings.map((drawing) => ({ ...drawing })),
    mode: board.mode,
    pitchType: board.pitchType,
    staffIds: [...board.staffIds],
    savedBoardId: null,
  }
}

export function syncBoardToTrainingBlock(board, block) {
  return {
    ...block,
    tacticalBoard: {
      ...block.tacticalBoard,
      ...createTacticalBoardSnapshot(board),
    },
  }
}

export function syncBoardToTrainingExercise(board, exercise) {
  return {
    ...exercise,
    tacticalBoard: {
      ...(exercise.tacticalBoard ?? {}),
      ...createTacticalBoardSnapshot(board),
    },
  }
}

export const POINT_DRAWING_TYPES = [
  'cone', 'ball', 'pole', 'hurdle', 'ring', 'mini-goal', 'mannequin', 'ladder', 'bib', 'text',
]

export const LINE_DRAWING_TYPES = ['arrow', 'arrow-curve', 'line', 'line-dashed', 'freehand']

export const AREA_DRAWING_TYPES = ['circle', 'rectangle', 'zone']

export function findMarkerInBoard(board, markerId) {
  const own = board.markers.find((m) => m.id === markerId)
  if (own) return { marker: own, list: 'markers' }
  const rival = (board.rivalMarkers ?? []).find((m) => m.id === markerId)
  if (rival) return { marker: rival, list: 'rivalMarkers' }
  return null
}

export function moveMarkerInBoard(board, markerId, x, y) {
  const found = findMarkerInBoard(board, markerId)
  if (!found) return board
  const nextX = clampPercent(x)
  const nextY = clampPercent(y)
  if (found.list === 'rivalMarkers') {
    return {
      ...board,
      rivalMarkers: board.rivalMarkers.map((m) =>
        m.id === markerId ? { ...m, x: nextX, y: nextY } : m,
      ),
    }
  }
  return {
    ...board,
    markers: moveMarker(board.markers, markerId, nextX, nextY),
  }
}

export function swapMarkersInBoard(board, markerIdA, markerIdB) {
  const a = findMarkerInBoard(board, markerIdA)
  const b = findMarkerInBoard(board, markerIdB)
  if (!a || !b || a.list !== b.list) return board
  if (a.list === 'rivalMarkers') {
    return { ...board, rivalMarkers: swapMarkers(board.rivalMarkers, markerIdA, markerIdB) }
  }
  return { ...board, markers: swapMarkers(board.markers, markerIdA, markerIdB) }
}

export function moveDrawingByDelta(drawings, drawingId, dx, dy) {
  return drawings.map((drawing) => {
    if (drawing.id !== drawingId) return drawing
    const next = { ...drawing }
    if (next.cx !== undefined) {
      next.cx = clampPercent(next.cx + dx)
      next.cy = clampPercent(next.cy + dy)
    }
    if (next.x !== undefined) {
      next.x = clampPercent(next.x + dx)
      next.y = clampPercent(next.y + dy)
    }
    if (next.x1 !== undefined) {
      next.x1 = clampPercent(next.x1 + dx)
      next.y1 = clampPercent(next.y1 + dy)
      next.x2 = clampPercent(next.x2 + dx)
      next.y2 = clampPercent(next.y2 + dy)
    }
    if (next.points?.length) {
      next.points = next.points.map((p) => ({
        x: clampPercent(p.x + dx),
        y: clampPercent(p.y + dy),
      }))
    }
    return next
  })
}

export function moveDrawingToPoint(drawings, drawingId, x, y) {
  return drawings.map((drawing) => {
    if (drawing.id !== drawingId) return drawing
    const next = { ...drawing }
    if (next.cx !== undefined) {
      next.cx = clampPercent(x)
      next.cy = clampPercent(y)
    } else if (next.x !== undefined && next.width !== undefined) {
      next.x = clampPercent(x - next.width / 2)
      next.y = clampPercent(y - next.height / 2)
    } else if (next.x !== undefined) {
      next.x = clampPercent(x)
      next.y = clampPercent(y)
    }
    return next
  })
}

export function deleteDrawingById(drawings, drawingId) {
  return drawings.filter((d) => d.id !== drawingId)
}

export function updateDrawing(drawings, drawingId, updates) {
  return drawings.map((d) => (d.id === drawingId ? { ...d, ...updates } : d))
}

export function reorderDrawing(drawings, drawingId, direction) {
  const index = drawings.findIndex((d) => d.id === drawingId)
  if (index < 0) return drawings
  const next = [...drawings]
  if (direction === 'front' && index < next.length - 1) {
    const [item] = next.splice(index, 1)
    next.push(item)
  } else if (direction === 'back' && index > 0) {
    const [item] = next.splice(index, 1)
    next.unshift(item)
  }
  return next
}

export function getDrawingCenter(drawing) {
  if (drawing.cx !== undefined) return { x: drawing.cx, y: drawing.cy }
  if (drawing.x1 !== undefined) {
    return { x: (drawing.x1 + drawing.x2) / 2, y: (drawing.y1 + drawing.y2) / 2 }
  }
  if (drawing.x !== undefined && drawing.width !== undefined) {
    return { x: drawing.x + drawing.width / 2, y: drawing.y + drawing.height / 2 }
  }
  if (drawing.x !== undefined) return { x: drawing.x, y: drawing.y }
  if (drawing.points?.length) {
    const xs = drawing.points.map((p) => p.x)
    const ys = drawing.points.map((p) => p.y)
    return { x: xs.reduce((a, b) => a + b, 0) / xs.length, y: ys.reduce((a, b) => a + b, 0) / ys.length }
  }
  return { x: 50, y: 50 }
}


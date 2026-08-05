import { useCallback, useRef, useState } from 'react'
import PitchMarker from './PitchMarker'
import PitchSurface from './PitchSurface'
import DrawingLayer, { createDrawing, hitTestDrawing } from './DrawingLayer'
import { generateRecordId } from '../../utils/playerFactory'
import { moveMarker, swapMarkers } from '../../utils/tacticalBoardState'

const SWAP_THRESHOLD = 8
const EQUIPMENT_TOOLS = ['cone', 'ball', 'pole', 'hurdle', 'ring', 'mini-goal', 'mannequin', 'ladder']

function getRelativePoint(event, element) {
  const rect = element.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) / rect.width) * 100,
    y: ((event.clientY - rect.top) / rect.height) * 100,
  }
}

function findNearbyMarker(markers, markerId, point) {
  return markers.find((marker) => {
    if (marker.id === markerId) return false
    return Math.hypot(marker.x - point.x, marker.y - point.y) < SWAP_THRESHOLD
  })
}

function isDrawTool(tool) {
  return tool !== 'select' && tool !== 'eraser'
}

export default function TacticalPitch({
  board,
  mode,
  playerMap,
  activeTool,
  drawColor,
  onBoardChange,
  onDropPlayerOnMarker,
  onDropPlayerOnPitch,
  onDrawingSelect,
}) {
  const pitchRef = useRef(null)
  const [draggingMarkerId, setDraggingMarkerId] = useState(null)
  const [selectedMarkerId, setSelectedMarkerId] = useState(null)
  const [selectedDrawingId, setSelectedDrawingId] = useState(null)
  const [drawStart, setDrawStart] = useState(null)
  const [previewDrawing, setPreviewDrawing] = useState(null)
  const [freehandPoints, setFreehandPoints] = useState([])

  const teamColors = board.teams?.own
  const visibleMarkers =
    board.teamView === 'rival'
      ? board.rivalMarkers ?? []
      : board.teamView === 'both'
        ? [...board.markers, ...(board.rivalMarkers ?? [])]
        : board.markers

  const updateBoard = useCallback(
    (updater) => onBoardChange(typeof updater === 'function' ? updater(board) : updater),
    [board, onBoardChange],
  )

  const pushHistory = (drawings) => ({
    past: [...board.history.past, board.drawings.map((drawing) => ({ ...drawing }))].slice(-50),
    future: [],
  })

  const handleMarkerPointerDown = (event, markerId) => {
    if (activeTool !== 'select') return
    event.preventDefault()
    event.stopPropagation()
    setDraggingMarkerId(markerId)
    setSelectedMarkerId(markerId)
    setSelectedDrawingId(null)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!pitchRef.current) return

    if (draggingMarkerId) {
      const point = getRelativePoint(event, pitchRef.current)
      updateBoard({
        ...board,
        markers: moveMarker(board.markers, draggingMarkerId, point.x, point.y),
      })
      return
    }

    if (drawStart && isDrawTool(activeTool)) {
      const point = getRelativePoint(event, pitchRef.current)
      if (activeTool === 'freehand') {
        const nextPoints = [...freehandPoints, point]
        setFreehandPoints(nextPoints)
        setPreviewDrawing(createDrawing('freehand', drawStart, point, drawColor, '', { points: nextPoints }))
      } else if (EQUIPMENT_TOOLS.includes(activeTool)) {
        setPreviewDrawing(createDrawing(activeTool, drawStart, point, drawColor))
      } else {
        setPreviewDrawing(createDrawing(activeTool, drawStart, point, drawColor))
      }
    }
  }

  const handlePointerUp = (event) => {
    if (!pitchRef.current) return

    if (draggingMarkerId) {
      const point = getRelativePoint(event, pitchRef.current)
      const nearby = findNearbyMarker(board.markers, draggingMarkerId, point)
      if (nearby) {
        updateBoard({
          ...board,
          markers: swapMarkers(board.markers, draggingMarkerId, nearby.id),
        })
      }
      setDraggingMarkerId(null)
      return
    }

    if (drawStart) {
      const point = getRelativePoint(event, pitchRef.current)
      if (activeTool === 'eraser') {
        const hitId = hitTestDrawing(board.drawings, point)
        if (hitId) {
          updateBoard({
            ...board,
            drawings: board.drawings.filter((drawing) => drawing.id !== hitId),
            history: pushHistory(board.drawings),
          })
        }
      } else if (activeTool === 'text') {
        const text = window.prompt('Texto para la pizarra', 'Movimiento')
        if (text) {
          const drawing = createDrawing('text', drawStart, point, drawColor, text)
          updateBoard({
            ...board,
            drawings: [...board.drawings, drawing],
            history: pushHistory(board.drawings),
          })
        }
      } else if (activeTool === 'freehand' && freehandPoints.length > 1) {
        const drawing = createDrawing('freehand', drawStart, point, drawColor, '', {
          points: freehandPoints,
        })
        updateBoard({
          ...board,
          drawings: [...board.drawings, drawing],
          history: pushHistory(board.drawings),
        })
      } else if (isDrawTool(activeTool)) {
        const drawing = createDrawing(activeTool, drawStart, point, drawColor)
        updateBoard({
          ...board,
          drawings: [...board.drawings, drawing],
          history: pushHistory(board.drawings),
        })
      }
      setDrawStart(null)
      setPreviewDrawing(null)
      setFreehandPoints([])
    }
  }

  const handlePitchPointerDown = (event) => {
    if (!pitchRef.current) return
    const point = getRelativePoint(event, pitchRef.current)

    if (activeTool === 'select') {
      const hitId = hitTestDrawing(board.drawings, point)
      setSelectedDrawingId(hitId)
      setSelectedMarkerId(null)
      onDrawingSelect?.(hitId)
      return
    }

    if (activeTool === 'eraser') {
      const hitId = hitTestDrawing(board.drawings, point)
      if (hitId) {
        updateBoard({
          ...board,
          drawings: board.drawings.filter((drawing) => drawing.id !== hitId),
          history: pushHistory(board.drawings),
        })
      }
      return
    }

    setDrawStart(point)
    if (activeTool === 'freehand') {
      setFreehandPoints([point])
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const playerId = event.dataTransfer.getData('playerId')
    if (!playerId || !pitchRef.current) return

    const point = getRelativePoint(event, pitchRef.current)
    const target =
      findNearbyMarker(board.markers, '', point) ??
      board.markers.reduce((closest, marker) => {
        const dist = Math.hypot(marker.x - point.x, marker.y - point.y)
        if (!closest || dist < closest.dist) return { marker, dist }
        return closest
      }, null)?.marker

    if (target) {
      onDropPlayerOnMarker?.(playerId, target.id)
    } else {
      onDropPlayerOnPitch?.(playerId, point)
    }
  }

  return (
    <div
      ref={pitchRef}
      className="h-full w-full touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ touchAction: 'none' }}
    >
      <PitchSurface pitchType={board.pitchType ?? 'full-vertical'} className="h-full">
        <div
          className="absolute inset-0"
          onPointerDown={handlePitchPointerDown}
        >
          <DrawingLayer drawings={board.drawings} previewDrawing={previewDrawing} />

          {visibleMarkers.map((marker) => (
            <PitchMarker
              key={marker.id}
              marker={marker}
              mode={mode}
              playerMap={playerMap}
              teamColors={marker.team === 'rival' ? board.teams?.rival : teamColors}
              isSelected={selectedMarkerId === marker.id}
              isDragging={draggingMarkerId === marker.id}
              onPointerDown={handleMarkerPointerDown}
            />
          ))}
        </div>
      </PitchSurface>
    </div>
  )
}

export function createFreeMarkerAt(point, playerId, playerLabel) {
  return {
    id: generateRecordId('marker'),
    slotId: null,
    label: playerLabel,
    x: point.x,
    y: point.y,
    playerId,
    onPitch: true,
    team: 'own',
  }
}

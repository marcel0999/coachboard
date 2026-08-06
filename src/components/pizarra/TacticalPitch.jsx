import { useCallback, useRef, useState } from 'react'
import PitchMarker from './PitchMarker'
import PitchSurface from './PitchSurface'
import DrawingLayer, { createDrawing, hitTestDrawing, POINT_DRAWING_TYPES } from './DrawingLayer'
import EquipmentOverlay from './EquipmentOverlay'
import DrawingContextMenu from './DrawingContextMenu'
import { generateRecordId } from '../../utils/playerFactory'
import {
  moveDrawingByDelta,
  moveMarkerInBoard,
  swapMarkersInBoard,
  pushDrawingHistory,
  duplicateDrawing,
  deleteDrawingById,
  updateDrawing,
  reorderDrawing,
} from '../../utils/tacticalBoardState'
import { DRAG_FROM_TOOLBAR } from '../../constants/tacticalBoard'

const SWAP_THRESHOLD = 8
const EQUIPMENT_TOOLS = [
  'cone', 'ball', 'pole', 'hurdle', 'ring', 'mini-goal', 'mannequin', 'ladder', 'bib',
]

function getRelativePoint(event, element) {
  const rect = element.getBoundingClientRect()
  return {
    x: Math.max(2, Math.min(98, ((event.clientX - rect.left) / rect.width) * 100)),
    y: Math.max(2, Math.min(98, ((event.clientY - rect.top) / rect.height) * 100)),
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

function isEquipmentTool(tool) {
  return EQUIPMENT_TOOLS.includes(tool)
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
  const boardRef = useRef(board)
  boardRef.current = board

  const [draggingMarkerId, setDraggingMarkerId] = useState(null)
  const [draggingDrawingId, setDraggingDrawingId] = useState(null)
  const [dragStartPoint, setDragStartPoint] = useState(null)
  const [selectedMarkerId, setSelectedMarkerId] = useState(null)
  const [selectedDrawingId, setSelectedDrawingId] = useState(null)
  const [drawStart, setDrawStart] = useState(null)
  const [previewDrawing, setPreviewDrawing] = useState(null)
  const [freehandPoints, setFreehandPoints] = useState([])
  const [contextMenuPos, setContextMenuPos] = useState(null)
  const dragMovedRef = useRef(false)

  const teamColors = board.teams?.own
  const visibleMarkers =
    board.teamView === 'rival'
      ? board.rivalMarkers ?? []
      : board.teamView === 'both'
        ? [...board.markers, ...(board.rivalMarkers ?? [])]
        : board.markers

  const updateBoard = useCallback(
    (updater) => {
      const current = boardRef.current
      onBoardChange(typeof updater === 'function' ? updater(current) : updater)
    },
    [onBoardChange],
  )

  const commitDrawings = useCallback(
    (nextDrawings) => {
      updateBoard((current) => ({
        ...current,
        drawings: nextDrawings,
        history: pushDrawingHistory(current).history,
      }))
    },
    [updateBoard],
  )

  const selectDrawing = useCallback(
    (drawingId, menuPos = null) => {
      setSelectedDrawingId(drawingId)
      setSelectedMarkerId(null)
      setContextMenuPos(menuPos)
      onDrawingSelect?.(drawingId)
    },
    [onDrawingSelect],
  )

  const handleMarkerPointerDown = (event, markerId) => {
    if (activeTool !== 'select') return
    event.preventDefault()
    event.stopPropagation()
    setDraggingMarkerId(markerId)
    setSelectedMarkerId(markerId)
    setSelectedDrawingId(null)
    setContextMenuPos(null)
    dragMovedRef.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleDrawingPointerDown = (event, drawingId) => {
    if (activeTool !== 'select') return
    event.preventDefault()
    event.stopPropagation()
    setDraggingDrawingId(drawingId)
    selectDrawing(drawingId)
    dragMovedRef.current = false
    if (pitchRef.current) {
      setDragStartPoint(getRelativePoint(event, pitchRef.current))
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!pitchRef.current) return
    const point = getRelativePoint(event, pitchRef.current)

    if (draggingMarkerId) {
      dragMovedRef.current = true
      updateBoard((current) => moveMarkerInBoard(current, draggingMarkerId, point.x, point.y))
      return
    }

    if (draggingDrawingId && dragStartPoint) {
      dragMovedRef.current = true
      const dx = point.x - dragStartPoint.x
      const dy = point.y - dragStartPoint.y
      updateBoard((current) => ({
        ...current,
        drawings: moveDrawingByDelta(current.drawings, draggingDrawingId, dx, dy),
      }))
      setDragStartPoint(point)
      return
    }

    if (drawStart && isDrawTool(activeTool)) {
      if (activeTool === 'freehand') {
        const nextPoints = [...freehandPoints, point]
        setFreehandPoints(nextPoints)
        setPreviewDrawing(createDrawing('freehand', drawStart, point, drawColor, '', { points: nextPoints }))
      } else if (isEquipmentTool(activeTool)) {
        setPreviewDrawing(createDrawing(activeTool, drawStart, point, drawColor))
      } else {
        setPreviewDrawing(createDrawing(activeTool, drawStart, point, drawColor))
      }
    }
  }

  const finishDrawingDrag = () => {
    if (draggingDrawingId && dragMovedRef.current) {
      updateBoard((current) => ({
        ...current,
        history: pushDrawingHistory(current).history,
      }))
    }
    setDraggingDrawingId(null)
    setDragStartPoint(null)
  }

  const handlePointerUp = (event) => {
    if (!pitchRef.current) return
    const point = getRelativePoint(event, pitchRef.current)

    if (draggingMarkerId) {
      if (dragMovedRef.current) {
        const current = boardRef.current
        const markerList =
          current.teamView === 'rival' || current.rivalMarkers?.some((m) => m.id === draggingMarkerId)
            ? current.rivalMarkers ?? []
            : current.markers
        const nearby = findNearbyMarker(markerList, draggingMarkerId, point)
        if (nearby) {
          updateBoard((b) => swapMarkersInBoard(b, draggingMarkerId, nearby.id))
        } else {
          updateBoard((b) => ({
            ...b,
          }))
        }
      }
      setDraggingMarkerId(null)
      finishDrawingDrag()
      return
    }

    if (draggingDrawingId) {
      finishDrawingDrag()
      return
    }

    if (drawStart) {
      const moved = Math.hypot(point.x - drawStart.x, point.y - drawStart.y)

      if (activeTool === 'eraser') {
        const hitId = hitTestDrawing(boardRef.current.drawings, point)
        if (hitId) {
          commitDrawings(deleteDrawingById(boardRef.current.drawings, hitId))
        }
      } else if (activeTool === 'text') {
        const text = window.prompt('Texto para la pizarra', 'Movimiento')
        if (text) {
          commitDrawings([
            ...boardRef.current.drawings,
            createDrawing('text', drawStart, point, drawColor, text),
          ])
        }
      } else if (activeTool === 'freehand' && freehandPoints.length > 1) {
        commitDrawings([
          ...boardRef.current.drawings,
          createDrawing('freehand', drawStart, point, drawColor, '', { points: freehandPoints }),
        ])
      } else if (isEquipmentTool(activeTool)) {
        commitDrawings([
          ...boardRef.current.drawings,
          createDrawing(activeTool, drawStart, point, drawColor),
        ])
      } else if (isDrawTool(activeTool) && moved > 1) {
        commitDrawings([
          ...boardRef.current.drawings,
          createDrawing(activeTool, drawStart, point, drawColor),
        ])
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
      const hitId = hitTestDrawing(boardRef.current.drawings, point)
      if (hitId) {
        selectDrawing(hitId, { x: event.clientX, y: event.clientY })
        setDraggingDrawingId(hitId)
        setDragStartPoint(point)
        dragMovedRef.current = false
      } else {
        setSelectedDrawingId(null)
        setSelectedMarkerId(null)
        setContextMenuPos(null)
        onDrawingSelect?.(null)
      }
      return
    }

    if (activeTool === 'eraser') {
      const hitId = hitTestDrawing(boardRef.current.drawings, point)
      if (hitId) {
        commitDrawings(deleteDrawingById(boardRef.current.drawings, hitId))
      }
      return
    }

    if (isEquipmentTool(activeTool)) {
      commitDrawings([
        ...boardRef.current.drawings,
        createDrawing(activeTool, point, point, drawColor),
      ])
      return
    }

    setDrawStart(point)
    if (activeTool === 'freehand') {
      setFreehandPoints([point])
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (event) => {
    event.preventDefault()
    if (!pitchRef.current) return
    const point = getRelativePoint(event, pitchRef.current)

    const toolType = event.dataTransfer.getData(DRAG_FROM_TOOLBAR)
    if (toolType && (isEquipmentTool(toolType) || toolType === 'text')) {
      if (toolType === 'text') {
        const text = window.prompt('Texto para la pizarra', 'Movimiento')
        if (text) {
          commitDrawings([
            ...boardRef.current.drawings,
            createDrawing('text', point, point, drawColor, text),
          ])
        }
      } else {
        commitDrawings([
          ...boardRef.current.drawings,
          createDrawing(toolType, point, point, drawColor),
        ])
      }
      return
    }

    const playerId = event.dataTransfer.getData('playerId')
    if (!playerId) return

    const target =
      findNearbyMarker(boardRef.current.markers, '', point) ??
      boardRef.current.markers.reduce((closest, marker) => {
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

  const selectedDrawing = board.drawings.find((d) => d.id === selectedDrawingId)

  const handleContextDuplicate = () => {
    if (!selectedDrawingId) return
    updateBoard((current) => ({
      ...current,
      drawings: duplicateDrawing(current.drawings, selectedDrawingId),
      history: pushDrawingHistory(current).history,
    }))
    setContextMenuPos(null)
  }

  const handleContextDelete = () => {
    if (!selectedDrawingId) return
    commitDrawings(deleteDrawingById(boardRef.current.drawings, selectedDrawingId))
    setSelectedDrawingId(null)
    setContextMenuPos(null)
    onDrawingSelect?.(null)
  }

  const handleContextColor = (color) => {
    if (!selectedDrawingId) return
    updateBoard((current) => ({
      ...current,
      drawings: updateDrawing(current.drawings, selectedDrawingId, { color }),
      history: pushDrawingHistory(current).history,
    }))
  }

  const handleContextRotate = () => {
    if (!selectedDrawingId) return
    updateBoard((current) => {
      const drawing = current.drawings.find((d) => d.id === selectedDrawingId)
      const nextRotation = ((drawing?.rotation ?? 0) + 45) % 360
      return {
        ...current,
        drawings: updateDrawing(current.drawings, selectedDrawingId, { rotation: nextRotation }),
        history: pushDrawingHistory(current).history,
      }
    })
  }

  const handleContextResize = () => {
    if (!selectedDrawingId) return
    updateBoard((current) => {
      const drawing = current.drawings.find((d) => d.id === selectedDrawingId)
      if (!drawing) return current
      const currentSize = drawing.size ?? 32
      const nextSize = currentSize >= 56 ? 24 : currentSize + 8
      return {
        ...current,
        drawings: updateDrawing(current.drawings, selectedDrawingId, { size: nextSize }),
        history: pushDrawingHistory(current).history,
      }
    })
  }

  const handleBringFront = () => {
    if (!selectedDrawingId) return
    updateBoard((current) => ({
      ...current,
      drawings: reorderDrawing(current.drawings, selectedDrawingId, 'front'),
    }))
    setContextMenuPos(null)
  }

  const handleSendBack = () => {
    if (!selectedDrawingId) return
    updateBoard((current) => ({
      ...current,
      drawings: reorderDrawing(current.drawings, selectedDrawingId, 'back'),
    }))
    setContextMenuPos(null)
  }

  const svgDrawings = board.drawings.filter((d) => !POINT_DRAWING_TYPES.includes(d.type))
  const previewForSvg =
    previewDrawing && !POINT_DRAWING_TYPES.includes(previewDrawing.type) ? previewDrawing : null

  return (
    <div
      ref={pitchRef}
      className="relative h-full w-full touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ touchAction: 'none' }}
    >
      <PitchSurface pitchType={board.pitchType ?? 'full-vertical'} className="h-full">
        <div className="absolute inset-0" onPointerDown={handlePitchPointerDown}>
          <DrawingLayer
            drawings={svgDrawings}
            previewDrawing={previewForSvg}
            selectedDrawingId={selectedDrawingId}
          />

          <EquipmentOverlay
            drawings={board.drawings}
            selectedDrawingId={selectedDrawingId}
            activeTool={activeTool}
            onPointerDown={handleDrawingPointerDown}
          />

          {previewDrawing && POINT_DRAWING_TYPES.includes(previewDrawing.type) && (
            <EquipmentOverlay
              drawings={[previewDrawing]}
              selectedDrawingId={null}
              activeTool="select"
              onPointerDown={() => {}}
            />
          )}

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

      {contextMenuPos && selectedDrawing && (
        <DrawingContextMenu
          drawing={selectedDrawing}
          position={contextMenuPos}
          onDuplicate={handleContextDuplicate}
          onDelete={handleContextDelete}
          onColorChange={handleContextColor}
          onRotate={handleContextRotate}
          onResize={handleContextResize}
          onBringFront={handleBringFront}
          onSendBack={handleSendBack}
          onClose={() => setContextMenuPos(null)}
        />
      )}
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
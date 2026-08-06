import { generateRecordId } from './playerFactory'

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  if (dx === 0 && dy === 0) return Math.hypot(point.x - start.x, point.y - start.y)
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)))
  const projX = start.x + t * dx
  const projY = start.y + t * dy
  return Math.hypot(point.x - projX, point.y - projY)
}

export function createDrawing(type, start, end, color, text = '', extra = {}) {
  const base = { id: generateRecordId('draw'), type, color, ...extra }

  switch (type) {
    case 'arrow':
    case 'arrow-curve':
    case 'line':
    case 'line-dashed':
      return { ...base, x1: start.x, y1: start.y, x2: end.x, y2: end.y }
    case 'freehand':
      return { ...base, points: extra.points ?? [start, end] }
    case 'circle':
      return {
        ...base,
        cx: start.x,
        cy: start.y,
        r: Math.hypot(end.x - start.x, end.y - start.y) * 2,
      }
    case 'cone':
    case 'ball':
    case 'pole':
    case 'ring':
    case 'mini-goal':
    case 'mannequin':
    case 'ladder':
    case 'bib':
      return { ...base, cx: start.x, cy: start.y, size: extra.size ?? undefined, rotation: extra.rotation ?? 0 }
    case 'rectangle':
    case 'zone':
      return {
        ...base,
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y),
        width: Math.abs(end.x - start.x),
        height: Math.abs(end.y - start.y),
      }
    case 'text':
      return { ...base, x: start.x, y: start.y, text: text || 'Texto' }
    case 'hurdle':
      return { ...base, cx: start.x, cy: start.y }
    default:
      return base
  }
}

export function hitTestDrawing(drawings, point, threshold = 4) {
  for (let index = drawings.length - 1; index >= 0; index -= 1) {
    const drawing = drawings[index]
    if (drawing.type === 'line' || drawing.type === 'arrow' || drawing.type === 'line-dashed') {
      const dist = distanceToSegment(point, { x: drawing.x1, y: drawing.y1 }, { x: drawing.x2, y: drawing.y2 })
      if (dist < threshold) return drawing.id
    }
    if (drawing.type === 'circle' || drawing.type === 'ring') {
      const d = Math.hypot(point.x - drawing.cx, point.y - drawing.cy)
      if (Math.abs(d - drawing.r / 2) < threshold || Math.abs(d - 10) < threshold) return drawing.id
    }
    if (drawing.type === 'zone' || drawing.type === 'rectangle') {
      if (
        point.x >= drawing.x &&
        point.x <= drawing.x + drawing.width &&
        point.y >= drawing.y &&
        point.y <= drawing.y + drawing.height
      ) {
        return drawing.id
      }
    }
    if (drawing.type === 'text') {
      if (Math.hypot(point.x - drawing.x, point.y - drawing.y) < threshold) return drawing.id
    }
    if (['cone', 'ball', 'pole', 'hurdle', 'mini-goal', 'mannequin', 'ladder', 'bib'].includes(drawing.type)) {
      if (Math.hypot(point.x - drawing.cx, point.y - drawing.cy) < threshold) return drawing.id
    }
    if (drawing.type === 'freehand' && drawing.points?.length) {
      const close = drawing.points.some(
        (p) => Math.hypot(point.x - p.x, point.y - p.y) < threshold,
      )
      if (close) return drawing.id
    }
  }
  return null
}

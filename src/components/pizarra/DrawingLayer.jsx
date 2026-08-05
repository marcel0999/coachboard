import { generateRecordId } from '../../utils/playerFactory'

function renderDrawing(drawing) {
  const key = drawing.id

  switch (drawing.type) {
    case 'arrow':
      return (
        <g key={key}>
          <line
            x1={`${drawing.x1}%`}
            y1={`${drawing.y1}%`}
            x2={`${drawing.x2}%`}
            y2={`${drawing.y2}%`}
            stroke={drawing.color}
            strokeWidth="3"
            markerEnd="url(#arrowhead)"
          />
        </g>
      )
    case 'arrow-curve': {
      const mx = (drawing.x1 + drawing.x2) / 2
      const my = Math.min(drawing.y1, drawing.y2) - 8
      return (
        <path
          key={key}
          d={`M ${drawing.x1}% ${drawing.y1}% Q ${mx}% ${my}% ${drawing.x2}% ${drawing.y2}%`}
          fill="none"
          stroke={drawing.color}
          strokeWidth="3"
          markerEnd="url(#arrowhead)"
        />
      )
    }
    case 'line':
      return (
        <line
          key={key}
          x1={`${drawing.x1}%`}
          y1={`${drawing.y1}%`}
          x2={`${drawing.x2}%`}
          y2={`${drawing.y2}%`}
          stroke={drawing.color}
          strokeWidth="3"
        />
      )
    case 'line-dashed':
      return (
        <line
          key={key}
          x1={`${drawing.x1}%`}
          y1={`${drawing.y1}%`}
          x2={`${drawing.x2}%`}
          y2={`${drawing.y2}%`}
          stroke={drawing.color}
          strokeWidth="3"
          strokeDasharray="8 6"
        />
      )
    case 'freehand':
      return (
        <polyline
          key={key}
          points={drawing.points.map((point) => `${point.x}%,${point.y}%`).join(' ')}
          fill="none"
          stroke={drawing.color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )
    case 'circle':
      return (
        <circle
          key={key}
          cx={`${drawing.cx}%`}
          cy={`${drawing.cy}%`}
          r={drawing.r}
          fill="none"
          stroke={drawing.color}
          strokeWidth="3"
        />
      )
    case 'rectangle':
      return (
        <rect
          key={key}
          x={`${drawing.x}%`}
          y={`${drawing.y}%`}
          width={`${drawing.width}%`}
          height={`${drawing.height}%`}
          fill="none"
          stroke={drawing.color}
          strokeWidth="3"
        />
      )
    case 'zone':
      return (
        <rect
          key={key}
          x={`${drawing.x}%`}
          y={`${drawing.y}%`}
          width={`${drawing.width}%`}
          height={`${drawing.height}%`}
          fill={drawing.color}
          opacity="0.25"
          stroke={drawing.color}
          strokeWidth="2"
        />
      )
    case 'text':
      return (
        <text
          key={key}
          x={`${drawing.x}%`}
          y={`${drawing.y}%`}
          fill={drawing.color}
          fontSize="14"
          fontWeight="700"
        >
          {drawing.text}
        </text>
      )
    case 'cone':
      return (
        <polygon
          key={key}
          points={`${drawing.cx}%,${drawing.cy + 2}% ${drawing.cx - 2}%,${drawing.cy - 2}% ${drawing.cx + 2}%,${drawing.cy - 2}%`}
          fill={drawing.color}
          opacity="0.9"
        />
      )
    case 'ball':
      return (
        <g key={key}>
          <circle cx={`${drawing.cx}%`} cy={`${drawing.cy}%`} r="8" fill={drawing.color} stroke="#111" strokeWidth="1" />
          <circle cx={`${drawing.cx - 2}%`} cy={`${drawing.cy - 1}%`} r="1.5" fill="#111" opacity="0.4" />
        </g>
      )
    case 'pole':
      return (
        <line
          key={key}
          x1={`${drawing.cx}%`}
          y1={`${drawing.cy - 3}%`}
          x2={`${drawing.cx}%`}
          y2={`${drawing.cy + 3}%`}
          stroke={drawing.color}
          strokeWidth="4"
          strokeLinecap="round"
        />
      )
    case 'hurdle':
      return (
        <g key={key}>
          <line x1={`${drawing.cx - 3}%`} y1={`${drawing.cy}%`} x2={`${drawing.cx + 3}%`} y2={`${drawing.cy}%`} stroke={drawing.color} strokeWidth="3" />
          <line x1={`${drawing.cx - 3}%`} y1={`${drawing.cy - 2}%`} x2={`${drawing.cx - 3}%`} y2={`${drawing.cy + 2}%`} stroke={drawing.color} strokeWidth="2" />
          <line x1={`${drawing.cx + 3}%`} y1={`${drawing.cy - 2}%`} x2={`${drawing.cx + 3}%`} y2={`${drawing.cy + 2}%`} stroke={drawing.color} strokeWidth="2" />
        </g>
      )
    case 'ring':
      return (
        <circle
          key={key}
          cx={`${drawing.cx}%`}
          cy={`${drawing.cy}%`}
          r="10"
          fill="none"
          stroke={drawing.color}
          strokeWidth="4"
        />
      )
    case 'mini-goal':
      return (
        <rect
          key={key}
          x={`${drawing.cx - 4}%`}
          y={`${drawing.cy - 2}%`}
          width="8%"
          height="4%"
          fill="none"
          stroke={drawing.color}
          strokeWidth="3"
        />
      )
    case 'mannequin':
      return (
        <g key={key}>
          <circle cx={`${drawing.cx}%`} cy={`${drawing.cy - 2}%`} r="3" fill={drawing.color} />
          <line x1={`${drawing.cx}%`} y1={`${drawing.cy}%`} x2={`${drawing.cx}%`} y2={`${drawing.cy + 4}%`} stroke={drawing.color} strokeWidth="3" />
        </g>
      )
    case 'ladder':
      return (
        <g key={key}>
          {[0, 1, 2, 3].map((step) => (
            <line
              key={step}
              x1={`${drawing.cx - 3}%`}
              y1={`${drawing.cy - 3 + step * 2}%`}
              x2={`${drawing.cx + 3}%`}
              y2={`${drawing.cy - 3 + step * 2}%`}
              stroke={drawing.color}
              strokeWidth="2"
            />
          ))}
        </g>
      )
    default:
      return null
  }
}

export default function DrawingLayer({ drawings, previewDrawing }) {
  const allDrawings = previewDrawing ? [...drawings, previewDrawing] : drawings

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="currentColor" />
        </marker>
      </defs>
      {allDrawings.map(renderDrawing)}
    </svg>
  )
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
      return { ...base, cx: start.x, cy: start.y }
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
    if (['cone', 'ball', 'pole', 'hurdle', 'mini-goal', 'mannequin', 'ladder'].includes(drawing.type)) {
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

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  if (dx === 0 && dy === 0) return Math.hypot(point.x - start.x, point.y - start.y)
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)))
  const projX = start.x + t * dx
  const projY = start.y + t * dy
  return Math.hypot(point.x - projX, point.y - projY)
}

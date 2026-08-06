
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
    case 'bib':
      return (
        <polygon
          key={key}
          points={`${drawing.cx}%,${drawing.cy - 3}% ${drawing.cx - 3}%,${drawing.cy + 3}% ${drawing.cx + 3}%,${drawing.cy + 3}%`}
          fill={drawing.color}
          opacity="0.9"
          stroke="#111"
          strokeWidth="0.5"
        />
      )
    default:
      return null
  }
}

export default function DrawingLayer({ drawings, previewDrawing, selectedDrawingId }) {
  const allDrawings = previewDrawing ? [...drawings, previewDrawing] : drawings

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="currentColor" />
        </marker>
      </defs>
      {allDrawings.map((drawing) => {
        const rendered = renderDrawing(drawing)
        if (!rendered) return null
        const isSelected = selectedDrawingId === drawing.id
        return (
          <g key={drawing.id} opacity={isSelected ? 1 : 1} style={isSelected ? { filter: 'drop-shadow(0 0 4px #fbbf24)' } : undefined}>
            {rendered}
          </g>
        )
      })}
    </svg>
  )
}

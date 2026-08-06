import { POINT_DRAWING_TYPES } from '../../utils/tacticalBoardState'

const EQUIPMENT_ICONS = {
  cone: ({ color }) => (
    <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-md">
      <polygon points="12,4 6,18 18,18" fill={color} stroke="#111" strokeWidth="0.5" />
    </svg>
  ),
  ball: ({ color }) => (
    <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-md">
      <circle cx="12" cy="12" r="10" fill={color} stroke="#111" strokeWidth="1" />
      <circle cx="9" cy="10" r="1.5" fill="#111" opacity="0.35" />
    </svg>
  ),
  pole: ({ color }) => (
    <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-md">
      <line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  hurdle: ({ color }) => (
    <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-md">
      <line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="3" />
      <line x1="4" y1="8" x2="4" y2="16" stroke={color} strokeWidth="2" />
      <line x1="20" y1="8" x2="20" y2="16" stroke={color} strokeWidth="2" />
    </svg>
  ),
  ring: ({ color }) => (
    <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-md">
      <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="3" />
    </svg>
  ),
  'mini-goal': ({ color }) => (
    <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-md">
      <rect x="4" y="8" width="16" height="10" fill="none" stroke={color} strokeWidth="2.5" />
    </svg>
  ),
  mannequin: ({ color }) => (
    <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-md">
      <circle cx="12" cy="6" r="3" fill={color} />
      <line x1="12" y1="9" x2="12" y2="20" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  ladder: ({ color }) => (
    <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-md">
      {[0, 1, 2, 3].map((step) => (
        <line key={step} x1="4" y1={6 + step * 4} x2="20" y2={6 + step * 4} stroke={color} strokeWidth="2" />
      ))}
    </svg>
  ),
  bib: ({ color }) => (
    <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-md">
      <path d="M8 4 L12 8 L16 4 L18 20 L6 20 Z" fill={color} stroke="#111" strokeWidth="0.5" opacity="0.9" />
    </svg>
  ),
  text: ({ color, text }) => (
    <span
      className="whitespace-nowrap rounded bg-black/40 px-1.5 py-0.5 text-xs font-bold shadow-md backdrop-blur-sm"
      style={{ color }}
    >
      {text || 'Texto'}
    </span>
  ),
}

const SIZE_MAP = {
  cone: 28,
  ball: 32,
  pole: 36,
  hurdle: 40,
  ring: 36,
  'mini-goal': 44,
  mannequin: 36,
  ladder: 44,
  bib: 32,
  text: null,
}

export default function EquipmentOverlay({
  drawings,
  selectedDrawingId,
  activeTool,
  onPointerDown,
}) {
  const interactive = activeTool === 'select'

  return (
    <>
      {drawings
        .filter((d) => POINT_DRAWING_TYPES.includes(d.type))
        .map((drawing) => {
          const Icon = EQUIPMENT_ICONS[drawing.type]
          if (!Icon) return null

          const size = drawing.size ?? SIZE_MAP[drawing.type] ?? 32
          const isSelected = selectedDrawingId === drawing.id
          const cx = drawing.cx ?? drawing.x ?? 50
          const cy = drawing.cy ?? drawing.y ?? 50
          const rotation = drawing.rotation ?? 0

          return (
            <div
              key={drawing.id}
              className={[
                'absolute touch-none select-none',
                interactive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none',
                isSelected ? 'z-30' : 'z-[5]',
                drawing.id === selectedDrawingId && 'ring-2 ring-yellow-400 ring-offset-1 rounded',
              ].join(' ')}
              style={{
                left: `${cx}%`,
                top: `${cy}%`,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                width: drawing.type === 'text' ? 'auto' : size,
                height: drawing.type === 'text' ? 'auto' : size,
                pointerEvents: interactive ? 'auto' : 'none',
              }}
              onPointerDown={(event) => {
                if (!interactive) return
                onPointerDown(event, drawing.id)
              }}
            >
              <Icon color={drawing.color} text={drawing.text} />
            </div>
          )
        })}
    </>
  )
}

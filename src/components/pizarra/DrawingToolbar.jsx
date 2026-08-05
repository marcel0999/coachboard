import {
  ArrowRight,
  Circle,
  Copy,
  Eraser,
  Goal,
  Hexagon,
  Layers,
  Minus,
  MousePointer2,
  PenLine,
  Redo2,
  Square,
  Trash2,
  Triangle,
  Type,
  Undo2,
  User,
} from 'lucide-react'
import { DRAWING_COLORS, DRAWING_TOOLS } from '../../constants/tacticalBoard'

const TOOL_ICONS = {
  select: MousePointer2,
  arrow: ArrowRight,
  'arrow-curve': PenLine,
  line: Minus,
  'line-dashed': Minus,
  freehand: PenLine,
  circle: Circle,
  rectangle: Square,
  zone: Layers,
  text: Type,
  cone: Triangle,
  ball: Circle,
  pole: Minus,
  hurdle: Hexagon,
  ring: Circle,
  'mini-goal': Goal,
  mannequin: User,
  ladder: Square,
  eraser: Eraser,
}

export default function DrawingToolbar({
  activeTool,
  drawColor,
  onToolChange,
  onColorChange,
  onUndo,
  onRedo,
  onClear,
  onDuplicate,
  canUndo,
  canRedo,
  canDuplicate,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
      <div className="flex flex-wrap gap-1">
      {DRAWING_TOOLS.map((tool) => {
        const Icon = TOOL_ICONS[tool.id]
        return (
          <button
            key={tool.id}
            type="button"
            title={tool.label}
            onClick={() => onToolChange(tool.id)}
            className={[
              'inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-all sm:px-3 sm:text-sm',
              activeTool === tool.id
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary',
            ].join(' ')}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            <span className="hidden lg:inline">{tool.label}</span>
          </button>
        )
      })}
      </div>

      <div className="mx-1 hidden h-8 w-px bg-slate-200 md:block" />

      <div className="flex items-center gap-1.5">
        {DRAWING_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Color ${color}`}
            onClick={() => onColorChange(color)}
            className={[
              'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
              drawColor === color ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-110' : 'border-white shadow-sm',
            ].join(' ')}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="ml-auto flex items-center gap-0.5">
        <button
          type="button"
          onClick={onDuplicate}
          disabled={!canDuplicate}
          className="rounded-lg p-2 text-text-secondary transition hover:bg-slate-50 disabled:opacity-40"
          title="Duplicar seleccionado"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button type="button" onClick={onUndo} disabled={!canUndo} className="rounded-lg p-2 text-text-secondary transition hover:bg-slate-50 disabled:opacity-40" title="Deshacer">
          <Undo2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo} className="rounded-lg p-2 text-text-secondary transition hover:bg-slate-50 disabled:opacity-40" title="Rehacer">
          <Redo2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={onClear} className="rounded-lg p-2 text-red-600 transition hover:bg-red-50" title="Limpiar pizarra">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

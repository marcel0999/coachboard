import { useState } from 'react'
import {
  ArrowRight,
  Circle,
  ChevronDown,
  ChevronUp,
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
import { DRAG_FROM_TOOLBAR } from '../../constants/tacticalBoard'

const DRAGGABLE_TOOLS = new Set([
  'cone', 'ball', 'pole', 'hurdle', 'ring', 'mini-goal', 'mannequin', 'ladder', 'bib', 'text',
])

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
  bib: Square,
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
  onDeleteSelected,
  canUndo,
  canRedo,
  canDuplicate,
  canDelete,
  layout = 'horizontal',
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showAllTools, setShowAllTools] = useState(false)

  const primaryTools = ['select', 'freehand', 'arrow', 'eraser']
  const equipmentTools = ['cone', 'ball', 'mini-goal', 'pole', 'hurdle', 'bib', 'mannequin']
  const visibleTools =
    layout === 'sidebar' && !showAllTools
      ? DRAWING_TOOLS.filter((t) => primaryTools.includes(t.id) || equipmentTools.includes(t.id))
      : DRAWING_TOOLS

  const renderToolButton = (tool) => {
    const Icon = TOOL_ICONS[tool.id]
    const isDraggable = DRAGGABLE_TOOLS.has(tool.id)
    return (
      <button
        key={tool.id}
        type="button"
        title={isDraggable ? `${tool.label} — arrastrar a la cancha` : tool.label}
        draggable={isDraggable}
        onDragStart={(event) => {
          if (!isDraggable) return
          event.dataTransfer.setData(DRAG_FROM_TOOLBAR, tool.id)
          event.dataTransfer.effectAllowed = 'copy'
        }}
        onClick={() => onToolChange(tool.id)}
        className={[
          layout === 'sidebar'
            ? 'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium'
            : 'inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium sm:px-3 sm:text-sm',
          activeTool === tool.id
            ? 'bg-accent text-white shadow-sm'
            : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
        ].join(' ')}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span>{tool.label}</span>
      </button>
    )
  }

  if (layout === 'sidebar') {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Herramientas</p>
        <div className="grid gap-1">{visibleTools.map(renderToolButton)}</div>
        {!showAllTools && (
          <button
            type="button"
            onClick={() => setShowAllTools(true)}
            className="w-full rounded-lg border border-dashed border-border/60 py-1.5 text-[10px] font-medium text-text-muted hover:border-accent/40 hover:text-accent"
          >
            Más herramientas…
          </button>
        )}
        <div className="flex flex-wrap gap-1 pt-1">
          {DRAWING_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Color ${color}`}
              onClick={() => onColorChange(color)}
              className={[
                'h-6 w-6 rounded-full border-2',
                drawColor === color ? 'border-accent ring-2 ring-accent/30' : 'border-border',
              ].join(' ')}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex gap-1 pt-1">
          <button type="button" onClick={onUndo} disabled={!canUndo} className="flex-1 rounded-lg p-1.5 text-text-muted hover:bg-surface-muted disabled:opacity-40" title="Deshacer">
            <Undo2 className="mx-auto h-4 w-4" />
          </button>
          <button type="button" onClick={onRedo} disabled={!canRedo} className="flex-1 rounded-lg p-1.5 text-text-muted hover:bg-surface-muted disabled:opacity-40" title="Rehacer">
            <Redo2 className="mx-auto h-4 w-4" />
          </button>
          <button type="button" onClick={onClear} className="flex-1 rounded-lg p-1.5 text-red-400 hover:bg-danger-subtle" title="Limpiar">
            <Trash2 className="mx-auto h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-surface-elevated shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-text-primary md:hidden"
        onClick={() => setMobileOpen((v) => !v)}
      >
        Herramientas tácticas
        {mobileOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      <div className={`flex flex-wrap items-center gap-2 p-2 ${mobileOpen ? 'flex' : 'hidden md:flex'}`}>
      <div className="flex flex-wrap gap-1">
      {DRAWING_TOOLS.map((tool) => {
        const Icon = TOOL_ICONS[tool.id]
        const isDraggable = DRAGGABLE_TOOLS.has(tool.id)
        return (
          <button
            key={tool.id}
            type="button"
            title={isDraggable ? `${tool.label} — clic o arrastrar a la cancha` : tool.label}
            draggable={isDraggable}
            onDragStart={(event) => {
              if (!isDraggable) return
              event.dataTransfer.setData(DRAG_FROM_TOOLBAR, tool.id)
              event.dataTransfer.effectAllowed = 'copy'
            }}
            onClick={() => onToolChange(tool.id)}
            className={[
              'inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-all sm:px-3 sm:text-sm',
              activeTool === tool.id
                ? 'bg-accent text-white shadow-sm shadow-accent/25'
                : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
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
              drawColor === color ? 'border-accent ring-2 ring-accent/30 scale-110' : 'border-white shadow-sm',
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
          className="rounded-lg p-2 text-text-secondary transition hover:bg-surface-muted disabled:opacity-40"
          title="Duplicar seleccionado"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDeleteSelected}
          disabled={!canDelete}
          className="rounded-lg p-2 text-red-400 transition hover:bg-danger-subtle disabled:opacity-40"
          title="Eliminar seleccionado"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={onUndo} disabled={!canUndo} className="rounded-lg p-2 text-text-secondary transition hover:bg-surface-muted disabled:opacity-40" title="Deshacer">
          <Undo2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo} className="rounded-lg p-2 text-text-secondary transition hover:bg-surface-muted disabled:opacity-40" title="Rehacer">
          <Redo2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={onClear} className="rounded-lg p-2 text-red-400 transition hover:bg-danger-subtle" title="Limpiar dibujos">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      </div>
    </div>
  )
}

import { ArrowRight, Eraser, Maximize2, Minimize2, Minus, MousePointer2, PenLine, Plus } from 'lucide-react'
import { ZOOM_LEVELS } from '../../constants/tacticalBoard'

const PRIMARY_TOOLS = [
  { id: 'select', label: 'Modo Mover', short: 'Mover', icon: MousePointer2 },
  { id: 'freehand', label: 'Dibujar', short: 'Dibujar', icon: PenLine },
  { id: 'arrow', label: 'Flecha', short: 'Flecha', icon: ArrowRight },
  { id: 'eraser', label: 'Borrar', short: 'Borrar', icon: Eraser },
]

function nearestZoomIndex(zoom) {
  let best = 0
  let minDiff = Infinity
  ZOOM_LEVELS.forEach((level, index) => {
    const diff = Math.abs(level - zoom)
    if (diff < minDiff) {
      minDiff = diff
      best = index
    }
  })
  return best
}

export default function TacticalPitchToolbar({
  activeTool,
  onToolChange,
  zoom = 1,
  onZoomChange,
  isFullscreen,
  onToggleFullscreen,
}) {
  const zoomIndex = nearestZoomIndex(zoom ?? 1)
  const zoomPercent = Math.round((zoom ?? 1) * 100)

  const stepZoom = (direction) => {
    const next = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, zoomIndex + direction))
    onZoomChange?.(ZOOM_LEVELS[next])
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-surface-card/80 px-3 py-2 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        {PRIMARY_TOOLS.map(({ id, label, short, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onToolChange(id)}
            className={[
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition',
              activeTool === id
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
            ].join(' ')}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{short}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-surface-muted p-0.5">
          <button
            type="button"
            onClick={() => stepZoom(-1)}
            disabled={zoomIndex <= 0}
            className="rounded-md p-1.5 text-text-secondary hover:bg-surface-elevated disabled:opacity-40"
            title="Alejar"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[2.75rem] text-center text-xs font-semibold text-text-primary">{zoomPercent}%</span>
          <button
            type="button"
            onClick={() => stepZoom(1)}
            disabled={zoomIndex >= ZOOM_LEVELS.length - 1}
            className="rounded-md p-1.5 text-text-secondary hover:bg-surface-elevated disabled:opacity-40"
            title="Acercar"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface-muted px-3 py-1.5 text-xs font-semibold text-text-secondary transition hover:border-accent/40 hover:text-accent"
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          <span className="hidden md:inline">{isFullscreen ? 'Salir' : 'Pantalla completa'}</span>
        </button>
      </div>
    </div>
  )
}

export { PRIMARY_TOOLS }

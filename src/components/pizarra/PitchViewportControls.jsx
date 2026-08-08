import { Maximize2, Minimize2, Minus, Plus } from 'lucide-react'
import { ZOOM_LEVELS } from '../../constants/tacticalBoard'

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

export default function PitchViewportControls({
  zoom = 1,
  onZoomChange,
  isFullscreen,
  onToggleFullscreen,
  displayOptions,
  onDisplayChange,
}) {
  const zoomIndex = nearestZoomIndex(zoom ?? 1)
  const zoomPercent = Math.round((zoom ?? 1) * 100)

  const stepZoom = (direction) => {
    const next = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, zoomIndex + direction))
    onZoomChange?.(ZOOM_LEVELS[next])
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-0.5 rounded-xl border border-border/60 bg-surface-card/95 p-0.5 shadow-sm backdrop-blur-sm">
        <button
          type="button"
          onClick={() => stepZoom(-1)}
          disabled={zoomIndex <= 0}
          className="rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-muted hover:text-text-primary disabled:opacity-40"
          title="Alejar"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-[3rem] px-1 text-center text-xs font-semibold text-text-primary">
          {zoomPercent}%
        </span>
        <button
          type="button"
          onClick={() => stepZoom(1)}
          disabled={zoomIndex >= ZOOM_LEVELS.length - 1}
          className="rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-muted hover:text-text-primary disabled:opacity-40"
          title="Acercar"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onToggleFullscreen}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-surface-card/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary shadow-sm backdrop-blur-sm transition hover:border-accent/40 hover:text-accent"
      >
        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        {isFullscreen ? 'Salir' : 'Pantalla completa'}
      </button>

      {displayOptions && onDisplayChange && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-surface-card/95 px-2 py-1.5 shadow-sm backdrop-blur-sm">
          {[
            { key: 'showNames', label: 'Nombres' },
            { key: 'showNumbers', label: 'Dorsales' },
            { key: 'showPositions', label: 'Posiciones' },
          ].map(({ key, label }) => (
            <label key={key} className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-text-secondary">
              <input
                type="checkbox"
                checked={displayOptions[key] ?? true}
                onChange={(event) => onDisplayChange(key, event.target.checked)}
                className="h-3.5 w-3.5 rounded border-border accent-accent"
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

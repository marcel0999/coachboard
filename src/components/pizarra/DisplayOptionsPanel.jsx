import { DEFAULT_DISPLAY_OPTIONS } from '../../constants/tacticalBoard'

function ToggleSwitch({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5">
      <span className="text-xs text-text-secondary">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-5 w-9 shrink-0 rounded-full transition-colors',
          checked ? 'bg-accent' : 'bg-surface-muted ring-1 ring-border/60',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          ].join(' ')}
        />
      </button>
    </label>
  )
}

export default function DisplayOptionsPanel({ displayOptions = DEFAULT_DISPLAY_OPTIONS, onChange }) {
  return (
    <div className="space-y-0.5 border-t border-border/60 pt-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">
        Ajustes de visualización
      </p>
      <ToggleSwitch
        label="Mostrar nombres"
        checked={displayOptions.showNames ?? true}
        onChange={(value) => onChange('showNames', value)}
      />
      <ToggleSwitch
        label="Mostrar dorsales"
        checked={displayOptions.showNumbers ?? true}
        onChange={(value) => onChange('showNumbers', value)}
      />
      <ToggleSwitch
        label="Mostrar posiciones"
        checked={displayOptions.showPositions ?? true}
        onChange={(value) => onChange('showPositions', value)}
      />
    </div>
  )
}

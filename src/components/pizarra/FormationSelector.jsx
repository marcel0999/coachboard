import { LayoutGrid } from 'lucide-react'
import { getAllFormationOptions } from '../../utils/formations'

const FEATURED_FORMATIONS = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-4-1', '4-1-4-1']

function FormationMiniDiagram({ formationId }) {
  const rows = formationId.split('-').map(Number)
  return (
    <div className="flex h-8 flex-col items-center justify-center gap-0.5">
      {rows.map((count, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-0.5">
          {Array.from({ length: count }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-accent/80"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function FormationSelector({ value, customFormations, onChange, compact = false }) {
  const allOptions = getAllFormationOptions(customFormations)
  const featured = allOptions.filter((opt) => FEATURED_FORMATIONS.includes(opt.value))
  const custom = allOptions.filter((opt) => opt.custom)
  const others = allOptions.filter(
    (opt) => !FEATURED_FORMATIONS.includes(opt.value) && !opt.custom,
  )

  if (compact) {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      >
        {allOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
            {option.custom ? ' ★' : ''}
          </option>
        ))}
      </select>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <LayoutGrid className="h-4 w-4 text-accent" />
        <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Formación</h4>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
        {featured.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              'formation-card flex flex-col items-center rounded-xl border bg-white px-2 py-2.5',
              value === option.value
                ? 'is-active border-accent bg-accent-subtle/50'
                : 'border-slate-200/80 hover:border-accent/40',
            ].join(' ')}
          >
            <FormationMiniDiagram formationId={option.value} />
            <span className="mt-1.5 text-xs font-bold text-text-primary">{option.label}</span>
          </button>
        ))}
      </div>

      {(custom.length > 0 || others.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {[...custom, ...others].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={[
                'formation-card rounded-lg border px-3 py-1.5 text-xs font-medium',
                value === option.value
                  ? 'is-active border-accent bg-accent-subtle text-accent'
                  : 'border-slate-200 bg-white text-text-secondary hover:border-accent/40',
              ].join(' ')}
            >
              {option.label}
              {option.custom ? ' ★' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function FormationSelectorBar({ value, customFormations, onChange }) {
  const allOptions = getAllFormationOptions(customFormations)
  const featured = allOptions.filter((opt) => FEATURED_FORMATIONS.includes(opt.value))
  const rest = allOptions.filter((opt) => !FEATURED_FORMATIONS.includes(opt.value))

  return (
    <div className="hidden items-center gap-1.5 lg:flex">
      {featured.map((option) => (
        <button
          key={option.value}
          type="button"
          title={option.label}
          onClick={() => onChange(option.value)}
          className={[
            'formation-card rounded-lg border px-3 py-1.5 text-xs font-bold',
            value === option.value
              ? 'is-active border-accent bg-accent text-white'
              : 'border-slate-200 bg-white text-text-secondary hover:border-accent/60',
          ].join(' ')}
        >
          {option.label}
        </button>
      ))}
      {rest.length > 0 && (
        <select
          value={FEATURED_FORMATIONS.includes(value) ? '' : value}
          onChange={(event) => {
            if (event.target.value) onChange(event.target.value)
          }}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm outline-none focus:border-accent"
        >
          <option value="">Más…</option>
          {rest.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
              {option.custom ? ' ★' : ''}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

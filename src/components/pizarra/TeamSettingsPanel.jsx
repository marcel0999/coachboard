import { FormField, Input, Textarea } from '../ui/FormField'

export default function TeamSettingsPanel({ teams, teamView, onChange, onViewChange }) {
  const updateTeam = (teamKey, field, value) => {
    onChange({
      ...teams,
      [teamKey]: { ...teams[teamKey], [field]: value },
    })
  }

  const renderTeamFields = (teamKey, label) => {
    const team = teams[teamKey]
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 p-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-text-primary">{label}</h4>
          <label className="inline-flex items-center gap-2 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={team.visible}
              onChange={(event) => updateTeam(teamKey, 'visible', event.target.checked)}
              className="rounded border-slate-300 text-accent focus:ring-accent"
            />
            Visible
          </label>
        </div>
        <FormField label="Nombre">
          <Input
            value={team.name}
            onChange={(event) => updateTeam(teamKey, 'name', event.target.value)}
          />
        </FormField>
        <div className="grid grid-cols-3 gap-2">
          <label className="text-xs text-text-muted">
            Principal
            <input
              type="color"
              value={team.primaryColor}
              onChange={(event) => updateTeam(teamKey, 'primaryColor', event.target.value)}
              className="mt-1 h-9 w-full cursor-pointer rounded-lg border border-slate-200"
            />
          </label>
          <label className="text-xs text-text-muted">
            Secundario
            <input
              type="color"
              value={team.secondaryColor}
              onChange={(event) => updateTeam(teamKey, 'secondaryColor', event.target.value)}
              className="mt-1 h-9 w-full cursor-pointer rounded-lg border border-slate-200"
            />
          </label>
          <label className="text-xs text-text-muted">
            Número
            <input
              type="color"
              value={team.numberColor}
              onChange={(event) => updateTeam(teamKey, 'numberColor', event.target.value)}
              className="mt-1 h-9 w-full cursor-pointer rounded-lg border border-slate-200"
            />
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        {[
          { id: 'own', label: 'Propio' },
          { id: 'rival', label: 'Rival' },
          { id: 'both', label: 'Ambos' },
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onViewChange(option.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium ${
              teamView === option.id ? 'bg-white text-accent shadow-sm' : 'text-text-secondary'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {renderTeamFields('own', 'Equipo propio')}
      {renderTeamFields('rival', 'Equipo rival')}
    </div>
  )
}

export function BoardNotesField({ value, onChange }) {
  return (
    <FormField label="Observaciones">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder="Notas tácticas para la exportación..."
      />
    </FormField>
  )
}

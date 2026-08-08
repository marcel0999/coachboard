import { FormField, Input, Textarea } from '../ui/FormField'
import { getFullName } from '../../utils/players'
import { initLoadControl } from '../../utils/trainings'

export default function TrainingLoadTab({ training, players, onChange }) {
  const playersMap = Object.fromEntries(players.map((player) => [player.id, player]))
  const entries = initLoadControl(training.players.attendees, training.loadControl)

  const updateEntry = (playerId, field, value) => {
    const next = entries.map((entry) => {
      if (entry.playerId !== playerId) return entry
      const updated = { ...entry, [field]: value }
      const rpe = Number(updated.rpe) || 0
      const minutes = Number(updated.minutes) || 0
      updated.totalLoad = rpe * minutes
      return updated
    })
    onChange({ ...training, loadControl: next })
  }

  if (training.players.attendees.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
        <p className="text-sm font-medium text-text-primary">Sin asistentes convocados</p>
        <p className="mt-1 text-sm text-text-secondary">Asigná jugadores en la pestaña Jugadores primero.</p>
      </div>
    )
  }

  const avgLoad = entries.length
    ? entries.reduce((sum, entry) => sum + (entry.totalLoad || 0), 0) / entries.length
    : 0

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm">
        <span className="font-medium text-text-primary">Carga promedio del grupo:</span>{' '}
        <span className="font-bold text-accent">{Math.round(avgLoad * 10) / 10}</span>
        <span className="text-text-muted"> (RPE × minutos)</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                <th className="px-4 py-3 font-semibold text-text-secondary">Jugador</th>
                <th className="px-4 py-3 font-semibold text-text-secondary">RPE (1-10)</th>
                <th className="px-4 py-3 font-semibold text-text-secondary">Minutos</th>
                <th className="px-4 py-3 font-semibold text-text-secondary">Carga total</th>
                <th className="px-4 py-3 font-semibold text-text-secondary">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {entries.map((entry) => (
                <tr key={entry.playerId}>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {getFullName(playersMap[entry.playerId])}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={entry.rpe}
                      onChange={(e) => updateEntry(entry.playerId, 'rpe', e.target.value)}
                      className="w-20"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min="0"
                      max="120"
                      value={entry.minutes}
                      onChange={(e) => updateEntry(entry.playerId, 'minutes', e.target.value)}
                      className="w-24"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold text-accent">{entry.totalLoad || 0}</td>
                  <td className="px-4 py-3">
                    <Textarea
                      rows={1}
                      value={entry.notes}
                      onChange={(e) => updateEntry(entry.playerId, 'notes', e.target.value)}
                      placeholder="Observaciones..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

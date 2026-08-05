import { getFullName } from '../../utils/players'
import { FormField, Input, Textarea } from '../ui/FormField'

function PlayerListColumn({ title, subtitle, playerIds, playersMap, onToggle, variant = 'default' }) {
  const variantClass = {
    default: 'border-slate-200 bg-slate-50/50',
    accent: 'border-accent/30 bg-accent/5',
    warning: 'border-amber-200 bg-amber-50/50',
    danger: 'border-red-200 bg-red-50/50',
  }[variant]

  return (
    <div className={`rounded-2xl border p-4 ${variantClass}`}>
      <h4 className="font-semibold text-text-primary">{title}</h4>
      <p className="mb-3 text-xs text-text-muted">{subtitle} · {playerIds.length}</p>
      <div className="max-h-[280px] space-y-1 overflow-y-auto">
        {playerIds.map((id) => {
          const player = playersMap[id]
          if (!player) return null
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
              className="flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left text-sm hover:bg-slate-50"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                {player.number}
              </span>
              <span className="font-medium">{getFullName(player)}</span>
            </button>
          )
        })}
        {playerIds.length === 0 && (
          <p className="py-4 text-center text-xs text-text-muted">Sin jugadores</p>
        )}
      </div>
    </div>
  )
}

export default function TrainingPlayersTab({ training, players, onChange, matches }) {
  const playersMap = Object.fromEntries(players.map((player) => [player.id, player]))
  const allIds = players.map((player) => player.id)

  const assigned = new Set([
    ...training.players.attendees,
    ...training.players.absent,
    ...training.players.injured,
  ])

  const unassigned = allIds.filter((id) => !assigned.has(id))

  const movePlayer = (playerId, list) => {
    const next = {
      attendees: training.players.attendees.filter((id) => id !== playerId),
      absent: training.players.absent.filter((id) => id !== playerId),
      injured: training.players.injured.filter((id) => id !== playerId),
    }
    onChange({
      ...training,
      players: {
        ...training.players,
        ...next,
        [list]: [...next[list], playerId],
      },
    })
  }

  const autoAssignAvailable = () => {
    const injuredFromPlantel = players
      .filter((player) => player.physicalStatus === 'Lesionado')
      .map((player) => player.id)

    const nextMatch = matches.find((match) => match.status === 'Programado')
    const unavailable = new Set([
      ...injuredFromPlantel,
      ...training.players.absent,
    ])

    const attendees = players
      .filter((player) => !unavailable.has(player.id))
      .map((player) => player.id)

    onChange({
      ...training,
      players: {
        ...training.players,
        attendees,
        injured: injuredFromPlantel,
      },
    })
  }

  const updateDifferentiated = (index, field, value) => {
    const next = [...training.players.differentiated]
    next[index] = { ...next[index], [field]: value }
    onChange({
      ...training,
      players: { ...training.players, differentiated: next },
    })
  }

  const addDifferentiated = () => {
    const available = training.players.attendees[0]
    if (!available) return
    onChange({
      ...training,
      players: {
        ...training.players,
        differentiated: [
          ...training.players.differentiated,
          { playerId: available, work: '', notes: '' },
        ],
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          Integrado con Plantel y Partidos. Clic en jugador para mover entre listas.
        </p>
        <button
          type="button"
          onClick={autoAssignAvailable}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Auto-convocar disponibles
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PlayerListColumn
          title="Asistentes"
          subtitle="Convocados"
          playerIds={training.players.attendees}
          playersMap={playersMap}
          onToggle={(id) => movePlayer(id, 'absent')}
          variant="accent"
        />
        <PlayerListColumn
          title="Ausentes"
          subtitle="No participan"
          playerIds={training.players.absent}
          playersMap={playersMap}
          onToggle={(id) => movePlayer(id, 'attendees')}
          variant="warning"
        />
        <PlayerListColumn
          title="Lesionados"
          subtitle="Desde plantel"
          playerIds={training.players.injured}
          playersMap={playersMap}
          onToggle={(id) => movePlayer(id, 'attendees')}
          variant="danger"
        />
      </div>

      {unassigned.length > 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-4">
          <p className="mb-2 text-xs font-medium text-text-secondary">Sin asignar ({unassigned.length})</p>
          <div className="flex flex-wrap gap-2">
            {unassigned.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => movePlayer(id, 'attendees')}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-text-primary hover:bg-accent/10"
              >
                + {getFullName(playersMap[id])}
              </button>
            ))}
          </div>
        </div>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold text-text-primary">Trabajos diferenciados</h4>
          <button type="button" onClick={addDifferentiated} className="text-sm font-medium text-accent hover:underline">
            + Agregar
          </button>
        </div>
        <div className="space-y-3">
          {training.players.differentiated.map((entry, index) => (
            <div key={`${entry.playerId}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
              <FormField label="Jugador">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={entry.playerId}
                  onChange={(e) => updateDifferentiated(index, 'playerId', e.target.value)}
                >
                  {training.players.attendees.map((id) => (
                    <option key={id} value={id}>{getFullName(playersMap[id])}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Trabajo">
                <Input value={entry.work} onChange={(e) => updateDifferentiated(index, 'work', e.target.value)} placeholder="Ej: Recuperación" />
              </FormField>
              <FormField label="Observaciones">
                <Textarea rows={1} value={entry.notes} onChange={(e) => updateDifferentiated(index, 'notes', e.target.value)} />
              </FormField>
            </div>
          ))}
          {training.players.differentiated.length === 0 && (
            <p className="text-sm text-text-muted">Sin trabajos diferenciados registrados.</p>
          )}
        </div>
      </section>
    </div>
  )
}

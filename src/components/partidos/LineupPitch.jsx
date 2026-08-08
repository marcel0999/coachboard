import { FORMATION_OPTIONS } from '../../constants/matches'
import { getFormationSlots, createEmptyLineup } from '../../utils/formations'
import { getFullName } from '../../utils/players'

function LineupSlot({ slot, player, onDrop, onClear }) {
  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const playerId = event.dataTransfer.getData('playerId')
    if (playerId) onDrop(slot.id, playerId)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
    >
      {player ? (
        <button
          type="button"
          onClick={() => onClear(slot.id)}
          className="group flex flex-col items-center"
          title={`${getFullName(player)} - clic para quitar`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-accent text-xs font-bold text-white shadow-lg transition group-hover:scale-105">
            {player.number}
          </div>
          <span className="mt-1 max-w-[64px] truncate rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {player.lastName}
          </span>
        </button>
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-white/70 bg-white/20 text-[10px] font-bold text-white">
          {slot.label}
        </div>
      )}
    </div>
  )
}

export default function LineupPitch({ match, players, onChange }) {
  const slots = getFormationSlots(match.formation)
  const playersMap = Object.fromEntries(players.map((player) => [player.id, player]))
  const calledIds = new Set([...match.squad.starters, ...match.squad.substitutes])
  const availablePlayers = players.filter((player) => calledIds.has(player.id))

  const handleFormationChange = (formation) => {
    onChange({
      ...match,
      formation,
      lineup: createEmptyLineup(formation),
    })
  }

  const assignPlayer = (slotId, playerId) => {
    if (!calledIds.has(playerId)) return

    const nextLineup = { ...match.lineup }
    Object.keys(nextLineup).forEach((key) => {
      if (nextLineup[key] === playerId) nextLineup[key] = null
    })
    nextLineup[slotId] = playerId

    onChange({ ...match, lineup: nextLineup })
  }

  const clearSlot = (slotId) => {
    onChange({
      ...match,
      lineup: { ...match.lineup, [slotId]: null },
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          {FORMATION_OPTIONS.map((formation) => (
            <button
              key={formation}
              type="button"
              onClick={() => handleFormationChange(formation)}
              className={[
                'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                match.formation === formation
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-surface-muted text-text-secondary hover:bg-slate-200',
              ].join(' ')}
            >
              {formation}
            </button>
          ))}
        </div>

        <div className="relative aspect-[68/105] w-full overflow-hidden rounded-2xl border-4 border-white/30 bg-green-600 shadow-inner">
          <div className="absolute inset-4 rounded-xl border-2 border-white/40" />
          <div className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 bg-white/40" />
          <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40" />
          <div className="absolute bottom-4 left-1/2 h-20 w-2/5 -translate-x-1/2 border-2 border-b-0 border-white/40" />
          <div className="absolute top-4 left-1/2 h-20 w-2/5 -translate-x-1/2 border-2 border-t-0 border-white/40" />

          {slots.map((slot) => (
            <LineupSlot
              key={slot.id}
              slot={slot}
              player={playersMap[match.lineup[slot.id]]}
              onDrop={assignPlayer}
              onClear={clearSlot}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-text-primary">Convocados disponibles</h4>
        <p className="mb-3 text-xs text-text-muted">Arrastrá a la cancha para asignar posición.</p>
        <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-2xl border border-border bg-surface-muted p-3">
          {availablePlayers.map((player) => (
            <div
              key={player.id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('playerId', player.id)
              }}
              className="flex cursor-grab items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm active:cursor-grabbing"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                {player.number}
              </span>
              <span className="font-medium">{getFullName(player)}</span>
            </div>
          ))}
          {availablePlayers.length === 0 && (
            <p className="py-6 text-center text-xs text-text-muted">Convocá jugadores primero</p>
          )}
        </div>
      </div>
    </div>
  )
}

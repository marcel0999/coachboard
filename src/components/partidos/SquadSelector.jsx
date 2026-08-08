import { getFullName } from '../../utils/players'
import ConvocationMedicalWarnings from '../medico/ConvocationMedicalWarnings'
import { getPlayerDocumentStatuses } from '../../utils/medicalCenter'
import MedicalStatusDot from '../medico/MedicalStatusDot'

function PlayerChip({ player, draggable = true }) {
  if (!player) return null

  const documentStatuses = getPlayerDocumentStatuses(player)
  const worstStatus = documentStatuses.reduce((worst, entry) => {
    if (!worst) return entry.status
    const priority = { expired: 0, critical: 1, warning: 2, missing: 3, ok: 4 }
    return priority[entry.status.level] < priority[worst.level] ? entry.status : worst
  }, null)

  return (
    <div
      draggable={draggable}
      onDragStart={(event) => {
        event.dataTransfer.setData('playerId', player.id)
        event.dataTransfer.effectAllowed = 'move'
      }}
      className="flex cursor-grab items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm shadow-sm active:cursor-grabbing"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
        {player.number}
      </span>
      <span className="font-medium text-text-primary">{getFullName(player)}</span>
      {worstStatus && worstStatus.level !== 'ok' && (
        <MedicalStatusDot level={worstStatus.level} />
      )}
    </div>
  )
}

function SquadColumn({ title, subtitle, playerIds, playersMap, onDrop, accent = false }) {
  const handleDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const playerId = event.dataTransfer.getData('playerId')
    if (playerId) onDrop(playerId)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`min-h-[280px] rounded-2xl border-2 border-dashed p-4 ${
        accent ? 'border-accent/40 bg-accent/5' : 'border-border bg-surface-muted/50'
      }`}
    >
      <div className="mb-3">
        <h4 className="font-semibold text-text-primary">{title}</h4>
        <p className="text-xs text-text-muted">{subtitle} · {playerIds.length}</p>
      </div>
      <div className="space-y-2">
        {playerIds.map((id) => (
          <PlayerChip key={id} player={playersMap[id]} />
        ))}
        {playerIds.length === 0 && (
          <p className="py-8 text-center text-xs text-text-muted">Arrastrá jugadores aquí</p>
        )}
      </div>
    </div>
  )
}

export default function SquadSelector({ match, players, categories = [], onChange }) {
  const playersMap = Object.fromEntries(players.map((player) => [player.id, player]))

  const movePlayer = (playerId, targetList) => {
    const squad = match.squad
    const removeFromAll = {
      starters: squad.starters.filter((id) => id !== playerId),
      substitutes: squad.substitutes.filter((id) => id !== playerId),
      notCalled: squad.notCalled.filter((id) => id !== playerId),
    }

    onChange({
      ...match,
      squad: {
        ...removeFromAll,
        [targetList]: [...removeFromAll[targetList], playerId],
      },
    })
  }

  return (
    <div>
      <p className="mb-4 text-sm text-text-secondary">
        Arrastrá jugadores entre Titulares, Suplentes y No convocados. Solo los convocados pueden alinearse.
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        <SquadColumn
          title="Titulares"
          subtitle="Máx. 11"
          playerIds={match.squad.starters}
          playersMap={playersMap}
          onDrop={(id) => movePlayer(id, 'starters')}
          accent
        />
        <SquadColumn
          title="Suplentes"
          subtitle="Convocados"
          playerIds={match.squad.substitutes}
          playersMap={playersMap}
          onDrop={(id) => movePlayer(id, 'substitutes')}
        />
        <SquadColumn
          title="No convocados"
          subtitle="Fuera de lista"
          playerIds={match.squad.notCalled}
          playersMap={playersMap}
          onDrop={(id) => movePlayer(id, 'notCalled')}
        />
      </div>
      <ConvocationMedicalWarnings match={match} players={players} categories={categories} />
    </div>
  )
}

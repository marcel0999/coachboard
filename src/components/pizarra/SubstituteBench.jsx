import { AlertTriangle, Armchair } from 'lucide-react'
import PlayerAvatar from '../plantel/PlayerAvatar'
import { getFullName } from '../../utils/players'
import { getPlayerPizarraAlert } from '../../utils/tacticalBoardPlayers'

function BenchPlayer({ player, index, onDragStart, onRemove }) {
  const alert = getPlayerPizarraAlert(player)

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('playerId', player.id)
        event.dataTransfer.effectAllowed = 'move'
        onDragStart?.(player.id)
      }}
      className={[
        'group flex cursor-grab items-center gap-2.5 rounded-xl border bg-white px-2.5 py-2 text-sm shadow-sm transition',
        'hover:-translate-y-px hover:shadow-md active:cursor-grabbing',
        alert.level === 'red'
          ? 'border-red-200 bg-red-50/30'
          : alert.level === 'yellow'
            ? 'border-amber-200 bg-amber-50/30'
            : 'border-slate-200/80 hover:border-emerald-200',
      ].join(' ')}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-text-muted">
        {index + 1}
      </span>
      <PlayerAvatar player={player} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-text-primary">
          <span className="text-emerald-600">#{player.number}</span> {getFullName(player)}
        </p>
        <p className="truncate text-xs text-text-muted">{player.primaryPosition}</p>
      </div>
      {alert.level !== 'ok' && (
        <AlertTriangle
          className={`h-4 w-4 shrink-0 ${alert.level === 'red' ? 'text-red-500' : 'text-amber-500'}`}
          title={alert.message}
        />
      )}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(player.id)}
          className="rounded-lg p-1 text-text-muted opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default function SubstituteBench({
  title = 'Banco de suplentes',
  players,
  benchPlayerIds,
  substitutions = [],
  playerMap,
  onDropToBench,
  onReorder,
  onRemoveFromBench,
}) {
  const benchPlayers = benchPlayerIds
    .map((id) => players.find((player) => player.id === id) ?? playerMap?.[id])
    .filter(Boolean)

  const handleDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const playerId = event.dataTransfer.getData('playerId')
    if (playerId) onDropToBench?.(playerId)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="rounded-2xl border border-dashed border-slate-300/80 bg-gradient-to-b from-slate-50/90 to-white p-4 shadow-sm transition hover:border-emerald-300/60"
      style={{ touchAction: 'none' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
            <Armchair className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-text-muted">
          {benchPlayers.length} suplentes
        </span>
      </div>
      <div className="space-y-2">
        {benchPlayers.length === 0 ? (
          <p className="w-full py-5 text-center text-sm text-text-muted">
            Arrastrá jugadores aquí para sacarlos del campo.
          </p>
        ) : (
          benchPlayers.map((player, index) => (
            <BenchPlayer
              key={player.id}
              player={player}
              index={index}
              onRemove={onRemoveFromBench}
            />
          ))
        )}
      </div>

      {substitutions.length > 0 && (
        <div className="mt-4 border-t border-slate-200/80 pt-3">
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">Sustituciones</h4>
          <ul className="space-y-1 text-xs text-text-secondary">
            {substitutions.map((sub) => {
              const outPlayer = playerMap?.[sub.playerOutId]
              const inPlayer = playerMap?.[sub.playerInId]
              return (
                <li key={sub.id} className="rounded-lg bg-white px-2 py-1 shadow-sm">
                  {outPlayer ? `#${outPlayer.number} ${outPlayer.lastName}` : '—'} →{' '}
                  {inPlayer ? `#${inPlayer.number} ${inPlayer.lastName}` : '—'}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export function SquadPool({ players, onDragStart }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">Plantel disponible</h3>
      <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
        {players.map((player) => (
          <BenchPlayer key={player.id} player={player} index={0} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  )
}

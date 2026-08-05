import { useMemo, useState } from 'react'
import { AlertTriangle, GripVertical, Search, Users } from 'lucide-react'
import PlayerAvatar from '../plantel/PlayerAvatar'
import Badge from '../ui/Badge'
import { getFullName } from '../../utils/players'
import { groupPlayersForPizarra } from '../../utils/tacticalBoardPlayers'

function PlayerRow({ entry, onDragStart, onRemoveFromBoard }) {
  const { player, alert } = entry

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('playerId', player.id)
        event.dataTransfer.effectAllowed = 'move'
        onDragStart?.(player.id)
      }}
      className={[
        'group flex cursor-grab items-center gap-2.5 rounded-xl border bg-white px-2.5 py-2.5 text-sm shadow-sm transition',
        'hover:-translate-y-px hover:shadow-md active:cursor-grabbing active:scale-[0.98]',
        alert.level === 'red'
          ? 'border-red-200 bg-red-50/40'
          : alert.level === 'yellow'
            ? 'border-amber-200 bg-amber-50/40'
            : 'border-slate-200/80 hover:border-emerald-200',
      ].join(' ')}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-emerald-400" />
      <PlayerAvatar player={player} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-emerald-700">
            #{player.number}
          </span>
          <span className="truncate font-semibold text-text-primary">{getFullName(player)}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1">
          <span className="text-xs text-text-muted">{player.primaryPosition}</span>
          <Badge variant="default">{player.physicalStatus}</Badge>
        </div>
      </div>
      {alert.level !== 'ok' && (
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            alert.level === 'red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
          }`}
          title={alert.message}
        >
          <AlertTriangle className="h-3 w-3" />
        </span>
      )}
      {onRemoveFromBoard && (
        <button
          type="button"
          onClick={() => onRemoveFromBoard(player.id)}
          className="rounded-lg px-1.5 py-0.5 text-[10px] font-medium text-text-muted opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
          title="Quitar de la pizarra"
        >
          Quitar
        </button>
      )}
    </div>
  )
}

function PlayerGroup({ title, entries, accent, onDragStart, onRemoveFromBoard }) {
  if (entries.length === 0) return null

  return (
    <div>
      <h4 className={`mb-2 text-[10px] font-bold uppercase tracking-wider ${accent ?? 'text-text-muted'}`}>
        {title} · {entries.length}
      </h4>
      <div className="space-y-2">
        {entries.map((entry) => (
          <PlayerRow
            key={entry.player.id}
            entry={entry}
            onDragStart={onDragStart}
            onRemoveFromBoard={onRemoveFromBoard}
          />
        ))}
      </div>
    </div>
  )
}

export default function PlayerSquadPanel({
  players,
  usedPlayerIds = new Set(),
  onRemoveFromBoard,
}) {
  const [search, setSearch] = useState('')

  const availablePlayers = useMemo(
    () => players.filter((player) => !usedPlayerIds.has(player.id)),
    [players, usedPlayerIds],
  )

  const groups = useMemo(
    () => groupPlayersForPizarra(availablePlayers, search),
    [availablePlayers, search],
  )

  const totalAvailable = availablePlayers.length

  return (
    <div className="flex h-full max-h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/80 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Plantel</h3>
            <p className="text-[11px] text-text-muted">{totalAvailable} disponibles</p>
          </div>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar jugador..."
            className="w-full rounded-xl border border-slate-200/80 bg-white py-2 pl-9 pr-3 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
          />
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <PlayerGroup title="Disponibles" entries={groups.available} onRemoveFromBoard={onRemoveFromBoard} />
        <PlayerGroup
          title="Lesionados"
          entries={groups.injured}
          accent="text-red-600"
          onRemoveFromBoard={onRemoveFromBoard}
        />
        <PlayerGroup
          title="Suspendidos"
          entries={groups.suspended}
          accent="text-red-600"
          onRemoveFromBoard={onRemoveFromBoard}
        />
        <PlayerGroup
          title="Documentación"
          entries={groups.medical}
          accent="text-amber-600"
          onRemoveFromBoard={onRemoveFromBoard}
        />

        {totalAvailable === 0 && (
          <p className="py-8 text-center text-sm text-text-muted">
            Todos los jugadores están en la cancha o en el banco.
          </p>
        )}
      </div>
    </div>
  )
}

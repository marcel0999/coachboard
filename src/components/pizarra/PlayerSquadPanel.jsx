import { useMemo, useState } from 'react'
import { AlertTriangle, GripVertical, Search, Users } from 'lucide-react'
import Badge from '../ui/Badge'
import { getFullName } from '../../utils/players'
import { groupPlayersForPizarra } from '../../utils/tacticalBoardPlayers'

function PlayerRow({ entry, onRemoveFromBoard }) {
  const { player, alert } = entry

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('playerId', player.id)
        event.dataTransfer.effectAllowed = 'move'
      }}
      className={[
        'group flex cursor-grab items-center gap-2 rounded-lg border bg-surface-muted/50 px-2 py-2 text-sm transition',
        'hover:border-accent/40 active:cursor-grabbing',
        alert.level === 'red'
          ? 'border-red-500/30'
          : alert.level === 'yellow'
            ? 'border-amber-500/30'
            : 'border-border/50',
      ].join(' ')}
    >
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-text-muted" />
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white shadow-sm"
        style={{ backgroundColor: 'var(--color-accent)' }}
      >
        {player.number}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-bold uppercase text-text-muted">{player.primaryPosition}</p>
        <p className="truncate text-xs font-semibold text-text-primary">{getFullName(player)}</p>
      </div>
      {alert.level !== 'ok' && (
        <AlertTriangle
          className={`h-3.5 w-3.5 shrink-0 ${alert.level === 'red' ? 'text-red-400' : 'text-amber-400'}`}
          title={alert.message}
        />
      )}
      {onRemoveFromBoard && (
        <button
          type="button"
          onClick={() => onRemoveFromBoard(player.id)}
          className="rounded px-1 text-[10px] text-text-muted opacity-0 transition hover:text-red-400 group-hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  )
}

function PlayerGroup({ title, entries, accent, onRemoveFromBoard }) {
  if (entries.length === 0) return null
  return (
    <div>
      <h4 className={`mb-1.5 text-[10px] font-bold uppercase tracking-wider ${accent ?? 'text-text-muted'}`}>
        {title} · {entries.length}
      </h4>
      <div className="space-y-1.5">
        {entries.map((entry) => (
          <PlayerRow key={entry.player.id} entry={entry} onRemoveFromBoard={onRemoveFromBoard} />
        ))}
      </div>
    </div>
  )
}

export default function PlayerSquadPanel({ players, usedPlayerIds = new Set(), onRemoveFromBoard }) {
  const [search, setSearch] = useState('')

  const availablePlayers = useMemo(
    () => players.filter((player) => !usedPlayerIds.has(player.id)),
    [players, usedPlayerIds],
  )

  const groups = useMemo(
    () => groupPlayersForPizarra(availablePlayers, search),
    [availablePlayers, search],
  )

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-surface-card">
      <div className="border-b border-border-subtle p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-subtle">
            <Users className="h-3.5 w-3.5 text-accent" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-text-primary">Jugadores disponibles</h3>
            <p className="text-[10px] text-text-muted">{availablePlayers.length} para arrastrar</p>
          </div>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar..."
            className="w-full rounded-lg border border-border/60 bg-surface-muted py-1.5 pl-8 pr-2 text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
        </div>
      </div>

      <div className="max-h-52 space-y-3 overflow-y-auto p-3 lg:max-h-64">
        <PlayerGroup title="Disponibles" entries={groups.available} onRemoveFromBoard={onRemoveFromBoard} />
        <PlayerGroup title="Lesionados" entries={groups.injured} accent="text-red-400" onRemoveFromBoard={onRemoveFromBoard} />
        <PlayerGroup title="Suspendidos" entries={groups.suspended} accent="text-red-400" onRemoveFromBoard={onRemoveFromBoard} />
        <PlayerGroup title="Documentación" entries={groups.medical} accent="text-amber-400" onRemoveFromBoard={onRemoveFromBoard} />
        {availablePlayers.length === 0 && (
          <p className="py-4 text-center text-xs text-text-muted">Todos en cancha o banco</p>
        )}
      </div>
    </div>
  )
}

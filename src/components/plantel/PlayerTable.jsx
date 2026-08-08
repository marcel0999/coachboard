import { Pencil, Trash2, Users } from 'lucide-react'
import EmptyState from '../ui/EmptyState'
import DataTable from '../ui/DataTable'
import Badge from '../ui/Badge'
import { statusToVariant } from '../../utils/badgeVariants'
import PlayerAvatar from './PlayerAvatar'
import { calculateAge, getFullName } from '../../utils/players'

export default function PlayerTable({ players, onView, onEdit, onDelete }) {
  if (players.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No se encontraron jugadores"
        description="Probá ajustando la búsqueda o los filtros, o agregá un nuevo jugador al plantel."
      />
    )
  }

  return (
    <DataTable>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-muted/50">
              <th className="px-4 py-3 font-semibold text-text-muted">Jugador</th>
              <th className="hidden px-4 py-3 font-semibold text-text-muted sm:table-cell">Posición</th>
              <th className="px-4 py-3 font-semibold text-text-muted">Estado</th>
              <th className="px-4 py-3 font-semibold text-text-muted">#</th>
              <th className="hidden px-4 py-3 font-semibold text-text-muted md:table-cell">Edad</th>
              <th className="px-4 py-3 text-right font-semibold text-text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {players.map((player) => {
              const age = calculateAge(player.birthDate)

              return (
                <tr
                  key={player.id}
                  className="cursor-pointer transition hover:bg-surface-muted/40"
                  onClick={() => onView(player)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar player={player} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-text-primary">{getFullName(player)}</p>
                        <p className="truncate text-xs text-text-muted sm:hidden">
                          {player.primaryPosition}
                        </p>
                        {player.secondaryPosition && (
                          <p className="mt-0.5 hidden text-xs text-text-muted sm:block">
                            Alt: {player.secondaryPosition}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-text-secondary sm:table-cell">
                    {player.primaryPosition}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusToVariant(player.physicalStatus)}>
                      {player.physicalStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-surface-muted px-1.5 text-xs font-bold text-text-primary ring-1 ring-border/50">
                      {player.number}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-text-secondary md:table-cell">
                    {age !== null ? `${age}a` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onEdit(player)
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-accent transition hover:bg-accent-subtle sm:text-sm"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onDelete(player)
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-danger-subtle sm:text-sm"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
    </DataTable>
  )
}

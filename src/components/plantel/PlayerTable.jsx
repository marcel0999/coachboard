import { Pencil, Trash2, Users } from 'lucide-react'
import EmptyState from '../ui/EmptyState'
import DataTable from '../ui/DataTable'
import Badge, { statusToVariant } from '../ui/Badge'
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
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-5 py-3.5 font-semibold text-text-secondary">Foto</th>
              <th className="px-5 py-3.5 font-semibold text-text-secondary">Nombre</th>
              <th className="px-5 py-3.5 font-semibold text-text-secondary">Edad</th>
              <th className="px-5 py-3.5 font-semibold text-text-secondary">Posición</th>
              <th className="px-5 py-3.5 font-semibold text-text-secondary">Estado</th>
              <th className="px-5 py-3.5 font-semibold text-text-secondary">Camiseta</th>
              <th className="px-5 py-3.5 text-right font-semibold text-text-secondary">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {players.map((player) => {
              const age = calculateAge(player.birthDate)

              return (
                <tr
                  key={player.id}
                  className="cursor-pointer transition hover:bg-slate-50/70"
                  onClick={() => onView(player)}
                >
                  <td className="px-5 py-4">
                    <PlayerAvatar player={player} />
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-text-primary">{getFullName(player)}</p>
                    {player.secondaryPosition && (
                      <p className="mt-0.5 text-xs text-text-muted">
                        Alt: {player.secondaryPosition}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-text-secondary">
                    {age !== null ? `${age} años` : '—'}
                  </td>
                  <td className="px-5 py-4 text-text-secondary">{player.primaryPosition}</td>
                  <td className="px-5 py-4">
                    <Badge variant={statusToVariant(player.physicalStatus)}>
                      {player.physicalStatus}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-700">
                      {player.number}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onEdit(player)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-accent transition hover:bg-accent/10"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onDelete(player)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
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

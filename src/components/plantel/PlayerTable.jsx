import { Pencil, Trash2, Users } from 'lucide-react'
import Badge, { statusToVariant } from '../ui/Badge'
import PlayerAvatar from './PlayerAvatar'
import { calculateAge, getFullName } from '../../utils/players'

export default function PlayerTable({ players, onView, onEdit, onDelete }) {
  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Users className="h-7 w-7 text-text-muted" />
        </div>
        <h3 className="text-base font-semibold text-text-primary">No se encontraron jugadores</h3>
        <p className="mt-1 max-w-sm text-sm text-text-secondary">
          Probá ajustando la búsqueda o los filtros, o agregá un nuevo jugador al plantel.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
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
      </div>
    </div>
  )
}

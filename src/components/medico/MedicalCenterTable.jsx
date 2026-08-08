import PlayerAvatar from '../plantel/PlayerAvatar'
import Badge from '../ui/Badge'
import MedicalDocumentCell from './MedicalDocumentCell'
import { MEDICAL_DOCUMENT_TYPES } from '../../constants/medicalCenter'
import { getFullName } from '../../utils/players'
import { getPlayerGeneralMedicalStatus } from '../../utils/medicalCenter'
import { getCategoryById } from '../../utils/categories'

export default function MedicalCenterTable({ players, categories = [], showCategory = false, onSelectPlayer }) {
  if (players.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center">
        <p className="text-sm font-medium text-text-primary">No hay jugadores en esta categoría</p>
        <p className="mt-1 text-sm text-text-secondary">Cambiá la categoría o agregá jugadores al plantel.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1200px] w-full text-left text-sm">
          <thead className="bg-surface-muted/80 text-xs uppercase tracking-wide text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-semibold">Jugador</th>
              {showCategory && <th className="px-4 py-3 font-semibold">Categoría</th>}
              {MEDICAL_DOCUMENT_TYPES.map((type) => (
                <th key={type.value} className="px-4 py-3 font-semibold">{type.shortLabel}</th>
              ))}
              <th className="px-4 py-3 font-semibold">Estado General</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {players.map((player) => {
              const generalStatus = getPlayerGeneralMedicalStatus(player)
              const category = getCategoryById(categories, player.categoryId)

              return (
                <tr
                  key={player.id}
                  className="cursor-pointer transition hover:bg-surface-muted/70"
                  onClick={() => onSelectPlayer?.(player)}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar player={player} size="sm" />
                      <div>
                        <p className="font-medium text-text-primary">{getFullName(player)}</p>
                        <p className="text-xs text-text-muted">#{player.number} · {player.primaryPosition}</p>
                      </div>
                    </div>
                  </td>
                  {showCategory && (
                    <td className="px-4 py-4">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                        style={{ backgroundColor: category?.color ?? '#64748b' }}
                      >
                        {category?.name ?? '—'}
                      </span>
                    </td>
                  )}
                  {generalStatus.documentStatuses.map(({ value, document }) => (
                    <td key={value} className="px-4 py-4 align-top">
                      <MedicalDocumentCell document={document} compact />
                    </td>
                  ))}
                  <td className="px-4 py-4 align-top">
                    <Badge variant={generalStatus.variant}>{generalStatus.label}</Badge>
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

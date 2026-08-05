import Badge from '../ui/Badge'
import { formatMatchDateTime, formatMatchResult } from '../../utils/matches'

function statusVariant(status) {
  switch (status) {
    case 'Finalizado':
      return 'success'
    case 'En juego':
      return 'warning'
    default:
      return 'default'
  }
}

export default function MatchTable({ matches, onView, onDelete }) {
  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-base font-semibold text-text-primary">No se encontraron partidos</p>
        <p className="mt-1 text-sm text-text-secondary">Ajustá los filtros o creá un nuevo partido.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-5 py-3.5 font-semibold text-text-secondary">Rival</th>
              <th className="px-5 py-3.5 font-semibold text-text-secondary">Competencia</th>
              <th className="px-5 py-3.5 font-semibold text-text-secondary">Fecha / Hora</th>
              <th className="px-5 py-3.5 font-semibold text-text-secondary">Estadio</th>
              <th className="px-5 py-3.5 font-semibold text-text-secondary">Condición</th>
              <th className="px-5 py-3.5 font-semibold text-text-secondary">Resultado</th>
              <th className="px-5 py-3.5 font-semibold text-text-secondary">Estado</th>
              <th className="px-5 py-3.5 text-right font-semibold text-text-secondary">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matches.map((match) => (
              <tr
                key={match.id}
                className="cursor-pointer transition hover:bg-slate-50/70"
                onClick={() => onView(match)}
              >
                <td className="px-5 py-4 font-medium text-text-primary">{match.opponent}</td>
                <td className="px-5 py-4 text-text-secondary">{match.competition}</td>
                <td className="px-5 py-4 text-text-secondary">{formatMatchDateTime(match.date, match.time)}</td>
                <td className="px-5 py-4 text-text-secondary">{match.stadium || '—'}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    {match.condition}
                  </span>
                </td>
                <td className="px-5 py-4 font-semibold text-text-primary">{formatMatchResult(match)}</td>
                <td className="px-5 py-4">
                  <Badge variant={statusVariant(match.status)}>{match.status}</Badge>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete(match)
                    }}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

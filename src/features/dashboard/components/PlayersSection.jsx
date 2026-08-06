import { UserPlus, Users } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import SectionHeader from '../../../components/ui/SectionHeader'
import EmptyState from '../../../components/ui/EmptyState'
import { ButtonLink } from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { getFullName } from '../../../utils/players'

export default function PlayersSection({ players }) {
  const recent = players.slice(0, 6)

  return (
    <Card>
      <SectionHeader title="Jugadores" icon={Users} />
      {recent.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Plantel vacío"
          description="Agregá jugadores para ver el resumen y estadísticas del club."
          action={
            <ButtonLink to="/plantel">
              <UserPlus className="h-4 w-4" />
              Ir al plantel
            </ButtonLink>
          }
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {recent.map((player) => (
            <li key={player.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted font-display text-xs font-bold text-text-secondary">
                  {player.number ?? '—'}
                </span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{getFullName(player)}</p>
                  <p className="text-xs text-text-secondary">{player.primaryPosition ?? 'Sin posición'}</p>
                </div>
              </div>
              <Badge variant={player.physicalStatus === 'Disponible' ? 'success' : 'warning'} dot>
                {player.physicalStatus ?? '—'}
              </Badge>
            </li>
          ))}
        </ul>
      )}
      {players.length > 6 && (
        <ButtonLink to="/plantel" variant="ghost" size="sm" className="mt-4 px-0">
          Ver los {players.length} jugadores →
        </ButtonLink>
      )}
    </Card>
  )
}

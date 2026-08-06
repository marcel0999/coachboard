import { Plus, UsersRound } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import SectionHeader from '../../../components/ui/SectionHeader'
import EmptyState from '../../../components/ui/EmptyState'
import { ButtonLink } from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'

export default function TeamsSection({ teams, loading, error }) {
  return (
    <Card>
      <SectionHeader title="Equipos" icon={UsersRound} />
      {loading ? (
        <p className="text-sm text-text-muted">Cargando equipos…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : teams.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="Sin equipos todavía"
          description="Creá el primer equipo de tu club para organizar planteles y categorías."
          action={
            <ButtonLink to="/configuracion" variant="secondary">
              <Plus className="h-4 w-4" />
              Configurar club
            </ButtonLink>
          }
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {teams.map((team) => (
            <li key={team.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-semibold text-text-primary">{team.name}</p>
                <p className="text-xs text-text-secondary">
                  {[team.category, team.season].filter(Boolean).join(' · ') || 'Sin categoría'}
                </p>
              </div>
              <Badge variant="success" dot>
                Activo
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

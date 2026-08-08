import { LayoutDashboard } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Badge from '../../../components/ui/Badge'
import { Card } from '../../../components/ui/Card'
import EmptyState from '../../../components/ui/EmptyState'
import { ButtonLink } from '../../../components/ui/Button'
import CategorySelector from '../../../components/categories/CategorySelector'
import { useDashboardData } from '../hooks/useDashboardData'
import ClubSelector from '../components/ClubSelector'
import ClubSummary from '../components/ClubSummary'
import TeamsSection from '../components/TeamsSection'
import PlayersSection from '../components/PlayersSection'
import UpcomingSection from '../components/UpcomingSection'
import QuickAccessGrid from '../components/QuickAccessGrid'
import { getCategoryById } from '../../../utils/categories'

export default function DashboardPage() {
  const {
    club,
    roleLabel,
    userClubs,
    teams,
    loadingTeams,
    teamsError,
    stats,
    quickAccess,
    isEmptyClub,
    categories,
    selectedCategoryId,
    isAllCategories,
    setSelectedCategoryId,
    scopedPlayers,
    formatMatchDateTime,
    handleSwitchClub,
    switchingClub,
  } = useDashboardData()

  const categoryLabel = isAllCategories
    ? 'Todas las categorías'
    : getCategoryById(categories, selectedCategoryId)?.name ?? 'Categoría'

  return (
    <div className="cb-animate-in space-y-5">
      <PageHeader
        title="Dashboard"
        description={`Resumen de ${club?.name ?? 'tu club'} · ${categoryLabel}`}
        badge={
          <Badge variant="accent" dot>
            En vivo
          </Badge>
        }
      />

      <ClubSelector
        club={club}
        userClubs={userClubs}
        roleLabel={roleLabel}
        onSwitchClub={handleSwitchClub}
        switching={switchingClub}
      />

      <Card hover={false}>
        <CategorySelector
          categories={categories}
          value={selectedCategoryId}
          onChange={setSelectedCategoryId}
          includeAll
        />
      </Card>

      <ClubSummary stats={stats} loadingTeams={loadingTeams} />

      {isEmptyClub && (
        <EmptyState
          icon={LayoutDashboard}
          title="Tu club está listo para empezar"
          description="Configurá equipos, cargá jugadores y planificá entrenamientos. Los datos se guardan en Supabase y respetan los permisos de tu rol."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <ButtonLink to="/plantel">Cargar jugadores</ButtonLink>
              <ButtonLink to="/entrenamientos" variant="secondary">
                Planificar entrenamiento
              </ButtonLink>
            </div>
          }
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <TeamsSection teams={teams} loading={loadingTeams} error={teamsError} />
        <PlayersSection players={scopedPlayers} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingSection stats={stats} formatMatchDateTime={formatMatchDateTime} />
        <QuickAccessGrid items={quickAccess} />
      </div>
    </div>
  )
}

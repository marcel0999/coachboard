import { useMemo, useState } from 'react'
import { CalendarClock, FileCheck2, FileWarning, HeartPulse, ShieldAlert } from 'lucide-react'
import { Card, StatCard } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import FilterPills from '../components/ui/FilterPills'
import MedicalAlertsPanel from '../components/medico/MedicalAlertsPanel'
import MedicalCenterTable from '../components/medico/MedicalCenterTable'
import PlayerMedicalModal from '../components/medico/PlayerMedicalModal'
import CategorySelector from '../components/categories/CategorySelector'
import { useAppData, useCategoryScope } from '../context/AppDataContext'
import { FILTER_OPTIONS } from '../constants/players'
import { MEDICAL_ALERT_FILTERS, getMedicalDocumentTypeLabel } from '../constants/medicalCenter'
import { CATEGORY_FILTER_ALL } from '../constants/categories'
import { filterPlayers } from '../utils/players'
import {
  buildMedicalAlerts,
  buildMedicalCenterDashboard,
} from '../utils/medicalCenter'
import { formatDate } from '../utils/playerFactory'
import SectionHeader from '../components/ui/SectionHeader'
import { getCategoryById, buildCategoryOptions } from '../utils/categories'

export default function CentroMedico() {
  const { updatePlayer } = useAppData()
  const {
    categories,
    selectedCategoryId,
    isAllCategories,
    setSelectedCategoryId,
    scopedPlayers,
    players,
  } = useCategoryScope()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [alertFilter, setAlertFilter] = useState('all')
  const [tableCategoryFilter, setTableCategoryFilter] = useState('all')
  const [selectedPlayerId, setSelectedPlayerId] = useState(null)

  const categoryLabel = isAllCategories
    ? 'Todas las categorías'
    : getCategoryById(categories, selectedCategoryId)?.name ?? 'Categoría'

  const dashboardPlayers = scopedPlayers

  const dashboard = useMemo(
    () => buildMedicalCenterDashboard(dashboardPlayers),
    [dashboardPlayers],
  )
  const alerts = useMemo(
    () => buildMedicalAlerts(dashboardPlayers, new Date(), categories),
    [dashboardPlayers, categories],
  )

  const filteredPlayers = useMemo(() => {
    let base = dashboardPlayers
    if (isAllCategories && tableCategoryFilter !== 'all') {
      base = players.filter((player) => player.categoryId === tableCategoryFilter)
    }

    const filtered = filterPlayers(base, { search, statusFilter })

    if (alertFilter === 'all') return filtered

    const playerIds = new Set(
      alerts
        .filter((alert) => {
          if (alertFilter === 'expired') return alert.level === 'expired' || alert.level === 'missing' || alert.level === 'suspended'
          if (alertFilter === 'expiring') return alert.level === 'warning' || alert.level === 'critical'
          if (alertFilter === 'injured') return alert.level === 'injured'
          if (alertFilter === 'ok') return alert.level === 'ok'
          return true
        })
        .map((alert) => alert.player.id),
    )

    return filtered.filter((player) => playerIds.has(player.id))
  }, [dashboardPlayers, players, isAllCategories, tableCategoryFilter, search, statusFilter, alertFilter, alerts])

  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === selectedPlayerId) ?? null,
    [players, selectedPlayerId],
  )

  const categoryFilterOptions = [
    { value: 'all', label: 'Todas las categorías' },
    ...buildCategoryOptions(categories, { includeAll: false }).map((option) => ({
      value: option.value,
      label: option.label,
    })),
  ]

  return (
    <div className="cb-animate-in">
      <PageHeader
        title="Centro Médico"
        description={`Gestión documental y alertas médicas · ${categoryLabel}`}
      />

      <Card className="mb-6">
        <CategorySelector
          categories={categories}
          value={selectedCategoryId}
          onChange={setSelectedCategoryId}
          includeAll
        />
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Documentación al día"
          value={dashboard.compliantPlayers}
          icon={FileCheck2}
          accent
        />
        <StatCard
          label="Próximos vencimientos"
          value={dashboard.expiringDocuments}
          icon={FileWarning}
          sublabel="Requieren atención"
        />
        <StatCard
          label="Documentación vencida"
          value={dashboard.expiredDocuments}
          icon={ShieldAlert}
          sublabel="Fuera de norma"
        />
        <StatCard
          label="Jugadores lesionados"
          value={dashboard.injuredPlayers}
          icon={HeartPulse}
          sublabel="Estado físico"
        />
        <StatCard
          label="Próximo documento a vencer"
          value={dashboard.nextExpiry ? `${dashboard.nextExpiry.days} días` : '—'}
          sublabel={
            dashboard.nextExpiry
              ? `${getMedicalDocumentTypeLabel(dashboard.nextExpiry.type)} · ${formatDate(dashboard.nextExpiry.date)}`
              : 'Sin vencimientos próximos'
          }
        />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-0">
          <div className="border-b border-border-subtle p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex-1">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Buscar jugador..."
                />
              </div>
              <FilterPills
                options={FILTER_OPTIONS}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>
            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
              <FilterPills
                options={MEDICAL_ALERT_FILTERS}
                value={alertFilter}
                onChange={setAlertFilter}
              />
              {isAllCategories && (
                <FilterPills
                  options={categoryFilterOptions}
                  value={tableCategoryFilter}
                  onChange={setTableCategoryFilter}
                />
              )}
            </div>
          </div>
          <div className="p-4">
            <MedicalCenterTable
              players={filteredPlayers}
              categories={categories}
              showCategory={isAllCategories}
              onSelectPlayer={(player) => {
                setSelectedPlayerId(player.id)
              }}
            />
          </div>
        </Card>

        <MedicalAlertsPanel alerts={alerts} filter={alertFilter} />
      </div>

      <Card>
        <SectionHeader
          title="Control documental por categoría"
          description="Los estados se calculan automáticamente: verde (+30 días), amarillo (11-30 días), rojo (10 días o menos / vencido). Hacé clic en un jugador para gestionar su ficha médica."
          icon={CalendarClock}
        />
      </Card>

      <PlayerMedicalModal
        isOpen={Boolean(selectedPlayerId)}
        onClose={() => setSelectedPlayerId(null)}
        player={selectedPlayer}
        categories={categories}
        onUpdate={updatePlayer}
      />
    </div>
  )
}

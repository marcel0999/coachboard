import { useMemo } from 'react'
import { CalendarDays, Dumbbell, HeartPulse, Trophy, Users } from 'lucide-react'
import { StatCard, Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import MetricTile from '../components/ui/MetricTile'
import SectionHeader from '../components/ui/SectionHeader'
import EmptyState from '../components/ui/EmptyState'
import { ButtonLink } from '../components/ui/Button'
import CategorySelector from '../components/categories/CategorySelector'
import { useCategoryScope } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { getFullName } from '../utils/players'
import { formatMatchDateTime } from '../utils/matches'
import { getWeekDays } from '../utils/trainings'
import { buildDashboardMedicalWidget } from '../utils/medicalCenter'
import { buildStaffDashboardWidget } from '../utils/staff'
import { getMedicalDocumentTypeLabel } from '../constants/medicalCenter'
import { formatDate } from '../utils/playerFactory'
import { getCategoryById } from '../utils/categories'

function formatNextMatch(match) {
  if (!match) return 'Sin partidos programados'
  const dateTime = formatMatchDateTime(match.date, match.time)
  return `${dateTime} vs ${match.opponent}`
}

export default function Dashboard() {
  const { club } = useAuth()
  const {
    categories,
    selectedCategoryId,
    isAllCategories,
    setSelectedCategoryId,
    scopedPlayers,
    scopedStaff,
    scopedMatches,
    scopedTrainings,
  } = useCategoryScope()

  const categoryLabel = isAllCategories
    ? 'Todas las categorías'
    : getCategoryById(categories, selectedCategoryId)?.name ?? 'Categoría'

  const stats = useMemo(() => {
    const weekDays = getWeekDays(new Date())
    const weekKeys = new Set(
      weekDays.map((day) => {
        const year = day.getFullYear()
        const month = String(day.getMonth() + 1).padStart(2, '0')
        const date = String(day.getDate()).padStart(2, '0')
        return `${year}-${month}-${date}`
      }),
    )

    const upcomingMatch = [...scopedMatches]
      .filter((match) => match.status === 'Programado')
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0]

    return {
      totalPlayers: scopedPlayers.length,
      available: scopedPlayers.filter((player) => player.physicalStatus === 'Disponible').length,
      injured: scopedPlayers.filter((player) => player.physicalStatus === 'Lesionado').length,
      trainingSessions: scopedTrainings.filter((training) => weekKeys.has(training.date)).length,
      nextMatch: formatNextMatch(upcomingMatch),
    }
  }, [scopedPlayers, scopedMatches, scopedTrainings])

  const recentPlayers = useMemo(() => scopedPlayers.slice(0, 5), [scopedPlayers])
  const medicalWidget = useMemo(
    () => buildDashboardMedicalWidget(scopedPlayers, new Date(), categories),
    [scopedPlayers, categories],
  )
  const staffWidget = useMemo(
    () => buildStaffDashboardWidget(scopedStaff),
    [scopedStaff],
  )

  return (
    <div className="cb-animate-in">
      <PageHeader
        title="Dashboard"
        description={`${club?.name ?? 'Tu club'} · ${categoryLabel}`}
        badge={<Badge variant="accent" dot>En vivo</Badge>}
      />

      <Card className="mb-6" hover={false}>
        <CategorySelector
          categories={categories}
          value={selectedCategoryId}
          onChange={setSelectedCategoryId}
          includeAll
        />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Jugadores" value={stats.totalPlayers} sublabel={categoryLabel} icon={Users} />
        <StatCard
          label="Staff técnico"
          value={scopedStaff.length}
          sublabel={`${staffWidget.active} activos`}
          accent
          icon={Users}
        />
        <StatCard label="Disponibles" value={stats.available} sublabel="Listos para entrenar" accent />
        <StatCard label="Lesionados" value={stats.injured} sublabel="En recuperación" />
        <StatCard label="Entrenamientos / sem" value={stats.trainingSessions} sublabel="Esta semana" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Alertas" icon={HeartPulse} />
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricTile label="Vencidos" value={medicalWidget.expiredDocuments} variant="danger" />
            <MetricTile
              label="Por vencer"
              value={medicalWidget.expiringDocuments}
              sublabel="< 30 días"
              variant="warning"
            />
            <MetricTile label="Lesionados" value={medicalWidget.injuredPlayers} variant="danger" />
            <MetricTile
              label="Próximo vencimiento"
              value={
                medicalWidget.nextExpiry
                  ? `${medicalWidget.nextExpiry.days} días`
                  : '—'
              }
              sublabel={
                medicalWidget.nextExpiry
                  ? `${getMedicalDocumentTypeLabel(medicalWidget.nextExpiry.type)} · ${getFullName(medicalWidget.nextExpiry.player)}`
                  : undefined
              }
            />
          </div>
          {(medicalWidget.topAlerts.length > 0 || staffWidget.topAlerts.length > 0) && (
            <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4">
              {[...medicalWidget.topAlerts.slice(0, 3), ...staffWidget.topAlerts.slice(0, 2)].map(
                (alert) => (
                  <li key={alert.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-text-secondary">{alert.title}</span>
                    <Badge variant={alert.variant} dot>
                      Alerta
                    </Badge>
                  </li>
                ),
              )}
            </ul>
          )}
          <ButtonLink to="/medico" variant="ghost" size="sm" className="mt-4 px-0">
            Ver Centro Médico →
          </ButtonLink>
        </Card>

        <Card>
          <SectionHeader title="Próximo partido" icon={Trophy} />
          <p className="font-display text-xl font-semibold text-text-primary">{stats.nextMatch}</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Revisá la alineación y la pizarra táctica antes del encuentro.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink to="/plantel">
              <Users className="h-4 w-4" />
              Ver plantel
            </ButtonLink>
            <ButtonLink to="/pizarra" variant="secondary">
              <CalendarDays className="h-4 w-4" />
              Pizarra
            </ButtonLink>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Accesos rápidos" icon={Dumbbell} />
          <ul className="divide-y divide-slate-100">
            {[
              { to: '/staff', label: 'Staff Técnico', meta: `${staffWidget.expiredLicenses + staffWidget.expiringLicenses} alertas` },
              { to: '/medico', label: 'Centro Médico', meta: `${medicalWidget.expiredDocuments} vencidos` },
              { to: '/plantel', label: 'Estado del plantel', meta: `${stats.available} disponibles` },
            ].map((item) => (
              <li key={item.to}>
                <ButtonLink
                  to={item.to}
                  variant="ghost"
                  className="w-full justify-between rounded-xl px-3 py-3 font-normal hover:bg-surface-muted"
                >
                  <span className="font-medium text-text-primary">{item.label}</span>
                  <span className="text-xs text-text-muted">{item.meta}</span>
                </ButtonLink>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Jugadores destacados" />
          {recentPlayers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Sin jugadores"
              description="Agregá jugadores al plantel para ver el resumen aquí."
              action={<ButtonLink to="/plantel">Ir al plantel</ButtonLink>}
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentPlayers.map((player) => (
                <li key={player.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted font-display text-xs font-bold text-text-secondary">
                      {player.number}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{getFullName(player)}</p>
                      <p className="text-xs text-text-secondary">{player.primaryPosition}</p>
                    </div>
                  </div>
                  <Badge variant={player.physicalStatus === 'Disponible' ? 'success' : 'warning'} dot>
                    {player.physicalStatus}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <SectionHeader title="Resumen de categoría" />
          <p className="text-sm text-text-secondary">
            Vista activa:{' '}
            <span className="font-semibold text-text-primary">{categoryLabel}</span>
          </p>
          <ul className="mt-4 space-y-3">
            {[
              { label: 'Jugadores registrados', value: stats.totalPlayers },
              { label: 'Partidos en historial', value: scopedMatches.length },
              { label: 'Entrenamientos planificados', value: scopedTrainings.length },
            ].map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between rounded-xl bg-surface-muted/60 px-4 py-3 text-sm"
              >
                <span className="text-text-secondary">{row.label}</span>
                <span className="font-display font-semibold text-text-primary">{row.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

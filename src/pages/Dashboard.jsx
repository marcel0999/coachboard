import { useMemo } from 'react'
import { CalendarDays, Dumbbell, HeartPulse, Trophy, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCard, Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import CategorySelector from '../components/categories/CategorySelector'
import { useCategoryScope } from '../context/AppDataContext'
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
    <div>
      <PageHeader
        title="Dashboard"
        description={`Resumen general del equipo · ${categoryLabel}`}
      />

      <Card className="mb-6">
        <CategorySelector
          categories={categories}
          value={selectedCategoryId}
          onChange={setSelectedCategoryId}
          includeAll
        />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Jugadores en plantel" value={stats.totalPlayers} sublabel={categoryLabel} />
        <StatCard label="Staff técnico" value={scopedStaff.length} sublabel={`${staffWidget.active} activos · ${categoryLabel}`} accent />
        <StatCard label="Disponibles" value={stats.available} sublabel="Listos para entrenar" />
        <StatCard label="Lesionados" value={stats.injured} sublabel="En recuperación" />
        <StatCard label="Entrenamientos / sem" value={stats.trainingSessions} sublabel="Planificados" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">Alertas</h2>
            <HeartPulse className="h-5 w-5 text-accent" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-red-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-red-700">Vencidos</p>
              <p className="mt-1 text-2xl font-bold text-red-800">{medicalWidget.expiredDocuments}</p>
            </div>
            <div className="rounded-xl bg-amber-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Por vencer (&lt; 30 días)</p>
              <p className="mt-1 text-2xl font-bold text-amber-800">{medicalWidget.expiringDocuments}</p>
            </div>
            <div className="rounded-xl bg-red-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-red-700">Lesionados</p>
              <p className="mt-1 text-2xl font-bold text-red-800">{medicalWidget.injuredPlayers}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Próximo vencimiento</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {medicalWidget.nextExpiry
                  ? `${medicalWidget.nextExpiry.days} días · ${getMedicalDocumentTypeLabel(medicalWidget.nextExpiry.type)}`
                  : '—'}
              </p>
              {medicalWidget.nextExpiry && (
                <p className="mt-1 text-xs text-text-muted">
                  {formatDate(medicalWidget.nextExpiry.date)} · {getFullName(medicalWidget.nextExpiry.player)}
                </p>
              )}
            </div>
          </div>
          {medicalWidget.topAlerts.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              {medicalWidget.topAlerts.slice(0, 3).map((alert) => (
                <li key={alert.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-text-secondary">{alert.title}</span>
                  <Badge variant={alert.variant}>{alert.level === 'expired' ? 'Rojo' : alert.level === 'injured' || alert.level === 'suspended' ? 'Rojo' : 'Amarillo'}</Badge>
                </li>
              ))}
            </ul>
          )}
          {staffWidget.topAlerts.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Staff — licencias</p>
              {staffWidget.topAlerts.slice(0, 2).map((alert) => (
                <li key={alert.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-text-secondary">{alert.title}</span>
                  <Badge variant={alert.variant}>Alerta</Badge>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/medico"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
          >
            Ver Centro Médico
          </Link>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">Próximo partido</h2>
            <Trophy className="h-5 w-5 text-accent" />
          </div>
          <p className="text-lg font-medium text-text-primary">{stats.nextMatch}</p>
          <p className="mt-2 text-sm text-text-secondary">
            Revisá la alineación y la pizarra táctica antes del encuentro.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              to="/plantel"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
            >
              <Users className="h-4 w-4" />
              Ver plantel
            </Link>
            <Link
              to="/pizarra"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-slate-50"
            >
              <CalendarDays className="h-4 w-4" />
              Pizarra
            </Link>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">Accesos rápidos</h2>
            <Dumbbell className="h-5 w-5 text-accent" />
          </div>
          <ul className="space-y-3">
            <li>
              <Link to="/staff" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50">
                <span className="text-text-primary">Staff Técnico</span>
                <span className="text-text-muted">{staffWidget.expiredLicenses + staffWidget.expiringLicenses} alertas</span>
              </Link>
            </li>
            <li>
              <Link to="/medico" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50">
                <span className="text-text-primary">Centro Médico</span>
                <span className="text-text-muted">{medicalWidget.expiredDocuments} vencidos</span>
              </Link>
            </li>
            <li>
              <Link to="/plantel" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50">
                <span className="text-text-primary">Estado del plantel</span>
                <span className="text-text-muted">{stats.available} disponibles</span>
              </Link>
            </li>
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-text-primary">Jugadores destacados</h2>
          {recentPlayers.length === 0 ? (
            <p className="text-sm text-text-secondary">No hay jugadores en el plantel.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentPlayers.map((player) => (
                <li key={player.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {player.number}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{getFullName(player)}</p>
                      <p className="text-xs text-text-secondary">{player.primaryPosition}</p>
                    </div>
                  </div>
                  <span className="text-xs text-text-muted">{player.physicalStatus}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold text-text-primary">Resumen de categoría</h2>
          <p className="text-sm text-text-secondary">
            Vista activa: <span className="font-medium text-text-primary">{categoryLabel}</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-text-secondary">
            <li>{stats.totalPlayers} jugadores registrados</li>
            <li>{scopedMatches.length} partidos en el historial</li>
            <li>{scopedTrainings.length} entrenamientos planificados</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Activity, Users } from 'lucide-react'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import FilterPills from '../components/ui/FilterPills'
import SortSelect from '../components/ui/SortSelect'
import PlayerPerformanceCard from '../components/rendimiento/PlayerPerformanceCard'
import PlayerPerformanceModal from '../components/rendimiento/PlayerPerformanceModal'
import CategorySelector from '../components/categories/CategorySelector'
import { useCategoryScope } from '../context/AppDataContext'
import { PERFORMANCE_FILTER_OPTIONS, PERFORMANCE_SORT_OPTIONS } from '../constants/performance'
import { filterPlayers } from '../utils/players'
import {
  buildAllPerformanceProfiles,
  buildPlayerPerformanceProfile,
  sortPlayersForPerformance,
} from '../utils/performanceCenter'

export default function CentroRendimiento() {
  const {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    scopedPlayers,
    scopedMatches,
    scopedTrainings,
  } = useCategoryScope()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [selectedPlayerId, setSelectedPlayerId] = useState(null)

  const profiles = useMemo(
    () => buildAllPerformanceProfiles(scopedPlayers, scopedMatches, scopedTrainings),
    [scopedPlayers, scopedMatches, scopedTrainings],
  )

  const filteredPlayers = useMemo(() => {
    const filtered = filterPlayers(scopedPlayers, { search, statusFilter })
    return sortPlayersForPerformance(filtered, sortBy)
  }, [scopedPlayers, search, statusFilter, sortBy])

  const selectedPlayer = useMemo(
    () => scopedPlayers.find((player) => player.id === selectedPlayerId) ?? null,
    [scopedPlayers, selectedPlayerId],
  )

  const selectedProfile = selectedPlayer
    ? profiles[selectedPlayer.id] ?? buildPlayerPerformanceProfile(selectedPlayer, scopedMatches, scopedTrainings)
    : null

  const overview = useMemo(() => {
    const allProfiles = Object.values(profiles)
    return {
      totalMinutes: allProfiles.reduce((sum, profile) => sum + profile.statistics.minutes, 0),
      totalGoals: allProfiles.reduce((sum, profile) => sum + profile.statistics.goals, 0),
      avgAvailability: allProfiles.length
        ? Math.round(allProfiles.reduce((sum, profile) => sum + profile.physical.availability, 0) / allProfiles.length)
        : 0,
    }
  }, [profiles])

  return (
    <div>
      <PageHeader
        title="Centro de Rendimiento"
        description="Dashboard unificado con datos en tiempo real de todo el sistema"
      />

      <Card className="mb-6">
        <CategorySelector
          categories={categories}
          value={selectedCategoryId}
          onChange={setSelectedCategoryId}
          includeAll
        />
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <Users className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Jugadores</p>
            <p className="text-2xl font-bold text-text-primary">{scopedPlayers.length}</p>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Minutos totales</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{overview.totalMinutes}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Goles totales</p>
          <p className="mt-1 text-2xl font-bold text-accent">{overview.totalGoals}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Disponibilidad media</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{overview.avgAvailability}%</p>
        </Card>
      </div>

      <Card className="mb-6 space-y-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre, dorsal o posición..."
        />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterPills
            options={PERFORMANCE_FILTER_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <SortSelect value={sortBy} onChange={setSortBy} options={PERFORMANCE_SORT_OPTIONS} />
        </div>
      </Card>

      <div className="mb-4 flex items-center gap-2 text-sm text-text-secondary">
        <Activity className="h-4 w-4 text-accent" />
        <span>
          Mostrando {filteredPlayers.length} de {scopedPlayers.length} jugadores · Clic para abrir dashboard
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredPlayers.map((player) => (
          <PlayerPerformanceCard
            key={player.id}
            player={player}
            profile={profiles[player.id]}
            onClick={(selected) => setSelectedPlayerId(selected.id)}
          />
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center">
          <p className="text-base font-semibold text-text-primary">No se encontraron jugadores</p>
          <p className="mt-1 text-sm text-text-secondary">Probá ajustando la búsqueda o los filtros.</p>
        </div>
      )}

      <PlayerPerformanceModal
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayerId(null)}
        player={selectedPlayer}
        profile={selectedProfile}
      />
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Calendar, Plus } from 'lucide-react'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import SearchInput from '../components/ui/SearchInput'
import FilterPills from '../components/ui/FilterPills'
import SortSelect from '../components/ui/SortSelect'
import ConfirmModal from '../components/ui/ConfirmModal'
import CategorySelector from '../components/categories/CategorySelector'
import MatchTable from '../components/partidos/MatchTable'
import MatchDetailModal from '../components/partidos/MatchDetailModal'
import { useAppData, useCategoryScope } from '../context/AppDataContext'
import { createEmptyMatch } from '../data/initialMatches'
import { MATCH_FILTER_OPTIONS, MATCH_SORT_OPTIONS } from '../constants/matches'
import { filterMatches, sortMatches } from '../utils/matches'

export default function Partidos() {
  const { players, staff, saveMatch, deleteMatch } = useAppData()
  const {
    categories,
    selectedCategoryId,
    effectiveCategoryId,
    setSelectedCategoryId,
    scopedMatches,
  } = useCategoryScope()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [viewingMatchId, setViewingMatchId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingMatch, setDeletingMatch] = useState(null)
  const [draftMatch, setDraftMatch] = useState(null)

  const filteredMatches = useMemo(() => {
    const filtered = filterMatches(scopedMatches, { search, statusFilter })
    return sortMatches(filtered, sortBy)
  }, [scopedMatches, search, statusFilter, sortBy])

  const stats = useMemo(
    () => ({
      total: scopedMatches.length,
      scheduled: scopedMatches.filter((m) => m.status === 'Programado').length,
      live: scopedMatches.filter((m) => m.status === 'En juego').length,
      finished: scopedMatches.filter((m) => m.status === 'Finalizado').length,
    }),
    [scopedMatches],
  )

  const viewingMatch = useMemo(
    () => scopedMatches.find((match) => match.id === viewingMatchId) ?? null,
    [scopedMatches, viewingMatchId],
  )

  const handleOpenCreate = () => {
    const categoryId = effectiveCategoryId
    const categoryPlayerIds = players
      .filter((player) => player.categoryId === categoryId)
      .map((player) => player.id)
    const categoryStaffIds = staff
      .filter((member) => (member.categoryIds ?? []).includes(categoryId))
      .map((member) => member.id)

    setDraftMatch(createEmptyMatch(categoryPlayerIds, categoryStaffIds, categoryId))
    setIsCreating(true)
  }

  const handleSave = (matchData) => {
    saveMatch(matchData)
    setIsCreating(false)
    setDraftMatch(null)
    setViewingMatchId(null)
  }

  const handleCloseModal = () => {
    setIsCreating(false)
    setDraftMatch(null)
    setViewingMatchId(null)
  }

  const handleConfirmDelete = () => {
    if (!deletingMatch) return
    deleteMatch(deletingMatch.id)
    if (viewingMatchId === deletingMatch.id) setViewingMatchId(null)
    setDeletingMatch(null)
  }

  return (
    <div>
      <PageHeader
        title="Partidos"
        description="Gestión completa de encuentros, convocatorias y estadísticas"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" />
            Nuevo partido
          </Button>
        }
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
            <Calendar className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Total</p>
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Programados</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{stats.scheduled}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">En juego</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{stats.live}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Finalizados</p>
          <p className="mt-1 text-2xl font-bold text-accent">{stats.finished}</p>
        </Card>
      </div>

      <Card className="mb-6 space-y-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por rival, competencia, estadio o ciudad..."
        />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterPills options={MATCH_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
          <SortSelect value={sortBy} onChange={setSortBy} options={MATCH_SORT_OPTIONS} />
        </div>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Mostrando{' '}
          <span className="font-medium text-text-primary">{filteredMatches.length}</span> de{' '}
          <span className="font-medium text-text-primary">{scopedMatches.length}</span> partidos
          <span className="hidden sm:inline text-text-muted"> · Clic en fila para gestionar</span>
        </p>
        <Button onClick={handleOpenCreate} className="hidden sm:inline-flex lg:hidden">
          <Plus className="h-4 w-4" />
          Nuevo partido
        </Button>
      </div>

      <MatchTable
        matches={filteredMatches}
        onView={(match) => setViewingMatchId(match.id)}
        onDelete={setDeletingMatch}
      />

      <MatchDetailModal
        isOpen={Boolean(viewingMatch)}
        onClose={handleCloseModal}
        match={viewingMatch}
        players={players}
        staff={staff}
        categories={categories}
        onSave={handleSave}
      />

      <MatchDetailModal
        isOpen={isCreating}
        onClose={handleCloseModal}
        match={draftMatch}
        players={players}
        staff={staff}
        categories={categories}
        onSave={handleSave}
        isNew
      />

      <ConfirmModal
        isOpen={Boolean(deletingMatch)}
        onClose={() => setDeletingMatch(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar partido"
        message={
          deletingMatch
            ? `¿Eliminar el partido vs ${deletingMatch.opponent}? Las estadísticas de jugadores se recalcularán.`
            : ''
        }
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}

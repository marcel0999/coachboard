import { useMemo, useState } from 'react'
import { Plus, UserCog, Users } from 'lucide-react'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import SearchInput from '../components/ui/SearchInput'
import FilterPills from '../components/ui/FilterPills'
import SortSelect from '../components/ui/SortSelect'
import ConfirmModal from '../components/ui/ConfirmModal'
import PlayerTable from '../components/plantel/PlayerTable'
import PlayerFormModal from '../components/plantel/PlayerFormModal'
import PlayerProfileModal from '../components/plantel/PlayerProfileModal'
import CategorySelector from '../components/categories/CategorySelector'
import CategoryManageModal from '../components/categories/CategoryManageModal'
import { useAppData } from '../context/AppDataContext'
import { FILTER_OPTIONS, SORT_OPTIONS } from '../constants/players'
import { CATEGORY_FILTER_ALL } from '../constants/categories'
import {
  filterPlayers,
  getFullName,
  sortPlayers,
} from '../utils/players'
import { filterStaffByCategory, getCategoryById } from '../utils/categories'

export default function Plantel() {
  const {
    categories,
    selectedCategoryId,
    effectiveCategoryId,
    setSelectedCategoryId,
    players,
    staff,
    savePlayer,
    updatePlayer,
    deletePlayer,
    saveCategory,
    deleteCategory,
  } = useAppData()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [deletingPlayer, setDeletingPlayer] = useState(null)
  const [viewingPlayerId, setViewingPlayerId] = useState(null)
  const [isCategoryManageOpen, setIsCategoryManageOpen] = useState(false)

  const plantelCategoryId =
    selectedCategoryId === CATEGORY_FILTER_ALL
      ? effectiveCategoryId
      : selectedCategoryId

  const currentCategory = getCategoryById(categories, plantelCategoryId)

  const categoryPlayers = useMemo(
    () => players.filter((player) => player.categoryId === plantelCategoryId),
    [players, plantelCategoryId],
  )

  const categoryStaff = useMemo(
    () => filterStaffByCategory(staff, plantelCategoryId),
    [staff, plantelCategoryId],
  )

  const viewingPlayer = useMemo(
    () => players.find((player) => player.id === viewingPlayerId) ?? null,
    [players, viewingPlayerId],
  )

  const filteredPlayers = useMemo(() => {
    const filtered = filterPlayers(categoryPlayers, { search, statusFilter })
    return sortPlayers(filtered, sortBy)
  }, [categoryPlayers, search, statusFilter, sortBy])

  const stats = useMemo(
    () => ({
      total: categoryPlayers.length,
      available: categoryPlayers.filter((p) => p.physicalStatus === 'Disponible').length,
      injured: categoryPlayers.filter((p) => p.physicalStatus === 'Lesionado').length,
      suspended: categoryPlayers.filter((p) => p.physicalStatus === 'Suspendido').length,
    }),
    [categoryPlayers],
  )

  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId)
  }

  const handleOpenCreate = () => {
    setEditingPlayer(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (player) => {
    setEditingPlayer(player)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingPlayer(null)
  }

  const handleSave = (formData) => {
    savePlayer(formData, editingPlayer)
    handleCloseForm()
  }

  const handleConfirmDelete = () => {
    if (!deletingPlayer) return
    deletePlayer(deletingPlayer.id)
    if (viewingPlayerId === deletingPlayer.id) setViewingPlayerId(null)
    setDeletingPlayer(null)
  }

  const handleEditFromProfile = (player) => {
    setViewingPlayerId(null)
    handleOpenEdit(player)
  }

  return (
    <div>
      <PageHeader
        title="Plantel"
        description="Gestión completa de jugadores del equipo por categoría"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" />
            Nuevo jugador
          </Button>
        }
      />

      <Card className="mb-6">
        <CategorySelector
          categories={categories}
          value={plantelCategoryId}
          onChange={handleCategoryChange}
          onManage={() => setIsCategoryManageOpen(true)}
        />
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <Users className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Total · {currentCategory?.name}</p>
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Disponibles</p>
          <p className="mt-1 text-2xl font-bold text-accent">{stats.available}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Lesionados</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{stats.injured}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Suspendidos</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{stats.suspended}</p>
        </Card>
      </div>

      {categoryStaff.length > 0 && (
        <Card className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <UserCog className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold text-text-primary">
              Cuerpo técnico · {currentCategory?.name}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryStaff.map((member) => (
              <span
                key={member.id}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-text-secondary"
              >
                {member.name} · {member.role}
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card className="mb-6 space-y-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre, dorsal, posición o email..."
        />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterPills options={FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
          <SortSelect value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
        </div>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Mostrando{' '}
          <span className="font-medium text-text-primary">{filteredPlayers.length}</span> de{' '}
          <span className="font-medium text-text-primary">{categoryPlayers.length}</span> jugadores
          <span className="hidden sm:inline text-text-muted"> · Clic en fila para ver ficha</span>
        </p>
        <Button onClick={handleOpenCreate} className="hidden sm:inline-flex lg:hidden">
          <Plus className="h-4 w-4" />
          Nuevo jugador
        </Button>
      </div>

      <PlayerTable
        players={filteredPlayers}
        onView={(player) => setViewingPlayerId(player.id)}
        onEdit={handleOpenEdit}
        onDelete={setDeletingPlayer}
      />

      <PlayerFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        player={editingPlayer}
        categories={categories}
        defaultCategoryId={plantelCategoryId}
      />

      <PlayerProfileModal
        isOpen={Boolean(viewingPlayer)}
        onClose={() => setViewingPlayerId(null)}
        player={viewingPlayer}
        onUpdate={updatePlayer}
        onEdit={handleEditFromProfile}
      />

      <CategoryManageModal
        isOpen={isCategoryManageOpen}
        onClose={() => setIsCategoryManageOpen(false)}
        categories={categories}
        players={players}
        onSaveCategory={saveCategory}
        onDeleteCategory={deleteCategory}
      />

      <ConfirmModal
        isOpen={Boolean(deletingPlayer)}
        onClose={() => setDeletingPlayer(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar jugador"
        message={
          deletingPlayer
            ? `¿Estás seguro de que querés eliminar a ${getFullName(deletingPlayer)} del plantel? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}

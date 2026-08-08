import { useMemo, useState } from 'react'
import { Plus, UserCog, Users } from 'lucide-react'
import { StatCard, Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import SectionHeader from '../components/ui/SectionHeader'
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
    <div className="cb-animate-in">
      <PageHeader
        title="Plantel"
        description={`Gestión de jugadores · ${currentCategory?.name ?? 'Categoría'}`}
        action={
          <Button onClick={handleOpenCreate} className="hidden lg:inline-flex">
            <Plus className="h-4 w-4" />
            Nuevo jugador
          </Button>
        }
      />

      <Card className="mb-5">
        <CategorySelector
          categories={categories}
          value={plantelCategoryId}
          onChange={handleCategoryChange}
          onManage={() => setIsCategoryManageOpen(true)}
        />
      </Card>

      <div className="mb-5 grid gap-3 grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Total · ${currentCategory?.name ?? 'Cat.'}`}
          value={stats.total}
          icon={Users}
          accent
        />
        <StatCard label="Disponibles" value={stats.available} sublabel="Listos" />
        <StatCard label="Lesionados" value={stats.injured} sublabel="Fuera" />
        <StatCard label="Suspendidos" value={stats.suspended} sublabel="Sanción" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-6">
        <aside className="space-y-4">
          <Card className="space-y-4">
            <Button onClick={handleOpenCreate} className="w-full lg:hidden">
              <Plus className="h-4 w-4" />
              Nuevo jugador
            </Button>
            <Button onClick={handleOpenCreate} className="hidden w-full lg:inline-flex">
              <Plus className="h-4 w-4" />
              Agregar jugador
            </Button>

            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar jugador..."
            />

            <div className="space-y-3">
              <p className="text-label">Estado</p>
              <FilterPills options={FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} size="sm" />
            </div>

            <SortSelect value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
          </Card>

          {categoryStaff.length > 0 && (
            <Card>
              <SectionHeader title="Cuerpo técnico" icon={UserCog} className="mb-3" />
              <div className="flex flex-wrap gap-2">
                {categoryStaff.map((member) => (
                  <Badge key={member.id}>
                    {member.name} · {member.role}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </aside>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm text-text-secondary">
              <span className="font-medium text-text-primary">{filteredPlayers.length}</span>
              {' / '}
              <span className="font-medium text-text-primary">{categoryPlayers.length}</span>
              {' jugadores'}
            </p>
            <Button onClick={handleOpenCreate} size="sm" className="lg:hidden">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <PlayerTable
            players={filteredPlayers}
            onView={(player) => setViewingPlayerId(player.id)}
            onEdit={handleOpenEdit}
            onDelete={setDeletingPlayer}
          />
        </div>
      </div>

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

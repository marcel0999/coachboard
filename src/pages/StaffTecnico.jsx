import { useMemo, useState } from 'react'
import { Plus, UserCog } from 'lucide-react'
import { Card, StatCard } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import SearchInput from '../components/ui/SearchInput'
import FilterPills from '../components/ui/FilterPills'
import SortSelect from '../components/ui/SortSelect'
import Badge from '../components/ui/Badge'
import SectionHeader from '../components/ui/SectionHeader'
import ConfirmModal from '../components/ui/ConfirmModal'
import StaffTable from '../components/staff/StaffTable'
import StaffFormModal from '../components/staff/StaffFormModal'
import StaffDetailModal from '../components/staff/StaffDetailModal'
import CategorySelector from '../components/categories/CategorySelector'
import { useAppData, useCategoryScope } from '../context/AppDataContext'
import {
  STAFF_FILTER_OPTIONS,
  STAFF_ROLES,
  STAFF_SORT_OPTIONS,
  STAFF_STATUS_FILTER_OPTIONS,
} from '../constants/staff'
import { filterStaff, sortStaff, buildStaffAlerts, getStaffFullName } from '../utils/staff'
import { CATEGORY_FILTER_ALL } from '../constants/categories'

export default function StaffTecnico() {
  const { saveStaff, updateStaff, deleteStaff, matches, trainings } = useAppData()
  const {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    scopedStaff,
    staff,
  } = useCategoryScope()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [viewingMember, setViewingMember] = useState(null)
  const [deletingMember, setDeletingMember] = useState(null)

  const localCategoryFilter =
    selectedCategoryId === CATEGORY_FILTER_ALL ? 'all' : selectedCategoryId

  const filteredStaff = useMemo(() => {
    const filtered = filterStaff(scopedStaff, {
      search,
      roleFilter,
      statusFilter,
      categoryFilter: localCategoryFilter,
    })
    return sortStaff(filtered, sortBy)
  }, [scopedStaff, search, roleFilter, statusFilter, localCategoryFilter, sortBy])

  const alerts = useMemo(() => buildStaffAlerts(scopedStaff), [scopedStaff])

  const stats = useMemo(() => ({
    total: scopedStaff.length,
    active: scopedStaff.filter((member) => member.status === 'Activo').length,
    coaches: scopedStaff.filter((member) =>
      ['Director Técnico', 'Asistente Técnico', 'Entrenador de Arqueros'].includes(member.role),
    ).length,
    medical: scopedStaff.filter((member) =>
      ['Fisioterapeuta', 'Médico', 'Nutricionista', 'Psicólogo'].includes(member.role),
    ).length,
    alerts: alerts.length,
  }), [scopedStaff, alerts])

  const roleCounts = useMemo(() => {
    return STAFF_ROLES.map((role) => ({
      role,
      count: scopedStaff.filter((member) => member.role === role).length,
    })).filter((entry) => entry.count > 0)
  }, [scopedStaff])

  const handleOpenCreate = () => {
    setEditingMember(null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingMember(null)
  }

  const handleViewMember = (member) => {
    setViewingMember(staff.find((item) => item.id === member.id) ?? member)
  }

  const handleEditFromDetail = (member) => {
    setViewingMember(null)
    setEditingMember(member)
    setIsFormOpen(true)
  }

  const handleStaffUpdate = (staffId, updates) => {
    updateStaff(staffId, updates)
    setViewingMember((current) =>
      current?.id === staffId ? { ...current, ...updates } : current,
    )
  }

  return (
    <div className="cb-animate-in">
      <PageHeader
        title="Staff Técnico"
        description="Gestión independiente del cuerpo técnico del club"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" />
            Nuevo integrante
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

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Integrantes totales" value={stats.total} sublabel="Cuerpo técnico" accent />
        <StatCard label="Activos" value={stats.active} sublabel="Integrantes habilitados" />
        <StatCard label="Cuerpo de entrenadores" value={stats.coaches} sublabel="DT, asistentes, arqueros" />
        <StatCard label="Área médica y apoyo" value={stats.medical} sublabel="Médicos, fisios, nutrición" />
        <StatCard label="Alertas de licencias" value={stats.alerts} sublabel="Vencidas o por vencer" />
      </div>

      <Card className="mb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, cargo, licencia..." />
          <FilterPills options={STAFF_FILTER_OPTIONS} value={roleFilter} onChange={setRoleFilter} />
          <FilterPills options={STAFF_STATUS_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
          <SortSelect options={STAFF_SORT_OPTIONS} value={sortBy} onChange={setSortBy} />
        </div>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Mostrando{' '}
          <span className="font-medium text-text-primary">{filteredStaff.length}</span> de{' '}
          <span className="font-medium text-text-primary">{scopedStaff.length}</span> integrantes
        </p>
      </div>

      <StaffTable
        staff={filteredStaff}
        categories={categories}
        onCreate={handleOpenCreate}
        onView={handleViewMember}
        onEdit={(member) => { setEditingMember(member); setIsFormOpen(true) }}
        onDelete={setDeletingMember}
      />

      {roleCounts.length > 0 && (
        <Card className="mt-6">
          <SectionHeader title="Distribución por cargo" icon={UserCog} />
          <div className="flex flex-wrap gap-2">
            {roleCounts.map(({ role, count }) => (
              <Badge key={role}>
                {role}: {count}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <StaffFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        member={editingMember}
        categories={categories}
        onSave={saveStaff}
      />

      <StaffDetailModal
        isOpen={Boolean(viewingMember)}
        onClose={() => setViewingMember(null)}
        member={viewingMember}
        categories={categories}
        matches={matches}
        trainings={trainings}
        onUpdate={handleStaffUpdate}
        onEdit={handleEditFromDetail}
      />

      <ConfirmModal
        isOpen={Boolean(deletingMember)}
        onClose={() => setDeletingMember(null)}
        onConfirm={() => {
          if (deletingMember) deleteStaff(deletingMember.id)
          setDeletingMember(null)
          if (viewingMember?.id === deletingMember?.id) setViewingMember(null)
        }}
        title="Eliminar integrante"
        message={deletingMember ? `¿Eliminar a ${getStaffFullName(deletingMember)} del staff técnico? Esta acción no se puede deshacer.` : ''}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}

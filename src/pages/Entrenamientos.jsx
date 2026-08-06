import { useMemo, useState } from 'react'
import { Calendar, CalendarDays, Plus } from 'lucide-react'
import { StatCard, Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import FilterPills from '../components/ui/FilterPills'
import SectionHeader from '../components/ui/SectionHeader'
import ConfirmModal from '../components/ui/ConfirmModal'
import WeeklyCalendar from '../components/entrenamientos/WeeklyCalendar'
import MonthlyCalendar from '../components/entrenamientos/MonthlyCalendar'
import TrainingDetailModal from '../components/entrenamientos/TrainingDetailModal'
import { useAppData, useCategoryScope } from '../context/AppDataContext'
import { createEmptyTraining } from '../data/initialTrainings'
import { getTrainingDisplayName, toDateKey } from '../utils/trainings'
import CategorySelector from '../components/categories/CategorySelector'

export default function Entrenamientos() {
  const { players, staff, matches, exercises, saveTraining, deleteTraining } = useAppData()
  const {
    categories,
    selectedCategoryId,
    effectiveCategoryId,
    setSelectedCategoryId,
    scopedTrainings,
  } = useCategoryScope()
  const [viewMode, setViewMode] = useState('week')
  const [referenceDate, setReferenceDate] = useState(new Date('2025-08-04'))
  const [viewingId, setViewingId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [draftTraining, setDraftTraining] = useState(null)
  const [deletingTraining, setDeletingTraining] = useState(null)

  const viewingTraining = useMemo(
    () => scopedTrainings.find((training) => training.id === viewingId) ?? null,
    [scopedTrainings, viewingId],
  )

  const stats = useMemo(() => ({
    total: scopedTrainings.length,
    scheduled: scopedTrainings.filter((t) => t.status === 'Programado').length,
    inProgress: scopedTrainings.filter((t) => t.status === 'En curso').length,
    finished: scopedTrainings.filter((t) => t.status === 'Finalizado').length,
  }), [scopedTrainings])

  const shiftDate = (amount, unit) => {
    const next = new Date(referenceDate)
    if (unit === 'week') next.setDate(next.getDate() + amount * 7)
    else next.setMonth(next.getMonth() + amount)
    setReferenceDate(next)
  }

  const handleOpenCreate = (date = '') => {
    const resolvedDate = date || toDateKey(referenceDate)
    setDraftTraining(createEmptyTraining(resolvedDate, effectiveCategoryId))
    setIsCreating(true)
  }

  const handleOpenTraining = (training) => {
    setViewingId(training.id)
  }

  const handleSave = (trainingData) => {
    saveTraining(trainingData)
    setViewingId(null)
    setIsCreating(false)
    setDraftTraining(null)
  }

  const handleFinalize = (trainingData) => {
    saveTraining(trainingData, true)
    setViewingId(null)
    setIsCreating(false)
    setDraftTraining(null)
  }

  const handleClose = () => {
    setViewingId(null)
    setIsCreating(false)
    setDraftTraining(null)
  }

  const handleConfirmDelete = () => {
    if (!deletingTraining) return
    deleteTraining(deletingTraining.id)
    if (viewingId === deletingTraining.id) setViewingId(null)
    setDeletingTraining(null)
  }

  return (
    <div className="cb-animate-in">
      <PageHeader
        title="Entrenamientos"
        description="Sesiones creadas por el cuerpo técnico · cada entrenamiento con sus ejercicios y pizarras"
        action={
          <Button onClick={() => handleOpenCreate()}>
            <Plus className="h-4 w-4" />
            Nuevo entrenamiento
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
        <StatCard label="Total sesiones" value={stats.total} icon={CalendarDays} accent />
        <StatCard label="Programados" value={stats.scheduled} sublabel="Próximas sesiones" />
        <StatCard label="En curso" value={stats.inProgress} sublabel="Sesiones activas" />
        <StatCard label="Finalizados" value={stats.finished} sublabel="Historial completo" />
      </div>

      <Card className="mb-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterPills
            options={[
              { value: 'week', label: 'Vista semanal' },
              { value: 'month', label: 'Vista mensual' },
            ]}
            value={viewMode}
            onChange={setViewMode}
          />
          <Button variant="secondary" size="sm" onClick={() => setReferenceDate(new Date())}>
            <Calendar className="h-4 w-4" />
            Hoy
          </Button>
        </div>

        {viewMode === 'week' ? (
          <WeeklyCalendar
            referenceDate={referenceDate}
            trainings={scopedTrainings}
            onPrev={() => shiftDate(-1, 'week')}
            onNext={() => shiftDate(1, 'week')}
            onSelectDay={handleOpenCreate}
            onOpenTraining={handleOpenTraining}
            onCreateTraining={handleOpenCreate}
          />
        ) : (
          <MonthlyCalendar
            referenceDate={referenceDate}
            trainings={scopedTrainings}
            onPrev={() => shiftDate(-1, 'month')}
            onNext={() => shiftDate(1, 'month')}
            onOpenTraining={handleOpenTraining}
            onCreateTraining={handleOpenCreate}
          />
        )}
      </Card>

      <Card>
        <SectionHeader title="Próximos entrenamientos" />
        <div className="space-y-2">
          {scopedTrainings
            .filter((t) => t.status !== 'Finalizado')
            .slice(0, 5)
            .map((training) => (
              <div
                key={training.id}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
              >
                <button
                  type="button"
                  onClick={() => handleOpenTraining(training)}
                  className="flex-1 text-left"
                >
                  <p className="font-medium text-text-primary">
                    {getTrainingDisplayName(training)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {training.date} · {training.time || '—'} · {training.category}
                  </p>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">{training.intensity ?? training.load}</span>
                  <button
                    type="button"
                    onClick={() => setDeletingTraining(training)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
        </div>
      </Card>

      <TrainingDetailModal
        isOpen={Boolean(viewingTraining)}
        onClose={handleClose}
        training={viewingTraining}
        players={players}
        staff={staff}
        exercises={exercises}
        matches={matches}
        categories={categories}
        onSave={handleSave}
        onFinalize={handleFinalize}
      />

      <TrainingDetailModal
        isOpen={isCreating}
        onClose={handleClose}
        training={draftTraining}
        players={players}
        staff={staff}
        exercises={exercises}
        matches={matches}
        categories={categories}
        onSave={handleSave}
        onFinalize={handleFinalize}
        isNew
      />

      <ConfirmModal
        isOpen={Boolean(deletingTraining)}
        onClose={() => setDeletingTraining(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar entrenamiento"
        message={deletingTraining ? `¿Eliminar el entrenamiento del ${deletingTraining.date}?` : ''}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}

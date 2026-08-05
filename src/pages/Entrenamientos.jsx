import { useMemo, useState } from 'react'
import { Calendar, CalendarDays, Plus } from 'lucide-react'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import ConfirmModal from '../components/ui/ConfirmModal'
import WeeklyCalendar from '../components/entrenamientos/WeeklyCalendar'
import MonthlyCalendar from '../components/entrenamientos/MonthlyCalendar'
import TrainingDetailModal from '../components/entrenamientos/TrainingDetailModal'
import { useAppData, useCategoryScope } from '../context/AppDataContext'
import { createEmptyTraining } from '../data/initialTrainings'
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
    setDraftTraining(createEmptyTraining(date, effectiveCategoryId))
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
    <div>
      <PageHeader
        title="Entrenamientos"
        description="Planificación semanal integrada con plantel, partidos y ejercicios"
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
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <CalendarDays className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Total sesiones</p>
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Programados</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{stats.scheduled}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">En curso</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{stats.inProgress}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Finalizados</p>
          <p className="mt-1 text-2xl font-bold text-accent">{stats.finished}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${viewMode === 'week' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary'}`}
            >
              Vista semanal
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${viewMode === 'month' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary'}`}
            >
              Vista mensual
            </button>
          </div>
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
        <h3 className="mb-4 text-base font-semibold text-text-primary">Próximos entrenamientos</h3>
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
                  <p className="font-medium text-text-primary">{training.date} · {training.time || '—'}</p>
                  <p className="text-sm text-text-secondary">{training.category} — {training.objective || training.field}</p>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">{training.load}</span>
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

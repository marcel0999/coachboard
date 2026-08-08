import { useEffect, useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import Modal from '../ui/Modal'
import Tabs from '../ui/Tabs'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Alert from '../ui/Alert'
import TrainingInfoTab from './TrainingInfoTab'
import TrainingExercisesTab from './TrainingExercisesTab'
import TrainingPlayersTab from './TrainingPlayersTab'
import TrainingLoadTab from './TrainingLoadTab'
import TrainingSummaryTab from './TrainingSummaryTab'
import { TRAINING_DETAIL_TABS } from '../../constants/trainings'
import { getTrainingDisplayName, getSessionExercises, validateTraining } from '../../utils/trainings'

function statusVariant(status) {
  switch (status) {
    case 'Finalizado': return 'success'
    case 'En curso': return 'warning'
    default: return 'default'
  }
}

export default function TrainingDetailModal({
  isOpen,
  onClose,
  training,
  players,
  exercises,
  matches,
  staff,
  categories = [],
  onSave,
  onFinalize,
  isNew = false,
}) {
  const [activeTab, setActiveTab] = useState('info')
  const [form, setForm] = useState(training)
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    if (isOpen && training) {
      setForm(training)
      setActiveTab('info')
      setValidationErrors({})
    }
  }, [isOpen, training])

  const sessionExerciseCount = useMemo(
    () => getSessionExercises(form ?? {}).length,
    [form],
  )

  if (!training || !form) return null

  const categoryPlayers = players.filter((player) => player.categoryId === form.categoryId)
  const categoryStaff = staff.filter((member) => (member.categoryIds ?? []).includes(form.categoryId))
  const categoryMatches = matches.filter((match) => match.categoryId === form.categoryId)
  const displayName = getTrainingDisplayName(form)

  const handleFormChange = (nextForm) => {
    if (nextForm.categoryId !== form.categoryId) {
      setForm({
        ...nextForm,
        players: {
          attendees: [],
          absent: [],
          injured: [],
          differentiated: [],
        },
        loadControl: [],
        staffIds: [],
      })
      return
    }

    setForm(nextForm)
    if (validationErrors.date && nextForm.date) {
      setValidationErrors((prev) => ({ ...prev, date: undefined }))
    }
    if (validationErrors.categoryId && nextForm.categoryId) {
      setValidationErrors((prev) => ({ ...prev, categoryId: undefined }))
    }
  }

  const runValidation = () => {
    const { ok, errors } = validateTraining(form)
    setValidationErrors(errors)
    return ok
  }

  const handleSave = () => {
    if (!runValidation()) {
      setActiveTab('info')
      return
    }
    onSave(form)
    onClose()
  }

  const handleFinalize = () => {
    if (!runValidation()) {
      setActiveTab('info')
      return
    }
    onFinalize(form)
    onClose()
  }

  const canSave = Boolean(form.date?.trim() && form.categoryId?.trim())

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isNew ? 'Nuevo entrenamiento' : displayName}
      description={
        isNew
          ? 'Completá la información y agregá los ejercicios de la sesión'
          : `${form.date} · ${form.time || 'Sin hora'} · ${form.field || 'Sin cancha'}`
      }
      size="2xl"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant(form.status)}>{form.status}</Badge>
        <span className="text-sm text-text-secondary">{form.objective || 'Sin objetivo'}</span>
        <span className="text-sm text-text-muted">
          · Intensidad {form.intensity ?? form.load}
        </span>
        {sessionExerciseCount > 0 && (
          <span className="text-sm text-text-muted">· {sessionExerciseCount} ejercicios</span>
        )}
      </div>

      {!canSave && activeTab !== 'info' && (
        <Alert variant="warning" className="mb-4">
          Completá la fecha y la categoría del plantel en Información antes de guardar.
        </Alert>
      )}

      <Tabs tabs={TRAINING_DETAIL_TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="pt-5">
        {activeTab === 'info' && (
          <TrainingInfoTab
            training={form}
            staff={categoryStaff}
            categories={categories}
            onChange={handleFormChange}
            errors={validationErrors}
          />
        )}
        {activeTab === 'exercises' && (
          <TrainingExercisesTab
            training={form}
            players={categoryPlayers}
            onChange={handleFormChange}
            isNew={isNew}
          />
        )}
        {activeTab === 'players' && (
          <TrainingPlayersTab
            training={form}
            players={categoryPlayers}
            matches={categoryMatches}
            onChange={handleFormChange}
          />
        )}
        {activeTab === 'load' && (
          <TrainingLoadTab training={form} players={categoryPlayers} onChange={handleFormChange} />
        )}
        {activeTab === 'summary' && (
          <TrainingSummaryTab
            training={form}
            exercises={exercises}
            onChange={handleFormChange}
            onFinalize={handleFinalize}
          />
        )}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!canSave}>
          <Save className="h-4 w-4" />
          Guardar entrenamiento
        </Button>
      </div>
    </Modal>
  )
}

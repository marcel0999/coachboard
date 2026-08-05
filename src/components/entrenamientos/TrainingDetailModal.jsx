import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import Modal from '../ui/Modal'
import Tabs from '../ui/Tabs'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import TrainingInfoTab from './TrainingInfoTab'
import TrainingPlanTab from './TrainingPlanTab'
import TrainingPlayersTab from './TrainingPlayersTab'
import TrainingLoadTab from './TrainingLoadTab'
import TrainingSummaryTab from './TrainingSummaryTab'
import { TRAINING_DETAIL_TABS } from '../../constants/trainings'

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

  useEffect(() => {
    if (isOpen && training) {
      setForm(training)
      setActiveTab('info')
    }
  }, [isOpen, training])

  if (!training || !form) return null

  const categoryPlayers = players.filter((player) => player.categoryId === form.categoryId)
  const categoryStaff = staff.filter((member) => (member.categoryIds ?? []).includes(form.categoryId))
  const categoryMatches = matches.filter((match) => match.categoryId === form.categoryId)

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
  }

  const handleSave = () => {
    if (!form.date || !form.categoryId) return
    onSave(form)
    onClose()
  }

  const handleFinalize = () => {
    if (!form.date || !form.categoryId) return
    onFinalize(form)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isNew ? 'Nuevo entrenamiento' : `Entrenamiento · ${form.category}`}
      description={isNew ? 'Planificá la sesión de entrenamiento' : `${form.date} · ${form.time || 'Sin hora'} · ${form.field || 'Sin cancha'}`}
      size="2xl"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant(form.status)}>{form.status}</Badge>
        <span className="text-sm text-text-secondary">{form.objective || 'Sin objetivo'}</span>
        <span className="text-sm text-text-muted">· Carga {form.load}</span>
      </div>

      <Tabs tabs={TRAINING_DETAIL_TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="pt-5">
        {activeTab === 'info' && (
          <TrainingInfoTab
            training={form}
            staff={categoryStaff}
            categories={categories}
            onChange={handleFormChange}
          />
        )}
        {activeTab === 'plan' && (
          <TrainingPlanTab training={form} exercises={exercises} players={categoryPlayers} onChange={handleFormChange} />
        )}
        {activeTab === 'players' && (
          <TrainingPlayersTab training={form} players={categoryPlayers} matches={categoryMatches} onChange={handleFormChange} />
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

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" />
          Guardar entrenamiento
        </Button>
      </div>
    </Modal>
  )
}

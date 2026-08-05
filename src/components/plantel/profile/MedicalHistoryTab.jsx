import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../../ui/Button'
import Badge from '../../ui/Badge'
import ConfirmModal from '../../ui/ConfirmModal'
import { FormField, Input, Select, Textarea } from '../../ui/FormField'
import { BODY_ZONES, MEDICAL_STATUSES } from '../../../constants/playerProfile'
import { formatDate, generateRecordId } from '../../../utils/playerFactory'

const EMPTY_RECORD = {
  date: '',
  injury: '',
  bodyZone: 'Tobillo',
  daysOff: '',
  status: 'En tratamiento',
  notes: '',
}

function medicalStatusVariant(status) {
  switch (status) {
    case 'Recuperado':
      return 'success'
    case 'En tratamiento':
      return 'warning'
    default:
      return 'danger'
  }
}

function MedicalRecordForm({ record, onSave, onCancel }) {
  const [form, setForm] = useState(record ?? EMPTY_RECORD)
  const [errors, setErrors] = useState({})

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.date) nextErrors.date = 'La fecha es obligatoria'
    if (!form.injury.trim()) nextErrors.injury = 'La lesión es obligatoria'
    if (form.daysOff === '' || form.daysOff === null) nextErrors.daysOff = 'Los días de baja son obligatorios'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    onSave({
      ...form,
      daysOff: Number(form.daysOff),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Fecha" htmlFor="med-date" required error={errors.date}>
          <Input id="med-date" type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
        </FormField>
        <FormField label="Lesión" htmlFor="med-injury" required error={errors.injury}>
          <Input id="med-injury" value={form.injury} onChange={(e) => update('injury', e.target.value)} placeholder="Ej: Esguince de tobillo" />
        </FormField>
        <FormField label="Zona del cuerpo" htmlFor="med-zone">
          <Select id="med-zone" value={form.bodyZone} onChange={(e) => update('bodyZone', e.target.value)}>
            {BODY_ZONES.map((zone) => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Días de baja" htmlFor="med-days" required error={errors.daysOff}>
          <Input id="med-days" type="number" min="0" value={form.daysOff} onChange={(e) => update('daysOff', e.target.value)} />
        </FormField>
        <FormField label="Estado" htmlFor="med-status">
          <Select id="med-status" value={form.status} onChange={(e) => update('status', e.target.value)}>
            {MEDICAL_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Observaciones" htmlFor="med-notes" className="sm:col-span-2">
          <Textarea id="med-notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} />
        </FormField>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" size="sm">Guardar registro</Button>
      </div>
    </form>
  )
}

export default function MedicalHistoryTab({ player, onUpdate }) {
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [deletingRecord, setDeletingRecord] = useState(null)

  const records = player.medicalHistory ?? []

  const saveRecords = (nextRecords) => {
    onUpdate({ medicalHistory: nextRecords })
  }

  const handleSave = (formData) => {
    if (editingRecord) {
      saveRecords(
        records.map((record) =>
          record.id === editingRecord.id ? { ...formData, id: editingRecord.id } : record,
        ),
      )
    } else {
      saveRecords([...records, { ...formData, id: generateRecordId('med') }])
    }
    setShowForm(false)
    setEditingRecord(null)
  }

  const handleDelete = () => {
    if (!deletingRecord) return
    saveRecords(records.filter((record) => record.id !== deletingRecord.id))
    setDeletingRecord(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {records.length} registro{records.length !== 1 ? 's' : ''} médico{records.length !== 1 ? 's' : ''}
        </p>
        {!showForm && (
          <Button size="sm" onClick={() => { setEditingRecord(null); setShowForm(true) }}>
            <Plus className="h-4 w-4" />
            Nuevo registro
          </Button>
        )}
      </div>

      {showForm && (
        <MedicalRecordForm
          record={editingRecord}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingRecord(null) }}
        />
      )}

      {records.length === 0 && !showForm ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
          <p className="text-sm font-medium text-text-primary">Sin historial médico</p>
          <p className="mt-1 text-sm text-text-secondary">Agregá el primer registro de lesión o tratamiento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...records].sort((a, b) => new Date(b.date) - new Date(a.date)).map((record) => (
            <div key={record.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-text-primary">{record.injury}</h4>
                    <Badge variant={medicalStatusVariant(record.status)}>{record.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">
                    {formatDate(record.date)} · {record.bodyZone} · {record.daysOff} días de baja
                  </p>
                  {record.notes && (
                    <p className="mt-2 text-sm text-text-secondary">{record.notes}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => { setEditingRecord(record); setShowForm(true) }}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/10"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingRecord(record)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deletingRecord)}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleDelete}
        title="Eliminar registro médico"
        message="¿Estás seguro de que querés eliminar este registro del historial médico?"
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}

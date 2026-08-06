import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { FormField, Input, Select, Textarea } from '../ui/FormField'
import {
  INTENSITY_LEVELS,
  LEVELS,
  AGE_RANGES,
  SOURCE_TYPES,
} from '../../constants/library'
import { TRAINING_SESSION_TYPES } from '../../constants/trainings'

export default function TrainingResourceModal({ isOpen, onClose, resource, onSave, canEdit }) {
  const [form, setForm] = useState(resource)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setForm(resource)
      setError('')
    }
  }, [isOpen, resource])

  if (!form) return null

  const meta = form.metadata ?? {}
  const readOnly = !canEdit || form.sourceType === SOURCE_TYPES.OFFICIAL

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))
  const updateMeta = (field, value) =>
    setForm((prev) => ({ ...prev, metadata: { ...prev.metadata, [field]: value } }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title?.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={readOnly ? form.title : form.id ? 'Editar entrenamiento' : 'Nuevo entrenamiento completo'}
      description="Biblioteca · Entrenamientos completos"
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre" className="sm:col-span-2" required>
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} disabled={readOnly} />
          </FormField>
          <FormField label="Objetivo general" className="sm:col-span-2">
            <Input value={form.objective} onChange={(e) => update('objective', e.target.value)} disabled={readOnly} />
          </FormField>
          <FormField label="Tipo de sesión">
            <Select value={meta.sessionType ?? 'Mixto'} onChange={(e) => updateMeta('sessionType', e.target.value)} disabled={readOnly}>
              {TRAINING_SESSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </FormField>
          <FormField label="Duración total (min)">
            <Input type="number" value={meta.durationMinutes ?? 90} onChange={(e) => updateMeta('durationMinutes', e.target.value)} disabled={readOnly} />
          </FormField>
          <FormField label="Intensidad">
            <Select value={meta.intensity ?? 'Media'} onChange={(e) => updateMeta('intensity', e.target.value)} disabled={readOnly}>
              {INTENSITY_LEVELS.map((i) => <option key={i} value={i}>{i}</option>)}
            </Select>
          </FormField>
          <FormField label="Nivel">
            <Select value={meta.level ?? ''} onChange={(e) => updateMeta('level', e.target.value)} disabled={readOnly}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </FormField>
          <FormField label="Edad">
            <Select value={meta.ageRange ?? 'Todas'} onChange={(e) => updateMeta('ageRange', e.target.value)} disabled={readOnly}>
              {AGE_RANGES.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </FormField>
          <FormField label="Cantidad de jugadores">
            <Input type="number" value={meta.playerCount ?? ''} onChange={(e) => updateMeta('playerCount', e.target.value)} disabled={readOnly} />
          </FormField>
          <FormField label="Materiales" className="sm:col-span-2">
            <Input value={meta.materials ?? ''} onChange={(e) => updateMeta('materials', e.target.value)} disabled={readOnly} />
          </FormField>
        </div>

        <FormField label="Parte inicial">
          <Textarea rows={2} value={meta.warmup ?? ''} onChange={(e) => updateMeta('warmup', e.target.value)} disabled={readOnly} />
        </FormField>
        <FormField label="Parte principal">
          <Textarea rows={3} value={meta.mainPart ?? ''} onChange={(e) => updateMeta('mainPart', e.target.value)} disabled={readOnly} />
        </FormField>
        <FormField label="Parte final">
          <Textarea rows={2} value={meta.cooldown ?? ''} onChange={(e) => updateMeta('cooldown', e.target.value)} disabled={readOnly} />
        </FormField>
        <FormField label="Observaciones">
          <Textarea rows={2} value={meta.observations ?? form.description ?? ''} onChange={(e) => updateMeta('observations', e.target.value)} disabled={readOnly} />
        </FormField>

        {!readOnly && (
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar entrenamiento'}</Button>
          </div>
        )}
      </form>
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { FormField, Input, Select, Textarea } from '../ui/FormField'
import {
  EXERCISE_CLASSIFICATIONS,
  INTENSITY_LEVELS,
  LEVELS,
  AGE_RANGES,
  SOURCE_TYPES,
} from '../../constants/library'

export default function ExerciseResourceModal({ isOpen, onClose, resource, onSave, canEdit }) {
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
      title={readOnly ? form.title : form.id ? 'Editar ejercicio' : 'Nuevo ejercicio'}
      description={readOnly ? 'Contenido de solo lectura' : 'Biblioteca · Ejercicios'}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre" className="sm:col-span-2" required>
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} disabled={readOnly} />
          </FormField>
          <FormField label="Categoría">
            <Select value={form.category} onChange={(e) => update('category', e.target.value)} disabled={readOnly}>
              {EXERCISE_CLASSIFICATIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Objetivo principal">
            <Input value={form.objective} onChange={(e) => update('objective', e.target.value)} disabled={readOnly} />
          </FormField>
          <FormField label="Duración (min)">
            <Input type="number" min="1" value={meta.durationMinutes ?? ''} onChange={(e) => updateMeta('durationMinutes', e.target.value)} disabled={readOnly} />
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
          <FormField label="Edad recomendada">
            <Select value={meta.ageRange ?? 'Todas'} onChange={(e) => updateMeta('ageRange', e.target.value)} disabled={readOnly}>
              {AGE_RANGES.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </FormField>
          <FormField label="Jugadores mín.">
            <Input type="number" value={meta.minPlayers ?? ''} onChange={(e) => updateMeta('minPlayers', e.target.value)} disabled={readOnly} />
          </FormField>
          <FormField label="Jugadores máx.">
            <Input type="number" value={meta.maxPlayers ?? ''} onChange={(e) => updateMeta('maxPlayers', e.target.value)} disabled={readOnly} />
          </FormField>
          <FormField label="Espacio" className="sm:col-span-2">
            <Input value={meta.space ?? ''} onChange={(e) => updateMeta('space', e.target.value)} disabled={readOnly} />
          </FormField>
          <FormField label="Materiales" className="sm:col-span-2">
            <Input value={meta.materials ?? ''} onChange={(e) => updateMeta('materials', e.target.value)} disabled={readOnly} />
          </FormField>
        </div>

        <FormField label="Descripción">
          <Textarea rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} disabled={readOnly} />
        </FormField>
        <FormField label="Organización">
          <Textarea rows={2} value={meta.organization ?? ''} onChange={(e) => updateMeta('organization', e.target.value)} disabled={readOnly} />
        </FormField>
        <FormField label="Desarrollo">
          <Textarea rows={2} value={meta.development ?? ''} onChange={(e) => updateMeta('development', e.target.value)} disabled={readOnly} />
        </FormField>
        <FormField label="Reglas">
          <Textarea rows={2} value={meta.rules ?? ''} onChange={(e) => updateMeta('rules', e.target.value)} disabled={readOnly} />
        </FormField>
        <FormField label="Variantes">
          <Textarea rows={2} value={meta.variants ?? ''} onChange={(e) => updateMeta('variants', e.target.value)} disabled={readOnly} />
        </FormField>
        <FormField label="Observaciones">
          <Textarea rows={2} value={meta.observations ?? ''} onChange={(e) => updateMeta('observations', e.target.value)} disabled={readOnly} />
        </FormField>

        {!readOnly && (
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar ejercicio'}</Button>
          </div>
        )}
      </form>
    </Modal>
  )
}

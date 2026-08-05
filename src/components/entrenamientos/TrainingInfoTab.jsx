import { FormField, Input, Select, Textarea } from '../ui/FormField'
import { LOAD_LEVELS, TRAINING_CATEGORIES, TRAINING_STATUSES } from '../../constants/trainings'
import { getActiveCategories } from '../../utils/categories'

import { StaffAssignmentList } from '../staff/StaffSelector'

export default function TrainingInfoTab({ training, staff, categories = [], onChange }) {
  const update = (field, value) => onChange({ ...training, [field]: value })
  const activeCategories = getActiveCategories(categories)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Categoría del plantel" htmlFor="tr-category-id" required className="sm:col-span-2">
        <Select
          id="tr-category-id"
          value={training.categoryId ?? ''}
          onChange={(e) => update('categoryId', e.target.value)}
        >
          <option value="">Seleccionar categoría</option>
          {activeCategories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </Select>
      </FormField>
      <FormField label="Fecha" htmlFor="tr-date" required>
        <Input id="tr-date" type="date" value={training.date} onChange={(e) => update('date', e.target.value)} />
      </FormField>
      <FormField label="Hora" htmlFor="tr-time">
        <Input id="tr-time" type="time" value={training.time} onChange={(e) => update('time', e.target.value)} />
      </FormField>
      <FormField label="Duración (min)" htmlFor="tr-duration">
        <Input id="tr-duration" type="number" min="30" max="180" value={training.duration} onChange={(e) => update('duration', e.target.value)} />
      </FormField>
      <FormField label="Cancha" htmlFor="tr-field">
        <Input id="tr-field" value={training.field} onChange={(e) => update('field', e.target.value)} placeholder="Ej: Cancha 1" />
      </FormField>
      <FormField label="Tipo de sesión" htmlFor="tr-category">
        <Select id="tr-category" value={training.category} onChange={(e) => update('category', e.target.value)}>
          {TRAINING_CATEGORIES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
      </FormField>
      <FormField label="Carga prevista" htmlFor="tr-load">
        <Select id="tr-load" value={training.load} onChange={(e) => update('load', e.target.value)}>
          {LOAD_LEVELS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
      </FormField>
      <FormField label="Estado" htmlFor="tr-status">
        <Select id="tr-status" value={training.status} onChange={(e) => update('status', e.target.value)}>
          {TRAINING_STATUSES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
      </FormField>
      <FormField label="Objetivo" htmlFor="tr-objective" className="sm:col-span-2">
        <Input id="tr-objective" value={training.objective} onChange={(e) => update('objective', e.target.value)} placeholder="Objetivo principal de la sesión" />
      </FormField>
      <FormField label="Observaciones" htmlFor="tr-notes" className="sm:col-span-2">
        <Textarea id="tr-notes" value={training.notes} onChange={(e) => update('notes', e.target.value)} rows={3} />
      </FormField>
      <FormField label="Responsables de la sesión" className="sm:col-span-2">
        <StaffAssignmentList
          staff={staff}
          selectedIds={training.staffIds ?? []}
          onChange={(staffIds) => update('staffIds', staffIds)}
        />
      </FormField>
    </div>
  )
}

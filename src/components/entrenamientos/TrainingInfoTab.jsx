import { FormField, Input, Select, Textarea } from '../ui/FormField'
import {
  INTENSITY_LEVELS,
  TRAINING_SESSION_TYPES,
  TRAINING_STATUSES,
} from '../../constants/trainings'
import { getActiveCategories } from '../../utils/categories'
import { StaffAssignmentList } from '../staff/StaffSelector'

export default function TrainingInfoTab({ training, staff, categories = [], onChange, errors = {} }) {
  const update = (field, value) => {
    const patch = { [field]: value }
    if (field === 'intensity') patch.load = value
    if (field === 'observations') patch.notes = value
    onChange({ ...training, ...patch })
  }

  const activeCategories = getActiveCategories(categories)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        label="Nombre del entrenamiento"
        htmlFor="tr-name"
        className="sm:col-span-2"
        error={errors.name}
      >
        <Input
          id="tr-name"
          value={training.name ?? ''}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Ej: Sesión táctica pre-partido"
        />
      </FormField>

      <FormField
        label="Categoría del plantel"
        htmlFor="tr-category-id"
        required
        className="sm:col-span-2"
        error={errors.categoryId}
      >
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

      <FormField label="Fecha" htmlFor="tr-date" required error={errors.date}>
        <Input
          id="tr-date"
          type="date"
          value={training.date}
          onChange={(e) => update('date', e.target.value)}
        />
      </FormField>

      <FormField label="Hora" htmlFor="tr-time">
        <Input
          id="tr-time"
          type="time"
          value={training.time}
          onChange={(e) => update('time', e.target.value)}
        />
      </FormField>

      <FormField label="Duración total (min)" htmlFor="tr-duration">
        <Input
          id="tr-duration"
          type="number"
          min="30"
          max="240"
          value={training.duration}
          onChange={(e) => update('duration', e.target.value)}
        />
      </FormField>

      <FormField label="Intensidad" htmlFor="tr-intensity">
        <Select
          id="tr-intensity"
          value={training.intensity ?? training.load ?? 'Media'}
          onChange={(e) => update('intensity', e.target.value)}
        >
          {INTENSITY_LEVELS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="Cantidad de jugadores" htmlFor="tr-player-count">
        <Input
          id="tr-player-count"
          type="number"
          min="0"
          value={training.playerCount ?? ''}
          onChange={(e) => update('playerCount', e.target.value)}
          placeholder="Ej: 18"
        />
      </FormField>

      <FormField label="Tipo de sesión" htmlFor="tr-session-type">
        <Select
          id="tr-session-type"
          value={training.category}
          onChange={(e) => update('category', e.target.value)}
        >
          {TRAINING_SESSION_TYPES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="Cancha" htmlFor="tr-field">
        <Input
          id="tr-field"
          value={training.field}
          onChange={(e) => update('field', e.target.value)}
          placeholder="Ej: Cancha 1"
        />
      </FormField>

      <FormField label="Estado" htmlFor="tr-status">
        <Select
          id="tr-status"
          value={training.status}
          onChange={(e) => update('status', e.target.value)}
        >
          {TRAINING_STATUSES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="Objetivo" htmlFor="tr-objective" className="sm:col-span-2">
        <Input
          id="tr-objective"
          value={training.objective}
          onChange={(e) => update('objective', e.target.value)}
          placeholder="Objetivo principal de la sesión"
        />
      </FormField>

      <FormField label="Observaciones" htmlFor="tr-observations" className="sm:col-span-2">
        <Textarea
          id="tr-observations"
          value={training.observations ?? training.notes ?? ''}
          onChange={(e) => update('observations', e.target.value)}
          rows={3}
          placeholder="Notas generales, condiciones del campo, clima..."
        />
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

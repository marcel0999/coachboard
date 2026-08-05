import { useEffect, useState } from 'react'
import { Camera, Save } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { FormField, Input, Select, Textarea } from '../ui/FormField'
import PlayerAvatar from './PlayerAvatar'
import {
  DOMINANT_FEET,
  EMPTY_PLAYER,
  PHYSICAL_STATUSES,
  POSITIONS,
} from '../../constants/players'
import { PERSONAL_DOCUMENT_TYPES, SUPPORTED_CURRENCIES, URUGUAY_DEPARTMENTS } from '../../config/localization'
import { getFullName } from '../../utils/players'
import { getActiveCategories, getDefaultCategoryId } from '../../utils/categories'
import { getDefaultNationality, getPhonePlaceholder, validateCedula } from '../../utils/localization'
import { useAppData } from '../../context/AppDataContext'

function validateForm(form) {
  const errors = {}

  if (!form.firstName.trim()) errors.firstName = 'El nombre es obligatorio'
  if (!form.lastName.trim()) errors.lastName = 'El apellido es obligatorio'
  if (!form.birthDate) errors.birthDate = 'La fecha de nacimiento es obligatoria'
  if (!form.primaryPosition) errors.primaryPosition = 'La posición principal es obligatoria'
  if (!form.categoryId) errors.categoryId = 'La categoría es obligatoria'
  if (form.number === '' || form.number === null) errors.number = 'El número es obligatorio'
  if (!form.physicalStatus) errors.physicalStatus = 'El estado físico es obligatorio'

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Ingresá un email válido'
  }

  if (form.documentType === 'cedula_uy' && form.document) {
    const cedulaCheck = validateCedula(form.document)
    if (!cedulaCheck.valid) errors.document = cedulaCheck.message
  }

  return errors
}

export default function PlayerFormModal({ isOpen, onClose, onSave, player, categories = [], defaultCategoryId = '' }) {
  const { clubSettings } = useAppData()
  const isEditing = Boolean(player)
  const [form, setForm] = useState(EMPTY_PLAYER)
  const [errors, setErrors] = useState({})
  const activeCategories = getActiveCategories(categories)
  const fallbackCategoryId = defaultCategoryId || getDefaultCategoryId(categories)
  const defaultNationality = getDefaultNationality(clubSettings)
  const phonePlaceholder = getPhonePlaceholder(clubSettings)

  useEffect(() => {
    if (isOpen) {
      setForm(
        player
          ? { ...player }
          : { ...EMPTY_PLAYER, nationality: defaultNationality, categoryId: fallbackCategoryId },
      )
      setErrors({})
    }
  }, [isOpen, player, fallbackCategoryId])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => updateField('photo', reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const validationErrors = validateForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    onSave(form)
  }

  const previewPlayer = { id: player?.id ?? 'preview', ...form }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar jugador' : 'Nuevo jugador'}
      description={
        isEditing
          ? `Modificá los datos de ${getFullName(player)}`
          : 'Completá la ficha del jugador para agregarlo al plantel'
      }
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-start">
          <div className="relative">
            <PlayerAvatar player={previewPlayer} size="lg" />
            <label
              htmlFor="player-photo"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-accent text-white shadow-md transition hover:bg-accent-hover"
            >
              <Camera className="h-4 w-4" />
              <input
                id="player-photo"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhotoChange}
              />
            </label>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-base font-semibold text-text-primary">
              {form.firstName || form.lastName ? getFullName(form) : 'Nuevo jugador'}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Subí una foto o se mostrarán las iniciales automáticamente.
            </p>
            {form.photo && (
              <button
                type="button"
                onClick={() => updateField('photo', null)}
                className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
              >
                Quitar foto
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre" htmlFor="firstName" required error={errors.firstName}>
            <Input id="firstName" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} placeholder="Ej: Martín" />
          </FormField>

          <FormField label="Apellido" htmlFor="lastName" required error={errors.lastName}>
            <Input id="lastName" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} placeholder="Ej: García" />
          </FormField>

          <FormField label="Fecha de nacimiento" htmlFor="birthDate" required error={errors.birthDate}>
            <Input id="birthDate" type="date" value={form.birthDate} onChange={(e) => updateField('birthDate', e.target.value)} />
          </FormField>

          <FormField label="Número de camiseta" htmlFor="number" required error={errors.number}>
            <Input id="number" type="number" min="1" max="99" value={form.number} onChange={(e) => updateField('number', e.target.value)} placeholder="Ej: 10" />
          </FormField>

          <FormField label="Categoría" htmlFor="categoryId" required error={errors.categoryId}>
            <Select id="categoryId" value={form.categoryId} onChange={(e) => updateField('categoryId', e.target.value)}>
              <option value="">Seleccionar categoría</option>
              {activeCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Altura (cm)" htmlFor="height">
            <Input id="height" type="number" min="140" max="220" value={form.height} onChange={(e) => updateField('height', e.target.value)} placeholder="Ej: 180" />
          </FormField>

          <FormField label="Peso (kg)" htmlFor="weight">
            <Input id="weight" type="number" min="40" max="150" value={form.weight} onChange={(e) => updateField('weight', e.target.value)} placeholder="Ej: 75" />
          </FormField>

          <FormField label="Pierna hábil" htmlFor="dominantFoot">
            <Select id="dominantFoot" value={form.dominantFoot} onChange={(e) => updateField('dominantFoot', e.target.value)}>
              {DOMINANT_FEET.map((foot) => (
                <option key={foot} value={foot}>{foot}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Estado físico" htmlFor="physicalStatus" required error={errors.physicalStatus}>
            <Select id="physicalStatus" value={form.physicalStatus} onChange={(e) => updateField('physicalStatus', e.target.value)}>
              {PHYSICAL_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Posición principal" htmlFor="primaryPosition" required error={errors.primaryPosition}>
            <Select id="primaryPosition" value={form.primaryPosition} onChange={(e) => updateField('primaryPosition', e.target.value)}>
              {POSITIONS.map((position) => (
                <option key={position} value={position}>{position}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Posición secundaria" htmlFor="secondaryPosition">
            <Select id="secondaryPosition" value={form.secondaryPosition} onChange={(e) => updateField('secondaryPosition', e.target.value)}>
              <option value="">Sin posición secundaria</option>
              {POSITIONS.map((position) => (
                <option key={position} value={position}>{position}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Teléfono" htmlFor="phone">
            <Input id="phone" type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder={phonePlaceholder} />
          </FormField>

          <FormField label="Email" htmlFor="email" error={errors.email}>
            <Input id="email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="jugador@club.com" />
          </FormField>

          <FormField label="Nacionalidad" htmlFor="nationality">
            <Input id="nationality" value={form.nationality} onChange={(e) => updateField('nationality', e.target.value)} placeholder={`Ej: ${defaultNationality}`} />
          </FormField>

          <FormField label="Tipo de documento" htmlFor="documentType">
            <Select id="documentType" value={form.documentType} onChange={(e) => updateField('documentType', e.target.value)}>
              {PERSONAL_DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Cédula de Identidad / Documento" htmlFor="document" error={errors.document}>
            <Input
              id="document"
              value={form.document}
              onChange={(e) => updateField('document', e.target.value)}
              placeholder={form.documentType === 'cedula_uy' ? 'Ej: 1.234.567-8' : 'Número de documento o pasaporte'}
            />
          </FormField>

          <FormField label="País" htmlFor="addressCountry">
            <Input id="addressCountry" value={form.addressCountry} onChange={(e) => updateField('addressCountry', e.target.value)} />
          </FormField>

          <FormField label="Departamento" htmlFor="addressDepartment">
            <Select id="addressDepartment" value={form.addressDepartment} onChange={(e) => updateField('addressDepartment', e.target.value)}>
              <option value="">—</option>
              {URUGUAY_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Ciudad o localidad" htmlFor="addressCity">
            <Input id="addressCity" value={form.addressCity} onChange={(e) => updateField('addressCity', e.target.value)} />
          </FormField>

          <FormField label="Dirección" htmlFor="addressStreet" className="sm:col-span-2">
            <Input id="addressStreet" value={form.addressStreet} onChange={(e) => updateField('addressStreet', e.target.value)} placeholder="Calle y número" />
          </FormField>

          <FormField label="Código postal" htmlFor="addressPostalCode">
            <Input id="addressPostalCode" value={form.addressPostalCode} onChange={(e) => updateField('addressPostalCode', e.target.value)} />
          </FormField>

          <FormField label="Inicio de contrato" htmlFor="contractStart">
            <Input id="contractStart" type="date" value={form.contractStart} onChange={(e) => updateField('contractStart', e.target.value)} />
          </FormField>

          <FormField label="Fin de contrato" htmlFor="contractEnd">
            <Input id="contractEnd" type="date" value={form.contractEnd} onChange={(e) => updateField('contractEnd', e.target.value)} />
          </FormField>

          <FormField label="Club anterior" htmlFor="previousClub">
            <Input id="previousClub" value={form.previousClub} onChange={(e) => updateField('previousClub', e.target.value)} placeholder="Club de origen" />
          </FormField>

          <FormField label="Representante" htmlFor="representative">
            <Input id="representative" value={form.representative} onChange={(e) => updateField('representative', e.target.value)} placeholder="Agente o agencia" />
          </FormField>

          <FormField label="Valor estimado" htmlFor="estimatedValue">
            <div className="flex gap-2">
              <Select
                id="estimatedValueCurrency"
                value={form.estimatedValueCurrency ?? 'UYU'}
                onChange={(e) => updateField('estimatedValueCurrency', e.target.value)}
                className="w-28 shrink-0"
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>{currency.code}</option>
                ))}
              </Select>
              <Input
                id="estimatedValue"
                type="number"
                min="0"
                value={form.estimatedValue}
                onChange={(e) => updateField('estimatedValue', e.target.value)}
                placeholder="Ej: 250000"
                className="flex-1"
              />
            </div>
          </FormField>
        </div>

        <FormField label="Observaciones" htmlFor="notes" className="mt-4">
          <Textarea id="notes" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Notas médicas, rendimiento, comentarios..." rows={4} />
        </FormField>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">
            <Save className="h-4 w-4" />
            {isEditing ? 'Guardar cambios' : 'Guardar jugador'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

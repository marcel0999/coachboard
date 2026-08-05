import { useEffect, useState } from 'react'
import { Camera, Save } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { FormField, Input, Select, Textarea } from '../ui/FormField'
import StaffAvatar from './StaffAvatar'
import {
  EMPTY_STAFF_MEMBER,
  STAFF_LICENSE_ISSUERS,
  STAFF_LICENSE_LEVELS,
  STAFF_PHONE_PLACEHOLDER,
  STAFF_ROLES,
  STAFF_STATUS,
} from '../../constants/staff'
import { PERSONAL_DOCUMENT_TYPES, URUGUAY_DEPARTMENTS } from '../../config/localization'
import { getActiveCategories, getDefaultCategoryId } from '../../utils/categories'
import { getDefaultNationality, validateCedula } from '../../utils/localization'
import { useAppData } from '../../context/AppDataContext'

function validateForm(form) {
  const errors = {}
  if (!form.firstName?.trim()) errors.firstName = 'El nombre es obligatorio'
  if (!form.lastName?.trim()) errors.lastName = 'El apellido es obligatorio'
  if (!form.role) errors.role = 'El cargo es obligatorio'
  if (!form.categoryIds?.length) errors.categoryIds = 'Seleccioná al menos una categoría'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Ingresá un email válido'
  }
  if (form.documentType === 'cedula_uy' && form.documentId) {
    const cedulaCheck = validateCedula(form.documentId)
    if (!cedulaCheck.valid) errors.documentId = cedulaCheck.message
  }
  return errors
}

export default function StaffFormModal({ isOpen, onClose, onSave, member, categories = [] }) {
  const { clubSettings } = useAppData()
  const isEditing = Boolean(member)
  const [form, setForm] = useState(EMPTY_STAFF_MEMBER)
  const [errors, setErrors] = useState({})
  const activeCategories = getActiveCategories(categories)
  const fallbackCategoryId = getDefaultCategoryId(categories)
  const defaultNationality = getDefaultNationality(clubSettings)

  useEffect(() => {
    if (isOpen) {
      setForm(
        member
          ? { ...EMPTY_STAFF_MEMBER, ...member, categoryIds: member.categoryIds ?? [] }
          : {
              ...EMPTY_STAFF_MEMBER,
              nationality: defaultNationality,
              categoryIds: [fallbackCategoryId],
            },
      )
      setErrors({})
    }
  }, [isOpen, member, fallbackCategoryId, defaultNationality])

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const toggleCategory = (categoryId) => {
    setForm((prev) => {
      const current = prev.categoryIds ?? []
      const next = current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
      return { ...prev, categoryIds: next }
    })
    if (errors.categoryIds) {
      setErrors((prev) => ({ ...prev, categoryIds: undefined }))
    }
  }

  const handlePhoto = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update('photo', reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    const nextErrors = validateForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSave(form, member)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar integrante' : 'Nuevo integrante del staff'}
      description="Completá los datos del cuerpo técnico"
      size="xl"
    >
      <div className="mb-6 flex items-center gap-4">
        <StaffAvatar member={{ ...form, id: member?.id ?? 'new' }} size="lg" />
        <div>
          <input type="file" accept="image/*" id="staff-photo" className="sr-only" onChange={handlePhoto} />
          <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById('staff-photo')?.click()}>
            <Camera className="h-4 w-4" />
            {form.photo ? 'Cambiar foto' : 'Subir foto'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Nombre" htmlFor="staff-first-name" required error={errors.firstName}>
          <Input id="staff-first-name" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} />
        </FormField>
        <FormField label="Apellido" htmlFor="staff-last-name" required error={errors.lastName}>
          <Input id="staff-last-name" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
        </FormField>
        <FormField label="Fecha de nacimiento" htmlFor="staff-birth">
          <Input id="staff-birth" type="date" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} />
        </FormField>
        <FormField label="Tipo de documento" htmlFor="staff-document-type">
          <Select id="staff-document-type" value={form.documentType} onChange={(e) => update('documentType', e.target.value)}>
            <option value="">—</option>
            {PERSONAL_DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Cédula de Identidad / Documento" htmlFor="staff-document" error={errors.documentId}>
          <Input
            id="staff-document"
            value={form.documentId}
            onChange={(e) => update('documentId', e.target.value)}
            placeholder={form.documentType === 'cedula_uy' ? 'Ej: 1.234.567-8' : 'Número de documento'}
          />
        </FormField>
        <FormField label="Nacionalidad" htmlFor="staff-nationality">
          <Input id="staff-nationality" value={form.nationality} onChange={(e) => update('nationality', e.target.value)} />
        </FormField>
        <FormField label="Estado" htmlFor="staff-status">
          <Select id="staff-status" value={form.status} onChange={(e) => update('status', e.target.value)}>
            {STAFF_STATUS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Teléfono" htmlFor="staff-phone">
          <Input id="staff-phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder={STAFF_PHONE_PLACEHOLDER} />
        </FormField>
        <FormField label="Email" htmlFor="staff-email" error={errors.email}>
          <Input id="staff-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="correo@club.com" />
        </FormField>
        <FormField label="País" htmlFor="staff-address-country">
          <Input id="staff-address-country" value={form.addressCountry} onChange={(e) => update('addressCountry', e.target.value)} />
        </FormField>
        <FormField label="Departamento" htmlFor="staff-address-department">
          <Select id="staff-address-department" value={form.addressDepartment} onChange={(e) => update('addressDepartment', e.target.value)}>
            <option value="">—</option>
            {URUGUAY_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Ciudad o localidad" htmlFor="staff-address-city">
          <Input id="staff-address-city" value={form.addressCity} onChange={(e) => update('addressCity', e.target.value)} />
        </FormField>
        <FormField label="Dirección" htmlFor="staff-address-street">
          <Input id="staff-address-street" value={form.addressStreet} onChange={(e) => update('addressStreet', e.target.value)} />
        </FormField>
        <FormField label="Código postal" htmlFor="staff-address-postal">
          <Input id="staff-address-postal" value={form.addressPostalCode} onChange={(e) => update('addressPostalCode', e.target.value)} />
        </FormField>
        <FormField label="Cargo principal" htmlFor="staff-role" required error={errors.role}>
          <Select id="staff-role" value={form.role} onChange={(e) => update('role', e.target.value)}>
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Cargo secundario" htmlFor="staff-secondary-role">
          <Select id="staff-secondary-role" value={form.secondaryRole} onChange={(e) => update('secondaryRole', e.target.value)}>
            <option value="">—</option>
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Entidad emisora de la licencia" htmlFor="staff-license-issuer">
          <Select id="staff-license-issuer" value={form.licenseIssuer} onChange={(e) => update('licenseIssuer', e.target.value)}>
            <option value="">—</option>
            {STAFF_LICENSE_ISSUERS.map((issuer) => (
              <option key={issuer} value={issuer}>{issuer}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Nivel o tipo de licencia" htmlFor="staff-license-level">
          <Select id="staff-license-level" value={form.licenseLevel} onChange={(e) => update('licenseLevel', e.target.value)}>
            <option value="">—</option>
            {STAFF_LICENSE_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Nombre de la licencia" htmlFor="staff-license-name">
          <Input id="staff-license-name" value={form.licenseName} onChange={(e) => update('licenseName', e.target.value)} placeholder="Ej: Licencia PRO CONMEBOL" />
        </FormField>
        <FormField label="Número de licencia" htmlFor="staff-license-number">
          <Input id="staff-license-number" value={form.licenseNumber} onChange={(e) => update('licenseNumber', e.target.value)} />
        </FormField>
        <FormField label="País de emisión" htmlFor="staff-license-country">
          <Input id="staff-license-country" value={form.licenseIssueCountry} onChange={(e) => update('licenseIssueCountry', e.target.value)} />
        </FormField>
        <FormField label="Fecha de emisión de licencia" htmlFor="staff-license-issue">
          <Input id="staff-license-issue" type="date" value={form.licenseIssueDate} onChange={(e) => update('licenseIssueDate', e.target.value)} />
        </FormField>
        <FormField label="Vencimiento de licencia" htmlFor="staff-license-expiry">
          <Input id="staff-license-expiry" type="date" value={form.licenseExpiry} onChange={(e) => update('licenseExpiry', e.target.value)} />
        </FormField>
        <FormField label="Especialidad" htmlFor="staff-specialty">
          <Input id="staff-specialty" value={form.specialty} onChange={(e) => update('specialty', e.target.value)} />
        </FormField>
        <FormField label="Fecha de ingreso" htmlFor="staff-start">
          <Input id="staff-start" type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
        </FormField>
        <FormField label="Categorías asignadas" error={errors.categoryIds} className="sm:col-span-2">
          <div className="flex flex-wrap gap-2">
            {activeCategories.map((category) => {
              const selected = (form.categoryIds ?? []).includes(category.id)
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selected
                      ? 'border-transparent text-white'
                      : 'border-slate-200 bg-white text-text-secondary hover:bg-slate-50'
                  }`}
                  style={selected ? { backgroundColor: category.color } : undefined}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
                  {category.name}
                </button>
              )
            })}
          </div>
        </FormField>
        <FormField label="Observaciones" htmlFor="staff-notes" className="sm:col-span-2">
          <Textarea id="staff-notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} />
        </FormField>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>
          <Save className="h-4 w-4" />
          {isEditing ? 'Guardar cambios' : 'Agregar integrante'}
        </Button>
      </div>
    </Modal>
  )
}

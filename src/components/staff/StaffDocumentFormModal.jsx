import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { FormField, Input, Select, Textarea } from '../ui/FormField'
import { STAFF_DOCUMENT_TYPES } from '../../constants/staffDocuments'
import { createStaffDocument } from '../../utils/staff'

export default function StaffDocumentFormModal({ isOpen, onClose, document, onSave }) {
  const [form, setForm] = useState(createStaffDocument('documento'))
  const isEditing = Boolean(document)

  useEffect(() => {
    if (isOpen) {
      setForm(document ? { ...document } : createStaffDocument('documento'))
    }
  }, [isOpen, document])

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        fileName: file.name,
        mimeType: file.type,
        dataUrl: reader.result,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    onSave(form)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar documento' : 'Agregar documento'}
      size="md"
    >
      <div className="space-y-4">
        <FormField label="Tipo de documento">
          <Select value={form.type} onChange={(e) => update('type', e.target.value)}>
            {STAFF_DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Fecha de emisión">
            <Input type="date" value={form.issuedAt} onChange={(e) => update('issuedAt', e.target.value)} />
          </FormField>
          <FormField label="Fecha de vencimiento">
            <Input type="date" value={form.expiresAt} onChange={(e) => update('expiresAt', e.target.value)} />
          </FormField>
        </div>
        <FormField label="Archivo">
          <Input type="file" onChange={handleFile} />
          {form.fileName && <p className="mt-1 text-xs text-text-muted">{form.fileName}</p>}
        </FormField>
        <FormField label="Notas">
          <Textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={2} />
        </FormField>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Guardar documento</Button>
      </div>
    </Modal>
  )
}

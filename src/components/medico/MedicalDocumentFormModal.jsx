import { useEffect, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Input, Select, Textarea } from '../ui/FormField'
import { MEDICAL_DOCUMENT_TYPES } from '../../constants/medicalCenter'
import { generateRecordId } from '../../utils/playerFactory'

const EMPTY_FORM = {
  type: 'carne_deportista',
  issuedAt: '',
  expiresAt: '',
  notes: '',
  fileName: null,
  mimeType: null,
  dataUrl: null,
}

export default function MedicalDocumentFormModal({
  isOpen,
  onClose,
  onSave,
  document,
  fixedType = null,
  excludedTypes = [],
}) {
  const fileInputRef = useRef(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!isOpen) return

    if (document) {
      setForm({
        type: document.type,
        issuedAt: document.issuedAt ?? '',
        expiresAt: document.expiresAt ?? '',
        notes: document.notes ?? '',
        fileName: document.fileName ?? null,
        mimeType: document.mimeType ?? null,
        dataUrl: document.dataUrl ?? null,
      })
      return
    }

    setForm({
      ...EMPTY_FORM,
      type: fixedType ?? 'carne_deportista',
    })
  }, [isOpen, document, fixedType])

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleUpload = (event) => {
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
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!form.expiresAt) return

    onSave({
      id: document?.id ?? generateRecordId('mdoc'),
      type: fixedType ?? form.type,
      issuedAt: form.issuedAt,
      expiresAt: form.expiresAt,
      notes: form.notes,
      fileName: form.fileName,
      mimeType: form.mimeType,
      dataUrl: form.dataUrl,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={document ? 'Editar documento médico' : 'Agregar documento médico'}
      description="El estado se calcula automáticamente según la fecha de vencimiento."
      size="lg"
    >
      <div className="space-y-4">
        {!fixedType && (
          <div>
            <label htmlFor="med-doc-type" className="mb-1.5 block text-xs font-medium text-text-secondary">
              Tipo de documento
            </label>
            <Select
              id="med-doc-type"
              value={form.type}
              onChange={handleChange('type')}
              disabled={Boolean(document)}
            >
              {MEDICAL_DOCUMENT_TYPES.filter((type) => !excludedTypes.includes(type.value)).map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </Select>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="med-issued" className="mb-1.5 block text-xs font-medium text-text-secondary">
              Fecha de emisión
            </label>
            <Input id="med-issued" type="date" value={form.issuedAt} onChange={handleChange('issuedAt')} />
          </div>
          <div>
            <label htmlFor="med-expires" className="mb-1.5 block text-xs font-medium text-text-secondary">
              Fecha de vencimiento
            </label>
            <Input id="med-expires" type="date" value={form.expiresAt} onChange={handleChange('expiresAt')} required />
          </div>
        </div>

        <div>
          <label htmlFor="med-notes" className="mb-1.5 block text-xs font-medium text-text-secondary">
            Observaciones
          </label>
          <Textarea id="med-notes" value={form.notes} onChange={handleChange('notes')} rows={3} />
        </div>

        <div className="rounded-2xl border border-border bg-surface-muted p-4">
          <p className="mb-2 text-sm font-medium text-text-primary">Archivo adjunto (PDF o imagen)</p>
          {form.fileName && (
            <p className="mb-3 text-sm text-text-secondary">{form.fileName}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="sr-only"
            id="med-file-upload"
            onChange={handleUpload}
          />
          <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            {form.fileName ? 'Reemplazar archivo' : 'Adjuntar archivo'}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={!form.expiresAt}>
          Guardar documento
        </Button>
      </div>
    </Modal>
  )
}

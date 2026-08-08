import { useRef, useState } from 'react'
import { FileText, Trash2, Upload } from 'lucide-react'
import Button from '../../ui/Button'
import ConfirmModal from '../../ui/ConfirmModal'
import { Select } from '../../ui/FormField'
import { DOCUMENT_TYPES, getDocumentTypeLabel } from '../../../constants/playerProfile'
import { formatDate, generateRecordId } from '../../../utils/playerFactory'

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsTab({ player, onUpdate }) {
  const fileInputRef = useRef(null)
  const [docType, setDocType] = useState('carnet')
  const [deletingDoc, setDeletingDoc] = useState(null)

  const documents = player.documents ?? []

  const handleUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const newDoc = {
        id: generateRecordId('doc'),
        type: docType,
        name: file.name,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        dataUrl: reader.result,
        uploadedAt: new Date().toISOString().slice(0, 10),
      }
      onUpdate({ documents: [...documents, newDoc] })
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsDataURL(file)
  }

  const handleDelete = () => {
    if (!deletingDoc) return
    onUpdate({ documents: documents.filter((doc) => doc.id !== deletingDoc.id) })
    setDeletingDoc(null)
  }

  const grouped = DOCUMENT_TYPES.map((type) => ({
    ...type,
    items: documents.filter((doc) => doc.type === type.value),
  })).filter((group) => group.items.length > 0)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface-muted p-4">
        <p className="mb-3 text-sm font-medium text-text-primary">Subir documento</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="doc-type" className="mb-1.5 block text-xs font-medium text-text-secondary">
              Tipo de documento
            </label>
            <Select id="doc-type" value={docType} onChange={(e) => setDocType(e.target.value)}>
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="sr-only"
              id="doc-upload"
              onChange={handleUpload}
            />
            <Button type="button" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Seleccionar archivo
            </Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Almacenamiento local temporal. Formatos: PDF, JPG, PNG, DOC.
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-text-muted" />
          <p className="mt-3 text-sm font-medium text-text-primary">Sin documentos cargados</p>
          <p className="mt-1 text-sm text-text-secondary">
            Subí carnet, documento, pasaporte, contrato u otros archivos del jugador.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <section key={group.value}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                {group.label}
              </h4>
              <div className="space-y-2">
                {group.items.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
                        <FileText className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">{doc.name}</p>
                        <p className="text-xs text-text-muted">
                          {formatDate(doc.uploadedAt)}
                          {doc.size ? ` · ${formatFileSize(doc.size)}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {doc.dataUrl && (
                        <a
                          href={doc.dataUrl}
                          download={doc.fileName}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/10"
                        >
                          Descargar
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeletingDoc(doc)}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-danger-subtle"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {documents.filter((doc) => !DOCUMENT_TYPES.some((t) => t.value === doc.type)).length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Otros
              </h4>
              {documents
                .filter((doc) => !DOCUMENT_TYPES.some((t) => t.value === doc.type))
                .map((doc) => (
                  <div key={doc.id} className="rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm">
                    {doc.name} — {getDocumentTypeLabel(doc.type)}
                  </div>
                ))}
            </section>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deletingDoc)}
        onClose={() => setDeletingDoc(null)}
        onConfirm={handleDelete}
        title="Eliminar documento"
        message={`¿Eliminar "${deletingDoc?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}

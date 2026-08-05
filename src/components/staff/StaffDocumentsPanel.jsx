import { useState } from 'react'
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import ConfirmModal from '../ui/ConfirmModal'
import StaffDocumentFormModal from './StaffDocumentFormModal'
import { getStaffDocumentTypeLabel } from '../../constants/staffDocuments'
import { createStaffDocument, removeStaffDocument, upsertStaffDocument } from '../../utils/staff'
import { getDocumentExpiryStatus } from '../../utils/medicalCenter'
import { formatDate } from '../../utils/playerFactory'

export default function StaffDocumentsPanel({ member, onUpdate }) {
  const [editingDocument, setEditingDocument] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingDocument, setDeletingDocument] = useState(null)

  const documents = member.documents ?? []

  const handleSave = (documentData) => {
    onUpdate({
      documents: upsertStaffDocument(member, documentData),
    })
    setEditingDocument(null)
    setIsCreating(false)
  }

  const handleDelete = () => {
    if (!deletingDocument) return
    onUpdate({
      documents: removeStaffDocument(member, deletingDocument.id),
    })
    setDeletingDocument(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Documentación del integrante. Verde (+30 días), amarillo (11-30), rojo (≤10 o vencido).
        </p>
        <Button size="sm" onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </div>

      {member.licenseExpiry && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">Licencia de entrenador</p>
              <p className="text-xs text-text-muted">
                {member.licenseType || 'Sin tipo'} · #{member.licenseNumber || '—'}
              </p>
              <p className="mt-1 text-xs text-text-secondary">Vence: {formatDate(member.licenseExpiry)}</p>
            </div>
            <Badge variant={getDocumentExpiryStatus(member.licenseExpiry).variant}>
              {getDocumentExpiryStatus(member.licenseExpiry).label}
            </Badge>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-text-muted">
          Sin documentos adjuntos.
        </p>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => {
            const status = getDocumentExpiryStatus(document.expiresAt)
            return (
              <div key={document.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {getStaffDocumentTypeLabel(document.type)}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      Emisión: {formatDate(document.issuedAt)} · Vence: {formatDate(document.expiresAt)}
                    </p>
                    {document.notes && <p className="mt-1 text-xs text-text-secondary">{document.notes}</p>}
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  {document.dataUrl && (
                    <a
                      href={document.dataUrl}
                      download={document.fileName}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/10"
                    >
                      <FileText className="h-4 w-4" />
                      Ver
                    </a>
                  )}
                  <button type="button" onClick={() => setEditingDocument(document)} className="text-sm text-accent hover:underline">
                    <Pencil className="inline h-3.5 w-3.5" /> Editar
                  </button>
                  <button type="button" onClick={() => setDeletingDocument(document)} className="text-sm text-red-600 hover:underline">
                    <Trash2 className="inline h-3.5 w-3.5" /> Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <StaffDocumentFormModal
        isOpen={isCreating || Boolean(editingDocument)}
        onClose={() => { setIsCreating(false); setEditingDocument(null) }}
        document={editingDocument}
        onSave={handleSave}
      />

      <ConfirmModal
        isOpen={Boolean(deletingDocument)}
        onClose={() => setDeletingDocument(null)}
        onConfirm={handleDelete}
        title="Eliminar documento"
        message="¿Eliminar este documento del staff?"
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}

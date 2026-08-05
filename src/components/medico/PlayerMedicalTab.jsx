import { useState } from 'react'
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import ConfirmModal from '../ui/ConfirmModal'
import MedicalDocumentCell from './MedicalDocumentCell'
import MedicalDocumentFormModal from './MedicalDocumentFormModal'
import { MEDICAL_DOCUMENT_TYPES } from '../../constants/medicalCenter'
import {
  getPlayerDocumentStatuses,
  removeMedicalDocument,
  upsertMedicalDocument,
} from '../../utils/medicalCenter'
import { getCategoryById } from '../../utils/categories'

export default function PlayerMedicalTab({ player, categories = [], onUpdate }) {
  const [editingType, setEditingType] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingDocument, setDeletingDocument] = useState(null)

  const documentStatuses = getPlayerDocumentStatuses(player)
  const editingDocument = editingType
    ? documentStatuses.find((entry) => entry.value === editingType)?.document ?? null
    : null

  const handleSave = (documentData) => {
    onUpdate({
      medicalDocuments: upsertMedicalDocument(player, documentData),
    })
    setEditingType(null)
    setIsCreating(false)
  }

  const handleDelete = () => {
    if (!deletingDocument) return
    onUpdate({
      medicalDocuments: removeMedicalDocument(player, deletingDocument.id),
    })
    setDeletingDocument(null)
  }

  const usedTypes = new Set((player.medicalDocuments ?? []).map((document) => document.type))
  const canAddMore = MEDICAL_DOCUMENT_TYPES.some((type) => !usedTypes.has(type.value))
  const hasAnyDocument = (player.medicalDocuments ?? []).length > 0

  return (
    <div className="space-y-4">
      {!hasAnyDocument && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
          <p className="text-sm font-medium text-text-primary">No hay documentación médica cargada</p>
          <p className="mt-1 text-sm text-text-secondary">
            Agregá carné del deportista, ficha médica u otros documentos obligatorios.
          </p>
          {canAddMore && (
            <Button type="button" size="sm" className="mt-4" onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4" />
              Agregar documento
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default">
          Categoría: {getCategoryById(categories, player.categoryId)?.name ?? 'Sin categoría'}
        </Badge>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          Documentación médica obligatoria del jugador. Los colores se calculan automáticamente.
        </p>
        {canAddMore && (
          <Button type="button" size="sm" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4" />
            Agregar documento
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {documentStatuses.map(({ value, label, document, status }) => (
          <div
            key={value}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">{label}</h4>
                <div className="mt-2">
                  <MedicalDocumentCell document={document} />
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {document?.dataUrl && (
                  <a
                    href={document.dataUrl}
                    download={document.fileName ?? 'documento-medico'}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/10"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <FileText className="h-4 w-4" />
                    Ver
                  </a>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingType(value)}
                >
                  <Pencil className="h-4 w-4" />
                  {document ? 'Editar' : 'Cargar'}
                </Button>
                {document && (
                  <button
                    type="button"
                    onClick={() => setDeletingDocument(document)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
            {!document && (
              <Badge variant={status.variant}>Pendiente de carga</Badge>
            )}
          </div>
        ))}
      </div>

      <MedicalDocumentFormModal
        isOpen={Boolean(editingType)}
        onClose={() => setEditingType(null)}
        onSave={handleSave}
        document={editingDocument}
        fixedType={editingType}
      />

      <MedicalDocumentFormModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSave={handleSave}
        excludedTypes={[...usedTypes]}
      />

      <ConfirmModal
        isOpen={Boolean(deletingDocument)}
        onClose={() => setDeletingDocument(null)}
        onConfirm={handleDelete}
        title="Eliminar documento médico"
        message={`¿Eliminar ${deletingDocument?.type ?? 'este documento'}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}

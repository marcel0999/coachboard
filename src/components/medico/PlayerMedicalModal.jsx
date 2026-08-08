import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import { statusToVariant } from '../../utils/badgeVariants'
import PlayerAvatar from '../plantel/PlayerAvatar'
import ViewErrorBoundary from '../ui/ViewErrorBoundary'
import PlayerMedicalTab from './PlayerMedicalTab'
import MedicalStatusDot from './MedicalStatusDot'
import { getFullName } from '../../utils/players'
import { getCategoryById } from '../../utils/categories'
import { displayDocument } from '../../utils/localization'
import { getDocumentTypeLabel } from '../../constants/playerProfile'
import {
  buildMedicalAlerts,
  getPlayerGeneralMedicalStatus,
} from '../../utils/medicalCenter'

export default function PlayerMedicalModal({
  isOpen,
  onClose,
  player,
  categories = [],
  onUpdate,
}) {
  if (!isOpen) return null

  if (!player) {
    return (
      <Modal
        isOpen
        onClose={onClose}
        title="Ficha médica"
        description="Jugador no encontrado"
        size="lg"
      >
        <p className="text-sm text-text-secondary">
          No se pudo abrir la ficha médica. El jugador seleccionado no existe o fue eliminado.
        </p>
      </Modal>
    )
  }

  const category = getCategoryById(categories, player.categoryId)
  const generalStatus = getPlayerGeneralMedicalStatus(player)
  const playerAlerts = buildMedicalAlerts([player], new Date(), categories).slice(0, 4)

  const handleUpdate = (updates) => {
    onUpdate(player.id, updates)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getFullName(player)}
      description={`Ficha médica · ${category?.name ?? 'Sin categoría'} · Dorsal ${player.number ?? '—'}`}
      size="2xl"
    >
      <div className="mb-5 rounded-2xl border border-border bg-surface-muted p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <PlayerAvatar player={player} size="lg" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusToVariant(player.physicalStatus)}>
                {player.physicalStatus}
              </Badge>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: category?.color ?? '#64748b' }}
              >
                {category?.name ?? 'Sin categoría'}
              </span>
              <div className="flex items-center gap-2">
                <MedicalStatusDot level={generalStatus.level} />
                <Badge variant={generalStatus.variant}>{generalStatus.label}</Badge>
              </div>
            </div>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">Documento</dt>
                <dd className="mt-0.5 font-medium text-text-primary">
                  {player.document
                    ? displayDocument(player.document, player.documentType)
                    : '—'}
                  {player.documentType && (
                    <span className="ml-1 text-xs font-normal text-text-secondary">
                      ({getDocumentTypeLabel(player.documentType)})
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">Posición</dt>
                <dd className="mt-0.5 font-medium text-text-primary">{player.primaryPosition ?? '—'}</dd>
              </div>
            </dl>
            {playerAlerts.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-text-muted">Alertas</p>
                <ul className="space-y-1">
                  {playerAlerts.map((alert) => (
                    <li key={alert.id} className="flex items-center gap-2 text-xs text-text-secondary">
                      <MedicalStatusDot level={alert.level} />
                      <span>{alert.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <ViewErrorBoundary
        resetKey={player.id}
        message="No se pudo abrir la ficha médica. Revisá los datos del jugador o intentá nuevamente."
        onRetry={onClose}
      >
        <PlayerMedicalTab
          player={player}
          categories={categories}
          onUpdate={handleUpdate}
        />
      </ViewErrorBoundary>
    </Modal>
  )
}

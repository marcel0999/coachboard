import Badge from '../ui/Badge'
import MedicalStatusDot from './MedicalStatusDot'
import { formatDate } from '../../utils/playerFactory'
import { getDocumentExpiryStatus } from '../../utils/medicalCenter'

export default function MedicalDocumentCell({ document, compact = false }) {
  const status = getDocumentExpiryStatus(document?.expiresAt)

  if (!document) {
    return (
      <div className="min-w-[140px]">
        <div className="flex items-center gap-2">
          <MedicalStatusDot level="missing" />
          <span className="text-xs font-medium text-red-400">Sin documento</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-[140px] space-y-1">
      <div className="flex items-center gap-2">
        <MedicalStatusDot level={status.level} />
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      {!compact && (
        <>
          <p className="text-xs text-text-secondary">
            Emisión: {formatDate(document.issuedAt)}
          </p>
          <p className="text-xs text-text-secondary">
            Vence: {formatDate(document.expiresAt)}
          </p>
          {document.fileName && (
            <p className="truncate text-xs text-accent">{document.fileName}</p>
          )}
          {document.notes && (
            <p className="line-clamp-2 text-xs text-text-muted">{document.notes}</p>
          )}
        </>
      )}
    </div>
  )
}

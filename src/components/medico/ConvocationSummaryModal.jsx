import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { getFullName } from '../../utils/players'
import { getMedicalDocumentTypeLabel } from '../../constants/medicalCenter'

export default function ConvocationSummaryModal({
  isOpen,
  onClose,
  onConfirm,
  summary,
}) {
  if (!summary) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resumen de convocatoria médica"
      description="Revisá el estado documental antes de confirmar la convocatoria."
      size="lg"
    >
      <div className="space-y-5">
        <section>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="success">Habilitados</Badge>
            <span className="text-sm text-text-secondary">{summary.habilitados.length} jugadores</span>
          </div>
          {summary.habilitados.length === 0 ? (
            <p className="text-sm text-text-muted">Ningún jugador convocado con documentación completamente al día.</p>
          ) : (
            <ul className="space-y-1 text-sm text-text-primary">
              {summary.habilitados.map((player) => (
                <li key={player.id}>• {getFullName(player)}</li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="warning">Próximos vencimientos</Badge>
            <span className="text-sm text-text-secondary">{summary.proximosVencer.length} jugadores</span>
          </div>
          {summary.proximosVencer.length === 0 ? (
            <p className="text-sm text-text-muted">Sin documentación por vencer en los convocados.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {summary.proximosVencer.map(({ player, expiringDocs }) => (
                <li key={player.id} className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
                  <span className="font-medium">{getFullName(player)}</span>
                  <ul className="mt-1 space-y-0.5">
                    {expiringDocs.map(({ value, status }) => (
                      <li key={value}>
                        {getMedicalDocumentTypeLabel(value)} · vence en {status.days} días
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="danger">Documentación vencida o faltante</Badge>
            <span className="text-sm text-text-secondary">{summary.vencidos.length} jugadores</span>
          </div>
          {summary.vencidos.length === 0 ? (
            <p className="text-sm text-text-muted">Ningún convocado con documentación vencida.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {summary.vencidos.map(({ player, expiredDocs, missingDocs }) => (
                <li key={player.id} className="rounded-lg bg-red-50 px-3 py-2 text-red-800">
                  <span className="font-medium">{getFullName(player)}</span>
                  <ul className="mt-1 space-y-0.5">
                    {expiredDocs.map(({ value, status }) => (
                      <li key={value}>
                        {getMedicalDocumentTypeLabel(value)} vencido hace {status.daysOverdue} días
                      </li>
                    ))}
                    {missingDocs.map(({ label }) => (
                      <li key={label}>{label} faltante</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>Volver</Button>
        <Button onClick={onConfirm}>Confirmar convocatoria</Button>
      </div>
    </Modal>
  )
}

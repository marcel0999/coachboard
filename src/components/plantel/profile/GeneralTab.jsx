import Badge from '../../ui/Badge'
import { statusToVariant } from '../../../utils/badgeVariants'
import InfoRow from '../../ui/InfoRow'
import PlayerAvatar from '../PlayerAvatar'
import { calculateAge, getFullName } from '../../../utils/players'
import { formatCurrency, displayDocument } from '../../../utils/localization'
import { getDocumentTypeLabel } from '../../../constants/playerProfile'
import { formatDate } from '../../../utils/playerFactory'

export default function GeneralTab({ player }) {
  const age = calculateAge(player.birthDate)

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface-muted p-6 sm:flex-row sm:items-start">
        <PlayerAvatar player={player} size="lg" />
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-text-primary">{getFullName(player)}</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {player.primaryPosition}
            {player.number ? ` · Dorsal ${player.number}` : ''}
          </p>
          <div className="mt-3">
            <Badge variant={statusToVariant(player.physicalStatus)}>
              {player.physicalStatus}
            </Badge>
          </div>
        </div>
      </div>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Datos personales
        </h4>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Fecha de nacimiento" value={`${formatDate(player.birthDate)}${age !== null ? ` (${age} años)` : ''}`} />
          <InfoRow label="Nacionalidad" value={player.nationality} />
          <InfoRow label="Tipo de documento" value={getDocumentTypeLabel(player.documentType)} />
          <InfoRow label="Documento" value={displayDocument(player.document, player.documentType)} />
          <InfoRow label="Teléfono" value={player.phone} />
          <InfoRow label="Email" value={player.email} />
          <InfoRow
            label="Dirección"
            value={
              [player.addressStreet, player.addressCity, player.addressDepartment, player.addressCountry]
                .filter(Boolean)
                .join(', ') || player.address
            }
            className="sm:col-span-2 lg:col-span-3"
          />
        </dl>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Datos deportivos
        </h4>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Posición principal" value={player.primaryPosition} />
          <InfoRow label="Posición secundaria" value={player.secondaryPosition || '—'} />
          <InfoRow label="Pie hábil" value={player.dominantFoot} />
          <InfoRow label="Altura" value={player.height ? `${player.height} cm` : '—'} />
          <InfoRow label="Peso" value={player.weight ? `${player.weight} kg` : '—'} />
          <InfoRow label="Número de camiseta" value={player.number} />
          <InfoRow label="Estado" value={player.physicalStatus} />
        </dl>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Contrato y representación
        </h4>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Inicio de contrato" value={formatDate(player.contractStart)} />
          <InfoRow label="Fin de contrato" value={formatDate(player.contractEnd)} />
          <InfoRow label="Club anterior" value={player.previousClub} />
          <InfoRow label="Representante" value={player.representative} />
          <InfoRow label="Valor estimado" value={formatCurrency(player.estimatedValue, player.estimatedValueCurrency ?? 'UYU')} />
        </dl>
      </section>

      {player.notes && (
        <section>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Observaciones
          </h4>
          <p className="rounded-xl border border-border-subtle bg-surface-muted/60 px-4 py-3 text-sm leading-relaxed text-text-primary">
            {player.notes}
          </p>
        </section>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Pencil } from 'lucide-react'
import Modal from '../ui/Modal'
import Tabs from '../ui/Tabs'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import StaffAvatar from './StaffAvatar'
import StaffDocumentsPanel from './StaffDocumentsPanel'
import { STAFF_DETAIL_TABS } from '../../constants/staff'
import {
  buildStaffParticipation,
  getStaffFullName,
  getStaffLicenseStatus,
} from '../../utils/staff'
import { getCategoryById } from '../../utils/categories'
import { formatDate } from '../../utils/playerFactory'
import { formatMatchDateTime } from '../../utils/matches'

function InfoRow({ label, value }) {
  return (
    <div className="rounded-xl bg-surface-muted px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-text-primary">{value || '—'}</p>
    </div>
  )
}

export default function StaffDetailModal({
  isOpen,
  onClose,
  member,
  categories = [],
  matches = [],
  trainings = [],
  onUpdate,
  onEdit,
}) {
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    if (isOpen) setActiveTab('general')
  }, [isOpen, member?.id])

  const participation = useMemo(
    () => (member ? buildStaffParticipation(member.id, matches, trainings) : []),
    [member, matches, trainings],
  )

  if (!member) return null

  const licenseStatus = getStaffLicenseStatus(member)

  const handleUpdate = (updates) => {
    onUpdate(member.id, updates)
  }

  const toggleCategory = (categoryId) => {
    const current = member.categoryIds ?? []
    const next = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId]
    handleUpdate({ categoryIds: next })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getStaffFullName(member)}
      description={`${member.role}${member.secondaryRole ? ` · ${member.secondaryRole}` : ''}`}
      size="2xl"
    >
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <StaffAvatar member={member} size="lg" />
        <div className="flex flex-wrap gap-2">
          <Badge variant={member.status === 'Activo' ? 'success' : 'default'}>{member.status}</Badge>
          <Badge variant={licenseStatus.variant}>Licencia: {licenseStatus.label}</Badge>
        </div>
        <Button size="sm" variant="secondary" className="ml-auto" onClick={() => onEdit(member)}>
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </div>

      <Tabs tabs={STAFF_DETAIL_TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="pt-5">
        {activeTab === 'general' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="Nombre" value={member.firstName} />
            <InfoRow label="Apellido" value={member.lastName} />
            <InfoRow label="Documento" value={member.documentId} />
            <InfoRow label="Nacionalidad" value={member.nationality} />
            <InfoRow label="Fecha de nacimiento" value={formatDate(member.birthDate)} />
            <InfoRow label="Fecha de ingreso" value={formatDate(member.startDate)} />
            <InfoRow label="Teléfono" value={member.phone} />
            <InfoRow label="Email" value={member.email} />
            <InfoRow
              label="Dirección"
              value={
                [member.addressStreet, member.addressCity, member.addressDepartment, member.addressCountry]
                  .filter(Boolean)
                  .join(', ') || member.address
              }
            />
            <InfoRow label="Especialidad" value={member.specialty} />
            <InfoRow label="Entidad emisora" value={member.licenseIssuer} />
            <InfoRow label="Nivel de licencia" value={member.licenseLevel || member.licenseType} />
            <InfoRow label="Nombre de licencia" value={member.licenseName} />
            <InfoRow label="Número de licencia" value={member.licenseNumber} />
            <InfoRow label="País de emisión" value={member.licenseIssueCountry} />
            <InfoRow label="Emisión licencia" value={formatDate(member.licenseIssueDate)} />
            <InfoRow label="Vencimiento licencia" value={formatDate(member.licenseExpiry)} />
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <p className="mb-3 text-sm text-text-secondary">Seleccioná las categorías donde trabaja este integrante.</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const selected = (member.categoryIds ?? []).includes(category.id)
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      selected ? 'border-transparent text-white' : 'border-border bg-surface-elevated text-text-secondary'
                    }`}
                    style={selected ? { backgroundColor: category.color } : undefined}
                  >
                    {category.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-2">
            {participation.filter((entry) => entry.type === 'match').length === 0 ? (
              <p className="text-sm text-text-muted">Sin participación registrada en partidos.</p>
            ) : (
              participation
                .filter((entry) => entry.type === 'match')
                .map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-border px-4 py-3 text-sm">
                    <p className="font-medium text-text-primary">{entry.label}</p>
                    <p className="text-xs text-text-muted">
                      {formatMatchDateTime(entry.date, '')} · {entry.competition} ·{' '}
                      {getCategoryById(categories, entry.categoryId)?.name ?? '—'}
                    </p>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === 'trainings' && (
          <div className="space-y-2">
            {participation.filter((entry) => entry.type === 'training').length === 0 ? (
              <p className="text-sm text-text-muted">Sin participación registrada en entrenamientos.</p>
            ) : (
              participation
                .filter((entry) => entry.type === 'training')
                .map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-border px-4 py-3 text-sm">
                    <p className="font-medium text-text-primary">{entry.label}</p>
                    <p className="text-xs text-text-muted">
                      {formatDate(entry.date)} · {getCategoryById(categories, entry.categoryId)?.name ?? '—'}
                    </p>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <StaffDocumentsPanel member={member} onUpdate={handleUpdate} />
        )}

        {activeTab === 'notes' && (
          <div>
            <p className="whitespace-pre-wrap text-sm text-text-primary">{member.notes || 'Sin observaciones.'}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

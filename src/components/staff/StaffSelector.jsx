import StaffAvatar from './StaffAvatar'
import Badge from '../ui/Badge'
import { getStaffFullName } from '../../utils/staff'

function StaffChip({ member, draggable = true }) {
  if (!member) return null

  return (
    <div
      draggable={draggable}
      onDragStart={(event) => {
        event.dataTransfer.setData('staffId', member.id)
        event.dataTransfer.effectAllowed = 'move'
      }}
      className="flex cursor-grab items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm shadow-sm active:cursor-grabbing"
    >
      <StaffAvatar member={member} size="sm" />
      <div className="min-w-0">
        <p className="truncate font-medium text-text-primary">{getStaffFullName(member)}</p>
        <p className="truncate text-xs text-text-muted">{member.role}</p>
      </div>
    </div>
  )
}

function StaffColumn({ title, subtitle, staffIds, staffMap, onDrop, accent = false }) {
  const handleDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const staffId = event.dataTransfer.getData('staffId')
    if (staffId) onDrop(staffId)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`min-h-[220px] rounded-2xl border-2 border-dashed p-4 ${
        accent ? 'border-accent/40 bg-accent/5' : 'border-border bg-surface-muted/50'
      }`}
    >
      <div className="mb-3">
        <h4 className="font-semibold text-text-primary">{title}</h4>
        <p className="text-xs text-text-muted">{subtitle} · {staffIds.length}</p>
      </div>
      <div className="space-y-2">
        {staffIds.map((id) => (
          <StaffChip key={id} member={staffMap[id]} />
        ))}
        {staffIds.length === 0 && (
          <p className="py-8 text-center text-xs text-text-muted">Arrastrá integrantes aquí</p>
        )}
      </div>
    </div>
  )
}

export default function StaffSelector({ match, staff, onChange }) {
  const staffMap = Object.fromEntries(staff.map((member) => [member.id, member]))
  const staffSquad = match.staffSquad ?? { called: [], notCalled: [] }

  const moveStaff = (staffId, targetList) => {
    const removeFromAll = {
      called: staffSquad.called.filter((id) => id !== staffId),
      notCalled: staffSquad.notCalled.filter((id) => id !== staffId),
    }

    onChange({
      ...match,
      staffSquad: {
        ...removeFromAll,
        [targetList]: [...removeFromAll[targetList], staffId],
      },
    })
  }

  return (
    <div>
      <p className="mb-4 text-sm text-text-secondary">
        Seleccioná el cuerpo técnico convocado para el partido. Arrastrá entre Convocados y No convocados.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <StaffColumn
          title="Convocados"
          subtitle="Cuerpo técnico"
          staffIds={staffSquad.called}
          staffMap={staffMap}
          onDrop={(id) => moveStaff(id, 'called')}
          accent
        />
        <StaffColumn
          title="No convocados"
          subtitle="Fuera de lista"
          staffIds={staffSquad.notCalled}
          staffMap={staffMap}
          onDrop={(id) => moveStaff(id, 'notCalled')}
        />
      </div>
    </div>
  )
}

export function StaffPanel({ staff, title = 'Cuerpo técnico' }) {
  if (staff.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-text-secondary">
        No hay integrantes del staff registrados.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <ul className="space-y-2">
        {staff.map((member) => (
          <li key={member.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-elevated px-3 py-2">
            <StaffAvatar member={member} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{getStaffFullName(member)}</p>
              <Badge variant="default">{member.role}</Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function StaffAssignmentList({ staff, selectedIds, onChange }) {
  const toggle = (staffId) => {
    if (selectedIds.includes(staffId)) {
      onChange(selectedIds.filter((id) => id !== staffId))
      return
    }
    onChange([...selectedIds, staffId])
  }

  if (staff.length === 0) {
    return <p className="text-sm text-text-secondary">No hay integrantes del staff registrados.</p>
  }

  return (
    <div className="space-y-2">
      {staff.map((member) => {
        const checked = selectedIds.includes(member.id)
        return (
          <label
            key={member.id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition ${
              checked ? 'border-accent bg-accent/5' : 'border-border bg-surface-elevated hover:bg-surface-muted'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(member.id)}
              className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
            />
            <StaffAvatar member={member} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary">{getStaffFullName(member)}</p>
              <p className="text-xs text-text-muted">{member.role}</p>
            </div>
          </label>
        )
      })}
    </div>
  )
}

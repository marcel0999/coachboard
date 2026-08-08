import StaffAvatar from '../staff/StaffAvatar'
import { STAFF_ROLES } from '../../constants/staff'

export default function TacticalBoardStaffPanel({ staff, selectedIds, staffRoles, onChange, onRoleChange }) {
  const toggle = (staffId) => {
    if (selectedIds.includes(staffId)) {
      onChange(selectedIds.filter((id) => id !== staffId))
      return
    }
    onChange([...selectedIds, staffId])
  }

  if (staff.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        No hay integrantes del staff en esta categoría. Agregá personal desde Staff Técnico.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {staff.map((member) => {
        const checked = selectedIds.includes(member.id)
        return (
          <div
            key={member.id}
            className={`rounded-xl border px-3 py-2 transition ${
              checked ? 'border-accent bg-accent/5' : 'border-border bg-surface-elevated'
            }`}
          >
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(member.id)}
                className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
              />
              <StaffAvatar member={member} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{member.name}</p>
                <p className="text-xs text-text-muted">{member.role}</p>
              </div>
            </label>
            {checked && (
              <select
                value={staffRoles[member.id] ?? member.role}
                onChange={(event) => onRoleChange(member.id, event.target.value)}
                className="mt-2 w-full rounded-lg border border-border px-2 py-1 text-xs"
              >
                {STAFF_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            )}
          </div>
        )
      })}
    </div>
  )
}

import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import StaffAvatar from './StaffAvatar'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { formatDate } from '../../utils/playerFactory'
import { getStaffFullName } from '../../utils/staff'
import { getCategoryById } from '../../utils/categories'

export default function StaffTable({ staff, categories = [], onCreate, onView, onEdit, onDelete }) {
  if (staff.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center">
        <p className="text-sm font-medium text-text-primary">No hay integrantes del staff</p>
        <p className="mt-1 text-sm text-text-secondary">
          Creá entrenadores y miembros del cuerpo técnico para comenzar.
        </p>
        {onCreate && (
          <Button onClick={onCreate} className="mt-4">
            <Plus className="h-4 w-4" />
            Nuevo integrante
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-semibold">Integrante</th>
              <th className="px-4 py-3 font-semibold">Cargo</th>
              <th className="px-4 py-3 font-semibold">Categorías</th>
              <th className="px-4 py-3 font-semibold">Contacto</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((member) => (
              <tr key={member.id} className="transition hover:bg-slate-50/70">
                <td className="px-4 py-4">
                  <button type="button" onClick={() => onView?.(member)} className="flex items-center gap-3 text-left">
                    <StaffAvatar member={member} size="sm" />
                    <div>
                      <p className="font-medium text-text-primary hover:text-accent">{getStaffFullName(member)}</p>
                      {member.specialty && (
                        <p className="mt-0.5 text-xs text-text-muted">{member.specialty}</p>
                      )}
                    </div>
                  </button>
                </td>
                <td className="px-4 py-4">
                  <Badge variant="default">{member.role}</Badge>
                  {member.secondaryRole && (
                    <p className="mt-1 text-xs text-text-muted">{member.secondaryRole}</p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {(member.categoryIds ?? []).map((categoryId) => {
                      const category = getCategoryById(categories, categoryId)
                      if (!category) return null
                      return (
                        <span
                          key={categoryId}
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name}
                        </span>
                      )
                    })}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="text-text-primary">{member.phone || '—'}</p>
                  <p className="text-xs text-text-muted">{member.email || '—'}</p>
                </td>
                <td className="px-4 py-4">
                  <Badge variant={member.status === 'Activo' ? 'success' : 'default'}>{member.status}</Badge>
                  {member.licenseExpiry && (
                    <p className="mt-1 text-xs text-text-muted">Licencia: {formatDate(member.licenseExpiry)}</p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onView?.(member)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-slate-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(member)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/10"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(member)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

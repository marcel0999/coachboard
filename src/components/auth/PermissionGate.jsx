import { useAuth } from '../../context/AuthContext'
import { canEditModule, canViewModule } from '../../utils/permissions'

export default function PermissionGate({
  module,
  requireEdit = false,
  children,
  fallback = null,
}) {
  const { role, membership } = useAuth()
  const allowed = requireEdit
    ? canEditModule(role, membership?.permissions, module)
    : canViewModule(role, membership?.permissions, module)

  if (!allowed) return fallback
  return children
}

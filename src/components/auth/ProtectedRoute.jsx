import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { canAccessPath } from '../../utils/permissions'
import Spinner from '../ui/Spinner'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, needsClubAccess, role, membership } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Spinner size="lg" label="Verificando sesión…" />
      </div>
    )
  }

  if (needsClubAccess) {
    return <Navigate to="/sin-acceso-club" replace />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, reason: 'auth_required' }}
      />
    )
  }

  if (!canAccessPath(role, membership?.permissions, location.pathname)) {
    return <Navigate to="/sin-autorizacion" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../ui/Spinner'

/** Requiere sesión Supabase activa (aunque no tenga club). */
export default function SessionRoute() {
  const { hasSupabaseSession, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Spinner size="lg" label="Verificando sesión…" />
      </div>
    )
  }

  if (!hasSupabaseSession) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

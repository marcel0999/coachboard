import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import { useAuth } from '../context/AuthContext'

export default function Unauthorized() {
  const { roleLabel } = useAuth()

  return (
    <AuthLayout
      title="Acceso no autorizado"
      subtitle={`Tu rol (${roleLabel ?? '—'}) no tiene permiso para ver esta sección.`}
      footer={
        <Link to="/dashboard" className="font-semibold text-accent hover:text-accent-hover">
          Volver al Dashboard
        </Link>
      }
    >
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldX className="h-7 w-7" />
        </div>
        <p className="text-center text-sm text-text-secondary">
          Contactá al administrador del club si necesitás acceso a este módulo.
        </p>
      </div>
    </AuthLayout>
  )
}

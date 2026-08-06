import { Navigate, Routes, Route, useParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import GuestRoute from './components/auth/GuestRoute'
import SessionRoute from './components/auth/SessionRoute'
import ClubDataShell from './components/auth/ClubDataShell'
import Spinner from './components/ui/Spinner'

import Dashboard from './pages/Dashboard'
import Plantel from './pages/Plantel'
import Partidos from './pages/Partidos'
import Entrenamientos from './pages/Entrenamientos'
import CentroRendimiento from './pages/CentroRendimiento'
import CentroMedico from './pages/CentroMedico'
import StaffTecnico from './pages/StaffTecnico'
import PizarraTactica from './pages/PizarraTactica'
import Biblioteca from './pages/Biblioteca'
import Configuracion from './pages/Configuracion'

import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AcceptInvite from './pages/AcceptInvite'
import NoClubAccess from './pages/NoClubAccess'
import Unauthorized from './pages/Unauthorized'
import TeamAccess from './pages/TeamAccess'

export default function App() {
  return (
    <Routes>
      {/* Landing pública — / muestra bienvenida o redirige al dashboard */}
      <Route element={<GuestRoute />}>
        <Route path="/" element={<Welcome />} />
        <Route path="/bienvenida" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/register" element={<Navigate to="/registro" replace />} />
        <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
        <Route path="/forgot-password" element={<Navigate to="/recuperar-contrasena" replace />} />
        <Route path="/restablecer-contrasena" element={<ResetPassword />} />
        <Route path="/reset-password" element={<Navigate to="/restablecer-contrasena" replace />} />
        <Route path="/invitacion/:token" element={<AcceptInvite />} />
        <Route path="/accept-invitation/:token" element={<AcceptInviteAlias />} />
      </Route>

      {/* Sesión Supabase sin membresía de club */}
      <Route element={<SessionRoute />}>
        <Route path="/sin-acceso-club" element={<NoClubAccess />} />
      </Route>

      {/* Rutas privadas — sesión + club + permisos */}
      <Route element={<ProtectedRoute />}>
        <Route path="/sin-autorizacion" element={<Unauthorized />} />

        <Route element={<ClubDataShell />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plantel" element={<Plantel />} />
            <Route path="/partidos" element={<Partidos />} />
            <Route path="/entrenamientos" element={<Entrenamientos />} />
            <Route path="/rendimiento" element={<CentroRendimiento />} />
            <Route path="/medico" element={<CentroMedico />} />
            <Route path="/staff" element={<StaffTecnico />} />
            <Route path="/pizarra" element={<PizarraTactica />} />
            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/ejercicios" element={<Navigate to="/biblioteca" replace />} />
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="/equipo/accesos" element={<TeamAccess />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  )
}

function AcceptInviteAlias() {
  const { token } = useParams()
  return <Navigate to={`/invitacion/${token}`} replace />
}

function CatchAllRedirect() {
  const { isAuthenticated, isLoading, needsClubAccess } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Spinner size="lg" label="Verificando sesión…" />
      </div>
    )
  }

  if (needsClubAccess) return <Navigate to="/sin-acceso-club" replace />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Navigate to="/login" replace />
}

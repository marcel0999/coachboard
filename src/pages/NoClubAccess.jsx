import { Navigate } from 'react-router-dom'

import { LogOut, Mail } from 'lucide-react'

import AuthLayout from '../components/auth/AuthLayout'

import Alert from '../components/ui/Alert'

import Button from '../components/ui/Button'

import Spinner from '../components/ui/Spinner'

import { useAuth } from '../context/AuthContext'



export default function NoClubAccess() {

  const { logout, user, authError, needsClubAccess, isLoading, isAuthenticated } = useAuth()



  if (isLoading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-surface">

        <Spinner size="lg" />

      </div>

    )

  }



  if (isAuthenticated) {

    return <Navigate to="/dashboard" replace />

  }



  if (!needsClubAccess) {

    return <Navigate to="/" replace />

  }



  return (

    <AuthLayout

      title="Sin acceso a un club"

      subtitle="Tu cuenta está autenticada pero no pertenece a ningún club activo."

    >

      <div className="space-y-4">

        <Alert variant="warning">

          {authError ??

            'Necesitás una invitación de un administrador o crear un nuevo club para continuar.'}

        </Alert>



        {user?.email && (

          <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-surface-muted/50 px-4 py-3 text-sm">

            <Mail className="h-4 w-4 text-text-muted" />

            <span className="text-text-secondary">Sesión activa:</span>

            <span className="font-medium text-text-primary">{user.email}</span>

          </div>

        )}



        <div className="space-y-2 text-sm text-text-secondary">

          <p>Podés:</p>

          <ul className="list-inside list-disc space-y-1 pl-2">

            <li>Pedir al administrador del club que te envíe una invitación</li>

            <li>Usar el enlace de invitación que recibiste por correo</li>

            <li>Crear un nuevo club si sos el responsable de uno</li>

          </ul>

        </div>



        <div className="flex flex-col gap-2 pt-2">

          <Button

            type="button"

            variant="secondary"

            size="lg"

            className="w-full"

            onClick={async () => {

              await logout()

              window.location.href = '/registro'

            }}

          >

            Cerrar sesión y crear un nuevo club

          </Button>

          <Button type="button" size="lg" className="w-full" onClick={() => logout()}>

            <LogOut className="h-4 w-4" />

            Cerrar sesión

          </Button>

        </div>

      </div>

    </AuthLayout>

  )

}


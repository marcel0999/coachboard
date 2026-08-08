import { useEffect, useState } from 'react'

import { Link, useNavigate, useParams } from 'react-router-dom'

import { Eye, EyeOff, Lock, User } from 'lucide-react'

import AuthLayout from '../components/auth/AuthLayout'

import Alert from '../components/ui/Alert'

import Button, { ButtonLink } from '../components/ui/Button'

import Spinner from '../components/ui/Spinner'

import { FormField, InputWithIcon, Input } from '../components/ui/FormField'

import { ROLE_LABELS } from '../constants/auth'

import { useAuth } from '../context/AuthContext'

import { getSupabaseInvitationByToken } from '../services/supabase/authService'



export default function AcceptInvite() {

  const { token } = useParams()

  const { acceptInvite, isAuthenticated, logout, user } = useAuth()

  const navigate = useNavigate()

  const [inviteData, setInviteData] = useState(null)

  const [inviteLoading, setInviteLoading] = useState(true)



  const [fullName, setFullName] = useState('')

  const [password, setPassword] = useState('')

  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const [error, setError] = useState('')



  useEffect(() => {

    let cancelled = false



    async function loadInvite() {

      setInviteLoading(true)

      try {

        const data = await getSupabaseInvitationByToken(token)

        if (!cancelled) setInviteData(data)

      } finally {

        if (!cancelled) setInviteLoading(false)

      }

    }



    loadInvite()

    return () => {

      cancelled = true

    }

  }, [token])



  if (isAuthenticated) {

    return (

      <AuthLayout

        title="Ya tenés una sesión activa"

        subtitle={`Estás conectado como ${user?.email}. Para aceptar esta invitación, cerrá sesión primero o usá otra cuenta.`}

      >

        <div className="space-y-3">

          <Button type="button" variant="secondary" size="lg" className="w-full" onClick={() => logout()}>

            Cerrar sesión y continuar

          </Button>

          <ButtonLink to="/dashboard" size="lg" className="w-full">

            Ir al Dashboard

          </ButtonLink>

        </div>

      </AuthLayout>

    )

  }



  if (inviteLoading) {

    return (

      <AuthLayout title="Validando invitación" subtitle="Un momento…">

        <div className="flex justify-center py-8">

          <Spinner />

        </div>

      </AuthLayout>

    )

  }



  if (!inviteData) {

    return (

      <AuthLayout

        title="Invitación no válida"

        subtitle="El enlace expiró o ya fue utilizado. Pedile al administrador del club una nueva invitación."

        footer={

          <Link to="/login" className="font-semibold text-accent hover:text-accent-hover">

            Ir al inicio de sesión

          </Link>

        }

      >

        <Alert variant="warning">No pudimos validar esta invitación.</Alert>

      </AuthLayout>

    )

  }



  const { invite, club } = inviteData



  async function handleSubmit(event) {

    event.preventDefault()

    setError('')



    if (password.length < 8) {

      setError('La contraseña debe tener al menos 8 caracteres.')

      return

    }

    if (password !== confirmPassword) {

      setError('Las contraseñas no coinciden.')

      return

    }



    setSubmitting(true)

    try {

      await acceptInvite({ token, fullName, password, email: invite.email })

      navigate('/dashboard', { replace: true })

    } catch (submitError) {

      setError(submitError.message)

    } finally {

      setSubmitting(false)

    }

  }



  return (

    <AuthLayout

      title="Unirte al club"

      subtitle={`Te invitaron a ${club.name} como ${ROLE_LABELS[invite.role]}.`}

    >

      <form onSubmit={handleSubmit} className="space-y-5">

        <div className="rounded-xl border border-border/60 bg-surface-muted/50 px-4 py-3 text-sm">

          <p className="text-text-secondary">Correo de la invitación</p>

          <p className="mt-1 font-medium text-text-primary">{invite.email}</p>

        </div>



        {error && <Alert variant="danger">{error}</Alert>}



        <FormField label="Tu nombre completo" htmlFor="fullName">

          <InputWithIcon

            id="fullName"

            icon={User}

            type="text"

            required

            value={fullName}

            onChange={(e) => setFullName(e.target.value)}

          />

        </FormField>



        <FormField label="Crear contraseña" htmlFor="password">

          <div className="relative">

            <InputWithIcon

              id="password"

              icon={Lock}

              type={showPassword ? 'text' : 'password'}

              autoComplete="new-password"

              required

              value={password}

              onChange={(e) => setPassword(e.target.value)}

              inputClassName="pr-11"

            />

            <button

              type="button"

              onClick={() => setShowPassword((value) => !value)}

              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"

              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}

            >

              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}

            </button>

          </div>

        </FormField>



        <FormField label="Confirmar contraseña" htmlFor="confirmPassword">

          <Input

            id="confirmPassword"

            type={showPassword ? 'text' : 'password'}

            required

            value={confirmPassword}

            onChange={(e) => setConfirmPassword(e.target.value)}

          />

        </FormField>



        <Button type="submit" disabled={submitting} size="lg" className="w-full">

          {submitting ? 'Activando cuenta…' : 'Aceptar invitación'}

        </Button>

      </form>

    </AuthLayout>

  )

}


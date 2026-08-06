import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { FormField, InputWithIcon, Input } from '../components/ui/FormField'
import { useAuth } from '../context/AuthContext'
import { assertSupabase } from '../lib/supabase'

export default function ResetPassword() {
  const { updatePassword, authError } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function verifyRecoverySession() {
      try {
        const client = assertSupabase()
        const { data, error } = await client.auth.getSession()
        if (error) throw error
        if (!cancelled) {
          setSessionReady(Boolean(data.session))
          setChecking(false)
        }
      } catch {
        if (!cancelled) {
          setSessionReady(false)
          setChecking(false)
        }
      }
    }

    verifyRecoverySession()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setLocalError('')

    if (password.length < 8) {
      setLocalError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden.')
      return
    }

    setSubmitting(true)
    try {
      await updatePassword(password)
      navigate('/login', { replace: true, state: { message: 'Contraseña actualizada. Iniciá sesión.' } })
    } catch (error) {
      setLocalError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <AuthLayout title="Verificando enlace" subtitle="Un momento…">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </AuthLayout>
    )
  }

  if (!sessionReady) {
    return (
      <AuthLayout
        title="Enlace inválido o expirado"
        subtitle="Solicitá un nuevo enlace de recuperación de contraseña."
        footer={
          <Link to="/recuperar-contrasena" className="font-semibold text-accent hover:text-accent-hover">
            Solicitar nuevo enlace
          </Link>
        }
      >
        <Alert variant="warning">
          El enlace de restablecimiento no es válido o ya expiró.
        </Alert>
      </AuthLayout>
    )
  }

  const errorMessage = localError || authError

  return (
    <AuthLayout
      title="Nueva contraseña"
      subtitle="Elegí una contraseña segura para tu cuenta."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <FormField label="Nueva contraseña" htmlFor="password">
          <div className="relative">
            <InputWithIcon
              id="password"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              inputClassName="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
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
          {submitting ? 'Guardando…' : 'Restablecer contraseña'}
        </Button>
      </form>
    </AuthLayout>
  )
}

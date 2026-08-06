import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { FormField, InputWithIcon } from '../components/ui/FormField'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, authError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')

  const successMessage = location.state?.message
  const redirectTo = location.state?.from ?? '/dashboard'

  async function handleSubmit(event) {
    event.preventDefault()
    setLocalError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setLocalError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const errorMessage = localError || authError

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Ingresá con tu cuenta para acceder al club."
      footer={
        <>
          ¿Primera vez en CoachBoard?{' '}
          <Link to="/registro" className="font-semibold text-accent hover:text-accent-hover">
            Crear club y cuenta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <FormField label="Correo electrónico" htmlFor="email">
          <InputWithIcon
            id="email"
            icon={Mail}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@club.com"
          />
        </FormField>

        <FormField label="Contraseña" htmlFor="password">
          <div className="relative">
            <InputWithIcon
              id="password"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              inputClassName="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-2 text-right">
            <Link to="/recuperar-contrasena" className="text-xs font-semibold text-accent hover:text-accent-hover">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </FormField>

        <Button type="submit" disabled={submitting} size="lg" className="w-full">
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
    </AuthLayout>
  )
}

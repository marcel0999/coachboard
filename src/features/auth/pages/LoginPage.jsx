import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import AuthLayout from '../../../components/auth/AuthLayout'
import Alert from '../../../components/ui/Alert'
import Button from '../../../components/ui/Button'
import { FormField, InputWithIcon } from '../../../components/ui/FormField'
import { useAuth } from '../../../context/AuthContext'
import PasswordField from '../components/PasswordField'

export default function LoginPage() {
  const { login, authError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

        <PasswordField
          id="password"
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <div className="-mt-2 text-right">
          <Link to="/recuperar-contrasena" className="text-xs font-semibold text-accent hover:text-accent-hover">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" disabled={submitting} size="lg" className="w-full">
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
    </AuthLayout>
  )
}

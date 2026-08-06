import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { FormField, Input, InputWithIcon } from '../components/ui/FormField'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [clubName, setClubName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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
      await register({ clubName, fullName, email, password })
      navigate('/dashboard', { replace: true })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Crear club"
      subtitle="Registrá tu club y tu cuenta de administrador. Solo usuarios autenticados pueden acceder al Dashboard."
      footer={
        <>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-accent hover:text-accent-hover">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="danger">{error}</Alert>}

        <FormField label="Nombre del club" htmlFor="clubName" required>
          <InputWithIcon
            id="clubName"
            icon={Building2}
            type="text"
            required
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder="Club Atlético Central"
          />
        </FormField>

        <FormField label="Tu nombre completo" htmlFor="fullName" required>
          <InputWithIcon
            id="fullName"
            icon={User}
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Marcel Gómez"
          />
        </FormField>

        <FormField label="Correo electrónico" htmlFor="email" required>
          <InputWithIcon
            id="email"
            icon={Mail}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@club.com"
          />
        </FormField>

        <FormField label="Contraseña" htmlFor="password" required hint="Mínimo 8 caracteres">
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
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <FormField label="Confirmar contraseña" htmlFor="confirmPassword" required>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormField>

        <Button type="submit" disabled={submitting} size="lg" className="mt-2 w-full">
          {submitting ? 'Creando club…' : 'Crear club y continuar'}
        </Button>
      </form>
    </AuthLayout>
  )
}

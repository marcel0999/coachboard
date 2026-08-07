import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Mail, User } from 'lucide-react'
import AuthLayout from '../../../components/auth/AuthLayout'
import Alert from '../../../components/ui/Alert'
import Button from '../../../components/ui/Button'
import { FormField, Input, InputWithIcon } from '../../../components/ui/FormField'
import { useAuth } from '../../../context/AuthContext'
import PasswordField from '../components/PasswordField'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [clubName, setClubName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    if (!fullName) {
      setError('Ingresá tu nombre y apellido.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (!acceptedTerms) {
      setError('Debés aceptar los términos para continuar.')
      return
    }

    setSubmitting(true)
    try {
      const result = await register({ clubName, fullName, email, password })
      if (result?.needsEmailVerification) {
        navigate('/verificar-correo', { replace: true, state: { email: result.email } })
        return
      }
      navigate('/dashboard', { replace: true })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Creá tu cuenta de CoachBoard para gestionar tu equipo, club o trabajo como entrenador."
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

        <FormField label="Nombre de usuario o club" htmlFor="clubName" required>
          <InputWithIcon
            id="clubName"
            icon={Building2}
            type="text"
            required
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder="Ej: Club Atlético Central o Marcel Nasser"
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre" htmlFor="firstName" required>
            <InputWithIcon
              id="firstName"
              icon={User}
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Marcel"
            />
          </FormField>
          <FormField label="Apellido" htmlFor="lastName" required>
            <Input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Gómez"
            />
          </FormField>
        </div>

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

        <PasswordField
          id="password"
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          hint="Mínimo 8 caracteres"
        />

        <PasswordField
          id="confirmPassword"
          label="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
          withIcon={false}
        />

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/80 bg-surface-muted/40 p-4">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
          />
          <span className="text-sm leading-relaxed text-text-secondary">
            Acepto los términos de uso y la política de privacidad de CoachBoard.
          </span>
        </label>

        <Button type="submit" disabled={submitting} size="lg" className="mt-2 w-full">
          {submitting ? 'Creando cuenta…' : 'Crear cuenta y continuar'}
        </Button>
      </form>
    </AuthLayout>
  )
}

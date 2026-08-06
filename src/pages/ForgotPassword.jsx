import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { FormField, InputWithIcon } from '../components/ui/FormField'
import { useAuth } from '../context/AuthContext'

export default function ForgotPassword() {
  const { requestPasswordReset, authError } = useAuth()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [localError, setLocalError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLocalError('')
    setSubmitting(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (error) {
      setLocalError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout
        title="Revisá tu correo"
        subtitle="Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña."
        footer={
          <Link to="/login" className="font-semibold text-accent hover:text-accent-hover">
            Volver al inicio de sesión
          </Link>
        }
      >
        <Alert variant="success" title="Enlace enviado">
          Revisá <strong>{email}</strong> y también la carpeta de spam.
        </Alert>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecer tu contraseña."
      footer={
        <Link to="/login" className="font-semibold text-accent hover:text-accent-hover">
          Volver al inicio de sesión
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {(localError || authError) && <Alert variant="danger">{localError || authError}</Alert>}

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

        <Button type="submit" disabled={submitting} size="lg" className="w-full">
          {submitting ? 'Enviando…' : 'Enviar enlace de recuperación'}
        </Button>
      </form>
    </AuthLayout>
  )
}

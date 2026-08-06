import { Link, useLocation } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import AuthLayout from '../../../components/auth/AuthLayout'
import Alert from '../../../components/ui/Alert'
import { ButtonLink } from '../../../components/ui/Button'

export default function VerifyEmailPage() {
  const location = useLocation()
  const email = location.state?.email

  return (
    <AuthLayout
      title="Confirmá tu correo"
      subtitle="Te enviamos un enlace de verificación. Una vez confirmado, podés iniciar sesión y acceder a tu club."
      footer={
        <Link to="/login" className="font-semibold text-accent hover:text-accent-hover">
          Ir al inicio de sesión
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-subtle text-accent">
            <MailCheck className="h-8 w-8" />
          </div>
        </div>

        <Alert variant="success" title="Cuenta creada">
          {email ? (
            <>
              Revisá <strong>{email}</strong> y hacé clic en el enlace de confirmación. También
              podés revisar la carpeta de spam.
            </>
          ) : (
            <>Revisá tu bandeja de entrada y hacé clic en el enlace de confirmación.</>
          )}
        </Alert>

        <p className="text-sm leading-relaxed text-text-secondary">
          Después de confirmar el correo, iniciá sesión con tu email y contraseña. Tu club se
          creará automáticamente al ingresar por primera vez.
        </p>

        <ButtonLink to="/login" size="lg" className="w-full">
          Ya confirmé — Iniciar sesión
        </ButtonLink>
      </div>
    </AuthLayout>
  )
}

import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { FormField, Input, InputWithIcon } from '../../../components/ui/FormField'

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete = 'current-password',
  required = false,
  hint,
  withIcon = true,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const InputComponent = withIcon ? InputWithIcon : Input
  const inputProps = {
    id,
    type: showPassword ? 'text' : 'password',
    autoComplete,
    required,
    value,
    onChange,
    ...(withIcon ? { icon: Lock, inputClassName: 'pr-11' } : {}),
  }

  return (
    <FormField label={label} htmlFor={id} required={required} hint={hint}>
      <div className="relative">
        <InputComponent {...inputProps} />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </FormField>
  )
}

import { useCallback, useState } from 'react'
import { useToast } from '../context/ToastContext'

/**
 * Flujo estándar para guardar formularios CRUD.
 * - Espera la operación async
 * - Toast de éxito / error
 * - onSuccess solo si no hubo error (cerrar modal, limpiar estado)
 */
export function useCrudSubmit({
  onSubmit,
  onSuccess,
  successMessage,
  errorMessage = 'No se pudo guardar los cambios',
}) {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = useCallback(
    async (...args) => {
      setIsSubmitting(true)
      try {
        const result = await onSubmit(...args)
        if (successMessage) toast.success(successMessage)
        onSuccess?.(result)
        return result
      } catch (error) {
        const message = error?.message || errorMessage
        toast.error(message)
        throw error
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit, onSuccess, successMessage, errorMessage, toast],
  )

  return { submit, isSubmitting }
}

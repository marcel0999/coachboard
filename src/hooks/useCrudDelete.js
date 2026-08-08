import { useCallback, useState } from 'react'
import { useToast } from '../context/ToastContext'

/**
 * Flujo estándar para eliminar registros desde ConfirmModal.
 */
export function useCrudDelete({
  onDelete,
  onSuccess,
  successMessage,
  errorMessage = 'No se pudo eliminar el registro',
}) {
  const toast = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const confirmDelete = useCallback(async () => {
    setIsDeleting(true)
    try {
      const result = await onDelete()
      if (successMessage) toast.success(successMessage)
      onSuccess?.(result)
      return result
    } catch (error) {
      toast.error(error?.message || errorMessage)
      throw error
    } finally {
      setIsDeleting(false)
    }
  }, [onDelete, onSuccess, successMessage, errorMessage, toast])

  return { confirmDelete, isDeleting }
}

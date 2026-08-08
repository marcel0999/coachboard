import { useCallback } from 'react'
import { useAppData } from '../context/AppDataContext'
import { useCrudSubmit } from './useCrudSubmit'
import { useCrudDelete } from './useCrudDelete'

/**
 * Guardado CRUD sobre AppDataContext + persistencia Supabase.
 */
export function useAppDataSave({ mutate, successMessage, onSuccess, errorMessage }) {
  const { persistAfterMutation } = useAppData()

  const runMutation = useCallback(
    async (payload) => {
      await persistAfterMutation(() => {
        mutate(payload)
      })
    },
    [mutate, persistAfterMutation],
  )

  return useCrudSubmit({
    onSubmit: runMutation,
    successMessage,
    onSuccess,
    errorMessage,
  })
}

/**
 * Eliminación CRUD sobre AppDataContext + persistencia Supabase.
 */
export function useAppDataDelete({ mutate, successMessage, onSuccess, errorMessage }) {
  const { persistAfterMutation } = useAppData()

  const runMutation = useCallback(async () => {
    await persistAfterMutation(() => {
      mutate()
    })
  }, [mutate, persistAfterMutation])

  return useCrudDelete({
    onDelete: runMutation,
    successMessage,
    onSuccess,
    errorMessage,
  })
}

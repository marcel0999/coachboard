import { useCallback } from 'react'

/**
 * Combina refresh → close → reset para usar como onSuccess de useCrudSubmit / useAppDataSave.
 * El toast de éxito lo gestiona el hook de submit.
 *
 * @example
 * const onSuccess = useFormSuccessActions({
 *   close: () => setOpen(false),
 *   reset: () => setForm(EMPTY),
 * })
 *
 * const { submit } = useAppDataSave({ mutate, successMessage: '...', onSuccess })
 */
export function useFormSuccessActions({ close, reset, refresh }) {
  return useCallback(async () => {
    if (refresh) await refresh()
    if (close) close()
    if (reset) reset()
  }, [close, reset, refresh])
}

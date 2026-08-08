import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import ToastViewport from '../components/ui/ToastViewport'

const ToastContext = createContext(null)

const DEFAULT_DURATION_MS = 4200

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ variant = 'info', message, duration = DEFAULT_DURATION_MS }) => {
      if (!message) return

      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, variant, message }])

      if (duration > 0) {
        window.setTimeout(() => dismissToast(id), duration)
      }
    },
    [dismissToast],
  )

  const toast = useMemo(
    () => ({
      success: (message, options) => showToast({ variant: 'success', message, ...options }),
      error: (message, options) => showToast({ variant: 'error', message, ...options }),
      info: (message, options) => showToast({ variant: 'info', message, ...options }),
    }),
    [showToast],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider')
  }
  return context
}

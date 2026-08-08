import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-500/20 bg-success-subtle text-emerald-200',
    iconClassName: 'text-emerald-400',
  },
  error: {
    icon: XCircle,
    className: 'border-red-500/20 bg-danger-subtle text-red-200',
    iconClassName: 'text-red-400',
  },
  info: {
    icon: Info,
    className: 'border-border/60 bg-surface-card text-text-primary',
    iconClassName: 'text-accent',
  },
}

export default function ToastViewport({ toasts, onDismiss }) {
  if (!toasts.length) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => {
        const variant = VARIANTS[toast.variant] ?? VARIANTS.info
        const Icon = variant.icon

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg ${variant.className}`}
            role="status"
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${variant.iconClassName}`} />
            <p className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-lg p-1 text-current/60 transition hover:bg-surface-elevated/10 hover:text-current"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

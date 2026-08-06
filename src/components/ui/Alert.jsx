import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200/80 bg-emerald-50/80 text-emerald-800',
    iconClass: 'text-emerald-600',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-amber-200/80 bg-amber-50/80 text-amber-900',
    iconClass: 'text-amber-600',
  },
  danger: {
    icon: XCircle,
    className: 'border-red-200/80 bg-red-50/80 text-red-800',
    iconClass: 'text-red-600',
  },
  info: {
    icon: Info,
    className: 'border-blue-200/80 bg-blue-50/80 text-blue-900',
    iconClass: 'text-blue-600',
  },
}

export default function Alert({ variant = 'info', title, children, action, className = '' }) {
  const config = VARIANTS[variant] ?? VARIANTS.info
  const Icon = config.icon

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${config.className} ${className}`}
      role="alert"
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconClass}`} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5 text-[13px] opacity-90' : ''}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

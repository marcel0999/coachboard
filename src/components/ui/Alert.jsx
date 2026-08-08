import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-500/20 bg-success-subtle text-emerald-300',
    iconClass: 'text-emerald-400',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-amber-500/20 bg-warning-subtle text-amber-200',
    iconClass: 'text-amber-400',
  },
  danger: {
    icon: XCircle,
    className: 'border-red-500/20 bg-danger-subtle text-red-300',
    iconClass: 'text-red-400',
  },
  info: {
    icon: Info,
    className: 'border-blue-500/20 bg-info-subtle text-blue-200',
    iconClass: 'text-blue-400',
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

const VARIANTS = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
}

export default function Badge({ children, variant = 'default' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant] ?? VARIANTS.default}`}
    >
      {children}
    </span>
  )
}

export function statusToVariant(status) {
  switch (status) {
    case 'Disponible':
      return 'success'
    case 'Lesionado':
      return 'danger'
    case 'Suspendido':
    case 'Suspensión':
      return 'warning'
    default:
      return 'default'
  }
}

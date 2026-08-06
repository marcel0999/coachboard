import { Link } from 'react-router-dom'

const VARIANTS = {
  primary:
    'bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-accent active:scale-[0.98]',
  secondary:
    'border border-slate-200/80 bg-white text-text-primary hover:bg-surface-muted hover:border-slate-300 shadow-xs active:scale-[0.98]',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]',
  ghost: 'text-text-secondary hover:bg-slate-100/80 hover:text-text-primary active:scale-[0.98]',
  outline:
    'border border-accent/30 bg-accent-subtle/50 text-accent hover:bg-accent-subtle active:scale-[0.98]',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-5 py-3 text-sm rounded-xl gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center font-semibold transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}

export function ButtonLink({
  to,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <Link
      to={to}
      className={[
        'inline-flex items-center justify-center font-semibold transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Link>
  )
}

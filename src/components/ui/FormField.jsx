export function FormField({ label, htmlFor, error, required, children, className = '', hint }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {hint && !error && <p className="mb-1.5 text-xs text-text-muted">{hint}</p>}
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

const inputClass = 'cb-input'

export function Input({ className = '', ...props }) {
  return <input className={`${inputClass} ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${inputClass} ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', rows = 3, ...props }) {
  return <textarea rows={rows} className={`${inputClass} resize-none ${className}`} {...props} />
}

/** Input con icono a la izquierda — para auth y búsquedas */
export function InputWithIcon({ icon: Icon, className = '', inputClassName = '', ...props }) {
  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      )}
      <input className={`${inputClass} ${Icon ? 'pl-10' : ''} ${inputClassName}`} {...props} />
    </div>
  )
}

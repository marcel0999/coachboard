export default function SectionHeader({ title, description, icon: Icon, action, className = '' }) {
  return (
    <div className={`mb-5 flex items-start justify-between gap-4 ${className}`}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-subtle text-accent">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h2 className="cb-section-title">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-text-secondary">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

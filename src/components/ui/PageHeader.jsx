export default function PageHeader({ title, description, action }) {
  return (
    <>
      {/* Mobile / tablet: título + acción */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:hidden">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{title}</h1>
          {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
        </div>
        {action}
      </div>

      {/* Desktop: acción visible arriba a la derecha (PageHeader completo está oculto en lg+) */}
      {action && (
        <div className="mb-6 hidden items-center justify-end lg:flex">
          {action}
        </div>
      )}
    </>
  )
}

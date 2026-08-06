export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/60 bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-center sm:flex-row sm:text-left">
        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} CoachBoard — Acceso restringido a usuarios autorizados
        </p>
        <p className="text-xs text-text-muted">
          Infraestructura Supabase · Datos aislados por club
        </p>
      </div>
    </footer>
  )
}

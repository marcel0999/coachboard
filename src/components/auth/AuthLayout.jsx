import Logo from '../layout/Logo'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <div className="relative hidden w-[44%] overflow-hidden bg-sidebar lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,rgba(59,130,246,0.08),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.25)_100%)]" />

        <div className="relative z-10 p-10">
          <Logo />
        </div>

        <div className="relative z-10 space-y-8 p-10">
          <div>
            <p className="text-label text-accent">Plataforma profesional</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.15] tracking-tight text-white">
              Gestión táctica para el cuerpo técnico moderno
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400">
              Plantel, partidos, entrenamientos y centro médico en un solo lugar. Datos aislados por
              club con accesos controlados por rol.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {['Plantel', 'Partidos', 'Pizarra táctica', 'Centro médico'].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:bg-white/10"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 p-10">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} CoachBoard</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md cb-animate-slide-up">
          <div className="mb-8 lg:hidden">
            <Logo compact light />
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary">{title}</h2>
            {subtitle ? <p className="mt-2 text-sm leading-relaxed text-text-secondary">{subtitle}</p> : null}
          </div>

          {children}

          {footer ? <div className="mt-8 text-center text-sm text-text-secondary">{footer}</div> : null}
        </div>
      </div>
    </div>
  )
}

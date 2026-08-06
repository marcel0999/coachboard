import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, LogIn, Shield, UserPlus, Users, Zap } from 'lucide-react'
import Logo from '../components/layout/Logo'

export default function Welcome() {
  const location = useLocation()
  const from = location.state?.from
  const authRequired = location.state?.reason === 'auth_required'

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo compact light />
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              state={from ? { from } : undefined}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-surface-muted hover:text-text-primary"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/registro"
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
              style={{ boxShadow: 'var(--shadow-accent)' }}
            >
              Crear club
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="relative overflow-hidden px-6 py-20 sm:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_55%)]" />
          <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

          <div className="relative mx-auto max-w-4xl text-center cb-animate-slide-up">
            <p className="text-label text-accent">CoachBoard</p>
            <h1 className="text-display-lg mt-4 text-text-primary">
              La plataforma que tu cuerpo técnico merece
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">
              Plantel, partidos, entrenamientos, pizarra táctica y centro médico — diseñado para
              clubes que exigen precisión, seguridad y una experiencia de primer nivel.
            </p>

            {authRequired && (
              <div className="mx-auto mt-6 max-w-md rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
                Necesitás iniciar sesión para acceder a CoachBoard.
              </div>
            )}

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/login"
                state={from ? { from } : undefined}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-hover sm:w-auto"
                style={{ boxShadow: 'var(--shadow-accent)' }}
              >
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-8 py-3.5 text-sm font-semibold text-text-primary shadow-sm transition hover:border-accent/30 hover:bg-accent-subtle/30 sm:w-auto"
              >
                <UserPlus className="h-4 w-4" />
                Crear club y cuenta
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200/60 bg-white px-6 py-16">
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                title: 'Acceso protegido',
                text: 'Autenticación Supabase con membresías por club. Cada usuario ve solo lo autorizado.',
              },
              {
                icon: Users,
                title: 'Multi-usuario',
                text: 'Invitaciones, roles y permisos granulares para administradores, DT y staff.',
              },
              {
                icon: Zap,
                title: 'Sincronizado',
                text: 'Datos en la nube — accedé desde cualquier dispositivo con la misma cuenta.',
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <div
                key={title}
                className={`rounded-2xl border border-slate-200/70 bg-surface-muted/50 p-6 text-left cb-animate-slide-up cb-stagger-${index + 1}`}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-subtle text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-text-primary">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-200/60 px-6 py-12">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="text-sm text-text-secondary">¿Listo para empezar?</p>
            <Link
              to="/registro"
              className="mt-4 inline-flex items-center gap-2 font-display text-lg font-semibold text-accent hover:text-accent-hover"
            >
              Crear tu club ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 py-6 text-center text-xs text-text-muted">
        © {new Date().getFullYear()} CoachBoard — Acceso restringido a usuarios autorizados
      </footer>
    </div>
  )
}

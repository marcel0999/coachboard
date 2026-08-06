import { Link } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'
import { LANDING_STATS } from '../constants'

export default function LandingHero({ authRequired, from }) {
  return (
    <section className="relative overflow-hidden bg-[#0a0f1a] px-6 pb-24 pt-16 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_55%)]" />
      <div className="pointer-events-none absolute -left-32 top-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center cb-animate-slide-up">
        <p className="text-label text-accent">CoachBoard</p>
        <h1 className="text-display-lg mt-4 text-white">
          Gestión profesional para el fútbol moderno
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          Plantel, entrenamientos, pizarra táctica y planificación en una plataforma
          diseñada para cuerpos técnicos que exigen orden, velocidad y control.
        </p>

        {authRequired && (
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:w-auto"
          >
            <UserPlus className="h-4 w-4" />
            Crear club gratis
          </Link>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {LANDING_STATS.map(({ value, label }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5">
              <p className="font-display text-2xl font-bold text-white">{value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

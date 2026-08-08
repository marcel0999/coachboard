import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import Logo from '../../../components/layout/Logo'
import LandingProductMockup from './LandingProductMockup'
import { LANDING_HERO_BADGES } from '../constants'

export default function LandingHero({ authRequired, from }) {
  return (
    <section id="producto" className="relative min-h-[calc(100dvh-4rem)] overflow-hidden landing-hero-bg">
      <div className="pointer-events-none absolute inset-0 landing-pitch-pattern opacity-60" />
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-sky-500/5 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-16 xl:py-20">
        <div className="landing-fade-up order-1 lg:order-none">
          <Logo />

          <h1 className="mt-8 font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
            Todo tu fútbol.
            <br />
            <span className="text-accent">En un solo lugar.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Gestioná plantel, entrenamientos, partidos, rendimiento, cuerpo técnico, área médica
            y planificación táctica desde una sola plataforma.
          </p>

          {authRequired && (
            <div className="mt-6 max-w-md rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              Necesitás iniciar sesión para acceder a CoachBoard.
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {LANDING_HERO_BADGES.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"
              >
                <Check className="h-3 w-3 text-accent" />
                {badge}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/registro"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-hover sm:text-base"
              style={{ boxShadow: 'var(--shadow-accent)' }}
            >
              Empezar ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#funciones"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:text-base"
            >
              Ver la plataforma
            </a>
          </div>

          <p className="mt-5 text-xs text-slate-500 sm:text-sm">
            Accedé desde cualquier dispositivo. Sin instalaciones.
          </p>
        </div>

        <div className="landing-fade-up order-2 lg:order-none lg:pl-4" style={{ animationDelay: '120ms' }}>
          <LandingProductMockup />
        </div>
      </div>
    </section>
  )
}

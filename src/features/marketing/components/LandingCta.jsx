import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function LandingCta() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 landing-hero-bg" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_55%)]" />

      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.75rem]">
          Tu fútbol merece algo mejor que planillas, papeles y grupos de WhatsApp.
        </h2>
        <p className="mt-5 text-lg text-slate-400">
          Empezá a organizar tu trabajo con CoachBoard.
        </p>

        <Link
          to="/registro"
          className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-10 py-4 text-base font-semibold text-white transition hover:bg-accent-hover sm:w-auto sm:text-lg"
          style={{ boxShadow: 'var(--shadow-accent)' }}
        >
          Crear mi cuenta
          <ArrowRight className="h-5 w-5" />
        </Link>

        <p className="mt-6 text-sm text-slate-500">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-accent transition hover:text-accent-hover">
            Iniciar sesión →
          </Link>
        </p>
      </div>
    </section>
  )
}

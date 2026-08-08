import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { PizarraMockup } from './LandingProductMockup'
import { LANDING_PITCH_POINTS } from '../constants'

export default function LandingPitchSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-[#060a12] px-4 py-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(16,185,129,0.06),transparent_60%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <PizarraMockup />
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-label text-accent">Pizarra táctica</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            Pensá el partido.
            <br />
            Diseñalo.
            <br />
            <span className="text-accent">Mostralo.</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-400">
            Armá formaciones, mové jugadores, diseñá ejercicios y prepará situaciones tácticas
            directamente sobre la cancha.
          </p>

          <ul className="mt-6 space-y-2.5">
            {LANDING_PITCH_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-sm text-slate-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15">
                  <Check className="h-3 w-3 text-accent" />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <Link
            to="/registro"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
            style={{ boxShadow: 'var(--shadow-accent)' }}
          >
            Descubrir Pizarra
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

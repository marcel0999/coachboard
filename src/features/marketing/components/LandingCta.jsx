import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function LandingCta() {
  return (
    <section className="border-t border-slate-200/60 bg-[#0a0f1a] px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-bold text-white">Empezá hoy con tu club</h2>
        <p className="mt-4 text-slate-400">
          Creá tu cuenta en minutos. Sin tarjeta de crédito. Configuración guiada.
        </p>
        <Link
          to="/registro"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
          style={{ boxShadow: 'var(--shadow-accent)' }}
        >
          Crear club y cuenta
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

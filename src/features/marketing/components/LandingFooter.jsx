import { Link } from 'react-router-dom'
import Logo from '../../../components/layout/Logo'
import { LANDING_FOOTER_LINKS } from '../constants'

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#060a12] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              Gestión profesional para el fútbol moderno.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
            {LANDING_FOOTER_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm text-slate-400 transition hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-slate-600 sm:flex-row">
          <p>© {new Date().getFullYear()} CoachBoard. Todos los derechos reservados.</p>
          <p>
            <Link to="/login" className="transition hover:text-slate-400">
              Acceso para usuarios registrados
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

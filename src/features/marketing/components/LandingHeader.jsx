import { Link } from 'react-router-dom'
import Logo from '../../../components/layout/Logo'

export default function LandingHeader({ from }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0f1a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo compact />
        <nav className="flex items-center gap-2">
          <Link
            to="/login"
            state={from ? { from } : undefined}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
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
        </nav>
      </div>
    </header>
  )
}

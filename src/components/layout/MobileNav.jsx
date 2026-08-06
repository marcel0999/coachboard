import { Menu, X } from 'lucide-react'
import Logo from './Logo'

export default function MobileHeader({ isOpen, onToggle, title = 'CoachBoard' }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden">
      <button
        type="button"
        onClick={onToggle}
        className="rounded-xl p-2.5 text-text-secondary transition hover:bg-surface-muted hover:text-text-primary"
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <div className="text-center">
        <p className="font-display text-sm font-semibold text-text-primary">{title}</p>
      </div>
      <Logo compact light />
    </header>
  )
}

export function MobileSidebar({ isOpen, onClose }) {
  return (
    <>
      <div
        className={[
          'fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <Sidebar onNavigate={onClose} />
      </div>
    </>
  )
}

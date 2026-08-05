import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'

export default function MobileHeader({ isOpen, onToggle }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      <button
        type="button"
        onClick={onToggle}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <p className="text-sm font-semibold text-text-primary">CoachBoard</p>
      <div className="w-9" />
    </header>
  )
}

export function MobileSidebar({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
        <Sidebar onNavigate={onClose} />
      </div>
    </>
  )
}

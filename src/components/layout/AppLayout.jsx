import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileHeader, { MobileSidebar } from './MobileNav'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/plantel': 'Plantel',
  '/partidos': 'Partidos',
  '/entrenamientos': 'Entrenamientos',
  '/rendimiento': 'Centro de Rendimiento',
  '/medico': 'Centro Médico',
  '/staff': 'Staff Técnico',
  '/pizarra': 'Pizarra Táctica',
  '/ejercicios': 'Ejercicios',
  '/configuracion': 'Configuración',
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const pageTitle = PAGE_TITLES[pathname] ?? 'CoachBoard'

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileHeader isOpen={mobileOpen} onToggle={() => setMobileOpen((v) => !v)} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-8 hidden lg:block">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">{pageTitle}</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Bienvenido a CoachBoard — tu centro de gestión deportiva
              </p>
            </header>

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

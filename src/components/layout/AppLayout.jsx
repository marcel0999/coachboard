import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Sidebar from './Sidebar'
import MobileHeader, { MobileSidebar } from './MobileNav'

const PAGE_META = {
  '/dashboard': { title: 'Dashboard', description: 'Resumen general del club' },
  '/plantel': { title: 'Plantel', description: 'Jugadores, fichas y estado físico' },
  '/partidos': { title: 'Partidos', description: 'Calendario, alineaciones y resultados' },
  '/entrenamientos': { title: 'Entrenamientos', description: 'Planificación semanal y mensual' },
  '/rendimiento': { title: 'Centro de Rendimiento', description: 'Evaluaciones y métricas' },
  '/medico': { title: 'Centro Médico', description: 'Fichas, alertas y documentación' },
  '/staff': { title: 'Staff Técnico', description: 'Cuerpo técnico y licencias' },
  '/pizarra': { title: 'Pizarra Táctica', description: 'Formaciones, ejercicios y movimientos' },
  '/biblioteca': { title: 'Biblioteca', description: 'Ejercicios, entrenamientos y contenido del club' },
  '/ejercicios': { title: 'Biblioteca', description: 'Ejercicios, entrenamientos y contenido del club' },
  '/configuracion': { title: 'Configuración', description: 'Club, datos y preferencias' },
  '/equipo/accesos': { title: 'Accesos del equipo', description: 'Invitaciones y permisos' },
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const { club } = useAuth()
  const { saveError, reloadFromStorage } = useAppData()
  const meta = PAGE_META[pathname] ?? { title: 'CoachBoard', description: '' }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileHeader
          isOpen={mobileOpen}
          onToggle={() => setMobileOpen((v) => !v)}
          title={meta.title}
        />

        <main className="relative flex-1 overflow-y-auto">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.04),transparent_50%)]" />

          <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {saveError && (
              <Alert
                variant="danger"
                title="No se pudo guardar en Supabase"
                className="mb-6"
                action={
                  <Button size="sm" variant="ghost" onClick={() => reloadFromStorage()}>
                    Reintentar
                  </Button>
                }
              >
                {saveError.message}
              </Alert>
            )}

            <Outlet context={{ pageMeta: meta, clubName: club?.name }} />
          </div>
        </main>
      </div>
    </div>
  )
}

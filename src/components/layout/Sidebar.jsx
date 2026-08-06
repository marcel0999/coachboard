import { NavLink } from 'react-router-dom'
import { LogOut, ShieldCheck, Users } from 'lucide-react'
import { NAV_ITEMS } from '../../config/navigation'
import { PERMISSION_MODULES } from '../../constants/auth'
import { useAuth } from '../../context/AuthContext'
import { canViewModule, pathToModule } from '../../utils/permissions'
import { getNavIcon } from '../../utils/navIcons'
import Logo from './Logo'

function NavItem({ to, label, end }) {
  const Icon = getNavIcon(to)

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-sidebar-active text-white shadow-sm'
            : 'text-slate-400 hover:bg-sidebar-hover hover:text-white',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent" />
          )}
          <Icon className="h-[18px] w-[18px] shrink-0 opacity-80 group-hover:opacity-100" />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ onNavigate }) {
  const { club, user, roleLabel, role, membership, logout } = useAuth()

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    const module = pathToModule(item.to)
    return module ? canViewModule(role, membership?.permissions, module) : true
  })

  const showTeamAccess = canViewModule(role, membership?.permissions, 'equipo')

  function handleLogout() {
    void logout().then(() => {
      window.location.replace('/login')
      onNavigate?.()
    })
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="border-b border-sidebar-border px-5 py-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4" aria-label="Navegación principal">
        {visibleNavItems.map((item) => (
          <div key={item.to} onClick={onNavigate}>
            <NavItem {...item} />
          </div>
        ))}

        {showTeamAccess ? (
          <div onClick={onNavigate}>
            <NavItem to={PERMISSION_MODULES.equipo.path} label={PERMISSION_MODULES.equipo.label} end />
          </div>
        ) : null}
      </nav>

      <div className="space-y-3 border-t border-sidebar-border px-4 py-4">
        <div className="rounded-xl bg-sidebar-hover/80 px-4 py-3 ring-1 ring-white/5">
          <p className="text-label text-slate-500">Club activo</p>
          <p className="mt-1 truncate font-display text-sm font-semibold text-white">{club?.name ?? '—'}</p>
        </div>

        <div className="rounded-xl bg-sidebar-hover/80 px-4 py-3 ring-1 ring-white/5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Users className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.fullName}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
              <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <ShieldCheck className="h-3 w-3" />
                {roleLabel}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-sidebar-border/80 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-sidebar-hover hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

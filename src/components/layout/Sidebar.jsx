import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../data/mockData'
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
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-sidebar-active text-white shadow-sm'
            : 'text-slate-400 hover:bg-sidebar-hover hover:text-white',
        ].join(' ')
      }
    >
      <Icon className="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100" />
      <span>{label}</span>
    </NavLink>
  )
}

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="border-b border-sidebar-border px-5 py-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => (
          <div key={item.to} onClick={onNavigate}>
            <NavItem {...item} />
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <div className="rounded-xl bg-sidebar-hover px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Temporada</p>
          <p className="mt-1 text-sm font-semibold text-white">2025/2026</p>
        </div>
      </div>
    </aside>
  )
}

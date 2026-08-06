import { LayoutDashboard, Users, ClipboardList, BookOpen, Trophy, CalendarDays, Activity, HeartPulse, UserCog, Settings, ShieldCheck } from 'lucide-react'

const ICON_MAP = {
  '/dashboard': LayoutDashboard,
  '/': LayoutDashboard,
  '/plantel': Users,
  '/partidos': Trophy,
  '/entrenamientos': CalendarDays,
  '/rendimiento': Activity,
  '/medico': HeartPulse,
  '/staff': UserCog,
  '/pizarra': ClipboardList,
  '/biblioteca': BookOpen,
  '/ejercicios': BookOpen,
  '/configuracion': Settings,
  '/equipo/accesos': ShieldCheck,
}

export function getNavIcon(path) {
  return ICON_MAP[path] ?? LayoutDashboard
}
